import { NextRequest, NextResponse } from 'next/server';
import type { ZodiacSign, Element } from '@/types/astrology';

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_NAMES: Record<ZodiacSign, string> = {
  aries: 'Aries', taurus: 'Taurus', gemini: 'Gemini', cancer: 'Cancer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', scorpio: 'Scorpio',
  sagittarius: 'Sagittarius', capricorn: 'Capricorn', aquarius: 'Aquarius', pisces: 'Pisces',
};

const SIGN_ELEMENTS: Record<ZodiacSign, Element> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

/* ------------------------------------------------------------------
   Element compatibility matrix (base scores 0-100)
   ------------------------------------------------------------------ */

const ELEMENT_COMPAT: Record<Element, Record<Element, number>> = {
  fire:  { fire: 80, earth: 45, air: 85, water: 40 },
  earth: { fire: 45, earth: 78, air: 42, water: 82 },
  air:   { fire: 85, earth: 42, air: 76, water: 48 },
  water: { fire: 40, earth: 82, air: 48, water: 79 },
};

/* ------------------------------------------------------------------
   Modality bonus/penalty (same = -5, complementary = +5)
   ------------------------------------------------------------------ */

type Modality = 'cardinal' | 'fixed' | 'mutable';

const SIGN_MODALITY: Record<ZodiacSign, Modality> = {
  aries: 'cardinal', taurus: 'fixed', gemini: 'mutable', cancer: 'cardinal',
  leo: 'fixed', virgo: 'mutable', libra: 'cardinal', scorpio: 'fixed',
  sagittarius: 'mutable', capricorn: 'cardinal', aquarius: 'fixed', pisces: 'mutable',
};

/* ------------------------------------------------------------------
   Seeded PRNG for deterministic narrative content
   ------------------------------------------------------------------ */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

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
   Narrative content pools
   ------------------------------------------------------------------ */

const STRENGTHS_POOL = [
  'A natural understanding of each other\'s emotional needs',
  'Shared values around loyalty and commitment',
  'Complementary communication styles that promote growth',
  'Strong physical and emotional chemistry',
  'Mutual admiration and respect for individuality',
  'Ability to balance each other\'s weaknesses',
  'A shared love of adventure and new experiences',
  'Deep intellectual connection and stimulating conversations',
  'Supportive dynamic during challenging times',
  'Alignment on long-term goals and aspirations',
  'Natural trust and emotional safety in the relationship',
  'Harmonious domestic life and shared aesthetic sensibilities',
];

const CHALLENGES_POOL = [
  'Differing approaches to conflict resolution',
  'Potential power struggles when both feel strongly',
  'Different social energy levels may cause friction',
  'Communication styles may require conscious adjustment',
  'Varying financial philosophies need open discussion',
  'Different needs for alone time vs. togetherness',
  'Risk of taking each other for granted over time',
  'Emotional expression differences require patience',
  'Decision-making pace may cause occasional frustration',
  'Balancing independence with partnership needs',
];

const SUMMARIES_POOL = [
  'This pairing creates a dynamic and evolving relationship where both partners inspire growth in one another. The cosmic chemistry between {sign1} and {sign2} suggests a connection that deepens meaningfully over time, blending passion with genuine understanding.',
  'When {sign1} meets {sign2}, the stars create a fascinating interplay of energies. This match brings together complementary strengths that, when nurtured with mutual respect, can form a truly enduring bond.',
  'The celestial alignment between {sign1} and {sign2} points to a relationship rich in both challenge and reward. Their combined energies create the kind of creative tension that fuels personal evolution and deep emotional intimacy.',
  'The {sign1}-{sign2} connection is one of the zodiac\'s most intriguing pairings. Both signs bring unique gifts to the table, and when they learn to appreciate their differences, this partnership can become a source of profound joy and mutual support.',
];

/* ------------------------------------------------------------------
   Score computation
   ------------------------------------------------------------------ */

function computeCompatibility(sign1: ZodiacSign, sign2: ZodiacSign) {
  const el1 = SIGN_ELEMENTS[sign1];
  const el2 = SIGN_ELEMENTS[sign2];
  const mod1 = SIGN_MODALITY[sign1];
  const mod2 = SIGN_MODALITY[sign2];

  let score = ELEMENT_COMPAT[el1][el2];

  // Modality adjustment
  if (mod1 === mod2) {
    score -= 5; // Same modality creates friction (both want the same role)
  } else {
    score += 3;
  }

  // Opposite sign bonus (magnetic attraction)
  const idx1 = SIGNS.indexOf(sign1);
  const idx2 = SIGNS.indexOf(sign2);
  if (Math.abs(idx1 - idx2) === 6) {
    score += 8;
  }

  // Same sign special case
  if (sign1 === sign2) {
    score = 72;
  }

  // Clamp
  return Math.max(15, Math.min(98, score));
}

