'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Star,
  Clock,
  MapPin,
  User,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Info,
  Lock,
  Crown,
  ArrowLeft,
  Sun,
  Moon,
  CircleDot,
  Flame,
  Mountain,
  Wind,
  Droplets,
} from 'lucide-react';
import EmailCapture from '@/components/EmailCapture';
import ShareChart from '@/components/ShareChart';
import PremiumGate from '@/components/PremiumGate';
import { generateBirthChart } from '@/lib/astrology/engine';
import { ZODIAC_SIGNS as ZODIAC_SIGN_DATA, ZODIAC_ORDER } from '@/data/zodiac/signs';
import { geocodeLocation } from '@/lib/geocoding';
import { useAuth } from '@/lib/auth-context';
import type {
  BirthChartData,
  HouseSystem as EngineHouseSystem,
  ZodiacSign,
  Element,
} from '@/types/astrology';

/* ================================================================
   CONSTANTS & TYPES
   ================================================================ */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '\u2648', Taurus: '\u2649', Gemini: '\u264A', Cancer: '\u264B',
  Leo: '\u264C', Virgo: '\u264D', Libra: '\u264E', Scorpio: '\u264F',
  Sagittarius: '\u2650', Capricorn: '\u2651', Aquarius: '\u2652', Pisces: '\u2653',
};

const ZODIAC_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};

const ZODIAC_MODALITIES: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
  Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
  Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable',
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647', Chiron: '\u26B7', 'North Node': '\u260A',
};

const HOUSE_NAMES: Record<number, string> = {
  1: 'House of Self', 2: 'House of Value', 3: 'House of Communication',
  4: 'House of Home', 5: 'House of Pleasure', 6: 'House of Health',
  7: 'House of Partnership', 8: 'House of Transformation', 9: 'House of Philosophy',
  10: 'House of Career', 11: 'House of Community', 12: 'House of the Subconscious',
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'Identity, appearance, first impressions, self-expression',
  2: 'Finances, material possessions, self-worth, personal resources',
  3: 'Communication, siblings, short trips, learning, intellect',
  4: 'Home, family, roots, emotional foundations, ancestry',
  5: 'Creativity, romance, children, fun, self-expression',
  6: 'Daily routines, health, service, work environment, pets',
  7: 'Partnerships, marriage, contracts, open enemies, diplomacy',
  8: 'Transformation, shared resources, intimacy, rebirth, occult',
  9: 'Higher education, travel, philosophy, religion, expansion',
  10: 'Career, public image, authority, ambition, reputation',
  11: 'Friendships, groups, hopes, wishes, humanitarian causes',
  12: 'Subconscious, hidden enemies, solitude, spirituality, karma',
};

const HOUSE_SYSTEMS = ['Placidus', 'Koch', 'Whole Sign', 'Equal', 'Campanus'] as const;

type HouseSystem = (typeof HOUSE_SYSTEMS)[number];

/** Map UI house system names to engine's lowercase identifiers */
const HOUSE_SYSTEM_MAP: Record<HouseSystem, EngineHouseSystem> = {
  'Placidus': 'placidus',
  'Koch': 'koch',
  'Whole Sign': 'whole_sign',
  'Equal': 'equal',
  'Campanus': 'campanus',
};

/** Capitalize a ZodiacSign key ('aries' → 'Aries') */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Planet key display names */
const PLANET_DISPLAY_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
  pluto: 'Pluto', chiron: 'Chiron', north_node: 'North Node', south_node: 'South Node',
};

/** Aspect type display names */
const ASPECT_DISPLAY_NAMES: Record<string, string> = {
  conjunction: 'Conjunction', sextile: 'Sextile', square: 'Square',
  trine: 'Trine', opposition: 'Opposition', quincunx: 'Quincunx',
  semi_sextile: 'Semi-sextile', semi_square: 'Semi-square',
  sesquiquadrate: 'Sesquiquadrate', quintile: 'Quintile',
};

/** Aspect nature classification */
const ASPECT_NATURE: Record<string, 'harmonious' | 'challenging' | 'neutral'> = {
  conjunction: 'neutral', sextile: 'harmonious', square: 'challenging',
  trine: 'harmonious', opposition: 'challenging', quincunx: 'challenging',
  semi_sextile: 'neutral', semi_square: 'challenging',
  sesquiquadrate: 'challenging', quintile: 'harmonious',
};

/** Aspect interpretations for display */
const ASPECT_INTERPRETATIONS: Record<string, string> = {
  conjunction: 'Intensely merged energies amplifying both planetary expressions',
  sextile: 'A natural talent and ease of expression between these energies',
  square: 'Dynamic tension that drives growth through challenge',
  trine: 'Effortless flow of energy creating innate gifts',
  opposition: 'A push-pull dynamic requiring balance and awareness',
  quincunx: 'An awkward angle requiring constant adjustment',
  semi_sextile: 'A subtle connection requiring conscious cultivation',
  semi_square: 'Minor friction that motivates small but important changes',
  sesquiquadrate: 'Persistent agitation that pushes toward resolution',
  quintile: 'A creative spark connecting talents in unexpected ways',
};

interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
  absoluteDegree: number;
}

interface HouseData {
  house: number;
  sign: string;
  degree: number;
  minute: number;
}

interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
  interpretation: string;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

interface ChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  houseSystem: HouseSystem;
  planets: PlanetPosition[];
  houses: HouseData[];
  aspects: AspectData[];
  sunSign: string;
  moonSign: string;
  risingSign: string;
  elementBalance: Record<Element, number>;
  modalityBalance: Record<string, number>;
}

const TABS = ['Chart Overview', 'Planetary Positions', 'Houses', 'Aspects', 'Full Report'] as const;
type TabName = (typeof TABS)[number];

/* ================================================================
   BRIDGE: ENGINE → UI
   Converts the real engine's BirthChartData into the UI's ChartData format
   ================================================================ */

function bridgeEngineToUI(
  engineData: BirthChartData,
  meta: { name: string; birthDate: string; birthTime: string; birthLocation: string; houseSystem: HouseSystem },
): ChartData {
  // Convert engine planets to UI format
  const planets: PlanetPosition[] = engineData.planets.map((p) => ({
    planet: PLANET_DISPLAY_NAMES[p.planet] || p.planet,
    sign: capitalize(p.sign),
    degree: p.degree,
    minute: p.minute,
    house: p.house,
    retrograde: p.retrograde,
    absoluteDegree: p.exactDegree,
  }));

  // Convert engine houses to UI format
  const houses: HouseData[] = engineData.houses.map((h) => ({
    house: h.house,
    sign: capitalize(h.sign),
    degree: h.degree,
    minute: h.minute,
  }));

  // Convert engine aspects to UI format
  const aspects: AspectData[] = engineData.aspects.map((a) => ({
    planet1: PLANET_DISPLAY_NAMES[a.planet1] || a.planet1,
    planet2: PLANET_DISPLAY_NAMES[a.planet2] || a.planet2,
    type: ASPECT_DISPLAY_NAMES[a.type] || a.type,
    orb: a.orb,
    applying: a.applying,
    interpretation: ASPECT_INTERPRETATIONS[a.type] || 'A significant planetary relationship',
    nature: ASPECT_NATURE[a.type] || 'neutral',
  }));

  // Extract Big Three
  const sunPlanet = engineData.planets.find((p) => p.planet === 'sun');
  const moonPlanet = engineData.planets.find((p) => p.planet === 'moon');

  return {
    ...meta,
    planets,
    houses,
    aspects,
    sunSign: sunPlanet ? capitalize(sunPlanet.sign) : 'Unknown',
    moonSign: moonPlanet ? capitalize(moonPlanet.sign) : 'Unknown',
    risingSign: capitalize(engineData.ascendant.sign),
    elementBalance: engineData.elementBalance,
    modalityBalance: engineData.modalityBalance,
  };
}

/* ================================================================
   ELEMENT & MODALITY BALANCE HELPERS
   ================================================================ */

function computeElementBalanceUI(chartData: ChartData): Record<string, number> {
  // If we have engine-computed balance, use it (more accurate)
  if (chartData.elementBalance) {
    const total = Object.values(chartData.elementBalance).reduce((a, b) => a + b, 0) || 1;
    return {
      Fire: Math.round((chartData.elementBalance.fire / total) * 100),
      Earth: Math.round((chartData.elementBalance.earth / total) * 100),
      Air: Math.round((chartData.elementBalance.air / total) * 100),
      Water: Math.round((chartData.elementBalance.water / total) * 100),
    };
  }
  // Fallback: compute from planet signs
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  chartData.planets.forEach((p) => {
    const el = ZODIAC_ELEMENTS[p.sign];
    if (el) counts[el]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.round((v / total) * 100)]));
}

function computeModalityBalanceUI(chartData: ChartData): Record<string, number> {
  // If we have engine-computed balance, use it
  if (chartData.modalityBalance) {
    const total = Object.values(chartData.modalityBalance).reduce((a, b) => a + b, 0) || 1;
    return {
      Cardinal: Math.round(((chartData.modalityBalance.cardinal ?? 0) / total) * 100),
      Fixed: Math.round(((chartData.modalityBalance.fixed ?? 0) / total) * 100),
      Mutable: Math.round(((chartData.modalityBalance.mutable ?? 0) / total) * 100),
    };
  }
  // Fallback: compute from planet signs
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  chartData.planets.forEach((p) => {
    const mod = ZODIAC_MODALITIES[p.sign];
    if (mod) counts[mod]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.round((v / total) * 100)]));
}

/* ================================================================
   SVG BIRTH CHART WHEEL
   ================================================================ */

