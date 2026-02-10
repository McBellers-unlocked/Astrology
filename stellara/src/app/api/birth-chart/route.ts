import { NextRequest, NextResponse } from 'next/server';
import type {
  BirthChartInput,
  BirthChartData,
  PlanetPosition,
  HouseCusp,
  Aspect,
  ZodiacSign,
  Planet,
  AspectType,
  Element,
  Modality,
} from '@/types/astrology';

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const PLANETS: Planet[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'north_node', 'south_node', 'chiron',
];

const ASPECT_TYPES: AspectType[] = [
  'conjunction', 'sextile', 'square', 'trine', 'opposition',
];

/* ------------------------------------------------------------------
   Seeded PRNG for deterministic mock data
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
   Mock chart generator
   ------------------------------------------------------------------ */

function generateMockChart(input: BirthChartInput): BirthChartData {
  const seedStr = `${input.birthDate}-${input.birthTime}-${input.latitude.toFixed(2)}-${input.longitude.toFixed(2)}`;
  const rand = seededRandom(hashCode(seedStr));

  // Generate planet positions
  const planets: PlanetPosition[] = PLANETS.map((planet, idx) => {
    const signIdx = Math.floor(rand() * 12);
    const degree = Math.floor(rand() * 30);
    const minute = Math.floor(rand() * 60);
    const house = (Math.floor(rand() * 12) + 1);
    const exactDegree = signIdx * 30 + degree + minute / 60;
    const retrograde = planet !== 'sun' && planet !== 'moon' && rand() < 0.25;

    return {
      planet,
      sign: SIGNS[signIdx],
      degree,
      minute,
      retrograde,
      house,
      exactDegree: parseFloat(exactDegree.toFixed(4)),
    };
  });

  // Generate house cusps
  const ascSignIdx = Math.floor(rand() * 12);
  const houses: HouseCusp[] = Array.from({ length: 12 }, (_, i) => {
    const signIdx = (ascSignIdx + i) % 12;
    const degree = Math.floor(rand() * 30);
    const minute = Math.floor(rand() * 60);

    return {
      house: i + 1,
      sign: SIGNS[signIdx],
      degree,
      minute,
    };
  });

  // Generate aspects between planets
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      if (rand() < 0.35) {
        const aspectType = ASPECT_TYPES[Math.floor(rand() * ASPECT_TYPES.length)];
        const orb = parseFloat((rand() * 8).toFixed(2));
        const applying = rand() < 0.5;

        const targetAngles: Record<string, number> = {
          conjunction: 0,
          sextile: 60,
          square: 90,
          trine: 120,
          opposition: 180,
        };

        aspects.push({
          planet1: planets[i].planet,
          planet2: planets[j].planet,
          type: aspectType,
          orb,
          applying,
          exactDegree: targetAngles[aspectType] ?? 0,
        });
      }
    }
  }

  // Ascendant and Midheaven
  const ascendant = {
    sign: SIGNS[ascSignIdx],
    degree: houses[0].degree,
  };

  const mcSignIdx = (ascSignIdx + 9) % 12;
  const midheaven = {
    sign: SIGNS[mcSignIdx],
    degree: houses[9]?.degree ?? Math.floor(rand() * 30),
  };

  // Element and modality balance
  const elementBalance: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityBalance: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  const signElements: Record<number, Element> = {
    0: 'fire', 1: 'earth', 2: 'air', 3: 'water',
    4: 'fire', 5: 'earth', 6: 'air', 7: 'water',
    8: 'fire', 9: 'earth', 10: 'air', 11: 'water',
  };

  const signModalities: Record<number, Modality> = {
    0: 'cardinal', 1: 'fixed', 2: 'mutable',
    3: 'cardinal', 4: 'fixed', 5: 'mutable',
    6: 'cardinal', 7: 'fixed', 8: 'mutable',
    9: 'cardinal', 10: 'fixed', 11: 'mutable',
  };

  for (const planet of planets) {
    const signIdx = SIGNS.indexOf(planet.sign);
    elementBalance[signElements[signIdx]] += 1;
    modalityBalance[signModalities[signIdx]] += 1;
  }

  return {
    planets,
    houses,
    aspects,
    ascendant,
    midheaven,
    elementBalance,
    modalityBalance,
  };
}

/* ------------------------------------------------------------------
   Validation
   ------------------------------------------------------------------ */

interface ValidationError {
  field: string;
  message: string;
}

function validateInput(body: unknown): { valid: true; data: BirthChartInput } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object.' }] };
  }

  const b = body as Record<string, unknown>;

  if (!b.birthDate || typeof b.birthDate !== 'string') {
    errors.push({ field: 'birthDate', message: 'birthDate is required and must be an ISO date string (YYYY-MM-DD).' });
  } else if (isNaN(Date.parse(b.birthDate))) {
    errors.push({ field: 'birthDate', message: 'birthDate must be a valid date.' });
  }

  if (!b.birthTime || typeof b.birthTime !== 'string') {
    errors.push({ field: 'birthTime', message: 'birthTime is required and must be in HH:mm format.' });
  } else if (!/^\d{2}:\d{2}$/.test(b.birthTime)) {
    errors.push({ field: 'birthTime', message: 'birthTime must match HH:mm format.' });
  }

  if (b.latitude === undefined || typeof b.latitude !== 'number') {
    errors.push({ field: 'latitude', message: 'latitude is required and must be a number.' });
  } else if (b.latitude < -90 || b.latitude > 90) {
    errors.push({ field: 'latitude', message: 'latitude must be between -90 and 90.' });
  }

  if (b.longitude === undefined || typeof b.longitude !== 'number') {
    errors.push({ field: 'longitude', message: 'longitude is required and must be a number.' });
  } else if (b.longitude < -180 || b.longitude > 180) {
    errors.push({ field: 'longitude', message: 'longitude must be between -180 and 180.' });
  }

  if (!b.location || typeof b.location !== 'string') {
    errors.push({ field: 'location', message: 'location is required and must be a string.' });
  }

  if (!b.timezone || typeof b.timezone !== 'string') {
    errors.push({ field: 'timezone', message: 'timezone is required and must be a valid IANA timezone string.' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      birthDate: b.birthDate as string,
      birthTime: b.birthTime as string,
      latitude: b.latitude as number,
      longitude: b.longitude as number,
      location: b.location as string,
      timezone: b.timezone as string,
    },
  };
}

/* ------------------------------------------------------------------
   POST /api/birth-chart
   ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  const headers = {
    'X-RateLimit-Limit': '30',
    'X-RateLimit-Remaining': '29',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
    'Cache-Control': 'private, no-cache',
  };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400, headers },
    );
  }

  const result = validateInput(body);

  if (!result.valid) {
    return NextResponse.json(
      { error: 'Validation failed.', details: result.errors },
      { status: 422, headers },
    );
  }

  const chart = generateMockChart(result.data);

  return NextResponse.json(
    {
      input: result.data,
      chart,
      generatedAt: new Date().toISOString(),
    },
    { status: 200, headers },
  );
}
