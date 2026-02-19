'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sun,
  Moon,
  CircleDot,
  Sparkles,
  Star,
  Heart,
  Crown,
  ArrowRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useDailyHoroscope } from '@/hooks/use-daily-horoscope';
import PremiumGate from '@/components/PremiumGate';

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'text-stardust-400 fill-stardust-400' : 'text-dust-600'}`}
        />
      ))}
    </div>
  );
}

function HoroscopePreview({ sign }: { sign: string }) {
  const horoscope = useDailyHoroscope(sign);

  if (!horoscope) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-celestial-300" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-celestial-300" />
          Today&apos;s Horoscope
        </h3>
        <span className="text-xs text-dust-500">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <p className="text-dust-200 text-sm leading-relaxed mb-4">{horoscope.teaser}</p>

      {horoscope.paragraphs[0] && (
        <p className="text-dust-300 text-sm leading-relaxed mb-4">{horoscope.paragraphs[0]}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-dust-400">Overall</span>
          <StarRating rating={horoscope.ratings.overall} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dust-400">Love</span>
          <StarRating rating={horoscope.ratings.love} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dust-400">Career</span>
          <StarRating rating={horoscope.ratings.career} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dust-400">Wellness</span>
          <StarRating rating={horoscope.ratings.wellness} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-dust-400">
        <span>Lucky: <span className="text-foreground">{horoscope.lucky.number}</span></span>
        <span>Color: <span className="text-foreground">{horoscope.lucky.color}</span></span>
        <span>Match: <span className="text-foreground">{capitalize(horoscope.lucky.compatibility)}</span></span>
      </div>

      <Link
        href={`/horoscope/${sign}`}
        className="mt-4 flex items-center gap-1.5 text-sm text-celestial-300 hover:text-celestial-200 transition-colors"
      >
        Read full horoscope
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function LockedHoroscopeTeaser({
  sunSign,
  label,
  signName,
  icon: Icon,
  iconColor,
  readingKey,
}: {
  sunSign: string;
  label: string;
  signName: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  readingKey: 'moonReading' | 'risingReading';
}) {
  const horoscope = useDailyHoroscope(sunSign);

  if (!horoscope) {
    return (
      <div className="glass-card p-5 flex items-center justify-center min-h-[120px]">
        <Loader2 className="h-5 w-5 animate-spin text-celestial-300" />
      </div>
    );
  }

  const reading = horoscope[readingKey];
  const preview = reading[0]?.split('.').slice(0, 2).join('.') + '...' || '';

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-base font-semibold text-foreground">
          {capitalize(signName)} {label}
        </h3>
      </div>
      <PremiumGate
        requiredTier="stellar"
        previewText={preview}
        featureName={`your ${capitalize(signName)} ${label}`}
      >
        <div className="space-y-3">
          {reading.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-dust-300">{p}</p>
          ))}
        </div>
      </PremiumGate>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isPremium } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-celestial-300" />
      </div>
    );
  }

  const hasBirthData = user.sunSign && user.moonSign && user.risingSign;
  const sunSign = user.sunSign || 'aries';
  const moonSign = user.moonSign || '';
  const risingSign = user.risingSign || '';

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-celestial-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-nebula-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-dust-400">
            {hasBirthData
              ? 'Your cosmic dashboard — everything in one place.'
              : 'Generate your birth chart to unlock your personalized dashboard.'}
          </p>
        </div>

        {/* Big Three Card */}
        {hasBirthData ? (
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-widest text-dust-400 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-stardust-400" />
              Your Big Three
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center group">
                <Sun className="mx-auto mb-2 h-6 w-6 text-stardust-400" />
                <p className="text-xs uppercase tracking-widest text-dust-400 mb-1">Sun Sign</p>
                <p className="text-2xl font-bold text-foreground">
                  <span className="mr-2 text-3xl">{ZODIAC_SYMBOLS[sunSign] || ''}</span>
                  {capitalize(sunSign)}
                </p>
                <p className="text-xs text-dust-500 mt-1">Your core identity</p>
              </div>
              <div className="glass-card p-5 text-center group">
                <Moon className="mx-auto mb-2 h-6 w-6 text-celestial-200" />
                <p className="text-xs uppercase tracking-widest text-dust-400 mb-1">Moon Sign</p>
                <p className="text-2xl font-bold text-foreground">
                  <span className="mr-2 text-3xl">{ZODIAC_SYMBOLS[moonSign] || ''}</span>
                  {capitalize(moonSign)}
                </p>
                <p className="text-xs text-dust-500 mt-1">Your emotional world</p>
              </div>
              <div className="glass-card p-5 text-center group">
                <CircleDot className="mx-auto mb-2 h-6 w-6 text-nebula-400" />
                <p className="text-xs uppercase tracking-widest text-dust-400 mb-1">Rising Sign</p>
                <p className="text-2xl font-bold text-foreground">
                  <span className="mr-2 text-3xl">{ZODIAC_SYMBOLS[risingSign] || ''}</span>
                  {capitalize(risingSign)}
                </p>
                <p className="text-xs text-dust-500 mt-1">How the world sees you</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 glass-card p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-celestial-300" />
            <h2 className="text-xl font-bold text-foreground mb-2">Discover Your Big Three</h2>
            <p className="text-dust-400 text-sm mb-6 max-w-md mx-auto">
              Generate your birth chart to see your Sun, Moon, and Rising signs.
              Your chart will be saved automatically.
            </p>
            <Link href="/birth-chart" className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Sparkles className="h-4 w-4" />
              Generate My Birth Chart
            </Link>
          </div>
        )}

        {/* Today's Horoscope */}
        {hasBirthData && (
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-widest text-dust-400 mb-4">
              {capitalize(sunSign)} Sun Forecast
            </h2>
            <HoroscopePreview sign={sunSign} />
          </div>
        )}

        {/* Moon & Rising Locked Teasers (free users only) */}
        {hasBirthData && !isPremium && (
          <div className="mb-8 space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-dust-400 flex items-center gap-2">
              <Crown className="h-4 w-4 text-stardust-400" />
              Premium Daily Readings
            </h2>
            <LockedHoroscopeTeaser
              sunSign={sunSign}
              label="Moon Reading"
              signName={moonSign}
              icon={Moon}
              iconColor="text-celestial-200"
              readingKey="moonReading"
            />
            <LockedHoroscopeTeaser
              sunSign={sunSign}
              label="Rising Reading"
              signName={risingSign}
              icon={CircleDot}
              iconColor="text-nebula-400"
              readingKey="risingReading"
            />
          </div>
        )}

        {/* Premium Upsell (for free users) */}
        {!isPremium && (
          <div className="mb-8 glass-card p-6 border border-stardust-500/20 bg-gradient-to-r from-stardust-600/5 to-celestial-600/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5 text-stardust-400" />
                  Unlock Your Full Cosmic Profile
                </h3>
                <p className="text-sm text-dust-400">
                  {hasBirthData ? (
                    <>
                      Unlock your{' '}
                      <span className="text-celestial-200 font-medium">
                        {ZODIAC_SYMBOLS[moonSign]} {capitalize(moonSign)} Moon
                      </span>
                      {' & '}
                      <span className="text-nebula-300 font-medium">
                        {ZODIAC_SYMBOLS[risingSign]} {capitalize(risingSign)} Rising
                      </span>
                      {' '}horoscopes, full birth chart analysis, detailed compatibility reports, and monthly transit alerts.
                    </>
                  ) : (
                    'Get Moon & Rising sign horoscopes, full birth chart analysis, detailed compatibility reports, and monthly transit alerts.'
                  )}
                </p>
              </div>
              <Link
                href="/pricing"
                className="btn-glow flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-dust-400 mb-4">Explore</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/birth-chart" className="glass-card p-5 group hover:border-celestial-500/30 transition-colors">
              <Sparkles className="h-6 w-6 text-celestial-300 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Birth Chart</h3>
              <p className="text-xs text-dust-400">
                {hasBirthData ? 'View your full natal chart' : 'Generate your natal chart'}
              </p>
            </Link>
            <Link href="/compatibility" className="glass-card p-5 group hover:border-celestial-500/30 transition-colors">
              <Heart className="h-6 w-6 text-nebula-400 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Compatibility</h3>
              <p className="text-xs text-dust-400">Check your chemistry with any sign</p>
            </Link>
            <Link href="/horoscope" className="glass-card p-5 group hover:border-celestial-500/30 transition-colors">
              <Star className="h-6 w-6 text-stardust-400 mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Daily Horoscope</h3>
              <p className="text-xs text-dust-400">Read today&apos;s cosmic forecast</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
