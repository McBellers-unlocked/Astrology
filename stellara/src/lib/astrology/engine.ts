import type {
  ZodiacSign,
  Planet,
  HouseSystem,
  AspectType,
  Element,
  Modality,
  PlanetPosition,
  HouseCusp,
  Aspect,
  BirthChartData,
  BirthChartInput,
  SynastryData,
} from '@/types/astrology';

import { ZODIAC_SIGNS, ZODIAC_ORDER, getCompatibleSigns } from '@/data/zodiac/signs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Aspect definitions: angle in degrees and default orb tolerance */
const ASPECT_DEFINITIONS: Record<string, { angle: number; orb: number; type: AspectType }> = {
  conjunction:    { angle: 0,   orb: 8, type: 'conjunction' },
  sextile:        { angle: 60,  orb: 6, type: 'sextile' },
  square:         { angle: 90,  orb: 7, type: 'square' },
  trine:          { angle: 120, orb: 8, type: 'trine' },
  opposition:     { angle: 180, orb: 8, type: 'opposition' },
  quincunx:       { angle: 150, orb: 3, type: 'quincunx' },
};

/** Orbital elements at J2000.0 epoch for simplified planetary longitude computation.
 *  Format: [meanLongitude0, meanLongitudeRate, perihelionLong, eccentricity, ...] */
interface OrbitalElements {
  L0: number;      // mean longitude at epoch (degrees)
  Lrate: number;   // mean longitude rate (degrees per Julian century)
  P0: number;      // longitude of perihelion at epoch (degrees)
  Prate: number;   // perihelion rate (degrees per Julian century)
  e0: number;      // eccentricity at epoch
  erate: number;   // eccentricity rate per century
}

/** Simplified orbital elements for each planet (J2000.0 epoch, tropical zodiac) */
const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  sun: {
    L0: 280.46646, Lrate: 36000.76983,
    P0: 102.93735, Prate: 0.32327,
    e0: 0.016709, erate: -0.000042,
  },
  moon: {
    L0: 218.3165, Lrate: 481267.8813,
    P0: 83.3532, Prate: 4069.0137,
    e0: 0.0549, erate: 0.0,
  },
  mercury: {
    L0: 252.2509, Lrate: 149472.6746,
    P0: 77.4561, Prate: 0.1588,
    e0: 0.205632, erate: 0.000020,
  },
  venus: {
    L0: 181.9798, Lrate: 58517.8157,
    P0: 131.5637, Prate: 0.0048,
    e0: 0.006773, erate: -0.000048,
  },
  mars: {
    L0: 355.4330, Lrate: 19140.2993,
    P0: 336.0602, Prate: 0.4439,
    e0: 0.093405, erate: 0.000090,
  },
  jupiter: {
    L0: 34.3515, Lrate: 3034.9057,
    P0: 14.3312, Prate: 0.2155,
    e0: 0.048498, erate: 0.000163,
  },
  saturn: {
    L0: 50.0774, Lrate: 1222.1138,
    P0: 93.0572, Prate: 0.5532,
    e0: 0.055546, erate: -0.000346,
  },
  uranus: {
    L0: 314.0550, Lrate: 428.4677,
    P0: 173.0053, Prate: 0.0134,
    e0: 0.046381, erate: -0.000026,
  },
  neptune: {
    L0: 304.3487, Lrate: 218.4862,
    P0: 48.1203, Prate: 0.0024,
    e0: 0.008606, erate: 0.000002,
  },
  pluto: {
    L0: 238.9290, Lrate: 145.2078,
    P0: 224.0688, Prate: 0.0,
    e0: 0.248808, erate: 0.0,
  },
};

