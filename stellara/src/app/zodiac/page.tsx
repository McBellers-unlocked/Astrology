'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Mountain,
  Wind,
  Waves,
  Star,
  Filter,
} from 'lucide-react';
import {
  SIGNS,
  ELEMENT_STYLES,
  ELEMENT_DESCRIPTIONS,
  type SignData,
} from '@/data/zodiac';

/* ================================================================
   TYPE & CONSTANTS
   ================================================================ */

type ElementFilter = 'All' | 'Fire' | 'Earth' | 'Air' | 'Water';

const ELEMENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Fire: Flame,
  Earth: Mountain,
  Air: Wind,
  Water: Waves,
};

const FILTER_TABS: ElementFilter[] = ['All', 'Fire', 'Earth', 'Air', 'Water'];

/* ================================================================
   ZODIAC SIGN CARD
   ================================================================ */

function ZodiacSignCard({ sign }: { sign: SignData }) {
  const style = ELEMENT_STYLES[sign.element];
  const ElementIcon = ELEMENT_ICONS[sign.element];

  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="glass-card-hover group flex flex-col p-6 sm:p-7 transition-all duration-300"
    >
      {/* Symbol & Element Badge */}
      <div className="mb-4 flex items-start justify-between">
        <span className="text-5xl sm:text-6xl leading-none transition-transform duration-300 group-hover:scale-110 drop-shadow-lg">
          {sign.symbol}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}
        >
          {ElementIcon && <ElementIcon size={10} />}
          {sign.element}
        </span>
      </div>

      {/* Name & Dates */}
      <h3 className="text-xl font-bold text-foreground mb-1">{sign.name}</h3>
      <p className="text-xs text-dust-500 mb-4">{sign.dates}</p>

      {/* Description */}
      <p className="text-sm text-dust-400 leading-relaxed flex-1 mb-5 line-clamp-4">
        {sign.shortDescription}
      </p>

      {/* CTA */}
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-celestial-300 group-hover:text-celestial-200 transition-colors">
        Explore {sign.name}
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function ZodiacHubPage() {
  const [activeFilter, setActiveFilter] = useState<ElementFilter>('All');

  const filteredSigns =
    activeFilter === 'All'
      ? SIGNS
      : SIGNS.filter((s) => s.element === activeFilter);

  return (
    <main className="relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-celestial-500/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-nebula-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-stardust-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* ============================================
            HERO SECTION
            ============================================ */}
        <header className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-celestial-500/20 bg-celestial-500/5 px-4 py-1.5 text-sm text-celestial-200">
            <Sparkles size={14} className="text-stardust-400" />
            Explore All 12 Signs
          </div>

          <h1 className="gradient-text mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            The Zodiac Signs
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-dust-400 leading-relaxed">
            Discover the unique personality, strengths, and cosmic gifts of each zodiac sign.
            From the fiery courage of Aries to the mystical depths of Pisces, explore the
            celestial archetypes that shape who we are.
          </p>
        </header>

        {/* ============================================
            FILTER TABS
            ============================================ */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.06] bg-space-800/60 p-1 backdrop-blur-sm">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              const tabStyle = tab !== 'All' ? ELEMENT_STYLES[tab] : null;
              const TabIcon = tab !== 'All' ? ELEMENT_ICONS[tab] : Filter;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-celestial-500/20 text-foreground shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                      : 'text-dust-400 hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                  aria-pressed={isActive}
                >
                  {TabIcon && <TabIcon size={14} className={isActive && tabStyle ? tabStyle.text : ''} />}
                  {tab}
                  {tab !== 'All' && (
                    <span className="hidden sm:inline text-xs text-dust-500">
                      ({SIGNS.filter((s) => s.element === tab).length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Element description when filtering */}
        {activeFilter !== 'All' && (
          <p className="text-center text-sm text-dust-300 -mt-6 mb-10 max-w-lg mx-auto animate-in">
            {ELEMENT_DESCRIPTIONS[activeFilter]}
          </p>
        )}

        {/* ============================================
            ZODIAC SIGN GRID
            ============================================ */}
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSigns.map((sign) => (
            <ZodiacSignCard key={sign.slug} sign={sign} />
          ))}
        </div>

        <hr className="section-divider my-20" />

        {/* ============================================
            QUICK REFERENCE TABLE
            ============================================ */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <p className="text-stardust-400 text-sm font-semibold uppercase tracking-widest mb-3">
              At a Glance
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Zodiac Quick Reference
            </h2>
            <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
              All twelve signs with their element, modality, and ruling planet in one convenient table.
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-celestial-400/15">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dust-400">
                      Sign
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dust-400">
                      Dates
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dust-400">
                      Element
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dust-400">
                      Modality
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-dust-400">
                      Ruling Planet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SIGNS.map((sign, i) => {
                    const style = ELEMENT_STYLES[sign.element];
                    return (
                      <tr
                        key={sign.slug}
                        className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                          i === SIGNS.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/zodiac/${sign.slug}`}
                            className="inline-flex items-center gap-3 group"
                          >
                            <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                              {sign.symbol}
                            </span>
                            <span className="font-semibold text-foreground group-hover:text-celestial-200 transition-colors">
                              {sign.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-dust-400">{sign.dates}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}
                          >
                            {sign.element}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-dust-300">{sign.modality}</td>
                        <td className="px-5 py-4 text-dust-300">{sign.ruler}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <hr className="section-divider my-20" />

        {/* ============================================
            THE FOUR ELEMENTS
            ============================================ */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              The Four Elements
            </h2>
            <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
              Every sign is shaped by one of four elemental forces that define its core nature.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {(['Fire', 'Earth', 'Air', 'Water'] as const).map((element) => {
              const style = ELEMENT_STYLES[element];
              const Icon = ELEMENT_ICONS[element];
              const elementSigns = SIGNS.filter((s) => s.element === element);
              return (
                <div key={element} className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={style.text}>
                      {Icon && <Icon size={20} />}
                    </span>
                    <h3 className={`text-lg font-bold ${style.text}`}>{element} Signs</h3>
                  </div>
                  <p className="text-sm text-dust-300 leading-relaxed mb-4">
                    {ELEMENT_DESCRIPTIONS[element]}
                  </p>
                  <div className="flex gap-3">
                    {elementSigns.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/zodiac/${s.slug}`}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="text-2xl">{s.symbol}</span>
                        <span className="text-xs text-dust-300">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="section-divider my-20" />

        {/* ============================================
            SEO CONTENT SECTION
            ============================================ */}
        <section className="mx-auto max-w-3xl mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Understanding the Zodiac
            </h2>
          </div>

          <div className="space-y-5 text-sm sm:text-base leading-relaxed text-dust-400">
            <p>
              The zodiac is a celestial coordinate system that has guided humanity&apos;s understanding
              of personality, destiny, and cosmic timing for over two thousand years. Divided into twelve
              equal segments of 30 degrees each, the zodiac belt follows the ecliptic &mdash; the apparent
              path of the Sun across the sky as observed from Earth. Each zodiac sign corresponds to a
              specific constellation and carries its own unique blend of elemental energy, modal quality,
              and planetary rulership that shapes the character of those born under its influence.
            </p>

            <p>
              The four elements &mdash; Fire, Earth, Air, and Water &mdash; form the foundational
              energies of the zodiac. Fire signs (Aries, Leo, Sagittarius) burn with passion,
              courage, and creative inspiration. Earth signs (Taurus, Virgo, Capricorn) ground us
              in practicality, patience, and material wisdom. Air signs (Gemini, Libra, Aquarius)
              elevate our thinking through intellect, communication, and social connection. Water
              signs (Cancer, Scorpio, Pisces) deepen our experience through emotion, intuition,
              and spiritual sensitivity.
            </p>

            <p>
              The three modalities &mdash; Cardinal, Fixed, and Mutable &mdash; describe how each
              sign engages with change and the world around it. Cardinal signs (Aries, Cancer, Libra,
              Capricorn) are initiators who lead with bold action. Fixed signs (Taurus, Leo, Scorpio,
              Aquarius) are sustainers who build with determination and focus. Mutable signs (Gemini,
              Virgo, Sagittarius, Pisces) are adapters who navigate change with flexibility and wisdom.
            </p>

            <p>
              Each zodiac sign is governed by a ruling planet that infuses it with specific qualities
              and themes. Mars drives Aries with courage, Venus graces Taurus and Libra with beauty
              and harmony, Mercury sharpens Gemini and Virgo with wit and analysis, the Moon nurtures
              Cancer with emotional depth, the Sun empowers Leo with radiant confidence, Pluto
              transforms Scorpio through intensity and rebirth, Jupiter expands Sagittarius with
              optimism and wisdom, Saturn structures Capricorn with discipline and ambition, Uranus
              revolutionizes Aquarius with innovation, and Neptune inspires Pisces with mystical
              vision and compassion.
            </p>

            <p>
              At Stellara, we believe that understanding your zodiac sign is just the beginning of a
              profound journey of self-discovery. While your Sun sign reveals your core identity, your
              complete birth chart &mdash; including your Moon sign, Rising sign, and the positions of
              all planets at the moment of your birth &mdash; paints a far richer and more nuanced
              portrait of who you are and the cosmic potential you carry. Explore each sign below to
              begin unlocking the celestial wisdom written in the stars.
            </p>
          </div>

          {/* Sign Links for SEO */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-dust-500">
            {SIGNS.map((sign) => (
              <Link
                key={sign.slug}
                href={`/zodiac/${sign.slug}`}
                className="transition-colors hover:text-celestial-300"
              >
                {sign.symbol} {sign.name}
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider my-16" />

        {/* ============================================
            BOTTOM CTA
            ============================================ */}
        <section className="text-center">
          <div className="glass-card inline-block p-8 sm:p-12">
            <Star size={28} className="text-stardust-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Go Deeper?
            </h2>
            <p className="text-dust-400 mb-8 max-w-md mx-auto">
              Your zodiac sign is just the beginning. Generate your complete birth chart to
              discover your Moon sign, Rising sign, and the full map of your cosmic blueprint.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/birth-chart"
                className="btn-glow text-base px-8 py-4 rounded-xl"
              >
                <Sparkles size={18} />
                Get Your Free Birth Chart
              </Link>
              <Link
                href="/compatibility"
                className="inline-flex items-center gap-2 text-celestial-300 hover:text-celestial-200 font-semibold transition-colors"
              >
                Check Compatibility
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
