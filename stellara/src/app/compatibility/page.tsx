'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  MessageCircle,
  Shield,
  Gem,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';

/* ================================================================
   ZODIAC DATA
   ================================================================ */

const SIGNS = [
  { slug: 'aries', name: 'Aries', symbol: '\u2648', element: 'Fire' },
  { slug: 'taurus', name: 'Taurus', symbol: '\u2649', element: 'Earth' },
  { slug: 'gemini', name: 'Gemini', symbol: '\u264A', element: 'Air' },
  { slug: 'cancer', name: 'Cancer', symbol: '\u264B', element: 'Water' },
  { slug: 'leo', name: 'Leo', symbol: '\u264C', element: 'Fire' },
  { slug: 'virgo', name: 'Virgo', symbol: '\u264D', element: 'Earth' },
  { slug: 'libra', name: 'Libra', symbol: '\u264E', element: 'Air' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', element: 'Water' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', element: 'Fire' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', element: 'Earth' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', element: 'Air' },
  { slug: 'pisces', name: 'Pisces', symbol: '\u2653', element: 'Water' },
];

type Sign = (typeof SIGNS)[number];

const ELEMENT_ACCENT: Record<string, string> = {
  Fire: 'text-red-400 border-red-500/40 bg-red-500/10',
  Earth: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  Air: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  Water: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
};

const ELEMENT_TAG_COLOR: Record<string, string> = {
  Fire: 'text-red-400',
  Earth: 'text-emerald-400',
  Air: 'text-sky-400',
  Water: 'text-blue-400',
};

const COMPLEMENTARY: Record<string, string> = {
  Fire: 'Air',
  Air: 'Fire',
  Earth: 'Water',
  Water: 'Earth',
};

/* ================================================================
   POPULAR PAIRINGS
   ================================================================ */

const POPULAR_PAIRINGS = [
  { sign1: 0, sign2: 4, slug: 'aries-leo' },
  { sign1: 1, sign2: 11, slug: 'taurus-pisces' },
  { sign1: 2, sign2: 6, slug: 'gemini-libra' },
  { sign1: 3, sign2: 7, slug: 'cancer-scorpio' },
  { sign1: 4, sign2: 8, slug: 'leo-sagittarius' },
  { sign1: 6, sign2: 10, slug: 'libra-aquarius' },
];

/* ================================================================
   DETERMINISTIC COMPATIBILITY ENGINE
   ================================================================ */

function areOpposite(i: number, j: number): boolean {
  return Math.abs(i - j) === 6;
}

function deterministicSeed(a: number, b: number): number {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return ((lo + 1) * 17 + (hi + 1) * 31) % 97;
}

interface RatingItem {
  label: string;
  value: number;
  stars: number;
  icon: typeof Heart;
}

interface CompatibilityResult {
  overall: number;
  ratings: RatingItem[];
  strengths: string[];
  challenges: string[];
  summary: string;
}

function toStars(v: number): number {
  return Math.max(1, Math.min(5, Math.round(v / 20)));
}

function computeCompatibility(
  indexA: number,
  indexB: number,
): CompatibilityResult {
  const signA = SIGNS[indexA];
  const signB = SIGNS[indexB];
  const s = deterministicSeed(indexA, indexB);

  let baseMin: number;
  let baseMax: number;

  if (signA.element === signB.element) {
    baseMin = 85;
    baseMax = 95;
  } else if (areOpposite(indexA, indexB)) {
    baseMin = 80;
    baseMax = 90;
  } else if (COMPLEMENTARY[signA.element] === signB.element) {
    baseMin = 75;
    baseMax = 85;
  } else {
    baseMin = 55;
    baseMax = 70;
  }

  const overall = baseMin + (s % (baseMax - baseMin + 1));

  const love = Math.min(100, Math.max(35, overall + ((s * 3) % 21) - 10));
  const communication = Math.min(100, Math.max(35, overall + ((s * 7) % 19) - 9));
  const trust = Math.min(100, Math.max(35, overall + ((s * 11) % 17) - 8));
  const sharedValues = Math.min(100, Math.max(35, overall + ((s * 13) % 23) - 11));
  const emotional = Math.min(100, Math.max(35, overall + ((s * 5) % 15) - 7));

  const ratings: RatingItem[] = [
    { label: 'Love', value: love, stars: toStars(love), icon: Heart },
    { label: 'Communication', value: communication, stars: toStars(communication), icon: MessageCircle },
    { label: 'Trust', value: trust, stars: toStars(trust), icon: Shield },
    { label: 'Shared Values', value: sharedValues, stars: toStars(sharedValues), icon: Gem },
    { label: 'Emotional Connection', value: emotional, stars: toStars(emotional), icon: Sparkles },
  ];

  return {
    overall,
    ratings,
    strengths: buildStrengths(signA, signB, overall),
    challenges: buildChallenges(signA, signB, overall),
    summary: buildSummary(signA, signB, overall),
  };
}

