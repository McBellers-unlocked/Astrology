'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Star,
  Heart,
  Sun,
  Moon,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
} from 'lucide-react';

/* ================================================================
   DATA
   ================================================================ */

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19', teaser: 'A bold career opportunity arrives today — trust your instincts.', rating: 4, slug: 'aries' },
  { name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20', teaser: 'Financial clarity emerges as Venus blesses your second house.', rating: 5, slug: 'taurus' },
  { name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20', teaser: 'A meaningful conversation shifts your perspective entirely.', rating: 3, slug: 'gemini' },
  { name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22', teaser: 'Home and family matters bring unexpected joy this evening.', rating: 4, slug: 'cancer' },
  { name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22', teaser: 'The spotlight finds you naturally — step into your creative power.', rating: 5, slug: 'leo' },
  { name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22', teaser: 'Details you overlooked now reveal a powerful pattern.', rating: 3, slug: 'virgo' },
  { name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22', teaser: 'A relationship deepens as honest words flow freely.', rating: 4, slug: 'libra' },
  { name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21', teaser: 'Deep transformation accelerates — release what no longer serves you.', rating: 5, slug: 'scorpio' },
  { name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21', teaser: 'Adventure calls — an unexpected travel opportunity surfaces.', rating: 4, slug: 'sagittarius' },
  { name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19', teaser: 'Your long-term strategy finally starts paying dividends.', rating: 4, slug: 'capricorn' },
  { name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18', teaser: 'Innovative thinking leads to a breakthrough in your community.', rating: 3, slug: 'aquarius' },
  { name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20', teaser: 'Your intuition is razor-sharp — trust the visions that arise.', rating: 5, slug: 'pisces' },
];

const TESTIMONIALS = [
  {
    name: 'Maya Rodriguez',
    role: 'Yoga Instructor, Austin TX',
    quote:
      'Stellara\'s birth chart reading was shockingly accurate. It described patterns in my life I\'ve never been able to articulate. I\'ve tried dozens of astrology apps — nothing comes close to this level of depth.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'James Chen',
    role: 'Software Engineer, Seattle WA',
    quote:
      'I was skeptical, but ran my chart out of curiosity. The compatibility analysis for my partner and me was so specific it felt like it was written by someone who knows us. We reference it in conversations constantly.',
    rating: 5,
    avatar: 'JC',
  },
  {
    name: 'Priya Sharma',
    role: 'Creative Director, Brooklyn NY',
    quote:
      'The daily AI horoscopes are genuinely useful — not vague fluff. They\'ve helped me time important meetings and creative decisions. The premium transit alerts alone are worth the subscription.',
    rating: 5,
    avatar: 'PS',
  },
];

const FAQ_DATA = [
  {
    question: 'What is a birth chart, and why does it matter?',
    answer:
      'A birth chart (or natal chart) is a snapshot of the sky at the exact moment you were born. It maps the positions of the Sun, Moon, and all planets across the twelve houses and zodiac signs. This chart serves as your unique cosmic blueprint, revealing personality traits, strengths, challenges, and life themes that astrologers have studied for thousands of years.',
  },
  {
    question: 'How accurate are Stellara\'s AI-powered horoscopes?',
    answer:
      'Our horoscopes are generated using precise astronomical ephemeris data combined with advanced AI trained on classical and modern astrological interpretation frameworks. Unlike generic sun-sign columns, Stellara factors in your full natal chart — including your Moon sign, Rising sign, and current planetary transits — to deliver readings that are specific and personally relevant.',
  },
  {
    question: 'What information do I need to generate my birth chart?',
    answer:
      'You\'ll need three pieces of information: your date of birth, your exact time of birth (as precise as possible), and your place of birth. The birth time is especially important because it determines your Rising sign and house placements. If you don\'t know your exact birth time, check your birth certificate or ask a family member — even an approximate time helps.',
  },
  {
    question: 'What\'s the difference between the free and premium plans?',
    answer:
      'The free plan gives you a complete natal chart with basic interpretations, daily sun-sign horoscopes, and one compatibility reading per month. Premium unlocks full chart interpretations covering every planet and house, personalized daily readings for your Sun, Moon, and Rising signs, unlimited compatibility analyses, real-time transit alerts, and progressed chart tracking.',
  },
];

const FEATURES = [
  {
    icon: Sun,
    title: 'Birth Chart Generator',
    description:
      'Professional-grade natal charts with full planetary positions, house placements, and aspect analysis. Get the same depth that professional astrologers use.',
    href: '/birth-chart',
    cta: 'Generate Your Chart',
  },
  {
    icon: Heart,
    title: 'Compatibility Engine',
    description:
      'Deep synastry and composite chart analysis to understand any relationship. Discover the cosmic dynamics between you and anyone in your life.',
    href: '/compatibility',
    cta: 'Check Compatibility',
  },
  {
    icon: Sparkles,
    title: 'AI Horoscopes',
    description:
      'Personalized daily readings for your Sun, Moon, and Rising signs. Powered by real-time planetary transits and trained on millennia of astrological wisdom.',
    href: '/horoscope',
    cta: 'Read Today\'s Horoscope',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Enter Your Birth Details',
    description: 'Provide your date, time, and place of birth. It takes less than 30 seconds.',
  },
  {
    step: 2,
    title: 'Get Your Personalized Chart',
    description:
      'We calculate precise planetary positions and generate your unique natal chart instantly.',
  },
  {
    step: 3,
    title: 'Unlock Deeper Insights',
    description:
      'Explore detailed interpretations, daily forecasts, and compatibility readings tailored to you.',
  },
];

const FREE_VS_PREMIUM = [
  { feature: 'Full Natal Chart', free: true, premium: true },
  { feature: 'Basic Sun-Sign Horoscope', free: true, premium: true },
  { feature: 'Detailed Planet Interpretations', free: false, premium: true },
  { feature: 'Moon & Rising Sign Readings', free: false, premium: true },
  { feature: 'Unlimited Compatibility Reports', free: false, premium: true },
  { feature: 'Real-Time Transit Alerts', free: false, premium: true },
  { feature: 'Progressed Chart Tracking', free: false, premium: true },
  { feature: 'Priority AI Analysis', free: false, premium: true },
];

/* ================================================================
   STAR PARTICLES BACKGROUND
   ================================================================ */

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${(i * 17.3 + 7) % 100}%`,
    top: `${(i * 23.7 + 13) % 100}%`,
    size: i % 5 === 0 ? 'star--lg' : i % 3 === 0 ? '' : 'star--sm',
    color: i % 11 === 0 ? 'star--gold' : i % 7 === 0 ? 'star--pink' : i % 5 === 0 ? 'star--blue' : '',
    delay: `${(i * 0.37) % 5}s`,
    duration: `${3 + (i % 4)}s`,
  }));

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className={`star ${s.size} ${s.color}`}
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   ZODIAC WHEEL VISUAL
   ================================================================ */

function ZodiacWheel() {
  const symbols = ZODIAC_SIGNS.map((z) => z.symbol);

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto" aria-hidden="true">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border border-celestial-400/20 animate-glow" />

      {/* Middle ring */}
      <div className="absolute inset-6 sm:inset-8 rounded-full border border-celestial-400/10" />

      {/* Inner ring */}
      <div className="absolute inset-16 sm:inset-20 rounded-full border border-nebula-500/10" />

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-stardust-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]" />
      </div>

      {/* Spinning zodiac symbols - outer ring */}
      <div className="absolute inset-0 zodiac-wheel">
        {symbols.map((sym, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const radius = 45;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <span
              key={i}
              className="absolute text-xl sm:text-2xl text-celestial-300/70 hover:text-stardust-400 transition-colors duration-300 select-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {sym}
            </span>
          );
        })}
      </div>

      {/* Counter-rotating inner symbols */}
      <div
        className="absolute inset-12 sm:inset-16"
        style={{ animation: 'zodiac-spin 90s linear infinite reverse' }}
      >
        {symbols.filter((_, i) => i % 3 === 0).map((sym, i) => {
          const angle = (i * 90 - 45) * (Math.PI / 180);
          const radius = 40;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <span
              key={i}
              className="absolute text-sm sm:text-base text-nebula-500/40 select-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {sym}
            </span>
          );
        })}
      </div>

      {/* Radial lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 h-px origin-left bg-gradient-to-r from-celestial-400/15 to-transparent"
          style={{
            width: '48%',
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   STAR RATING COMPONENT
   ================================================================ */

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? 'fill-stardust-400 text-stardust-400'
              : 'fill-transparent text-dust-600'
          }
        />
      ))}
    </div>
  );
}

/* ================================================================
   FAQ ACCORDION ITEM
   ================================================================ */

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-celestial-400/10 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-celestial-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-celestial-400/60"
        aria-expanded={isOpen}
      >
        <span className="text-base sm:text-lg font-semibold pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-celestial-300 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-dust-400 leading-relaxed text-sm sm:text-base">{answer}</p>
      </div>
    </div>
  );
}

/* ================================================================
   FAQ ACCORDION WRAPPER
   ================================================================ */

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="glass-card p-6 sm:p-8">
      {FAQ_DATA.map((item, i) => (
        <FAQItem
          key={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MAIN PAGE COMPONENT
   ================================================================ */

export default function HomePage() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen">
      <StarField />

      <main className="relative z-10">
        {/* ============================================
            SECTION 1 — HERO
            ============================================ */}
        <section className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-24 pb-16 overflow-hidden">
          {/* Background radial accents */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(236,72,153,0.06) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />

          {/* Zodiac Wheel */}
          <div className="mb-8 sm:mb-12 animate-in">
            <ZodiacWheel />
          </div>

          {/* Headline */}
          <h1 className="gradient-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-center animate-in max-w-4xl">
            Your Stars, Decoded.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 sm:mt-8 text-lg sm:text-xl md:text-2xl text-dust-300 text-center max-w-2xl leading-relaxed animate-in">
            Professional-grade birth charts, AI-powered daily horoscopes, and
            deep compatibility analysis — all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-5 animate-in w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/birth-chart"
              className="btn-glow text-center text-base sm:text-lg px-8 py-4 rounded-xl"
            >
              <Sparkles size={20} />
              Get Your Free Birth Chart
            </Link>
            <Link
              href="/horoscope"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold text-celestial-200 border border-celestial-400/25 rounded-xl bg-celestial-400/5 hover:bg-celestial-400/10 hover:border-celestial-400/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sun size={20} />
              Today&apos;s Horoscope
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dust-500 animate-in">
            <span className="text-xs uppercase tracking-widest">Explore</span>
            <ChevronDown size={16} className="animate-bounce" />
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 2 — DAILY HOROSCOPE PREVIEW
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-stardust-400 text-sm font-semibold uppercase tracking-widest mb-3">
              {dateString}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Today&apos;s Cosmic Forecast
            </h2>
            <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
              Tap your sign to reveal what the stars have in store for you today.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 stagger-children">
            {ZODIAC_SIGNS.map((sign) => (
              <Link
                key={sign.slug}
                href={`/horoscope/${sign.slug}`}
                className="glass-card-hover group p-5 sm:p-6 flex flex-col items-center text-center"
              >
                {/* Symbol */}
                <span className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 block">
                  {sign.symbol}
                </span>

                {/* Sign name & dates */}
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {sign.name}
                </h3>
                <p className="text-xs text-dust-500 mt-0.5 mb-3">{sign.dates}</p>

                {/* Rating */}
                <StarRating rating={sign.rating} size={12} />

                {/* Teaser */}
                <p className="text-sm text-dust-400 mt-3 leading-relaxed line-clamp-2">
                  {sign.teaser}
                </p>

                {/* CTA */}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-celestial-300 group-hover:text-celestial-200 transition-colors">
                  View Full Horoscope
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 3 — CORE FEATURES
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-celestial-300 text-sm font-semibold uppercase tracking-widest mb-3">
              Powerful Tools
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need in the Stars
            </h2>
            <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
              Professional astrology tools, now accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="glass-card-hover group p-8 sm:p-10 flex flex-col"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-celestial-400/10 border border-celestial-400/20 flex items-center justify-center mb-6 group-hover:bg-celestial-400/15 group-hover:border-celestial-400/30 transition-colors">
                    <Icon size={28} className="text-celestial-300" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-dust-400 leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-celestial-300 group-hover:text-celestial-200 transition-colors">
                    {feature.cta}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 4 — HOW IT WORKS
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-5xl mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-nebula-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-celestial-400/30 via-nebula-500/30 to-stardust-400/30" aria-hidden="true" />

            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                {/* Step number */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full border-2 border-celestial-400/25 flex items-center justify-center bg-space-900/80 relative z-10">
                    <span className="gradient-text text-3xl font-extrabold">
                      {item.step}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(124,58,237,0.12) 0%, transparent 70%)',
                    }}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-dust-400 leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/birth-chart"
              className="btn-glow text-base px-8 py-4 rounded-xl"
            >
              <Zap size={18} />
              Get Started — It&apos;s Free
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 5 — TESTIMONIALS
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-6xl mx-auto">
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-stardust-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Trusted by Thousands
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              What Our Community Says
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 stagger-children">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="glass-card p-8 flex flex-col"
              >
                {/* Stars */}
                <StarRating rating={t.rating} />

                {/* Quote */}
                <blockquote className="mt-5 text-dust-300 leading-relaxed flex-1 text-sm sm:text-base">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-celestial-400/10">
                  <div className="w-10 h-10 rounded-full bg-celestial-400/15 border border-celestial-400/25 flex items-center justify-center text-sm font-bold text-celestial-200">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-dust-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 6 — PREMIUM CTA
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-5xl mx-auto">
          <div className="relative glass-card p-8 sm:p-12 md:p-16 overflow-hidden">
            {/* Background accent */}
            <div
              className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at top right, rgba(251,191,36,0.08) 0%, transparent 60%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at bottom left, rgba(124,58,237,0.08) 0%, transparent 60%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="text-center mb-10 sm:mb-12">
                <span className="premium-badge mb-4 inline-flex">Premium</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4">
                  Unlock the Full Cosmos
                </h2>
                <p className="mt-4 text-dust-400 text-lg max-w-xl mx-auto">
                  Go beyond the basics. Get the full depth of your astrological profile with premium features.
                </p>
              </div>

              {/* Comparison table */}
              <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
                <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] gap-0 text-sm">
                  {/* Header */}
                  <div className="pb-3 mb-3 border-b border-celestial-400/15 font-semibold text-dust-400 text-xs uppercase tracking-wider">
                    Feature
                  </div>
                  <div className="pb-3 mb-3 border-b border-celestial-400/15 font-semibold text-dust-400 text-xs uppercase tracking-wider text-center">
                    Free
                  </div>
                  <div className="pb-3 mb-3 border-b border-celestial-400/15 font-semibold text-stardust-400 text-xs uppercase tracking-wider text-center">
                    Premium
                  </div>

                  {/* Rows */}
                  {FREE_VS_PREMIUM.map((row) => (
                    <div key={row.feature} className="contents">
                      <div className="py-2.5 text-dust-300 border-b border-celestial-400/5 flex items-center">
                        {row.feature}
                      </div>
                      <div className="py-2.5 text-center border-b border-celestial-400/5 flex items-center justify-center">
                        {row.free ? (
                          <Shield size={16} className="text-aurora-500" />
                        ) : (
                          <span className="text-dust-600">—</span>
                        )}
                      </div>
                      <div className="py-2.5 text-center border-b border-celestial-400/5 flex items-center justify-center">
                        <Shield size={16} className="text-stardust-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className="btn-glow text-base px-10 py-4 rounded-xl"
                >
                  <Star size={18} />
                  Start Free Trial
                </Link>
                <p className="text-xs text-dust-500">
                  No credit card required. 7-day free trial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider mx-auto max-w-5xl" />

        {/* ============================================
            SECTION 7 — SEO CONTENT & FAQ
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl mx-auto">
          {/* SEO paragraph */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              What is Stellara?
            </h2>
            <p className="text-dust-400 leading-relaxed text-base sm:text-lg max-w-3xl mx-auto">
              Stellara is a modern astrology platform that combines precise astronomical
              calculations with AI-powered interpretations to deliver professional-grade
              birth chart readings, daily horoscopes, and compatibility analysis. Whether
              you&apos;re exploring your natal chart for the first time or you&apos;re a
              seasoned astrology enthusiast seeking deeper insights into planetary transits
              and progressions, Stellara provides the tools and wisdom you need. Our
              platform covers all twelve zodiac signs — Aries, Taurus, Gemini, Cancer, Leo,
              Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces — with
              personalized readings that go far beyond generic sun-sign horoscopes.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <FAQAccordion />
          </div>
        </section>

        {/* ============================================
            FOOTER CTA STRIP
            ============================================ */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center border-t border-celestial-400/10">
          <div className="max-w-2xl mx-auto">
            <Moon size={32} className="text-celestial-300 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Explore Your Cosmic Blueprint?
            </h2>
            <p className="text-dust-400 mb-8">
              Join thousands of people who have already discovered what the stars
              reveal about their lives. Your birth chart is waiting.
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

          {/* Minimal footer */}
          <div className="mt-16 pt-8 border-t border-celestial-400/5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto text-xs text-dust-500">
            <p>&copy; {new Date().getFullYear()} Stellara. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="hover:text-celestial-300 transition-colors">
                Pricing
              </Link>
              <Link href="/birth-chart" className="hover:text-celestial-300 transition-colors">
                Birth Chart
              </Link>
              <Link href="/horoscope" className="hover:text-celestial-300 transition-colors">
                Horoscopes
              </Link>
              <Link href="/compatibility" className="hover:text-celestial-300 transition-colors">
                Compatibility
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
