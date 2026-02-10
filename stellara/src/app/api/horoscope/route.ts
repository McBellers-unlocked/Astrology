import { NextRequest, NextResponse } from 'next/server';
import type { ZodiacSign, DailyHoroscope } from '@/types/astrology';

/* ------------------------------------------------------------------
   Deterministic seed helpers
   ------------------------------------------------------------------ */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/** Simple seeded PRNG (Mulberry32) for deterministic-per-day output. */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------
   Content pools (deterministic selection based on date + sign)
   ------------------------------------------------------------------ */

const VALID_SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const HOROSCOPE_TEMPLATES = [
  'The stars align in your favor today, bringing a burst of creative energy. Trust your instincts when making decisions, especially regarding matters of the heart. A surprising encounter may shift your perspective.',
  'Today invites you to slow down and reflect on recent changes. Financial opportunities are on the horizon, but patience is your greatest ally. Evening hours favor deep conversations.',
  'A powerful celestial alignment amplifies your communication skills today. Express your thoughts boldly and others will listen. A career-related breakthrough is closer than you think.',
  'The Moon illuminates your domestic sphere, drawing your attention to home and family. Nurturing your closest relationships will bring unexpected rewards. Self-care is essential this evening.',
  'Dynamic planetary aspects fuel your ambition and drive. Take calculated risks in professional matters, as the cosmos supports bold moves. Romance heats up after sunset.',
  'Today encourages introspection and spiritual growth. Meditation or journaling may reveal important insights. A friend offers advice that resonates deeply with your current situation.',
  'Planetary transits highlight your social sector, making this an ideal day for networking and collaboration. A creative project gains momentum. Stay open to unconventional ideas.',
  'Transformation is the theme of the day as intense planetary energy pushes you toward positive change. Release old patterns that no longer serve you. New beginnings await.',
  'Adventure calls to your spirit today. Whether through travel, learning, or exploring new ideas, expansion is favored. A philosophical conversation may change your worldview.',
  'Discipline and determination guide you toward long-term goals today. Your hard work is about to pay off in tangible ways. Evening brings relaxation and comfort.',
  'Innovation and originality define your day. Break free from routine and explore fresh approaches to persistent challenges. Group activities bring joy and inspiration.',
  'Your intuition is remarkably strong today. Pay attention to dreams and subtle feelings as they carry important messages. Creative and artistic pursuits are especially favored.',
];

const MOODS = [
  'inspired', 'reflective', 'energetic', 'peaceful', 'passionate',
  'curious', 'optimistic', 'determined', 'creative', 'grateful',
  'adventurous', 'contemplative', 'empowered', 'serene', 'playful',
];

const COLORS = [
  'royal purple', 'celestial blue', 'golden amber', 'rose quartz',
  'emerald green', 'midnight indigo', 'sunset coral', 'silver mist',
  'ruby red', 'ocean teal', 'ivory white', 'dusty lavender',
];

/* ------------------------------------------------------------------
   Rate limiting headers
   ------------------------------------------------------------------ */

function rateLimitHeaders() {
  return {
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '59',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
  };
}

/* ------------------------------------------------------------------
   GET /api/horoscope?sign=aries&type=sun
   ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const signParam = searchParams.get('sign')?.toLowerCase() as ZodiacSign | undefined;
  const typeParam = (searchParams.get('type')?.toLowerCase() ?? 'sun') as
    | 'sun'
    | 'moon'
    | 'rising';

  // Validate sign
  if (!signParam || !VALID_SIGNS.includes(signParam)) {
    return NextResponse.json(
      {
        error: 'Invalid or missing "sign" parameter.',
        validSigns: VALID_SIGNS,
      },
      { status: 400, headers: rateLimitHeaders() },
    );
  }

  // Validate type
  if (!['sun', 'moon', 'rising'].includes(typeParam)) {
    return NextResponse.json(
      {
        error: 'Invalid "type" parameter. Must be "sun", "moon", or "rising".',
      },
      { status: 400, headers: rateLimitHeaders() },
    );
  }

  // Build a deterministic seed from today's date + sign + type
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const seedString = `${today}-${signParam}-${typeParam}`;
  const seed = hashCode(seedString);
  const rand = seededRandom(seed);

  // Pick deterministic content
  const signIndex = VALID_SIGNS.indexOf(signParam);
  const templateIndex = Math.floor(rand() * HOROSCOPE_TEMPLATES.length);
  const moodIndex = Math.floor(rand() * MOODS.length);
  const colorIndex = Math.floor(rand() * COLORS.length);
  const compatIndex = (signIndex + Math.floor(rand() * 11) + 1) % 12;
  const luckyNumber = Math.floor(rand() * 99) + 1;

  const ratingOverall = Math.floor(rand() * 5) + 1;
  const ratingLove = Math.floor(rand() * 5) + 1;
  const ratingCareer = Math.floor(rand() * 5) + 1;
  const ratingWellness = Math.floor(rand() * 5) + 1;

  const horoscope: DailyHoroscope = {
    sign: signParam,
    date: today,
    type: typeParam,
    content: HOROSCOPE_TEMPLATES[templateIndex],
    mood: MOODS[moodIndex],
    luckyNumber,
    luckyColor: COLORS[colorIndex],
    compatibility: VALID_SIGNS[compatIndex],
    rating: {
      overall: ratingOverall,
      love: ratingLove,
      career: ratingCareer,
      wellness: ratingWellness,
    },
  };

  return NextResponse.json(horoscope, {
    status: 200,
    headers: rateLimitHeaders(),
  });
}
