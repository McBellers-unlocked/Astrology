'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Sparkles, Heart, MessageCircle, Shield, Gem, Brain, Lock } from 'lucide-react';
import {
  SIGNS,
  ELEMENT_STYLES,
  getSignBySlug,
  calculateCompatibility,
  getCompatibilityRatings,
  getCompatibilityStrengths,
  getCompatibilityChallenges,
  getCompatibilitySummary,
  POPULAR_PAIRINGS,
} from '@/data/zodiac';

// ---------------------------------------------------------------------------
// Score Ring Component
// ---------------------------------------------------------------------------
function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  const color =
    score >= 85 ? '#10B981' : score >= 70 ? '#7C3AED' : score >= 55 ? '#FBBF24' : '#EC4899';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(124,58,237,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-dust-400 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star Rating Component
// ---------------------------------------------------------------------------
function StarRating({ rating, label, icon }: { rating: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-celestial-300">{icon}</span>
        <span className="text-sm text-dust-200">{label}</span>
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={15}
            className={
              i <= rating
                ? 'text-stardust-400 fill-stardust-400'
                : 'text-dust-600'
            }
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function CompatibilityPage() {
  const [sign1, setSign1] = useState<string | null>(null);
  const [sign2, setSign2] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (sign1 && sign2) {
      setShowResult(true);
    }
  };

  const score = sign1 && sign2 ? calculateCompatibility(sign1, sign2) : 0;
  const ratings = sign1 && sign2 ? getCompatibilityRatings(sign1, sign2) : null;
  const strengths = sign1 && sign2 ? getCompatibilityStrengths(sign1, sign2) : [];
  const challenges = sign1 && sign2 ? getCompatibilityChallenges(sign1, sign2) : [];
  const summary = sign1 && sign2 ? getCompatibilitySummary(sign1, sign2) : '';
  const s1Data = sign1 ? getSignBySlug(sign1) : null;
  const s2Data = sign2 ? getSignBySlug(sign2) : null;

  return (
    <main className="relative min-h-screen pb-24">
      {/* ----- Hero Section ----- */}
      <section className="pt-20 pb-10 text-center px-4">
        <div className="mx-auto max-w-3xl">
          <Sparkles className="mx-auto mb-4 text-stardust-400" size={32} />
          <h1 className="gradient-text text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Cosmic Compatibility
          </h1>
          <p className="text-lg sm:text-xl text-dust-300 max-w-2xl mx-auto leading-relaxed">
            Discover the celestial chemistry between any two signs. Select your sign and theirs
            to unveil what the stars have written about your connection.
          </p>
        </div>
      </section>

      {/* ----- Sign Selectors ----- */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Your Sign */}
          <div className="glass-card p-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-celestial-300 mb-4">
              Your Sign
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {SIGNS.map((s) => {
                const isActive = sign1 === s.slug;
                const elStyle = ELEMENT_STYLES[s.element];
                return (
                  <button
                    key={s.slug}
                    onClick={() => { setSign1(s.slug); setShowResult(false); }}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${elStyle.bg} ${elStyle.border} border-2 shadow-glow-sm scale-105`
                        : 'border-white/5 hover:border-celestial-400/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="text-2xl mb-0.5">{s.symbol}</span>
                    <span className={`text-[10px] font-medium ${isActive ? elStyle.text : 'text-dust-400'}`}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Their Sign */}
          <div className="glass-card p-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-nebula-400 mb-4">
              Their Sign
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {SIGNS.map((s) => {
                const isActive = sign2 === s.slug;
                const elStyle = ELEMENT_STYLES[s.element];
                return (
                  <button
                    key={s.slug}
                    onClick={() => { setSign2(s.slug); setShowResult(false); }}
                    className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${elStyle.bg} ${elStyle.border} border-2 shadow-glow-sm scale-105`
                        : 'border-white/5 hover:border-nebula-400/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="text-2xl mb-0.5">{s.symbol}</span>
                    <span className={`text-[10px] font-medium ${isActive ? elStyle.text : 'text-dust-400'}`}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleCheck}
            disabled={!sign1 || !sign2}
            className={`btn-glow px-8 py-3.5 text-base font-semibold rounded-xl transition-all duration-200 ${
              !sign1 || !sign2 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Sparkles size={18} />
            Check Compatibility
          </button>
          {sign1 && sign2 && !showResult && (
            <p className="text-dust-400 text-sm mt-3">
              {s1Data?.symbol} {s1Data?.name} & {s2Data?.symbol} {s2Data?.name} &mdash; ready to reveal
            </p>
          )}
        </div>
      </section>

      {/* ----- Results ----- */}
      {showResult && sign1 && sign2 && ratings && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16 animate-in">
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{s1Data?.symbol}</span>
                <Heart className="text-nebula-400" size={24} />
                <span className="text-5xl">{s2Data?.symbol}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {s1Data?.name} & {s2Data?.name}
              </h2>
              <p className="text-dust-400 text-sm">
                {s1Data?.element} {s1Data?.modality} &times; {s2Data?.element} {s2Data?.modality}
              </p>
            </div>

            <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-start">
              {/* Score Ring */}
              <div className="flex flex-col items-center gap-2">
                <ScoreRing score={score} />
                <span className="text-xs text-dust-400 uppercase tracking-wider font-medium">
                  Overall Score
                </span>
              </div>

              {/* Ratings */}
              <div className="space-y-1 flex-1">
                <StarRating rating={ratings.love} label="Love" icon={<Heart size={15} />} />
                <StarRating rating={ratings.communication} label="Communication" icon={<MessageCircle size={15} />} />
                <StarRating rating={ratings.trust} label="Trust" icon={<Shield size={15} />} />
                <StarRating rating={ratings.sharedValues} label="Shared Values" icon={<Gem size={15} />} />
                <StarRating rating={ratings.emotionalConnection} label="Emotional Connection" icon={<Brain size={15} />} />
              </div>
            </div>

            <hr className="section-divider my-8" />

            {/* Strengths & Challenges */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-aurora-400 font-semibold mb-3">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-dust-200 leading-relaxed">
                      <span className="text-aurora-400 shrink-0 mt-0.5">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-wider text-nebula-400 font-semibold mb-3">
                  Challenges
                </h3>
                <ul className="space-y-2">
                  {challenges.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-dust-200 leading-relaxed">
                      <span className="text-nebula-400 shrink-0 mt-0.5">&ndash;</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Summary */}
            <p className="text-dust-300 text-sm leading-relaxed mb-8">{summary}</p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/compatibility/${sign1}-${sign2}`}
                className="btn-glow px-6 py-3 text-sm font-semibold rounded-xl w-full sm:w-auto text-center"
              >
                Read Full Analysis
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-stardust-400/30 text-stardust-300 hover:bg-stardust-400/10 hover:border-stardust-400/50 transition-all duration-200 w-full sm:w-auto"
              >
                <Lock size={14} />
                Get Full Synastry Report
                <span className="premium-badge text-[9px] ml-1">PRO</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ----- Popular Pairings ----- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
          Popular Pairings
        </h2>
        <p className="text-dust-400 text-center mb-8">
          Explore the most searched zodiac compatibility combinations
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {POPULAR_PAIRINGS.map((slug) => {
            const [s1Slug, s2Slug] = slug.split('-');
            const sd1 = getSignBySlug(s1Slug);
            const sd2 = getSignBySlug(s2Slug);
            if (!sd1 || !sd2) return null;
            const pairScore = calculateCompatibility(s1Slug, s2Slug);
            return (
              <Link
                key={slug}
                href={`/compatibility/${slug}`}
                className="glass-card-hover p-4 flex flex-col items-center gap-2 group"
              >
                <div className="flex items-center gap-2 text-3xl">
                  <span>{sd1.symbol}</span>
                  <Heart size={14} className="text-nebula-400/60 group-hover:text-nebula-400 transition-colors" />
                  <span>{sd2.symbol}</span>
                </div>
                <span className="text-sm font-medium text-dust-200 group-hover:text-foreground transition-colors">
                  {sd1.name} & {sd2.name}
                </span>
                <span className="text-xs text-celestial-300 font-semibold">{pairScore}%</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ----- SEO Content ----- */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="glass-card p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Understanding Zodiac Compatibility
          </h2>
          <div className="space-y-4 text-dust-300 text-sm leading-relaxed">
            <p>
              Zodiac compatibility, also known as synastry, is the ancient practice of comparing two
              birth charts to understand the dynamics of a relationship. While sun sign compatibility
              is the most popular form of astrological comparison, a complete synastry analysis
              considers the positions of all planets, the Moon, the Ascendant, and the aspects they
              form between two charts.
            </p>
            <p>
              The four elements &mdash; Fire, Earth, Air, and Water &mdash; play a fundamental role
              in compatibility. Signs sharing the same element (a trine aspect) tend to understand
              each other effortlessly, while signs in complementary elements (sextile) create
              stimulating partnerships. Square aspects between signs of clashing elements generate
              tension that can fuel passion and growth, while oppositions create magnetic attraction
              between complementary energies.
            </p>
            <p>
              Modality also matters: Cardinal signs (Aries, Cancer, Libra, Capricorn) initiate
              action; Fixed signs (Taurus, Leo, Scorpio, Aquarius) sustain energy; and Mutable
              signs (Gemini, Virgo, Sagittarius, Pisces) adapt and transform. Pairings that share
              a modality understand each other&apos;s rhythm, while mixed-modality pairings benefit from
              the complementary dynamics each approach brings.
            </p>
            <p>
              Remember that sun sign compatibility is just the beginning. For a truly comprehensive
              understanding of your relationship dynamics, a full synastry chart analysis examines
              the interplay of both partners&apos; complete birth charts, revealing layers of connection
              that sun signs alone cannot capture.
            </p>
          </div>
        </div>
      </section>

      {/* ----- All Pairings Grid ----- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">
          Explore All 144 Compatibility Pairings
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {SIGNS.map((s) => (
            <div key={s.slug} className="space-y-1">
              <div className="text-center text-xs font-semibold text-celestial-300 uppercase tracking-wider py-1">
                {s.symbol} {s.name}
              </div>
              {SIGNS.map((t) => (
                <Link
                  key={`${s.slug}-${t.slug}`}
                  href={`/compatibility/${s.slug}-${t.slug}`}
                  className="block text-center text-[11px] text-dust-400 hover:text-celestial-200 hover:bg-white/[0.03] rounded px-1.5 py-0.5 transition-colors"
                >
                  {t.symbol} {t.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