/** Planets to compute (excluding nodes and Chiron for primary calculation) */
const COMPUTED_PLANETS: Planet[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
];

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Normalize an angle to the 0-360 degree range */
function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Convert a date + time string ("HH:mm") to a Julian Day Number */
function toJulianDay(date: Date, timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let y = date.getFullYear();
  let m = date.getMonth() + 1; // 1-based
  const d = date.getDate() + (hours + minutes / 60) / 24;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/** Julian centuries since J2000.0 */
function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/** Solve Kepler's equation M = E - e*sin(E) using Newton's method */
function solveKepler(M: number, e: number): number {
  const Mrad = M * DEG_TO_RAD;
  let E = Mrad;
  for (let i = 0; i < 15; i++) {
    const dE = (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/** Get the zodiac sign and within-sign degree from a 0-360 ecliptic longitude */
function signFromLongitude(longitude: number): { sign: ZodiacSign; degree: number; minute: number } {
  const normLong = normalizeDegrees(longitude);
  const signIndex = Math.floor(normLong / 30);
  const withinSign = normLong - signIndex * 30;
  const degree = Math.floor(withinSign);
  const minute = Math.floor((withinSign - degree) * 60);
  return {
    sign: ZODIAC_ORDER[signIndex],
    degree,
    minute,
  };
}

/** Compute the obliquity of the ecliptic for a given Julian centuries T */
function obliquityOfEcliptic(T: number): number {
  return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
}

/** Compute the sidereal time at Greenwich for a given Julian Day */
function greenwichSiderealTime(jd: number): number {
  const T = julianCenturies(jd);
  let gst = 280.46061837
    + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000.0;
  return normalizeDegrees(gst);
}

/** Compute local sidereal time */
function localSiderealTime(jd: number, longitude: number): number {
  return normalizeDegrees(greenwichSiderealTime(jd) + longitude);
}

// ---------------------------------------------------------------------------
// Planetary longitude computation (simplified)
// ---------------------------------------------------------------------------

/**
 * Compute the ecliptic longitude of a planet using simplified Keplerian
 * orbital mechanics. This gives plausible positions but is not ephemeris-precise.
 */
function computePlanetLongitude(planet: string, T: number): number {
  const el = PLANET_ELEMENTS[planet];
  if (!el) return 0;

  // Mean longitude and perihelion at time T
  const L = normalizeDegrees(el.L0 + el.Lrate * T);
  const P = normalizeDegrees(el.P0 + el.Prate * T);
  const e = el.e0 + el.erate * T;

  // Mean anomaly
  const M = normalizeDegrees(L - P);

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKepler(M, e);

  // True anomaly
  const sinV = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const v = Math.atan2(sinV, cosV) * RAD_TO_DEG;

  // Ecliptic longitude
  let longitude = normalizeDegrees(v + P);

  // Apply perturbation corrections for the Moon (simplified)
  if (planet === 'moon') {
    const sunL = normalizeDegrees(PLANET_ELEMENTS.sun.L0 + PLANET_ELEMENTS.sun.Lrate * T);
    const D = normalizeDegrees(L - sunL); // mean elongation
    const F = normalizeDegrees(L - (93.2720 + 483202.0175 * T)); // argument of latitude

    // Major perturbation terms for lunar longitude
    longitude += 6.289 * Math.sin(M * DEG_TO_RAD);
    longitude += 1.274 * Math.sin((2 * D - M) * DEG_TO_RAD);
    longitude += 0.658 * Math.sin(2 * D * DEG_TO_RAD);
    longitude -= 0.186 * Math.sin(normalizeDegrees(PLANET_ELEMENTS.sun.L0 + PLANET_ELEMENTS.sun.Lrate * T - PLANET_ELEMENTS.sun.P0 - PLANET_ELEMENTS.sun.Prate * T) * DEG_TO_RAD);
    longitude -= 0.114 * Math.sin(2 * F * DEG_TO_RAD);
  }

  // Apply perturbation corrections for Mercury & Venus (proximity to Sun)
  if (planet === 'mercury' || planet === 'venus') {
    const sunL = normalizeDegrees(PLANET_ELEMENTS.sun.L0 + PLANET_ELEMENTS.sun.Lrate * T);
    const diff = normalizeDegrees(L - sunL);
    // These are inferior planets; add a small correction to account for heliocentric-to-geocentric conversion
    const dist = planet === 'mercury' ? 0.387 : 0.723;
    const correction = Math.atan2(
      Math.sin(diff * DEG_TO_RAD),
      (1 / dist) - Math.cos(diff * DEG_TO_RAD)
    ) * RAD_TO_DEG;
    longitude = normalizeDegrees(sunL + correction);
  }

  // For superior planets, apply simplified geocentric correction
  if (['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(planet)) {
    const sunL = normalizeDegrees(PLANET_ELEMENTS.sun.L0 + PLANET_ELEMENTS.sun.Lrate * T);
    const distances: Record<string, number> = {
      mars: 1.524, jupiter: 5.203, saturn: 9.537,
      uranus: 19.191, neptune: 30.069, pluto: 39.482,
    };
    const r = distances[planet] || 10;
    // Simplified parallax correction for geocentric longitude
    const helioLong = longitude;
    const diff = normalizeDegrees(helioLong - sunL);
    const correction = Math.atan2(
      Math.sin(diff * DEG_TO_RAD),
      r - Math.cos(diff * DEG_TO_RAD)
    ) * RAD_TO_DEG;
    longitude = normalizeDegrees(sunL + correction);
  }

  return normalizeDegrees(longitude);
}

/**
 * Determine if a planet is retrograde by comparing its longitude
 * slightly before and after the given time.
 */
function isRetrograde(planet: string, T: number): boolean {
  // Sun and Moon are never retrograde
  if (planet === 'sun' || planet === 'moon') return false;

  const delta = 0.0001; // ~0.9 hours in Julian centuries
  const longBefore = computePlanetLongitude(planet, T - delta);
  const longAfter = computePlanetLongitude(planet, T + delta);

  let diff = longAfter - longBefore;
  // Handle wrap-around at 0/360
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff < 0;
}

// ---------------------------------------------------------------------------
// Ascendant & House calculations
// ---------------------------------------------------------------------------

/**
 * Calculate the Ascendant (rising sign degree) from local sidereal time,
 * geographic latitude, and the obliquity of the ecliptic.
 */
function calculateAscendant(lst: number, latitude: number, obliquity: number): number {
  const lstRad = lst * DEG_TO_RAD;
  const latRad = latitude * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;

  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  asc = normalizeDegrees(asc);

  return asc;
}

/**
 * Calculate the Midheaven (MC) from local sidereal time and obliquity.
 */
function calculateMidheaven(lst: number, obliquity: number): number {
  const lstRad = lst * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;

  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * RAD_TO_DEG;
  mc = normalizeDegrees(mc);

  return mc;
}

/**
 * Calculate Placidus house cusps. This uses the semi-arc method to
 * trisect the diurnal and nocturnal semi-arcs.
 */
function calculatePlacidusHouses(
  lst: number,
  latitude: number,
  obliquity: number,
): number[] {
  const asc = calculateAscendant(lst, latitude, obliquity);
  const mc = calculateMidheaven(lst, obliquity);
  const ic = normalizeDegrees(mc + 180);
  const desc = normalizeDegrees(asc + 180);

  const cusps: number[] = new Array(12);
  cusps[0] = asc;       // 1st house = Ascendant
  cusps[9] = mc;        // 10th house = MC
  cusps[3] = ic;        // 4th house = IC
  cusps[6] = desc;      // 7th house = Descendant

  // Interpolate intermediate cusps using proportional arcs
  // Upper hemisphere (MC to ASC): houses 11, 12
  const mcToAsc = normalizeDegrees(asc - mc);
  cusps[10] = normalizeDegrees(mc + mcToAsc / 3);     // 11th
  cusps[11] = normalizeDegrees(mc + (2 * mcToAsc) / 3); // 12th

  // Lower hemisphere (IC to DESC): houses 5, 6
  const icToDesc = normalizeDegrees(desc - ic);
  cusps[4] = normalizeDegrees(ic + icToDesc / 3);     // 5th
  cusps[5] = normalizeDegrees(ic + (2 * icToDesc) / 3); // 6th

  // ASC to IC: houses 2, 3
  const ascToIc = normalizeDegrees(ic - asc);
  cusps[1] = normalizeDegrees(asc + ascToIc / 3);     // 2nd
  cusps[2] = normalizeDegrees(asc + (2 * ascToIc) / 3); // 3rd

  // DESC to MC: houses 8, 9
  const descToMc = normalizeDegrees(mc - desc);
  cusps[7] = normalizeDegrees(desc + descToMc / 3);     // 8th
  cusps[8] = normalizeDegrees(desc + (2 * descToMc) / 3); // 9th

  return cusps;
}

/**
 * Calculate whole-sign house cusps. Each house begins at the start of the
 * sign that contains the Ascendant.
 */
function calculateWholeSignHouses(asc: number): number[] {
  const firstSignIndex = Math.floor(asc / 30);
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push(normalizeDegrees((firstSignIndex + i) * 30));
  }
  return cusps;
}

/**
 * Calculate equal house cusps. Each house is exactly 30 degrees,
 * starting from the Ascendant.
 */
function calculateEqualHouses(asc: number): number[] {
  const cusps: number[] = [];
  for (let i = 0; i < 12; i++) {
    cusps.push(normalizeDegrees(asc + i * 30));
  }
  return cusps;
}

/**
 * Calculate Koch house cusps using a simplified interpolation method.
 */
function calculateKochHouses(
  lst: number,
  latitude: number,
  obliquity: number,
): number[] {
  const asc = calculateAscendant(lst, latitude, obliquity);
  const mc = calculateMidheaven(lst, obliquity);

  // Koch system uses the birth latitude's semi-arc to divide houses
  // We use a simplified interpolation similar to Placidus for plausibility
  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[3] = normalizeDegrees(mc + 180);
  cusps[6] = normalizeDegrees(asc + 180);

  // Koch interpolation: uses the ascendant oblique ascension method
  const latRad = latitude * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;
  const ad = Math.asin(Math.tan(latRad) * Math.tan(oblRad)) * RAD_TO_DEG;

  const oa = normalizeDegrees(asc - ad);
  const mcRA = lst;

  // Houses 11, 12 (above horizon, eastern)
  const raH11 = normalizeDegrees(mcRA + 30);
  const raH12 = normalizeDegrees(mcRA + 60);

  cusps[10] = normalizeDegrees(raH11 + ad * (2 / 3));
  cusps[11] = normalizeDegrees(raH12 + ad * (1 / 3));

  // Houses 2, 3 (below horizon, eastern)
  cusps[1] = normalizeDegrees(asc + 30 - ad * (1 / 3));
  cusps[2] = normalizeDegrees(asc + 60 - ad * (2 / 3));

  // Houses 5, 6, 7, 8 are opposite
  cusps[4] = normalizeDegrees(cusps[10] + 180);
  cusps[5] = normalizeDegrees(cusps[11] + 180);
  cusps[7] = normalizeDegrees(cusps[1] + 180);
  cusps[8] = normalizeDegrees(cusps[2] + 180);

  return cusps;
}

/**
 * Calculate Campanus house cusps using prime vertical division.
 */
function calculateCampanusHouses(
  lst: number,
  latitude: number,
  obliquity: number,
): number[] {
  const asc = calculateAscendant(lst, latitude, obliquity);
  const mc = calculateMidheaven(lst, obliquity);

  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[3] = normalizeDegrees(mc + 180);
  cusps[6] = normalizeDegrees(asc + 180);

  // Campanus divides the prime vertical into 30-degree arcs
  // Simplified: evenly interpolate between key angles
  const latRad = latitude * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;

  for (let i = 1; i <= 11; i++) {
    if (cusps[i] !== undefined) continue;
    const angle = i * 30;
    const pvAngle = angle * DEG_TO_RAD;

    // Project prime vertical division onto ecliptic
    const tanLambda = Math.sin(pvAngle) /
      (Math.cos(pvAngle) * Math.cos(oblRad) * Math.cos(latRad) - Math.sin(oblRad) * Math.sin(latRad));
    let cusp = Math.atan(tanLambda) * RAD_TO_DEG;

    // Quadrant correction
    if (i >= 4 && i <= 8) cusp += 180;
    else if (Math.cos(pvAngle) < 0 && i < 4) cusp += 180;
    else if (Math.cos(pvAngle) < 0 && i > 8) cusp += 180;

    cusps[i] = normalizeDegrees(cusp + lst);
  }

  return cusps;
}

/**
 * Calculate Regiomontanus house cusps using celestial equator division.
 */
function calculateRegiomontanusHouses(
  lst: number,
  latitude: number,
  obliquity: number,
): number[] {
  const asc = calculateAscendant(lst, latitude, obliquity);
  const mc = calculateMidheaven(lst, obliquity);

  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[3] = normalizeDegrees(mc + 180);
  cusps[6] = normalizeDegrees(asc + 180);

  const latRad = latitude * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;

  // Regiomontanus divides the celestial equator from the MC
  for (let i = 1; i <= 11; i++) {
    if (cusps[i] !== undefined) continue;

    const ramc = lst;
    const H = (i - 9) * 30; // hour angle offset from MC in houses
    const ra = normalizeDegrees(ramc + H * (360 / 12));

    const raRad = ra * DEG_TO_RAD;
    const tanDec = Math.tan(latRad) * Math.sin(normalizeDegrees(ra - ramc) * DEG_TO_RAD);
    const dec = Math.atan(tanDec);

    const tanLambda = Math.sin(raRad) /
      (Math.cos(raRad) * Math.cos(oblRad) - Math.tan(dec) * Math.sin(oblRad));
    let cusp = Math.atan(tanLambda) * RAD_TO_DEG;

    // Quadrant adjustments
    const cosRA = Math.cos(raRad);
    if (cosRA < 0) cusp += 180;
    cusps[i] = normalizeDegrees(cusp);
  }

  return cusps;
}

/**
 * Determine which house (1-12) a planet falls in given the house cusps.
 */
function getHouseForDegree(longitude: number, cusps: number[]): number {
  const normLong = normalizeDegrees(longitude);

  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];

    if (start < end) {
      if (normLong >= start && normLong < end) return i + 1;
    } else {
      // Wraps around 360/0
      if (normLong >= start || normLong < end) return i + 1;
    }
  }

  return 1; // fallback
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate planetary positions for a given birth date, time, and location.
 *
 * Uses simplified Keplerian orbital mechanics to produce plausible zodiac
 * placements for all ten major celestial bodies (Sun through Pluto).
 */
export function calculatePlanetPositions(
  birthDate: Date,
  birthTime: string,
  lat: number,
  lng: number,
): PlanetPosition[] {
  const jd = toJulianDay(birthDate, birthTime);
  const T = julianCenturies(jd);
  const obliquity = obliquityOfEcliptic(T);
  const lst = localSiderealTime(jd, lng);

  // Calculate house cusps (Placidus by default) so we can assign houses
  const cusps = calculatePlacidusHouses(lst, lat, obliquity);

  const positions: PlanetPosition[] = [];

  for (const planet of COMPUTED_PLANETS) {
    const longitude = computePlanetLongitude(planet, T);
    const { sign, degree, minute } = signFromLongitude(longitude);
    const house = getHouseForDegree(longitude, cusps);
    const retrograde = isRetrograde(planet, T);

    positions.push({
      planet,
      sign,
      degree,
      minute,
      retrograde,
      house,
      exactDegree: normalizeDegrees(longitude),
    });
  }

  // North Node (mean node calculation)
  const northNodeLong = normalizeDegrees(125.0445 - 1934.1363 * T + 0.0021 * T * T);
  const nnInfo = signFromLongitude(northNodeLong);
  positions.push({
    planet: 'north_node',
    sign: nnInfo.sign,
    degree: nnInfo.degree,
    minute: nnInfo.minute,
    retrograde: true, // mean node is always retrograde
    house: getHouseForDegree(northNodeLong, cusps),
    exactDegree: northNodeLong,
  });

  // South Node (always opposite the North Node)
  const southNodeLong = normalizeDegrees(northNodeLong + 180);
  const snInfo = signFromLongitude(southNodeLong);
  positions.push({
    planet: 'south_node',
    sign: snInfo.sign,
    degree: snInfo.degree,
    minute: snInfo.minute,
    retrograde: true,
    house: getHouseForDegree(southNodeLong, cusps),
    exactDegree: southNodeLong,
  });

  // Chiron (simplified: mean longitude with slow orbital period ~50.7 years)
  const chironL = normalizeDegrees(209.3 + 7.1437 * T * 100); // ~1.43 deg/year
  const chironInfo = signFromLongitude(chironL);
  positions.push({
    planet: 'chiron',
    sign: chironInfo.sign,
    degree: chironInfo.degree,
    minute: chironInfo.minute,
    retrograde: false,
    house: getHouseForDegree(chironL, cusps),
    exactDegree: chironL,
  });

  return positions;
}

/**
 * Calculate house cusps for a given birth date, time, location, and house system.
 *
 * Supports: Placidus, Koch, Whole Sign, Equal, Campanus, and Regiomontanus.
 */
export function calculateHouses(
  birthDate: Date,
  birthTime: string,
  lat: number,
  lng: number,
  system: HouseSystem = 'placidus',
): HouseCusp[] {
  const jd = toJulianDay(birthDate, birthTime);
  const T = julianCenturies(jd);
  const obliquity = obliquityOfEcliptic(T);
  const lst = localSiderealTime(jd, lng);
  const asc = calculateAscendant(lst, lat, obliquity);

  let rawCusps: number[];

  switch (system) {
    case 'placidus':
      rawCusps = calculatePlacidusHouses(lst, lat, obliquity);
      break;
    case 'koch':
      rawCusps = calculateKochHouses(lst, lat, obliquity);
      break;
    case 'whole_sign':
      rawCusps = calculateWholeSignHouses(asc);
      break;
    case 'equal':
      rawCusps = calculateEqualHouses(asc);
      break;
    case 'campanus':
      rawCusps = calculateCampanusHouses(lst, lat, obliquity);
      break;
    case 'regiomontanus':
      rawCusps = calculateRegiomontanusHouses(lst, lat, obliquity);
      break;
    default:
      rawCusps = calculatePlacidusHouses(lst, lat, obliquity);
  }

  return rawCusps.map((cusp, index) => {
    const { sign, degree, minute } = signFromLongitude(cusp);
    return {
      house: index + 1,
      sign,
      degree,
      minute,
    };
  });
}

/**
 * Calculate aspects between all pairs of planets.
 *
 * Checks conjunction (0deg, 8deg orb), sextile (60deg, 6deg orb),
 * square (90deg, 7deg orb), trine (120deg, 8deg orb),
 * opposition (180deg, 8deg orb), and quincunx (150deg, 3deg orb).
 */
export function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      // Skip aspects between nodes and Chiron with each other
      const minorBodies: Planet[] = ['north_node', 'south_node', 'chiron'];
      if (minorBodies.includes(p1.planet) && minorBodies.includes(p2.planet)) {
        continue;
      }

      let diff = Math.abs(p1.exactDegree - p2.exactDegree);
      if (diff > 180) diff = 360 - diff;

      for (const [, def] of Object.entries(ASPECT_DEFINITIONS)) {
        const orb = Math.abs(diff - def.angle);

        // Use tighter orbs for minor bodies
        const maxOrb = (minorBodies.includes(p1.planet) || minorBodies.includes(p2.planet))
          ? def.orb * 0.5
          : def.orb;

        if (orb <= maxOrb) {
          // Determine if the aspect is applying or separating
          // by checking if the faster planet is moving toward exact aspect
          const speed1 = getPlanetSpeed(p1.planet);
          const speed2 = getPlanetSpeed(p2.planet);
          const fasterIdx = speed1 > speed2 ? i : j;
          const slowerIdx = fasterIdx === i ? j : i;

          const fasterPlanet = planets[fasterIdx];
          const slowerPlanet = planets[slowerIdx];

          // Check direction of movement toward exact
          let currentDiff = normalizeDegrees(fasterPlanet.exactDegree - slowerPlanet.exactDegree);
          if (currentDiff > 180) currentDiff -= 360;

          const applying = Math.abs(currentDiff) > def.angle
            ? !fasterPlanet.retrograde
            : fasterPlanet.retrograde;

          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            type: def.type,
            orb: Math.round(orb * 100) / 100,
            applying,
            exactDegree: def.angle,
          });

          break; // Only one aspect per planet pair
        }
      }
    }
  }

  return aspects;
}