/* ------------------------------------------------------------------
   Response builder
   ------------------------------------------------------------------ */

interface CompatibilityResponse {
  sign1: { sign: ZodiacSign; name: string; element: Element };
  sign2: { sign: ZodiacSign; name: string; element: Element };
  overallScore: number;
  categoryScores: {
    love: number;
    communication: number;
    trust: number;
    shared_values: number;
    emotional: number;
  };
  strengths: string[];
  challenges: string[];
  summary: string;
  advice: string;
}

function buildResponse(sign1: ZodiacSign, sign2: ZodiacSign): CompatibilityResponse {
  const overall = computeCompatibility(sign1, sign2);
  const pairKey = [sign1, sign2].sort().join('-');
  const rand = seededRandom(hashCode(pairKey));

  // Category scores (deterministic, clustered around overall)
  const variance = () => Math.floor(rand() * 20) - 10;
  const clamp = (v: number) => Math.max(10, Math.min(100, v));

  const categoryScores = {
    love: clamp(overall + variance()),
    communication: clamp(overall + variance()),
    trust: clamp(overall + variance()),
    shared_values: clamp(overall + variance()),
    emotional: clamp(overall + variance()),
  };

  // Pick strengths (3-4 items)
  const strengthCount = 3 + (rand() > 0.5 ? 1 : 0);
  const strengths: string[] = [];
  const usedStrIdx = new Set<number>();
  while (strengths.length < strengthCount) {
    const idx = Math.floor(rand() * STRENGTHS_POOL.length);
    if (!usedStrIdx.has(idx)) {
      usedStrIdx.add(idx);
      strengths.push(STRENGTHS_POOL[idx]);
    }
  }

  // Pick challenges (2-3 items)
  const challengeCount = 2 + (rand() > 0.6 ? 1 : 0);
  const challenges: string[] = [];
  const usedChIdx = new Set<number>();
  while (challenges.length < challengeCount) {
    const idx = Math.floor(rand() * CHALLENGES_POOL.length);
    if (!usedChIdx.has(idx)) {
      usedChIdx.add(idx);
      challenges.push(CHALLENGES_POOL[idx]);
    }
  }

  // Summary
  const summaryIdx = Math.floor(rand() * SUMMARIES_POOL.length);
  const summary = SUMMARIES_POOL[summaryIdx]
    .replace(/{sign1}/g, SIGN_NAMES[sign1])
    .replace(/{sign2}/g, SIGN_NAMES[sign2]);

  // Advice (deterministic)
  const advicePool = [
    `Focus on celebrating your differences rather than trying to change one another. ${SIGN_NAMES[sign1]}'s ${SIGN_ELEMENTS[sign1]} energy and ${SIGN_NAMES[sign2]}'s ${SIGN_ELEMENTS[sign2]} energy create a beautiful balance when given room to coexist.`,
    `Open communication is the key to unlocking this pairing's full potential. Make time for honest conversations about your needs, and remember that vulnerability is a strength in this relationship.`,
    `Build rituals and traditions together that honor both partners' natures. Whether it's a weekly date night or a shared creative project, consistency and intentionality will deepen your bond.`,
  ];
  const advice = advicePool[Math.floor(rand() * advicePool.length)];

  return {
    sign1: { sign: sign1, name: SIGN_NAMES[sign1], element: SIGN_ELEMENTS[sign1] },
    sign2: { sign: sign2, name: SIGN_NAMES[sign2], element: SIGN_ELEMENTS[sign2] },
    overallScore: overall,
    categoryScores,
    strengths,
    challenges,
    summary,
    advice,
  };
}

/* ------------------------------------------------------------------
   GET /api/compatibility?sign1=aries&sign2=leo
   ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const headers = {
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '59',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
  };

  const { searchParams } = request.nextUrl;
  const sign1 = searchParams.get('sign1')?.toLowerCase() as ZodiacSign | undefined;
  const sign2 = searchParams.get('sign2')?.toLowerCase() as ZodiacSign | undefined;

  if (!sign1 || !SIGNS.includes(sign1)) {
    return NextResponse.json(
      { error: 'Invalid or missing "sign1" parameter.', validSigns: SIGNS },
      { status: 400, headers },
    );
  }

  if (!sign2 || !SIGNS.includes(sign2)) {
    return NextResponse.json(
      { error: 'Invalid or missing "sign2" parameter.', validSigns: SIGNS },
      { status: 400, headers },
    );
  }

  const response = buildResponse(sign1, sign2);

  return NextResponse.json(response, { status: 200, headers });
}
