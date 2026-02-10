'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Star,
  Filter,
} from 'lucide-react';

/* ================================================================
   ZODIAC DATA
   ================================================================ */

const SIGNS = [
  { slug: 'aries', name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', color: '#EF4444', luckyNumbers: [1, 9, 17], luckyDay: 'Tuesday', bodyPart: 'Head' },
  { slug: 'taurus', name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20', element: 'Earth', modality: 'Fixed', ruler: 'Venus', color: '#10B981', luckyNumbers: [2, 6, 14], luckyDay: 'Friday', bodyPart: 'Throat' },
  { slug: 'gemini', name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20', element: 'Air', modality: 'Mutable', ruler: 'Mercury', color: '#8B5CF6', luckyNumbers: [5, 7, 14], luckyDay: 'Wednesday', bodyPart: 'Arms & Hands' },
  { slug: 'cancer', name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22', element: 'Water', modality: 'Cardinal', ruler: 'Moon', color: '#3B82F6', luckyNumbers: [2, 7, 11], luckyDay: 'Monday', bodyPart: 'Chest & Stomach' },
  { slug: 'leo', name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22', element: 'Fire', modality: 'Fixed', ruler: 'Sun', color: '#F59E0B', luckyNumbers: [1, 4, 10], luckyDay: 'Sunday', bodyPart: 'Heart & Spine' },
  { slug: 'virgo', name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', color: '#059669', luckyNumbers: [5, 14, 23], luckyDay: 'Wednesday', bodyPart: 'Digestive System' },
  { slug: 'libra', name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22', element: 'Air', modality: 'Cardinal', ruler: 'Venus', color: '#EC4899', luckyNumbers: [6, 15, 24], luckyDay: 'Friday', bodyPart: 'Lower Back & Kidneys' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21', element: 'Water', modality: 'Fixed', ruler: 'Pluto', color: '#7C3AED', luckyNumbers: [8, 11, 18], luckyDay: 'Tuesday', bodyPart: 'Reproductive System' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', color: '#F97316', luckyNumbers: [3, 7, 9], luckyDay: 'Thursday', bodyPart: 'Hips & Thighs' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', color: '#6B7280', luckyNumbers: [4, 8, 13], luckyDay: 'Saturday', bodyPart: 'Knees & Bones' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18', element: 'Air', modality: 'Fixed', ruler: 'Uranus', color: '#06B6D4', luckyNumbers: [4, 7, 11], luckyDay: 'Saturday', bodyPart: 'Ankles & Circulatory System' },
  { slug: 'pisces', name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20', element: 'Water', modality: 'Mutable', ruler: 'Neptune', color: '#8B5CF6', luckyNumbers: [3, 9, 12], luckyDay: 'Thursday', bodyPart: 'Feet & Immune System' },
];

const SIGN_DESCRIPTIONS: Record<string, string> = {
  aries:
    'The first sign of the zodiac, Aries charges through life with fierce determination and infectious enthusiasm. Born leaders who thrive on challenge and competition, Aries individuals bring a pioneering spirit to everything they touch, turning obstacles into opportunities with raw courage and unstoppable drive.',
  taurus:
    'Grounded in the richness of the physical world, Taurus embodies patience, loyalty, and a profound appreciation for beauty. These earthy souls build their lives on solid foundations, savoring every sensory pleasure while creating lasting security for themselves and the people they love most deeply.',
  gemini:
    'The celestial twins dance between worlds of thought and conversation, bringing intellectual curiosity and adaptable charm to every encounter. Gemini\u2019s quicksilver mind connects ideas that others miss, weaving stories and forging connections with a playful wit that keeps everyone endlessly fascinated.',
  cancer:
    'Guided by the Moon\u2019s tender rhythms, Cancer carries the emotional wisdom of the zodiac within their nurturing heart. These deeply intuitive souls create sanctuary wherever they go, offering fierce protection to their loved ones while navigating the tides of feeling with remarkable courage and grace.',
  leo:
    'Ruled by the radiant Sun, Leo illuminates every room with warmth, creativity, and an unmistakable presence that draws all eyes. These generous-hearted lions lead with both passion and compassion, inspiring others to shine alongside them while never dimming their own magnificent, golden light.',
  virgo:
    'With Mercury\u2019s analytical precision and the Earth\u2019s grounding wisdom, Virgo transforms chaos into order and potential into excellence. These devoted perfectionists serve the world through meticulous care and practical brilliance, finding sacred purpose in the details that others overlook entirely.',
  libra:
    'Venus bestows upon Libra an exquisite sense of harmony, beauty, and relational wisdom that creates balance wherever they go. These natural diplomats navigate the complexities of human connection with grace, seeking fairness and partnership while cultivating an aesthetic vision that elevates everything around them.',
  scorpio:
    'Pluto\u2019s transformative power flows through Scorpio with magnetic intensity, granting these fearless souls the ability to see beneath every surface. Masters of reinvention who embrace the full spectrum of human experience, Scorpios forge unbreakable bonds through radical honesty and emotional depth.',
  sagittarius:
    'Jupiter\u2019s boundless optimism fuels the Sagittarian quest for truth, adventure, and the expansive wisdom found beyond every horizon. These philosophical archers aim their arrows at the stars, inspiring others with their contagious enthusiasm, generous spirit, and unwavering faith in life\u2019s infinite possibilities.',
  capricorn:
    'Saturn\u2019s disciplined wisdom shapes Capricorn into the zodiac\u2019s master builder, scaling peaks that others consider impossible with methodical patience. These ambitious strategists play the long game with quiet authority, constructing legacies of lasting achievement while earning deep respect through their unwavering integrity.',
  aquarius:
    'Uranus sparks the revolutionary brilliance of Aquarius, the zodiac\u2019s visionary humanitarian who sees the future before anyone else. These independent thinkers challenge convention with innovative ideas, building community around shared ideals while marching to a cosmic drumbeat that only their awakened minds can hear.',
  pisces:
    'Neptune\u2019s mystical currents flow through Pisces, blessing these compassionate dreamers with boundless imagination and spiritual depth. The last sign of the zodiac carries the collective wisdom of all twelve, channeling universal empathy into art, healing, and a transcendent love that dissolves every boundary.',
};

type ElementFilter = 'All' | 'Fire' | 'Earth' | 'Air' | 'Water';

const ELEMENT_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  Fire: { bg: 'bg-stardust-500/10', text: 'text-stardust-400', border: 'border-stardust-500/30', icon: Flame },
  Earth: { bg: 'bg-aurora-500/10', text: 'text-aurora-400', border: 'border-aurora-500/30', icon: Mountain },
  Air: { bg: 'bg-celestial-500/10', text: 'text-celestial-200', border: 'border-celestial-500/30', icon: Wind },
  Water: { bg: 'bg-nebula-500/10', text: 'text-nebula-400', border: 'border-nebula-500/30', icon: Droplets },
};

const FILTER_TABS: ElementFilter[] = ['All', 'Fire', 'Earth', 'Air', 'Water'];

/* ================================================================
   ZODIAC SIGN CARD
   ================================================================ */

function ZodiacSignCard({ sign }: { sign: (typeof SIGNS)[number] }) {
  const style = ELEMENT_STYLES[sign.element];
  const ElementIcon = style.icon;

  return (
    <Link
      href={`/zodiac/${sign.slug}`}
      className="glass-card-hover group flex flex-col p-6 sm:p-7 transition-all duration-300"
    >
      {/* Symbol */}
      <div className="mb-4 flex items-start justify-between">
        <span
          className="text-5xl sm:text-6xl leading-none transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
          style={{ color: sign.color }}
        >
          {sign.symbol}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}
        >
          <ElementIcon size={10} />
          {sign.element}
        </span>
      </div>

      {/* Name & dates */}
      <h3 className="text-xl font-bold text-foreground mb-1">{sign.name}</h3>
      <p className="text-xs text-dust-500 mb-4">{sign.dates}</p>

      {/* Description */}
      <p className="text-sm text-dust-400 leading-relaxed flex-1 mb-5 line-clamp-4">
        {SIGN_DESCRIPTIONS[sign.slug]}
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
              const TabIcon = tab !== 'All' && tabStyle ? tabStyle.icon : Filter;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-celestial-500/20 text-foreground shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                      : 'text-dust-400 hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                  aria-pressed={isActive}
                >
                  <TabIcon size={14} className={isActive && tabStyle ? tabStyle.text : ''} />
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

        {/* ============================================
            ZODIAC SIGN GRID
            ============================================ */}
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSigns.map((sign) => (
            <ZodiacSignCard key={sign.slug} sign={sign} />
          ))}
        </div>

        {/* Section Divider */}
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
                            <span
                              className="text-2xl transition-transform duration-200 group-hover:scale-110"
                              style={{ color: sign.color }}
                            >
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

        {/* Section Divider */}
        <hr className="section-divider my-20" />

        {/* ============================================
            SEO CONTENT SECTION
            ============================================ */}
        <section className="mx-auto max-w-3xl">
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

        {/* Section Divider */}
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
                href="/horoscope"
                className="inline-flex items-center gap-2 text-celestial-300 hover:text-celestial-200 font-semibold transition-colors"
              >
                Read Today&apos;s Horoscope
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