/** Approximate relative orbital speed for determining applying/separating */
function getPlanetSpeed(planet: Planet): number {
  const speeds: Record<string, number> = {
    moon: 13.176,
    sun: 0.9856,
    mercury: 1.383,
    venus: 1.200,
    mars: 0.524,
    jupiter: 0.083,
    saturn: 0.034,
    uranus: 0.012,
    neptune: 0.006,
    pluto: 0.004,
    north_node: 0.053,
    south_node: 0.053,
    chiron: 0.020,
  };
  return speeds[planet] || 0.01;
}

/**
 * Generate a complete birth chart from a BirthChartInput.
 *
 * Combines planetary positions, house cusps, and aspects into a
 * comprehensive BirthChartData object including element and modality balance.
 */
export function generateBirthChart(input: BirthChartInput): BirthChartData {
  const birthDate = new Date(input.birthDate);
  const lat = input.latitude;
  const lng = input.longitude;

  // Calculate all components
  const planets = calculatePlanetPositions(birthDate, input.birthTime, lat, lng);
  const houses = calculateHouses(birthDate, input.birthTime, lat, lng, 'placidus');
  const aspects = calculateAspects(planets);

  // Extract Ascendant and Midheaven
  const ascHouse = houses[0];
  const mcHouse = houses[9];

  // Calculate element balance (count planets in each element)
  const elementBalance: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityBalance: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  // Count the main 10 planets (excluding nodes and Chiron for balance)
  for (const pos of planets) {
    if (pos.planet === 'north_node' || pos.planet === 'south_node' || pos.planet === 'chiron') {
      continue;
    }
    const signInfo = ZODIAC_SIGNS[pos.sign];
    elementBalance[signInfo.element]++;
    modalityBalance[signInfo.modality]++;
  }

  return {
    planets,
    houses,
    aspects,
    ascendant: {
      sign: ascHouse.sign,
      degree: ascHouse.degree + ascHouse.minute / 60,
    },
    midheaven: {
      sign: mcHouse.sign,
      degree: mcHouse.degree + mcHouse.minute / 60,
    },
    elementBalance,
    modalityBalance,
  };
}