/* ================================================================
   CONTENT GENERATORS
   ================================================================ */

function buildStrengths(a: Sign, b: Sign, score: number): string[] {
  const same = a.element === b.element;
  const comp = COMPLEMENTARY[a.element] === b.element;

  if (same) {
    return [
      `Shared ${a.element} element creates an instinctive understanding and natural rhythm between ${a.name} and ${b.name}.`,
      `Both signs speak the same emotional language, reducing miscommunication and building deep trust over time.`,
      `Your combined ${a.element} energy amplifies creativity, passion, and mutual inspiration in the relationship.`,
    ];
  }
  if (comp) {
    return [
      `${a.name}\u2019s ${a.element} energy is beautifully fueled by ${b.name}\u2019s ${b.element} nature, creating a dynamic and balanced partnership.`,
      `You naturally complement each other\u2019s weaknesses \u2014 where one partner falters, the other instinctively steps in.`,
      `The ${a.element}\u2013${b.element} connection fosters both excitement and stability, a rare and powerful combination.`,
    ];
  }
  if (score >= 80) {
    return [
      `The magnetic tension between ${a.name} and ${b.name} creates an irresistible attraction that deepens over time.`,
      `Opposite sign energy means you each bring exactly what the other lacks, forming a complete and powerful union.`,
      `Your differences become your greatest assets when you learn to appreciate rather than resist each other\u2019s nature.`,
    ];
  }
  return [
    `${a.name} and ${b.name} challenge each other to grow in ways neither would achieve alone.`,
    `The friction between your elements builds resilience and depth in the relationship when navigated with care.`,
    `You bring genuinely different perspectives to the table, enriching each other\u2019s worldview and decision-making.`,
  ];
}

function buildChallenges(a: Sign, b: Sign, score: number): string[] {
  const same = a.element === b.element;
  const comp = COMPLEMENTARY[a.element] === b.element;

  if (same) {
    return [
      `Too much ${a.element} energy can lead to intensity overload \u2014 you may amplify each other\u2019s weaknesses as easily as your strengths.`,
      `Similar temperaments can create competition or power struggles when both partners want to lead.`,
      `The comfort of sameness may reduce growth \u2014 you\u2019ll need to consciously push each other toward new experiences.`,
    ];
  }
  if (comp) {
    return [
      `${a.element} and ${b.element} move at different speeds, which can create friction around timing and decision-making.`,
      `${a.name} may sometimes feel ${b.name} is too detached or too intense, depending on the moment.`,
      `Balancing independence with togetherness requires ongoing communication and conscious effort from both partners.`,
    ];
  }
  if (score >= 80) {
    return [
      `Opposite signs can polarize under stress, retreating to extreme versions of their nature rather than meeting in the middle.`,
      `What initially attracts you to each other can become the very thing that frustrates you most over time.`,
      `Finding common ground on daily routines and lifestyle preferences may require more compromise than either expects.`,
    ];
  }
  return [
    `The fundamental difference between ${a.element} and ${b.element} energy can make emotional attunement genuinely difficult.`,
    `${a.name} and ${b.name} may struggle to understand each other\u2019s core motivations and needs without patient dialogue.`,
    `Conflict resolution styles differ significantly \u2014 one may want to talk it through while the other needs space and time.`,
  ];
}

