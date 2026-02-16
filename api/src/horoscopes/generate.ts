/**
 * Daily horoscope generation via Claude API.
 * Run as a standalone cron script once daily (e.g., midnight).
 *
 * Usage: npx tsx src/horoscopes/generate.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';

const SIGNS = [
  { slug: 'aries', name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19', element: 'Fire', ruler: 'Mars' },
  { slug: 'taurus', name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20', element: 'Earth', ruler: 'Venus' },
  { slug: 'gemini', name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20', element: 'Air', ruler: 'Mercury' },
  { slug: 'cancer', name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22', element: 'Water', ruler: 'Moon' },
  { slug: 'leo', name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22', element: 'Fire', ruler: 'Sun' },
  { slug: 'virgo', name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22', element: 'Earth', ruler: 'Mercury' },
  { slug: 'libra', name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22', element: 'Air', ruler: 'Venus' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21', element: 'Water', ruler: 'Pluto' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21', element: 'Fire', ruler: 'Jupiter' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19', element: 'Earth', ruler: 'Saturn' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18', element: 'Air', ruler: 'Uranus' },
  { slug: 'pisces', name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20', element: 'Water', ruler: 'Neptune' },
];

interface GeneratedHoroscope {
  teaser: string;
  ratings: { overall: number; love: number; career: number; wellness: number };
  paragraphs: [string, string, string, string];
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
  moonReading: [string, string];
  risingReading: [string, string];
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function buildPrompt(sign: typeof SIGNS[number], dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });

  return `You are an expert astrologer writing daily horoscopes for a premium astrology website called Stellara. Generate today's horoscope for ${sign.name} (${sign.dates}, ${sign.element} sign, ruled by ${sign.ruler}).

Today is ${dayName}, ${monthName} ${day}, ${year}.

Write in a warm, insightful, and encouraging tone. Reference planetary transits, aspects, and houses naturally. Make content feel specific to today — not generic enough to apply to any day. Each paragraph should be 3-5 sentences.

Return ONLY valid JSON (no markdown, no code fences) matching this exact structure:

{
  "teaser": "A 2-3 sentence punchy preview for the horoscope hub page. Should entice users to click through to the full reading.",
  "ratings": {
    "overall": <1-5>,
    "love": <1-5>,
    "career": <1-5>,
    "wellness": <1-5>
  },
  "paragraphs": [
    "Morning/opening paragraph about the day's energy and what to expect.",
    "Midday paragraph about career, communication, or practical matters.",
    "Evening paragraph about relationships, social life, or emotional themes.",
    "Closing paragraph with reflection, advice, and tomorrow's preview."
  ],
  "luckyNumber": <1-99>,
  "luckyColor": "A specific, evocative color name (e.g., 'Sunset Coral' not just 'Red')",
  "compatibility": "The zodiac sign most compatible with ${sign.name} today (just the sign name)",
  "moonReading": [
    "First paragraph of the Moon Sign reading — emotional landscape and inner feelings.",
    "Second paragraph of the Moon Sign reading — emotional growth and relationship dynamics."
  ],
  "risingReading": [
    "First paragraph of the Rising Sign reading — how others perceive you today, physical energy.",
    "Second paragraph of the Rising Sign reading — social presence, appearance, first impressions."
  ]
}`;
}

function validateHoroscope(data: unknown): data is GeneratedHoroscope {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.teaser !== 'string' || !d.teaser) return false;

  const r = d.ratings as Record<string, unknown> | undefined;
  if (!r || typeof r.overall !== 'number' || typeof r.love !== 'number'
    || typeof r.career !== 'number' || typeof r.wellness !== 'number') return false;

  if (!Array.isArray(d.paragraphs) || d.paragraphs.length < 4
    || d.paragraphs.some((p: unknown) => typeof p !== 'string' || !p)) return false;

  if (!Array.isArray(d.moonReading) || d.moonReading.length < 2
    || d.moonReading.some((p: unknown) => typeof p !== 'string' || !p)) return false;

  if (!Array.isArray(d.risingReading) || d.risingReading.length < 2
    || d.risingReading.some((p: unknown) => typeof p !== 'string' || !p)) return false;

  if (typeof d.luckyNumber !== 'number') return false;
  if (typeof d.luckyColor !== 'string' || !d.luckyColor) return false;
  if (typeof d.compatibility !== 'string' || !d.compatibility) return false;

  return true;
}

async function generateForSign(
  client: Anthropic,
  sign: typeof SIGNS[number],
  dateStr: string,
): Promise<GeneratedHoroscope> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(sign, dateStr) }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    // Strip any accidental code fences
    const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
    const parsed = JSON.parse(cleaned);

    if (validateHoroscope(parsed)) {
      return parsed;
    }

    if (attempt < maxAttempts) {
      console.warn(`    Invalid structure for ${sign.name} (attempt ${attempt}/${maxAttempts}), retrying...`);
      await new Promise((r) => setTimeout(r, 500));
    } else {
      throw new Error(`Invalid horoscope structure after ${maxAttempts} attempts`);
    }
  }
  throw new Error('Unreachable');
}

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO daily_horoscopes (
    sign, date, teaser,
    overall_rating, love_rating, career_rating, wellness_rating,
    paragraph_1, paragraph_2, paragraph_3, paragraph_4,
    lucky_number, lucky_color, compatibility,
    moon_reading_1, moon_reading_2,
    rising_reading_1, rising_reading_2
  ) VALUES (
    @sign, @date, @teaser,
    @overall_rating, @love_rating, @career_rating, @wellness_rating,
    @paragraph_1, @paragraph_2, @paragraph_3, @paragraph_4,
    @lucky_number, @lucky_color, @compatibility,
    @moon_reading_1, @moon_reading_2,
    @rising_reading_1, @rising_reading_2
  )
`);

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const dateStr = getToday();

  // Check if today's horoscopes already exist
  const existing = db.prepare(
    'SELECT COUNT(*) as count FROM daily_horoscopes WHERE date = ?'
  ).get(dateStr) as { count: number };

  if (existing.count >= 12) {
    console.log(`Horoscopes for ${dateStr} already generated (${existing.count}/12). Skipping.`);
    return;
  }

  console.log(`Generating horoscopes for ${dateStr}...`);
  let success = 0;
  let failed = 0;

  for (const sign of SIGNS) {
    try {
      console.log(`  ${sign.symbol} ${sign.name}...`);
      const horoscope = await generateForSign(client, sign, dateStr);

      insertStmt.run({
        sign: sign.slug,
        date: dateStr,
        teaser: horoscope.teaser,
        overall_rating: horoscope.ratings.overall,
        love_rating: horoscope.ratings.love,
        career_rating: horoscope.ratings.career,
        wellness_rating: horoscope.ratings.wellness,
        paragraph_1: horoscope.paragraphs[0],
        paragraph_2: horoscope.paragraphs[1],
        paragraph_3: horoscope.paragraphs[2],
        paragraph_4: horoscope.paragraphs[3],
        lucky_number: horoscope.luckyNumber,
        lucky_color: horoscope.luckyColor,
        compatibility: horoscope.compatibility,
        moon_reading_1: horoscope.moonReading[0],
        moon_reading_2: horoscope.moonReading[1],
        rising_reading_1: horoscope.risingReading[0],
        rising_reading_2: horoscope.risingReading[1],
      });

      success++;

      // Small delay between calls to be respectful to rate limits
      if (sign !== SIGNS[SIGNS.length - 1]) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (err) {
      failed++;
      console.error(`  FAILED for ${sign.name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`Done. ${success} generated, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