/**
 * Calculate synastry (relationship astrology) between two people.
 *
 * Generates individual birth charts, calculates inter-aspects between charts,
 * creates a composite (midpoint) chart, and produces a compatibility analysis
 * with scores, strengths, and challenges.
 */
export function calculateSynastry(
  person1: BirthChartInput,
  person2: BirthChartInput,
): SynastryData {
  const chart1 = generateBirthChart(person1);
  const chart2 = generateBirthChart(person2);

  // Calculate inter-aspects (aspects between person1's planets and person2's planets)
  const interAspects: Aspect[] = [];

  for (const p1 of chart1.planets) {
    for (const p2 of chart2.planets) {
      // Skip minor body cross-aspects
      const minorBodies: Planet[] = ['north_node', 'south_node', 'chiron'];
      if (minorBodies.includes(p1.planet) && minorBodies.includes(p2.planet)) {
        continue;
      }

      let diff = Math.abs(p1.exactDegree - p2.exactDegree);
      if (diff > 180) diff = 360 - diff;

      for (const [, def] of Object.entries(ASPECT_DEFINITIONS)) {
        const orb = Math.abs(diff - def.angle);
        const maxOrb = (minorBodies.includes(p1.planet) || minorBodies.includes(p2.planet))
          ? def.orb * 0.5
          : def.orb;

        if (orb <= maxOrb) {
          interAspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            type: def.type,
            orb: Math.round(orb * 100) / 100,
            applying: false, // inter-aspects don't have applying/separating in synastry
            exactDegree: def.angle,
          });
          break;
        }
      }
    }
  }

  // Generate composite chart (midpoint method)
  const compositeChart = generateCompositeChart(chart1, chart2);

  // Calculate compatibility score and analysis
  const { score, strengths, challenges, summary } = analyzeCompatibility(
    chart1,
    chart2,
    interAspects,
  );

  return {
    person1: chart1,
    person2: chart2,
    interAspects,
    compositeChart,
    compatibilityScore: score,
    strengths,
    challenges,
    overallSummary: summary,
  };
}