function buildSummary(a: Sign, b: Sign, score: number): string {
  if (score >= 85) {
    return `${a.name} and ${b.name} share a powerful cosmic connection that feels both natural and destined. This pairing thrives on mutual understanding, shared values, and an intuitive bond that deepens with time. While no relationship is without its challenges, the celestial alignment between these two signs creates a foundation of genuine compatibility that many couples envy. With conscious effort and open communication, this is a partnership that can truly stand the test of time.`;
  }
  if (score >= 75) {
    return `The connection between ${a.name} and ${b.name} is marked by a compelling blend of harmony and healthy tension. These two signs bring complementary energies to the relationship, each offering what the other needs most. The key to unlocking this pairing\u2019s full potential lies in embracing your differences as strengths rather than sources of conflict. When both partners commit to growth, this combination produces a deeply rewarding and evolving partnership.`;
  }
  if (score >= 65) {
    return `${a.name} and ${b.name} represent a cosmic pairing that requires intentional effort but offers significant rewards for those willing to do the work. The differences between these signs can spark both friction and fascination in equal measure. Success in this relationship comes from building bridges of understanding across your elemental divide. With patience, humor, and genuine respect for each other\u2019s nature, this pairing can surprise everyone \u2014 including yourselves.`;
  }
  return `The relationship between ${a.name} and ${b.name} is one of astrology\u2019s more challenging pairings, but challenge does not mean impossibility. These two signs operate on fundamentally different wavelengths, which can lead to misunderstanding but also to profound growth. The couples who make this combination work often develop extraordinary communication skills and a deep appreciation for perspectives unlike their own. This is a relationship that transforms both partners when approached with openness and patience.`;
}

/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function scoreLabel(score: number): string {
  if (score >= 90) return 'Soulmate Energy';
  if (score >= 80) return 'Highly Compatible';
  if (score >= 70) return 'Strong Potential';
  if (score >= 60) return 'Worth Exploring';
  return 'Growth Opportunity';
}

function scoreColor(score: number): string {
  if (score >= 85) return '#34d399';
  if (score >= 75) return '#7C3AED';
  if (score >= 65) return '#FBBF24';
  return '#f472b6';
}

/* ================================================================
   CIRCULAR SVG SCORE RING
   ================================================================ */

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        className="transform -rotate-90"
      >
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(124,58,237,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${color}50)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-dust-400 mt-1 uppercase tracking-widest font-semibold">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   STAR RATING ROW
   ================================================================ */