function BirthChartWheel({ data }: { data: ChartData }) {
  const size = 580;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const zodiacR = outerR - 32;
  const houseOuterR = zodiacR - 2;
  const houseInnerR = houseOuterR * 0.52;
  const planetR = (houseOuterR + houseInnerR) / 2 + 15;
  const centerR = houseInnerR - 8;

  const ascDeg = data.houses[0]
    ? (ZODIAC_SIGNS.indexOf(data.houses[0].sign as typeof ZODIAC_SIGNS[number]) * 30 + data.houses[0].degree + data.houses[0].minute / 60)
    : 0;

  function toSvgAngle(eclipticDeg: number): number {
    // Ascendant at 9 o'clock (180 degrees in SVG), ecliptic increases counter-clockwise
    return 180 - (eclipticDeg - ascDeg);
  }

  function polarToXY(angleDeg: number, r: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  }

  function describeArc(
    startAngle: number,
    endAngle: number,
    r: number,
  ): string {
    const s = polarToXY(startAngle, r);
    const e = polarToXY(endAngle, r);
    let sweep = startAngle - endAngle;
    if (sweep < 0) sweep += 360;
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  // Sign colors
  const signColors: Record<string, string> = {
    Aries: '#ef4444', Taurus: '#22c55e', Gemini: '#f59e0b', Cancer: '#64748b',
    Leo: '#f97316', Virgo: '#84cc16', Libra: '#ec4899', Scorpio: '#dc2626',
    Sagittarius: '#a855f7', Capricorn: '#6b7280', Aquarius: '#06b6d4', Pisces: '#818cf8',
  };

  // Aspect line colors
  const aspectColors: Record<string, string> = {
    Conjunction: '#fbbf24',
    Sextile: '#34d399',
    Trine: '#22c55e',
    Square: '#f87171',
    Opposition: '#ef4444',
    Quincunx: '#f97316',
    'Semi-sextile': '#94a3b8',
  };

  // House cusp lines
  const houseCusps = data.houses.map((h) => {
    const eclipticDeg = ZODIAC_SIGNS.indexOf(h.sign as typeof ZODIAC_SIGNS[number]) * 30 + h.degree + h.minute / 60;
    return toSvgAngle(eclipticDeg);
  });

  // Planet positions for chart
  const planetPositions = data.planets.map((p) => {
    const svgAngle = toSvgAngle(p.absoluteDegree);
    const pos = polarToXY(svgAngle, planetR);
    return { ...p, svgAngle, x: pos.x, y: pos.y };
  });

  // Spread overlapping planets
  const spreadPlanets = [...planetPositions];
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < spreadPlanets.length; i++) {
      for (let j = i + 1; j < spreadPlanets.length; j++) {
        const dx = spreadPlanets[i].x - spreadPlanets[j].x;
        const dy = spreadPlanets[i].y - spreadPlanets[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 22) {
          const adjust = (22 - dist) / 2;
          const angle = Math.atan2(dy, dx);
          spreadPlanets[i].x += Math.cos(angle) * adjust;
          spreadPlanets[i].y -= Math.sin(angle) * adjust;
          spreadPlanets[j].x -= Math.cos(angle) * adjust;
          spreadPlanets[j].y += Math.sin(angle) * adjust;
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full max-w-[580px] mx-auto"
      style={{ filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.15))' }}
    >
      <defs>
        <radialGradient id="chartBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(124,58,237,0.08)" />
          <stop offset="70%" stopColor="rgba(5,8,22,0.95)" />
          <stop offset="100%" stopColor="rgba(5,8,22,1)" />
        </radialGradient>
        <filter id="planetGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx={cx} cy={cy} r={outerR} fill="url(#chartBg)" stroke="rgba(124,58,237,0.2)" strokeWidth="1.5" />

      {/* Zodiac ring background */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={zodiacR} fill="none" stroke="rgba(124,58,237,0.25)" strokeWidth="1" />

      {/* 12 Zodiac sign segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startAngle = toSvgAngle((i + 1) * 30);
        const endAngle = toSvgAngle(i * 30);
        const midAngle = toSvgAngle(i * 30 + 15);
        const labelPos = polarToXY(midAngle, (outerR + zodiacR) / 2);
        const divStart = polarToXY(startAngle, zodiacR);
        const divEnd = polarToXY(startAngle, outerR);

        return (
          <g key={sign}>
            {/* Dividing line */}
            <line
              x1={divStart.x} y1={divStart.y}
              x2={divEnd.x} y2={divEnd.y}
              stroke="rgba(124,58,237,0.2)"
              strokeWidth="0.5"
            />
            {/* Sign symbol */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={signColors[sign] || '#a78bfa'}
              fontSize="14"
              fontWeight="bold"
              style={{ filter: 'drop-shadow(0 0 4px rgba(124,58,237,0.3))' }}
            >
              {ZODIAC_SYMBOLS[sign]}
            </text>
          </g>
        );
      })}

      {/* House ring */}
      <circle cx={cx} cy={cy} r={houseOuterR} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={houseInnerR} fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="1" />

      {/* House cusp lines */}
      {houseCusps.map((angle, i) => {
        const inner = polarToXY(angle, houseInnerR);
        const outer = polarToXY(angle, houseOuterR);
        const isCardinal = i === 0 || i === 3 || i === 6 || i === 9;
        // House number label
        const nextAngle = houseCusps[(i + 1) % 12];
        let midA = (angle + nextAngle) / 2;
        // Handle wrapping
        if (Math.abs(angle - nextAngle) > 180) {
          midA = ((angle + nextAngle + 360) / 2) % 360;
        }
        const labelPos = polarToXY(midA, houseInnerR + 18);

        return (
          <g key={`house-${i}`}>
            <line
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke={isCardinal ? 'rgba(167,139,250,0.5)' : 'rgba(124,58,237,0.18)'}
              strokeWidth={isCardinal ? 1.5 : 0.7}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(156,163,175,0.6)"
              fontSize="9"
              fontWeight="500"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* ASC / MC labels */}
      {(() => {
        const ascPos = polarToXY(houseCusps[0], outerR + 2);
        const mcIdx = 9;
        const mcPos = polarToXY(houseCusps[mcIdx], outerR + 2);
        return (
          <>
            <text x={ascPos.x - 18} y={ascPos.y} textAnchor="middle" dominantBaseline="central" fill="#a78bfa" fontSize="10" fontWeight="700">ASC</text>
            <text x={mcPos.x} y={mcPos.y - 12} textAnchor="middle" dominantBaseline="central" fill="#a78bfa" fontSize="10" fontWeight="700">MC</text>
          </>
        );
      })()}

      {/* Aspect lines between planets */}
      {data.aspects.slice(0, 20).map((asp, i) => {
        const p1 = spreadPlanets.find((p) => p.planet === asp.planet1);
        const p2 = spreadPlanets.find((p) => p.planet === asp.planet2);
        if (!p1 || !p2) return null;

        // Draw lines from near center
        const p1Inner = polarToXY(
          Math.atan2(-(p1.y - cy), p1.x - cx) * 180 / Math.PI,
          centerR,
        );
        const p2Inner = polarToXY(
          Math.atan2(-(p2.y - cy), p2.x - cx) * 180 / Math.PI,
          centerR,
        );

        return (
          <line
            key={`aspect-${i}`}
            x1={p1Inner.x} y1={p1Inner.y}
            x2={p2Inner.x} y2={p2Inner.y}
            stroke={aspectColors[asp.type] || '#6b7280'}
            strokeWidth={asp.type === 'Conjunction' || asp.type === 'Opposition' ? 1 : 0.6}
            strokeOpacity={0.45}
            strokeDasharray={asp.nature === 'challenging' ? '4,3' : asp.nature === 'neutral' ? '2,2' : 'none'}
            filter="url(#lineGlow)"
          />
        );
      })}

      {/* Planet glyphs */}
      {spreadPlanets.map((p) => (
        <g key={p.planet} filter="url(#planetGlow)">
          <circle cx={p.x} cy={p.y} r="10" fill="rgba(5,8,22,0.85)" stroke="rgba(167,139,250,0.4)" strokeWidth="0.8" />
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={p.retrograde ? '#f87171' : '#e0d5ff'}
            fontSize="12"
            fontWeight="bold"
          >
            {PLANET_GLYPHS[p.planet] || p.planet[0]}
          </text>
          {p.retrograde && (
            <text
              x={p.x + 10}
              y={p.y - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f87171"
              fontSize="6"
              fontWeight="bold"
            >
              Rx
            </text>
          )}
        </g>
      ))}

      {/* Center embellishment */}
      <circle cx={cx} cy={cy} r={centerR} fill="rgba(5,8,22,0.9)" stroke="rgba(124,58,237,0.15)" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r="6" fill="rgba(124,58,237,0.3)" />
      <circle cx={cx} cy={cy} r="2" fill="#a78bfa" />
    </svg>
  );
}

/* ================================================================
   TAB COMPONENTS
   ================================================================ */

function ChartOverviewTab({ data }: { data: ChartData }) {
  const elements = useMemo(() => computeElementBalanceUI(data), [data]);
  const modalities = useMemo(() => computeModalityBalanceUI(data), [data]);

  const elementColors: Record<string, string> = {
    Fire: 'bg-red-500', Earth: 'bg-emerald-500', Air: 'bg-amber-400', Water: 'bg-blue-500',
  };
  const elementIcons: Record<string, React.ReactNode> = {
    Fire: <Flame className="w-4 h-4" />,
    Earth: <Mountain className="w-4 h-4" />,
    Air: <Wind className="w-4 h-4" />,
    Water: <Droplets className="w-4 h-4" />,
  };
  const modalityColors: Record<string, string> = {
    Cardinal: 'bg-purple-500', Fixed: 'bg-indigo-500', Mutable: 'bg-cyan-500',
  };

  return (
    <div className="space-y-8 animate-in">
      {/* The Big Three */}
      <div>
        <h3 className="text-xl font-semibold text-celestial-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-stardust-400" />
          The Big Three
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Sun Sign', sign: data.sunSign, icon: <Sun className="w-6 h-6 text-stardust-400" />, desc: 'Your core identity and ego' },
            { label: 'Moon Sign', sign: data.moonSign, icon: <Moon className="w-6 h-6 text-celestial-200" />, desc: 'Your emotional inner world' },
            { label: 'Rising Sign', sign: data.risingSign, icon: <CircleDot className="w-6 h-6 text-nebula-400" />, desc: 'How the world perceives you' },
          ].map((item) => (
            <div key={item.label} className="glass-card p-5 text-center group">
              <div className="flex justify-center mb-3">{item.icon}</div>
              <p className="text-xs uppercase tracking-widest text-dust-400 mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                <span className="mr-2 text-3xl">{ZODIAC_SYMBOLS[item.sign]}</span>
                {item.sign}
              </p>
              <p className="text-sm text-dust-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Element Balance */}
      <div>
        <h3 className="text-xl font-semibold text-celestial-100 mb-4">Element Balance</h3>
        <div className="glass-card p-5 space-y-3">
          {Object.entries(elements).map(([element, pct]) => (
            <div key={element} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20 text-sm text-dust-300">
                {elementIcons[element]}
                <span>{element}</span>
              </div>
              <div className="flex-1 h-3 bg-space-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${elementColors[element]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm text-dust-400 w-10 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modality Balance */}
      <div>
        <h3 className="text-xl font-semibold text-celestial-100 mb-4">Modality Balance</h3>
        <div className="glass-card p-5 space-y-3">
          {Object.entries(modalities).map(([mod, pct]) => (
            <div key={mod} className="flex items-center gap-3">
              <span className="w-20 text-sm text-dust-300">{mod}</span>
              <div className="flex-1 h-3 bg-space-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${modalityColors[mod]} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm text-dust-400 w-10 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanetaryPositionsTab({ data }: { data: ChartData }) {
  return (
    <div className="space-y-3 animate-in">
      <h3 className="text-xl font-semibold text-celestial-100 mb-4">Planetary Positions</h3>
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-4 py-2 text-xs uppercase tracking-widest text-dust-400">
        <span>Planet</span>
        <span>Sign</span>
        <span>Degree</span>
        <span>House</span>
        <span>Status</span>
      </div>
      {data.planets.map((p) => (
        <div
          key={p.planet}
          className="glass-card p-4 sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_1fr] sm:items-center gap-2 flex flex-col space-y-1 sm:space-y-0"
        >
          {/* Planet */}
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.4))' }}>
              {PLANET_GLYPHS[p.planet] || ''}
            </span>
            <span className="font-semibold text-foreground">{p.planet}</span>
          </div>
          {/* Sign */}
          <div className="flex items-center gap-1.5 text-dust-200">
            <span className="text-lg">{ZODIAC_SYMBOLS[p.sign]}</span>
            <span>{p.sign}</span>
          </div>
          {/* Degree */}
          <span className="text-dust-300 font-mono text-sm">
            {p.degree}&deg;{p.minute.toString().padStart(2, '0')}&apos;
          </span>
          {/* House */}
          <span className="text-dust-300 text-sm">
            <span className="sm:hidden text-dust-500 mr-1">House</span>
            {p.house}
          </span>
          {/* Retrograde */}
          <span>
            {p.retrograde ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                Rx
              </span>
            ) : (
              <span className="text-xs text-dust-500">Direct</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function HousesTab({ data }: { data: ChartData }) {
  return (
    <div className="space-y-3 animate-in">
      <h3 className="text-xl font-semibold text-celestial-100 mb-4">House Cusps</h3>
      {data.houses.map((h) => (
        <div key={h.house} className="glass-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-celestial-600/30 text-celestial-200 text-xs font-bold border border-celestial-500/20">
                  {h.house}
                </span>
                <span className="font-semibold text-foreground">
                  {h.house}{h.house === 1 ? 'st' : h.house === 2 ? 'nd' : h.house === 3 ? 'rd' : 'th'} House
                </span>
                <span className="text-dust-400 hidden sm:inline">&mdash;</span>
                <span className="text-dust-400 text-sm hidden sm:inline">{HOUSE_NAMES[h.house]}</span>
              </div>
              <p className="text-sm text-dust-400 sm:hidden mb-2">{HOUSE_NAMES[h.house]}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-dust-200">
                <span className="text-lg">{ZODIAC_SYMBOLS[h.sign]}</span>
                <span className="text-sm">{h.sign}</span>
              </div>
              <span className="text-dust-300 font-mono text-sm">
                {h.degree}&deg;{h.minute.toString().padStart(2, '0')}&apos;
              </span>
            </div>
          </div>
          <p className="text-xs text-dust-500 mt-2 leading-relaxed">{HOUSE_THEMES[h.house]}</p>
        </div>
      ))}
    </div>
  );
}

function AspectsTab({ data }: { data: ChartData }) {
  const natureStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    harmonious: { bg: 'bg-aurora-500/8', border: 'border-aurora-500/20', text: 'text-aurora-400', badge: 'bg-aurora-500/15 text-aurora-400 border-aurora-500/25' },
    challenging: { bg: 'bg-red-500/8', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/25' },
    neutral: { bg: 'bg-blue-500/8', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  };

  const aspectSymbols: Record<string, string> = {
    Conjunction: '\u260C', Sextile: '\u26B9', Square: '\u25A1',
    Trine: '\u25B3', Opposition: '\u260D', Quincunx: '\u26BB', 'Semi-sextile': '\u26BA',
  };

  if (data.aspects.length === 0) {
    return (
      <div className="glass-card p-8 text-center animate-in">
        <p className="text-dust-400">No major aspects found in this chart configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in">
      <h3 className="text-xl font-semibold text-celestial-100 mb-2">Aspects</h3>
      <div className="flex gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-aurora-500" /> Harmonious</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Challenging</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Neutral</span>
      </div>
      {data.aspects.map((asp, i) => {
        const style = natureStyles[asp.nature] || natureStyles.neutral;
        return (
          <div key={i} className={`glass-card p-4 border ${style.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {/* Planets and aspect type */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg">{PLANET_GLYPHS[asp.planet1]}</span>
                <span className="font-medium text-foreground text-sm">{asp.planet1}</span>
                <span className={`text-lg ${style.text}`}>{aspectSymbols[asp.type] || '\u2014'}</span>
                <span className="font-medium text-foreground text-sm">{asp.planet2}</span>
                <span className="text-lg">{PLANET_GLYPHS[asp.planet2]}</span>
              </div>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${style.badge}`}>
                  {asp.type}
                </span>
                <span className="text-xs text-dust-400 font-mono">
                  {asp.orb}&deg; orb
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${asp.applying ? 'text-stardust-400 bg-stardust-500/10' : 'text-dust-400 bg-dust-700/30'}`}>
                  {asp.applying ? 'Applying' : 'Separating'}
                </span>
              </div>
            </div>
            <p className="text-sm text-dust-400 mt-2 leading-relaxed">{asp.interpretation}</p>
          </div>
        );
      })}
    </div>
  );
}

function FullReportTab() {
  return (
    <div className="space-y-6 animate-in">
      <h3 className="text-xl font-semibold text-celestial-100 mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-stardust-400" />
        Full Birth Chart Report
      </h3>

      <PremiumGate
        requiredTier="stellar"
        featureName="your full birth chart report"
        previewText="Your natal chart reveals a complex tapestry of planetary influences that shape your personality, relationships, career path, and spiritual evolution. The unique arrangement of celestial bodies at the moment of your birth creates a cosmic blueprint that is entirely yours."
      >
        <div className="glass-card p-6 space-y-4">
          <p className="text-dust-200 leading-relaxed">
            Your Mercury placement indicates a mind that processes information through intuitive
            channels rather than pure logic. You possess a rare ability to synthesize complex
            ideas and communicate them with emotional depth that resonates with others on a
            profound level.
          </p>
          <p className="text-dust-200 leading-relaxed">
            Venus in your chart suggests a deeply romantic nature combined with a strong aesthetic
            sensibility. Your approach to love is characterized by loyalty and intensity, though
            you may struggle with vulnerability in the early stages of relationships.
          </p>
          <p className="text-dust-200 leading-relaxed">
            The Mars placement reveals your driving force and how you assert yourself in the
            world. Your particular configuration suggests a strategic approach to ambition, one
            that values sustainability over quick victories.
          </p>
          <p className="text-dust-200 leading-relaxed">
            Jupiter&apos;s influence in your chart expands your natural talents and brings opportunities
            for growth in areas related to higher learning, philosophy, and travel. Saturn&apos;s position
            provides structure and discipline, teaching you to build lasting foundations.
          </p>
          <p className="text-dust-200 leading-relaxed">
            The outer planets — Uranus, Neptune, and Pluto — colour your generational experience
            and deeper spiritual journey. Their house positions reveal where in your life you
            will encounter transformation, awakening, and transcendence.
          </p>
        </div>
      </PremiumGate>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function BirthChartPage() {
  const { user, updateProfile } = useAuth();

  /* ----------- Form State ----------- */
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    houseSystem: 'Placidus' as HouseSystem,
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Chart Overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [houseGuideOpen, setHouseGuideOpen] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsGenerating(true);

      try {
        // Geocode the location to get lat/lng
        const geo = await geocodeLocation(formData.birthLocation);

        // Use the real Keplerian orbital mechanics engine
        const engineResult = generateBirthChart({
          birthDate: formData.birthDate,
          birthTime: formData.birthTime || '12:00',
          latitude: geo.latitude,
          longitude: geo.longitude,
          location: geo.displayName,
          timezone: 'UTC',
          houseSystem: HOUSE_SYSTEM_MAP[formData.houseSystem],
        });

        // Convert engine output to UI format
        const data = bridgeEngineToUI(engineResult, {
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthLocation: formData.birthLocation || geo.displayName,
          houseSystem: formData.houseSystem,
        });

        setChartData(data);
        setActiveTab('Chart Overview');

        // Auto-save birth data to profile if user is logged in
        if (user) {
          updateProfile({
            birthDate: formData.birthDate,
            birthTime: formData.birthTime || undefined,
            birthLocation: formData.birthLocation || undefined,
            sunSign: data.sunSign.toLowerCase(),
            moonSign: data.moonSign.toLowerCase(),
            risingSign: data.risingSign.toLowerCase(),
          }).catch(() => {
            // Silent fail — chart still displayed even if save fails
          });
        }
      } catch (err) {
        console.error('Chart generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [formData],
  );

  const handleReset = useCallback(() => {
    setChartData(null);
    setActiveTab('Chart Overview');
  }, []);

  const isFormValid = formData.name.trim() !== '' && formData.birthDate !== '';

  /* ----------- Render: INPUT FORM ----------- */
  if (!chartData) {
    return (
      <div className="min-h-screen relative">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-celestial-600/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-nebula-600/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-10 animate-in">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Your Birth Chart
            </h1>
            <p className="text-dust-400 text-lg max-w-md mx-auto leading-relaxed">
              Enter your birth details for a professional-grade natal chart analysis
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6 animate-in" style={{ animationDelay: '100ms' }}>
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-dust-200">
                <User className="w-4 h-4 text-celestial-300" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-space-800/70 border border-celestial-500/15 rounded-xl text-foreground placeholder-dust-500 focus:outline-none focus:border-celestial-400/40 focus:ring-2 focus:ring-celestial-500/20 transition-all"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium text-dust-200">
                <CalendarDays className="w-4 h-4 text-celestial-300" />
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-space-800/70 border border-celestial-500/15 rounded-xl text-foreground focus:outline-none focus:border-celestial-400/40 focus:ring-2 focus:ring-celestial-500/20 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-2">
              <label htmlFor="birthTime" className="flex items-center gap-2 text-sm font-medium text-dust-200">
                <Clock className="w-4 h-4 text-celestial-300" />
                Birth Time
              </label>
              <input
                type="time"
                id="birthTime"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-space-800/70 border border-celestial-500/15 rounded-xl text-foreground focus:outline-none focus:border-celestial-400/40 focus:ring-2 focus:ring-celestial-500/20 transition-all [color-scheme:dark]"
              />
              <p className="text-xs text-dust-500 flex items-center gap-1.5">
                <Info className="w-3 h-3 flex-shrink-0" />
                Exact birth time gives the most accurate results
              </p>
            </div>

            {/* Birth Location */}
            <div className="space-y-2">
              <label htmlFor="birthLocation" className="flex items-center gap-2 text-sm font-medium text-dust-200">
                <MapPin className="w-4 h-4 text-celestial-300" />
                Birth Location
              </label>
              <input
                type="text"
                id="birthLocation"
                name="birthLocation"
                value={formData.birthLocation}
                onChange={handleInputChange}
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-space-800/70 border border-celestial-500/15 rounded-xl text-foreground placeholder-dust-500 focus:outline-none focus:border-celestial-400/40 focus:ring-2 focus:ring-celestial-500/20 transition-all"
              />
            </div>

            {/* House System */}
            <div className="space-y-2">
              <label htmlFor="houseSystem" className="flex items-center gap-2 text-sm font-medium text-dust-200">
                <CircleDot className="w-4 h-4 text-celestial-300" />
                House System
              </label>
              <select
                id="houseSystem"
                name="houseSystem"
                value={formData.houseSystem}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-space-800/70 border border-celestial-500/15 rounded-xl text-foreground focus:outline-none focus:border-celestial-400/40 focus:ring-2 focus:ring-celestial-500/20 transition-all appearance-none cursor-pointer"
              >
                {HOUSE_SYSTEMS.map((sys) => (
                  <option key={sys} value={sys} className="bg-space-800 text-foreground">
                    {sys}
                  </option>
                ))}
              </select>

              {/* Helper hint */}
              <p className="text-xs text-dust-500 mt-1.5">
                Not sure? <span className="text-celestial-300">Placidus</span> is the most widely used system.
              </p>

              {/* Expandable house system guide */}
              <button
                type="button"
                onClick={() => setHouseGuideOpen((prev) => !prev)}
                className="flex items-center gap-1.5 mt-2 text-xs text-dust-400 hover:text-celestial-200 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Learn about house systems</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${houseGuideOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${houseGuideOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="rounded-xl border border-celestial-500/10 bg-space-800/40 p-4 space-y-3 text-xs leading-relaxed text-dust-400">
                    <div>
                      <span className="font-semibold text-celestial-200">Placidus</span> — The most popular system worldwide. Uses time-based division of the sky. Best for most readings.
                    </div>
                    <div>
                      <span className="font-semibold text-celestial-200">Koch</span> — Similar to Placidus but factors in birth location more heavily. Popular in German-speaking countries.
                    </div>
                    <div>
                      <span className="font-semibold text-celestial-200">Whole Sign</span> — Each house spans one full zodiac sign. The oldest system, favoured in Hellenistic astrology.
                    </div>
                    <div>
                      <span className="font-semibold text-celestial-200">Equal</span> — Each house is exactly 30&deg; from the Ascendant. Simple and consistent across all latitudes.
                    </div>
                    <div>
                      <span className="font-semibold text-celestial-200">Campanus</span> — Divides the sky by space rather than time. Less common, used in some medieval traditions.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isGenerating}
              className="btn-glow w-full py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Calculating your chart...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate My Birth Chart
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="glass-card p-6 mt-8 animate-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-celestial-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Why do we need your birth time?</h3>
                <p className="text-sm text-dust-400 leading-relaxed">
                  Your birth time determines your Ascendant (Rising Sign), house placements, and the
                  precise position of the Moon. These are essential for an accurate chart reading.
                  Without a birth time, we use noon as a default, which provides your Sun sign and
                  planetary signs but may show inaccurate house placements and Moon position.
                  For the most precise reading, check your birth certificate or ask a family member.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------- Render: RESULTS ----------- */
  const formattedDate = (() => {
    try {
      const d = new Date(chartData.birthDate + 'T12:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return chartData.birthDate;
    }
  })();

  const formattedTime = (() => {
    if (!chartData.birthTime) return 'Unknown';
    try {
      const [h, m] = chartData.birthTime.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return chartData.birthTime;
    }
  })();

  return (
    <div className="min-h-screen relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-celestial-600/4 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-nebula-600/4 blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-72 h-72 rounded-full bg-stardust-600/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-dust-400 hover:text-celestial-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Generate Another Chart
          </button>
          <ShareChart
            sunSign={chartData.planets.find(p => p.planet === 'Sun')?.sign ?? 'Unknown'}
            moonSign={chartData.planets.find(p => p.planet === 'Moon')?.sign ?? 'Unknown'}
            risingSign={chartData.houses[0]?.sign ?? 'Unknown'}
            name={chartData.name}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-10 animate-in">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
            {chartData.name}&apos;s Natal Chart
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-dust-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </span>
            {chartData.birthLocation && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {chartData.birthLocation}
              </span>
            )}
            <span className="text-dust-500">
              {chartData.houseSystem} Houses
            </span>
          </div>
        </div>

        {/* Two-column layout: Chart + Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Visual Chart */}
          <div className="animate-in" style={{ animationDelay: '100ms' }}>
            <div className="glass-card p-4 sm:p-6 sticky top-8">
              <h2 className="text-sm uppercase tracking-widest text-dust-400 mb-4 text-center">Natal Chart Wheel</h2>
              <BirthChartWheel data={chartData} />
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-celestial-500/10">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-dust-400">
                  {chartData.planets.slice(0, 10).map((p) => (
                    <div key={p.planet} className="flex items-center gap-1.5">
                      <span className="text-sm">{PLANET_GLYPHS[p.planet]}</span>
                      <span>{p.planet}</span>
                      <span className="text-dust-500 ml-auto">{ZODIAC_SYMBOLS[p.sign]} {p.degree}&deg;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-1 mb-6 p-1 glass-card rounded-xl scrollbar-none">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-celestial-600/30 text-celestial-100 shadow-lg shadow-celestial-500/10 border border-celestial-500/20'
                      : 'text-dust-400 hover:text-dust-200 hover:bg-space-700/50'
                  } ${tab === 'Full Report' ? 'flex items-center gap-1.5' : ''}`}
                >
                  {tab}
                  {tab === 'Full Report' && (
                    <span className="premium-badge text-[9px] py-0 px-1.5 leading-tight">PRO</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'Chart Overview' && <ChartOverviewTab data={chartData} />}
              {activeTab === 'Planetary Positions' && <PlanetaryPositionsTab data={chartData} />}
              {activeTab === 'Houses' && <HousesTab data={chartData} />}
              {activeTab === 'Aspects' && <AspectsTab data={chartData} />}
              {activeTab === 'Full Report' && <FullReportTab />}
            </div>
          </div>
        </div>

        {/* Email Capture — post-chart generation */}
        <div className="mt-12 mx-auto max-w-xl animate-in" style={{ animationDelay: '300ms' }}>
          <EmailCapture
            heading="Get your chart insights by email"
            subheading="Receive transit alerts, monthly forecasts, and updates when planets activate your chart."
            ctaText="Send Me Updates"
            variant="banner"
            source="birth_chart_results"
          />
        </div>
      </div>
    </div>
  );
}