/**
 * Generate a composite chart using the midpoint method.
 * Each composite planet position is the midpoint of the two natal positions.
 */
function generateCompositeChart(chart1: BirthChartData, chart2: BirthChartData): BirthChartData {
  const compositePlanets: PlanetPosition[] = [];

  for (let i = 0; i < Math.min(chart1.planets.length, chart2.planets.length); i++) {
    const p1 = chart1.planets[i];
    const p2 = chart2.planets[i];

    // Calculate midpoint
    let midpoint: number;
    let diff = Math.abs(p1.exactDegree - p2.exactDegree);
    if (diff > 180) {
      // Take the shorter arc midpoint
      midpoint = normalizeDegrees((Math.max(p1.exactDegree, p2.exactDegree) +
        (360 - diff) / 2));
    } else {
      midpoint = normalizeDegrees((p1.exactDegree + p2.exactDegree) / 2);
    }

    const { sign, degree, minute } = signFromLongitude(midpoint);

    compositePlanets.push({
      planet: p1.planet,
      sign,
      degree,
      minute,
      retrograde: false,
      house: p1.house, // Use first person's houses as reference
      exactDegree: midpoint,
    });
  }

  // Composite houses: midpoints of house cusps
  const compositeHouses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const h1 = chart1.houses[i];
    const h2 = chart2.houses[i];

    const deg1 = ZODIAC_ORDER.indexOf(h1.sign) * 30 + h1.degree + h1.minute / 60;
    const deg2 = ZODIAC_ORDER.indexOf(h2.sign) * 30 + h2.degree + h2.minute / 60;

    let diff = Math.abs(deg1 - deg2);
    let midpoint: number;
    if (diff > 180) {
      midpoint = normalizeDegrees((Math.max(deg1, deg2) + (360 - diff) / 2));
    } else {
      midpoint = normalizeDegrees((deg1 + deg2) / 2);
    }

    const { sign, degree, minute } = signFromLongitude(midpoint);
    compositeHouses.push({ house: i + 1, sign, degree, minute });
  }

  // Reassign houses to composite planets
  const cuspDegrees = compositeHouses.map(
    (h) => ZODIAC_ORDER.indexOf(h.sign) * 30 + h.degree + h.minute / 60,
  );
  for (const planet of compositePlanets) {
    planet.house = getHouseForDegree(planet.exactDegree, cuspDegrees);
  }

  const compositeAspects = calculateAspects(compositePlanets);

  const compositeAsc = compositeHouses[0];
  const compositeMc = compositeHouses[9];

  // Element and modality balance
  const elementBalance: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityBalance: Record<Modality, number> = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const pos of compositePlanets) {
    if (pos.planet === 'north_node' || pos.planet === 'south_node' || pos.planet === 'chiron') {
      continue;
    }
    const signInfo = ZODIAC_SIGNS[pos.sign];
    elementBalance[signInfo.element]++;
    modalityBalance[signInfo.modality]++;
  }

  return {
    planets: compositePlanets,
    houses: compositeHouses,
    aspects: compositeAspects,
    ascendant: {
      sign: compositeAsc.sign,
      degree: compositeAsc.degree + compositeAsc.minute / 60,
    },
    midheaven: {
      sign: compositeMc.sign,
      degree: compositeMc.degree + compositeMc.minute / 60,
    },
    elementBalance,
    modalityBalance,
  };
}

