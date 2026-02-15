'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Star,
  Heart,
  Briefcase,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  Crown,
} from 'lucide-react';
import {
  SIGNS,
  ELEMENT_COLORS,
  HOROSCOPE_TEASERS,
  HOROSCOPE_RATINGS,
} from '@/lib/zodiac-data';
import { useAuth } from '@/lib/auth-context';
import EmailCapture from '@/components/EmailCapture';

type TabKey = 'sun' | 'moon' | 'rising';

interface Tab {
  key: TabKey;
  label: string;
  premium: boolean;
}

const TABS: Tab[] = [
  { key: 'sun', label: 'Sun Sign', premium: false },
  { key: 'moon', label: 'Moon Sign', premium: true },
  { key: 'rising', label: 'Rising Sign', premium: true },
];

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < rating
              ? 'fill-stardust-400 text-stardust-400'
              : 'fill-transparent text-dust-600'
          }
        />
      ))}
    </span>
  );
}

function RatingRow({
  icon: Icon,
  label,
  rating,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  rating: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-xs text-dust-400">
        <Icon size={12} className="shrink-0" />
        <span>{label}</span>
      </div>
      <StarRating rating={rating} />
    </div>
  );
}

function ZodiacCard({ sign }: { sign: (typeof SIGNS)[number] }) {
  const teaser = HOROSCOPE_TEASERS[sign.slug];
  const ratings = HOROSCOPE_RATINGS[sign.slug];
  const elementStyle = ELEMENT_COLORS[sign.element];

  return (
    <Link
      href={`/horoscope/${sign.slug}`}
      className="glass-card-hover group flex flex-col p-5 transition-all duration-300"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-4xl leading-none ${elementStyle.text} drop-shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            {sign.symbol}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {sign.name}
            </h3>
            <p className="text-xs text-dust-400">{sign.dates}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wider ${elementStyle.bg} ${elementStyle.text} ${elementStyle.border}`}
        >
          {sign.element}
        </span>
      </div>

      {/* Teaser */}
      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-dust-300">
        {teaser}
      </p>

      {/* Ratings */}
      <div className="mb-4 space-y-1.5 border-t border-white/5 pt-3">
        <RatingRow icon={Sparkles} label="Overall" rating={ratings.overall} />
        <RatingRow icon={Heart} label="Love" rating={ratings.love} />
        <RatingRow icon={Briefcase} label="Career" rating={ratings.career} />
        <RatingRow icon={Activity} label="Wellness" rating={ratings.wellness} />
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-celestial-300 transition-colors group-hover:text-celestial-100">
        Read Full Horoscope
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

export default function HoroscopeHubPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('sun');
  const { user, isPremium } = useAuth();
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM do, yyyy');

  return (
    <main className="relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-celestial-500/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-nebula-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-stardust-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-celestial-500/20 bg-celestial-500/5 px-4 py-1.5 text-sm text-celestial-200">
            <Sparkles size={14} className="text-stardust-400" />
            Updated daily at midnight EST
          </div>

          <h1 className="gradient-text mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Daily Cosmic Forecast
          </h1>

          <div className="mb-8 flex items-center justify-center gap-2 text-dust-400">
            <Calendar size={16} />
            <time dateTime={today.toISOString().split('T')[0]}>
              {formattedDate}
            </time>
          </div>

          {/* Tab Switcher */}
          <div className="mx-auto inline-flex rounded-xl border border-white/[0.06] bg-space-800/60 p-1 backdrop-blur-sm">
            {TABS.map((tab) => {
              const locked = tab.premium && !isPremium;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (!locked) setActiveTab(tab.key);
                  }}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-celestial-500/20 text-foreground shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                      : locked
                        ? 'cursor-not-allowed text-dust-500 hover:text-dust-400'
                        : 'text-dust-400 hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                  aria-pressed={activeTab === tab.key}
                  disabled={locked}
                >
                  {tab.label}
                  {tab.premium && !isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-stardust-500/25 bg-stardust-500/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-stardust-400">
                      <Lock size={8} />
                      Pro
                    </span>
                  )}
                  {tab.premium && isPremium && (
                    <Crown size={12} className="text-stardust-400" />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Premium banner for locked tabs (only shown to non-premium users) */}
        {activeTab !== 'sun' && !isPremium && (
          <div className="mb-10 rounded-2xl border border-stardust-500/20 bg-gradient-to-r from-stardust-500/5 via-celestial-500/5 to-nebula-500/5 p-6 text-center">
            <Lock size={20} className="mx-auto mb-2 text-stardust-400" />
            <p className="mb-3 text-sm text-dust-300">
              {user
                ? `${activeTab === 'moon' ? 'Moon Sign' : 'Rising Sign'} readings require a Stellara Premium subscription for personalized insights based on your full birth chart.`
                : `Sign up free and upgrade to Premium to unlock ${activeTab === 'moon' ? 'Moon Sign' : 'Rising Sign'} readings.`}
            </p>
            <Link
              href={user ? '/pricing' : '/signup'}
              className="btn-glow inline-flex items-center gap-2 !px-6 !py-2.5 text-sm"
            >
              <Sparkles size={14} />
              {user ? 'Unlock Premium Readings' : 'Create Free Account'}
            </Link>
          </div>
        )}

        {/* Zodiac Grid */}
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SIGNS.map((sign) => (
            <ZodiacCard key={sign.slug} sign={sign} />
          ))}
        </div>

        {/* Email Capture */}
        <div className="mx-auto mt-16 max-w-xl">
          <EmailCapture
            heading="Your horoscope, delivered daily"
            subheading="Start each morning with cosmic guidance tailored to your sign."
            ctaText="Get Daily Horoscopes"
            variant="card"
            source="horoscope_hub"
          />
        </div>

        {/* Section Divider */}
        <hr className="section-divider my-16" />

        {/* SEO Content Section */}
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
            Your Daily Horoscope, Crafted by the Cosmos
          </h2>

          <div className="space-y-4 text-sm leading-relaxed text-dust-400">
            <p>
              Welcome to Stellara&apos;s Daily Cosmic Forecast\u2014your trusted
              source for personalized daily horoscopes rooted in real-time
              planetary transits. Every morning, our astrologers analyze the
              positions of the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn,
              Uranus, Neptune, and Pluto to deliver insights uniquely tailored to
              each zodiac sign.
            </p>

            <p>
              Whether you&apos;re an adventurous Aries seeking your next bold
              move, a grounded Taurus looking for financial clarity, or a
              dreamy Pisces following your intuition, our daily readings offer
              actionable guidance for love, career, wellness, and personal
              growth. Each horoscope includes star ratings across four key life
              areas so you can quickly see where the cosmic energy is strongest
              for your sign today.
            </p>

            <p>
              For deeper insights, Stellara Premium members unlock personalized
              Moon Sign and Rising Sign readings. While your Sun Sign reveals
              your core identity and conscious self, your Moon Sign illuminates
              your emotional landscape, and your Rising Sign shapes how you
              present yourself to the world. Together, these three placements
              create a rich, nuanced portrait of your daily cosmic weather.
            </p>

            <p>
              Our horoscopes are updated daily at midnight EST, giving you
              fresh guidance to start each new day with celestial clarity.
              Bookmark this page, explore your sign&apos;s full reading, and
              discover how the stars are shaping your unique journey today.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-dust-500">
            {SIGNS.map((sign) => (
              <Link
                key={sign.slug}
                href={`/horoscope/${sign.slug}`}
                className="transition-colors hover:text-celestial-300"
              >
                {sign.symbol} {sign.name} Horoscope
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