function StarRatingRow({
  label,
  stars,
  icon: Icon,
}: {
  label: string;
  stars: number;
  icon: typeof Heart;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-celestial-500/10 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-celestial-400/10 border border-celestial-500/20 flex items-center justify-center">
          <Icon size={16} className="text-celestial-300" />
        </div>
        <span className="text-sm font-medium text-dust-300">{label}</span>
      </div>
      <div className="flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < stars
                ? 'fill-stardust-400 text-stardust-400'
                : 'fill-transparent text-dust-600'
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   SIGN SELECTOR GRID
   ================================================================ */

function SignSelector({
  title,
  selectedIndex,
  onSelect,
}: {
  title: string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-dust-500 mb-5">Select a zodiac sign</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {SIGNS.map((sign, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={sign.slug}
              onClick={() => onSelect(i)}
              aria-pressed={isSelected}
              aria-label={`${sign.name} \u2014 ${sign.element} sign`}
              className={`group relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-celestial-400/60 ${
                isSelected
                  ? `${ELEMENT_ACCENT[sign.element]} shadow-[0_0_20px_rgba(124,58,237,0.15)]`
                  : 'border-celestial-500/10 bg-space-800/40 hover:border-celestial-500/25 hover:bg-space-800/70'
              }`}
            >
              <span
                className={`text-2xl sm:text-3xl transition-transform duration-300 ${
                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                {sign.symbol}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isSelected ? 'text-foreground' : 'text-dust-400'
                }`}
              >
                {sign.name}
              </span>
              <span className={`text-[10px] ${ELEMENT_TAG_COLOR[sign.element]} opacity-70`}>
                {sign.element}
              </span>
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function CompatibilityPage() {
  const [signA, setSignA] = useState<number | null>(null);
  const [signB, setSignB] = useState<number | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  function handleCheck() {
    if (signA === null || signB === null) return;
    const data = computeCompatibility(signA, signB);
    setResult(data);
    setShowResult(true);
  }

  function handleReset() {
    setShowResult(false);
    setResult(null);
  }

  return (
    <div className="relative min-h-screen">
      <main className="relative z-10">
        {/* ============================================
            SECTION 1 \u2014 HERO
            ============================================ */}
        <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 overflow-hidden">
          {/* Background radial accents */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(236,72,153,0.07) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />

          {/* Icon */}
          <div className="mb-6 animate-in">
            <div className="w-16 h-16 rounded-full border border-nebula-500/25 bg-nebula-500/10 flex items-center justify-center">
              <Heart size={28} className="text-nebula-400" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-center animate-in max-w-4xl">
            Cosmic Compatibility
          </h1>

          {/* Subheadline */}
          <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-dust-300 text-center max-w-2xl leading-relaxed animate-in">
            Discover the celestial chemistry between any two signs
          </p>

          {/* Scroll hint */}
          <div className="mt-10 text-dust-500 text-xs uppercase tracking-widest animate-in flex items-center gap-2">
            <Sparkles size={14} className="text-stardust-400" />
            <span>Select two signs below to begin</span>
            <Sparkles size={14} className="text-stardust-400" />
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 2 \u2014 SIGN SELECTORS
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <SignSelector
              title="Your Sign"
              selectedIndex={signA}
              onSelect={(i) => {
                setSignA(i);
                if (showResult) handleReset();
              }}
            />
            <SignSelector
              title="Their Sign"
              selectedIndex={signB}
              onSelect={(i) => {
                setSignB(i);
                if (showResult) handleReset();
              }}
            />
          </div>

          {/* Selected summary & CTA */}
          <div className="mt-10 flex flex-col items-center gap-5">
            {signA !== null && signB !== null && (
              <p className="text-dust-300 text-base animate-in text-center">
                <span className="text-foreground font-semibold">
                  {SIGNS[signA].symbol} {SIGNS[signA].name}
                </span>
                <span className="mx-3 text-nebula-400">&hearts;</span>
                <span className="text-foreground font-semibold">
                  {SIGNS[signB].symbol} {SIGNS[signB].name}
                </span>
              </p>
            )}

            <button
              onClick={handleCheck}
              disabled={signA === null || signB === null}
              className={`btn-glow text-base px-10 py-4 rounded-xl transition-opacity ${
                signA === null || signB === null
                  ? 'opacity-40 cursor-not-allowed'
                  : ''
              }`}
            >
              <Heart size={18} />
              Check Compatibility
            </button>

            {(signA === null || signB === null) && (
              <p className="text-xs text-dust-500">
                Please select both signs to continue
              </p>
            )}
          </div>
        </section>

        {/* ============================================
            SECTION 3 \u2014 RESULTS
            ============================================ */}
        {showResult && result && signA !== null && signB !== null && (
          <>
            <div className="section-divider mx-auto max-w-5xl" />

            <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl mx-auto">
              {/* Results header */}
              <div className="text-center mb-12 animate-in">
                <p className="text-nebula-400 text-sm font-semibold uppercase tracking-widest mb-3">
                  Compatibility Report
                </p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                  {SIGNS[signA].symbol} {SIGNS[signA].name}{' '}
                  <span className="text-nebula-400">&amp;</span>{' '}
                  {SIGNS[signB].symbol} {SIGNS[signB].name}
                </h2>
                <p className="mt-3 text-dust-400 text-sm">
                  {SIGNS[signA].element} + {SIGNS[signB].element} pairing
                </p>
              </div>

              {/* Score ring + ratings grid */}
              <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-12">
                {/* Left \u2014 Overall score */}
                <div className="glass-card p-8 sm:p-10 flex flex-col items-center justify-center text-center animate-in">
                  <p className="text-xs text-dust-500 uppercase tracking-widest font-semibold mb-5">
                    Overall Compatibility
                  </p>
                  <ScoreRing score={result.overall} />
                  <p
                    className="mt-5 text-lg font-bold"
                    style={{ color: scoreColor(result.overall) }}
                  >
                    {scoreLabel(result.overall)}
                  </p>
                </div>

                {/* Right \u2014 Category ratings */}
                <div className="glass-card p-6 sm:p-8 animate-in">
                  <p className="text-xs text-dust-500 uppercase tracking-widest font-semibold mb-4">
                    Detailed Breakdown
                  </p>
                  {result.ratings.map((r) => (
                    <StarRatingRow
                      key={r.label}
                      label={r.label}
                      stars={r.stars}
                      icon={r.icon}
                    />
                  ))}
                </div>
              </div>

              {/* Strengths & Challenges */}
              <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-12">
                {/* Strengths */}
                <div className="glass-card p-6 sm:p-8 animate-in">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-aurora-500/10 border border-aurora-500/20 flex items-center justify-center">
                      <Sparkles size={16} className="text-aurora-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Strengths
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-aurora-400 shrink-0" />
                        <span className="text-dust-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div className="glass-card p-6 sm:p-8 animate-in">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-nebula-500/10 border border-nebula-500/20 flex items-center justify-center">
                      <Shield size={16} className="text-nebula-400" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Challenges
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {result.challenges.map((c, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-nebula-400 shrink-0" />
                        <span className="text-dust-300">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card p-6 sm:p-10 mb-12 animate-in">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  The Bottom Line
                </h3>
                <p className="text-dust-300 leading-relaxed text-sm sm:text-base">
                  {result.summary}
                </p>
              </div>

              {/* Full Synastry Report CTA */}
              <div className="glass-card relative p-8 sm:p-12 overflow-hidden animate-in">
                <div
                  className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at top right, rgba(251,191,36,0.08) 0%, transparent 60%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
                      <span className="premium-badge">Premium</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                      Get the Full Synastry Report
                    </h3>
                    <p className="text-dust-400 text-sm leading-relaxed max-w-lg">
                      Unlock planet-by-planet aspect analysis, composite chart
                      reading, timing forecasts for your relationship, and
                      personalized advice from our AI astrologer.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-dust-300">
                      <li className="flex items-center gap-2">
                        <Lock size={12} className="text-stardust-400" />
                        Full synastry aspect grid with orbs
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock size={12} className="text-stardust-400" />
                        Composite chart interpretation
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock size={12} className="text-stardust-400" />
                        Relationship transit forecast
                      </li>
                    </ul>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href="/pricing"
                      className="btn-glow text-base px-8 py-4 rounded-xl"
                    >
                      <Star size={18} />
                      Get Full Synastry Report
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 4 \u2014 POPULAR PAIRINGS
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-stardust-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Fan Favorites
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Popular Pairings
            </h2>
            <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
              Explore the most-searched zodiac combinations and their cosmic
              chemistry.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 stagger-children">
            {POPULAR_PAIRINGS.map((pair) => {
              const a = SIGNS[pair.sign1];
              const b = SIGNS[pair.sign2];
              const compat = computeCompatibility(pair.sign1, pair.sign2);
              const color = scoreColor(compat.overall);

              return (
                <Link
                  key={pair.slug}
                  href={`/compatibility/${pair.slug}`}
                  className="glass-card-hover group p-6 sm:p-7 flex flex-col"
                >
                  {/* Sign symbols */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {a.symbol}
                    </span>
                    <Heart
                      size={18}
                      className="text-nebula-400 group-hover:text-nebula-300 transition-colors"
                    />
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {b.symbol}
                    </span>
                  </div>

                  {/* Names */}
                  <h3 className="text-center text-lg font-bold text-foreground mb-1">
                    {a.name} &amp; {b.name}
                  </h3>
                  <p className="text-center text-xs text-dust-500 mb-4">
                    {a.element} + {b.element}
                  </p>

                  {/* Score bar */}
                  <div className="w-full h-1.5 rounded-full bg-space-900 mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${compat.overall}%`,
                        background: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color }} className="font-bold">
                      {compat.overall}% match
                    </span>
                    <span className="text-dust-500">
                      {scoreLabel(compat.overall)}
                    </span>
                  </div>

                  {/* Arrow CTA */}
                  <div className="mt-4 pt-4 border-t border-celestial-500/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-celestial-300 group-hover:text-celestial-200 transition-colors flex items-center gap-1.5">
                      View Full Report
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 5 \u2014 SEO CONTENT
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Understanding Zodiac Compatibility
            </h2>
            <p className="text-dust-400 leading-relaxed text-base sm:text-lg max-w-3xl mx-auto mb-6">
              Zodiac compatibility is the study of how different astrological
              signs interact, connect, and challenge one another in
              relationships. Rooted in thousands of years of astrological
              tradition, compatibility analysis examines the elemental
              relationships between signs &mdash; Fire, Earth, Air, and Water
              &mdash; as well as their modalities (Cardinal, Fixed, and Mutable)
              and planetary rulers to determine the natural harmony or tension
              between any two people.
            </p>
            <p className="text-dust-400 leading-relaxed text-base sm:text-lg max-w-3xl mx-auto mb-6">
              Signs that share the same element &mdash; such as Aries and Leo
              (both Fire signs) or Taurus and Virgo (both Earth signs) &mdash;
              tend to understand each other instinctively. They communicate in
              the same emotional language and share fundamental values.
              Complementary elements like Fire and Air or Earth and Water create
              dynamic partnerships where each sign fuels and supports the other.
              Even challenging combinations, where elements clash, offer
              opportunities for growth and transformation that comfortable
              pairings may never achieve.
            </p>
            <p className="text-dust-400 leading-relaxed text-base sm:text-lg max-w-3xl mx-auto">
              At Stellara, our compatibility engine goes beyond simple sun-sign
              matching. Our analysis considers the full spectrum of elemental
              relationships, oppositional dynamics, and sign-specific
              characteristics to deliver nuanced, meaningful reports. Whether you
              are exploring a new romantic connection, deepening an existing
              partnership, or understanding a friendship or family dynamic, our
              AI-powered compatibility readings provide the astrological insight
              you need. For the deepest analysis, our premium synastry reports
              examine planet-by-planet aspects between two full birth charts,
              revealing the complete cosmic picture of any relationship.
            </p>
          </div>

          {/* Element compatibility guide */}
          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              The Four Elements &amp; Compatibility
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{'\u2648'}</span>
                  <h4 className="font-bold text-red-400">Fire Signs</h4>
                </div>
                <p className="text-xs text-dust-400 mb-1">
                  Aries, Leo, Sagittarius
                </p>
                <p className="text-sm text-dust-300 leading-relaxed">
                  Passionate, dynamic, and bold. Fire signs are most compatible
                  with fellow Fire signs and Air signs, which fan their flames
                  and fuel their ambitions.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{'\u2649'}</span>
                  <h4 className="font-bold text-emerald-400">Earth Signs</h4>
                </div>
                <p className="text-xs text-dust-400 mb-1">
                  Taurus, Virgo, Capricorn
                </p>
                <p className="text-sm text-dust-300 leading-relaxed">
                  Grounded, reliable, and sensual. Earth signs thrive with
                  fellow Earth signs and Water signs, which nourish their roots
                  and deepen their emotional world.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-sky-500/15 bg-sky-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{'\u264A'}</span>
                  <h4 className="font-bold text-sky-400">Air Signs</h4>
                </div>
                <p className="text-xs text-dust-400 mb-1">
                  Gemini, Libra, Aquarius
                </p>
                <p className="text-sm text-dust-300 leading-relaxed">
                  Intellectual, social, and adaptive. Air signs harmonize with
                  fellow Air signs and Fire signs, which ignite their curiosity
                  and inspire bold ideas.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-blue-500/15 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{'\u264B'}</span>
                  <h4 className="font-bold text-blue-400">Water Signs</h4>
                </div>
                <p className="text-xs text-dust-400 mb-1">
                  Cancer, Scorpio, Pisces
                </p>
                <p className="text-sm text-dust-300 leading-relaxed">
                  Intuitive, emotional, and deep. Water signs connect best with
                  fellow Water signs and Earth signs, which provide the stability
                  and security they crave.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            FOOTER CTA STRIP
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center border-t border-celestial-400/10">
          <div className="max-w-2xl mx-auto">
            <Heart size={32} className="text-nebula-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready for a Deeper Connection?
            </h2>
            <p className="text-dust-400 mb-8">
              Go beyond sun signs. Get a full synastry report based on your
              complete birth charts for the most accurate compatibility analysis
              available.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="btn-glow text-base px-8 py-4 rounded-xl"
              >
                <Star size={18} />
                Unlock Premium Reports
              </Link>
              <Link
                href="/birth-chart"
                className="inline-flex items-center gap-2 text-celestial-300 hover:text-celestial-200 font-semibold transition-colors"
              >
                Generate Your Birth Chart
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