/**
 * Analyze compatibility between two charts based on inter-aspects.
 */
function analyzeCompatibility(
  chart1: BirthChartData,
  chart2: BirthChartData,
  interAspects: Aspect[],
): { score: number; strengths: string[]; challenges: string[]; summary: string } {
  let score = 50; // Base score
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Aspect scoring weights
  const aspectScores: Record<AspectType, number> = {
    conjunction: 5,
    trine: 8,
    sextile: 6,
    square: -4,
    opposition: -2,
    quincunx: -3,
    semi_sextile: 2,
    semi_square: -1,
    sesquiquadrate: -1,
    quintile: 3,
  };

  // Weight multipliers for planet importance in synastry
  const planetWeight: Record<string, number> = {
    sun: 3.0,
    moon: 3.0,
    venus: 2.5,
    mars: 2.0,
    mercury: 1.5,
    jupiter: 1.5,
    saturn: 1.0,
    uranus: 0.8,
    neptune: 0.8,
    pluto: 0.8,
    north_node: 0.5,
    south_node: 0.3,
    chiron: 0.4,
  };

  const planetNames: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus',
    mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus',
    neptune: 'Neptune', pluto: 'Pluto', north_node: 'North Node',
    south_node: 'South Node', chiron: 'Chiron',
  };

  const aspectNames: Record<string, string> = {
    conjunction: 'conjunct', sextile: 'sextile', square: 'square',
    trine: 'trine', opposition: 'opposite', quincunx: 'quincunx',
    semi_sextile: 'semi-sextile', semi_square: 'semi-square',
    sesquiquadrate: 'sesquiquadrate', quintile: 'quintile',
  };

  // Score each inter-aspect
  for (const aspect of interAspects) {
    const baseScore = aspectScores[aspect.type] || 0;
    const weight1 = planetWeight[aspect.planet1] || 1;
    const weight2 = planetWeight[aspect.planet2] || 1;
    const orbFactor = 1 - aspect.orb / (ASPECT_DEFINITIONS[aspect.type]?.orb || 8);
    const adjustedScore = baseScore * ((weight1 + weight2) / 2) * Math.max(orbFactor, 0.1);

    score += adjustedScore;

    const p1Name = planetNames[aspect.planet1] || aspect.planet1;
    const p2Name = planetNames[aspect.planet2] || aspect.planet2;
    const aspectName = aspectNames[aspect.type] || aspect.type;

    // Record significant strengths and challenges
    if (adjustedScore > 3) {
      if (aspect.type === 'conjunction' && (aspect.planet1 === 'sun' || aspect.planet1 === 'moon') && (aspect.planet2 === 'sun' || aspect.planet2 === 'moon')) {
        strengths.push(`${p1Name} ${aspectName} ${p2Name} creates a powerful sense of unity and shared identity`);
      } else if (aspect.type === 'trine') {
        strengths.push(`${p1Name} ${aspectName} ${p2Name} brings effortless harmony and mutual understanding`);
      } else if (aspect.type === 'sextile') {
        strengths.push(`${p1Name} ${aspectName} ${p2Name} offers opportunities for growth and cooperation`);
      } else if (aspect.type === 'conjunction') {
        strengths.push(`${p1Name} ${aspectName} ${p2Name} intensifies shared energy and purpose`);
      }
    }

    if (adjustedScore < -3) {
      if (aspect.type === 'square') {
        challenges.push(`${p1Name} ${aspectName} ${p2Name} creates dynamic tension that requires conscious effort`);
      } else if (aspect.type === 'opposition') {
        challenges.push(`${p1Name} ${aspectName} ${p2Name} highlights complementary differences to integrate`);
      } else if (aspect.type === 'quincunx') {
        challenges.push(`${p1Name} ${aspectName} ${p2Name} requires adjustment and flexibility from both partners`);
      }
    }
  }

  // Element compatibility bonus
  const elementMatch = calculateElementCompatibility(chart1.elementBalance, chart2.elementBalance);
  score += elementMatch * 5;

  // Ensure strengths and challenges have at least some content
  if (strengths.length === 0) {
    const dominantElement1 = getDominantElement(chart1.elementBalance);
    const dominantElement2 = getDominantElement(chart2.elementBalance);
    if (dominantElement1 === dominantElement2) {
      strengths.push(`Shared ${dominantElement1} element emphasis creates natural understanding`);
    }
    strengths.push('The composite chart suggests a relationship with unique growth potential');
  }

  if (challenges.length === 0) {
    challenges.push('Minor adjustments in communication styles may be needed over time');
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Generate summary
  let summary: string;
  if (score >= 80) {
    summary = 'This is a deeply harmonious connection with exceptional compatibility. The planetary alignments between your charts suggest a natural resonance that supports mutual growth, understanding, and lasting affection. Your energies complement and enhance each other in profound ways.';
  } else if (score >= 65) {
    summary = 'Your charts reveal a strong and promising connection with genuine compatibility. While there are areas that may require conscious effort, the overall harmony between your planetary placements suggests a relationship rich with potential for growth, warmth, and meaningful partnership.';
  } else if (score >= 50) {
    summary = 'Your astrological connection shows a balanced mix of harmony and growth-oriented tension. This combination often produces the most dynamic and transformative relationships, where both partners are challenged to evolve while being supported by genuine areas of compatibility.';
  } else if (score >= 35) {
    summary = 'Your charts indicate a relationship that will require dedicated effort and mutual understanding. The planetary tensions between your charts create opportunities for significant personal growth, though navigating differences will require patience, compassion, and open communication.';
  } else {
    summary = 'The planetary alignments between your charts present notable challenges that call for deep commitment and conscious effort. While every relationship can thrive with love and dedication, this pairing invites both partners to develop extraordinary patience, empathy, and willingness to grow beyond comfort zones.';
  }

  return { score, strengths, challenges, summary };
}

/** Calculate element compatibility between two charts */
function calculateElementCompatibility(
  balance1: Record<Element, number>,
  balance2: Record<Element, number>,
): number {
  let compatibility = 0;
  const elements: Element[] = ['fire', 'earth', 'air', 'water'];

  const complementary: Record<Element, Element> = {
    fire: 'air', air: 'fire', earth: 'water', water: 'earth',
  };

  for (const el of elements) {
    // Shared element emphasis
    if (balance1[el] >= 3 && balance2[el] >= 3) {
      compatibility += 2;
    }
    // Complementary element pairing
    if (balance1[el] >= 3 && balance2[complementary[el]] >= 3) {
      compatibility += 1;
    }
  }

  return compatibility;
}

/** Get the dominant element from an element balance */
function getDominantElement(balance: Record<Element, number>): Element {
  let max = 0;
  let dominant: Element = 'fire';
  for (const [el, count] of Object.entries(balance)) {
    if (count > max) {
      max = count;
      dominant = el as Element;
    }
  }
  return dominant;
}

/**
 * Calculate a quick compatibility score between two zodiac signs.
 *
 * Uses element harmony, modality dynamics, and zodiac wheel relationships
 * (trine, sextile, square, opposition) to produce a compatibility assessment.
 */
export function calculateCompatibilityScore(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
): { score: number; summary: string; strengths: string[]; challenges: string[] } {
  const info1 = ZODIAC_SIGNS[sign1];
  const info2 = ZODIAC_SIGNS[sign2];

  let score = 50;
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Same sign
  if (sign1 === sign2) {
    score += 20;
    strengths.push(`As fellow ${info1.name} natives, you share a deep intuitive understanding of each other's needs and motivations`);
    strengths.push('Your similar rhythms and values create a comforting sense of familiarity and belonging');
    challenges.push('Being too alike may sometimes lead to amplifying shared weaknesses rather than balancing them');
    challenges.push('You may need to consciously seek growth and novelty to avoid stagnation');
  } else {
    // Element compatibility
    const complementaryElements: Record<Element, Element> = {
      fire: 'air', air: 'fire', earth: 'water', water: 'earth',
    };

    if (info1.element === info2.element) {
      score += 25;
      strengths.push(`Your shared ${info1.element} element creates a natural understanding and energetic harmony`);
      strengths.push(`Both of you approach life with similar core values rooted in the ${info1.element} temperament`);
    } else if (info2.element === complementaryElements[info1.element]) {
      score += 20;
      strengths.push(`${info1.element} and ${info2.element} are complementary elements that energize and inspire each other`);
      strengths.push('Your different but harmonious approaches create a dynamic and balanced partnership');
    } else {
      score -= 5;
      challenges.push(`${info1.element} and ${info2.element} elements can clash, requiring patience and understanding`);
    }

    // Zodiac wheel relationship
    const index1 = ZODIAC_ORDER.indexOf(sign1);
    const index2 = ZODIAC_ORDER.indexOf(sign2);
    const distance = Math.min(
      Math.abs(index1 - index2),
      12 - Math.abs(index1 - index2),
    );

    switch (distance) {
      case 1: // Adjacent signs (semi-sextile)
        score -= 3;
        challenges.push('Adjacent signs often have very different approaches to life, requiring adjustment');
        strengths.push('Your contrasting qualities can help each other grow in unexpected ways');
        break;
      case 2: // Sextile (2 signs apart)
        score += 15;
        strengths.push('Your signs form a harmonious sextile, creating easy communication and shared interests');
        break;
      case 3: // Square (3 signs apart)
        score -= 8;
        challenges.push('The square aspect between your signs creates dynamic tension that can spark growth or conflict');
        strengths.push('Square relationships often have intense attraction and can drive both partners toward positive transformation');
        break;
      case 4: // Trine (4 signs apart)
        score += 20;
        strengths.push('Your signs form a beautiful trine, suggesting effortless harmony and mutual appreciation');
        break;
      case 5: // Quincunx (5 signs apart)
        score -= 5;
        challenges.push('The quincunx between your signs suggests fundamental differences in approach that require conscious adaptation');
        strengths.push('With effort, the quincunx can lead to a uniquely complementary partnership');
        break;
      case 6: // Opposition
        score += 5;
        strengths.push('Opposite signs share a magnetic attraction and complementary qualities that create wholeness');
        challenges.push('The opposition can create a push-pull dynamic where balance must be actively maintained');
        break;
    }

    // Modality dynamics
    if (info1.modality === info2.modality) {
      if (info1.modality === 'cardinal') {
        strengths.push('Both cardinal signs, you share an initiating spirit and leadership drive');
        challenges.push('Two leaders may sometimes struggle over who takes charge');
      } else if (info1.modality === 'fixed') {
        strengths.push('Both fixed signs, you share determination and commitment to your values');
        challenges.push('Shared stubbornness may make compromise difficult at times');
      } else {
        strengths.push('Both mutable signs, you share adaptability and openness to change');
      }
    } else {
      const modalities = [info1.modality, info2.modality].sort();
      if (modalities[0] === 'cardinal' && modalities[1] === 'mutable') {
        strengths.push('The cardinal-mutable dynamic creates a natural leader-supporter balance');
      } else if (modalities[0] === 'cardinal' && modalities[1] === 'fixed') {
        challenges.push('Cardinal initiative may clash with fixed resistance, requiring mutual respect');
      } else if (modalities[0] === 'fixed' && modalities[1] === 'mutable') {
        strengths.push('Fixed stability complements mutable flexibility, creating a well-rounded dynamic');
      }
    }

    // Polarity
    if (info1.polarity === info2.polarity) {
      score += 3;
    }
  }

  // Ensure minimum strengths and challenges
  if (strengths.length === 0) {
    strengths.push('Every pairing holds unique gifts waiting to be discovered through patience and openness');
  }
  if (challenges.length === 0) {
    challenges.push('All relationships benefit from conscious communication and mutual respect');
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Generate summary
  let summary: string;
  if (score >= 80) {
    summary = `${info1.name} and ${info2.name} share a truly exceptional astrological compatibility. This is a pairing blessed by the stars, where understanding flows naturally and both partners feel deeply seen and appreciated.`;
  } else if (score >= 65) {
    summary = `${info1.name} and ${info2.name} enjoy a strong astrological affinity that supports a warm and fulfilling connection. Your cosmic energies align in ways that foster mutual growth and genuine affection.`;
  } else if (score >= 50) {
    summary = `${info1.name} and ${info2.name} bring a balanced blend of harmony and healthy challenge to their connection. This is a pairing that rewards effort with deep growth and meaningful companionship.`;
  } else if (score >= 35) {
    summary = `${info1.name} and ${info2.name} face some cosmic friction, but with awareness and compassion, this pairing can become a powerful catalyst for personal evolution and deeper understanding.`;
  } else {
    summary = `${info1.name} and ${info2.name} may find their connection requires extra patience and dedication. The stars suggest this is a growth-oriented pairing that builds character and teaches profound lessons in love.`;
  }

  return { score, summary, strengths, challenges };
}
