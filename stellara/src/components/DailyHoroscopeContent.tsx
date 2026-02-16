'use client';

import { useEffect } from 'react';
import {
  Star,
  Heart,
  Briefcase,
  Activity,
  Sparkles,
  Hash,
  Palette,
  Users,
  Moon,
  Sunrise,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import PremiumGate from '@/components/PremiumGate';
import { useDailyHoroscope } from '@/hooks/use-daily-horoscope';
import { trackEvent, trackMetaEvent } from '@/components/Analytics';

/* -------------------------------------------------------------------------- */
/*  Helper components                                                         */
/* -------------------------------------------------------------------------- */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={14}
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

function RatingCard({
  icon: Icon,
  label,
  rating,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  rating: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-dust-300">
        <Icon size={15} className="text-dust-400" />
        <span>{label}</span>
      </div>
      <StarRating rating={rating} />
    </div>
  );
}

function LuckyItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-center">
      <Icon size={18} className="text-stardust-400" />
      <span className="text-xs text-dust-500">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PremiumReadingSection({
  title,
  icon: Icon,
  paragraphs,
  featureName,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  paragraphs: string[];
  featureName: string;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-celestial-300" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      <div className="px-6 py-5">
        <PremiumGate
          requiredTier="stellar"
          previewText={paragraphs[0]}
          featureName={featureName}
        >
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-dust-300 sm:text-base sm:leading-relaxed"
              >
                {p}
              </p>
            ))}
          </div>
        </PremiumGate>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */

function ContentSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-8">
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-stardust-400" />
            <h2 className="text-xl font-semibold text-foreground">
              Today&apos;s Horoscope
            </h2>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
                <div className="h-4 w-[92%] animate-pulse rounded bg-white/[0.04]" />
                <div className="h-4 w-[78%] animate-pulse rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
        {/* Moon/Rising skeleton */}
        {[0, 1].map((i) => (
          <div key={i} className="glass-card overflow-hidden">
            <div className="border-b border-white/[0.06] px-6 py-4">
              <div className="h-5 w-48 animate-pulse rounded bg-white/[0.04]" />
            </div>
            <div className="space-y-2 px-6 py-5">
              <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
              <div className="h-4 w-[85%] animate-pulse rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
      <aside className="space-y-6">
        <div className="glass-card p-5">
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-white/[0.04]" />
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-white/[0.02]" />
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="mb-4 h-4 w-28 animate-pulse rounded bg-white/[0.04]" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.02]" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

interface Props {
  slug: string;
  signName: string;
}

export default function DailyHoroscopeContent({ slug, signName }: Props) {
  const content = useDailyHoroscope(slug);

  // Fire ViewContent for Meta Pixel retargeting
  useEffect(() => {
    trackEvent('view_horoscope', { sign: slug });
    trackMetaEvent('ViewContent', { content_name: signName, content_category: 'horoscope' });
  }, [slug, signName]);

  if (!content) return <ContentSkeleton />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* Left Column: Full Horoscope */}
      <div className="space-y-8">
        {/* Today's Horoscope */}
        <section className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-stardust-400" />
            <h2 className="text-xl font-semibold text-foreground">
              Today&apos;s Horoscope
            </h2>
          </div>
          <div className="space-y-4">
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-relaxed text-dust-300 sm:text-base sm:leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Moon Sign Reading */}
        <PremiumReadingSection
          title="Your Moon Sign Reading"
          icon={Moon}
          paragraphs={content.moonReading}
          featureName="Moon Sign readings"
        />

        {/* Rising Sign Reading */}
        <PremiumReadingSection
          title="Your Rising Sign Reading"
          icon={Sunrise}
          paragraphs={content.risingReading}
          featureName="Rising Sign readings"
        />
      </div>

      {/* Right Column: Sidebar */}
      <aside className="space-y-6">
        {/* Ratings */}
        <div className="glass-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-dust-300">
            <Star size={14} className="text-stardust-400" />
            Today&apos;s Ratings
          </h3>
          <div className="space-y-2">
            <RatingCard icon={Sparkles} label="Overall" rating={content.ratings.overall} />
            <RatingCard icon={Heart} label="Love" rating={content.ratings.love} />
            <RatingCard icon={Briefcase} label="Career" rating={content.ratings.career} />
            <RatingCard icon={Activity} label="Wellness" rating={content.ratings.wellness} />
          </div>
        </div>

        {/* Lucky Details */}
        <div className="glass-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-dust-300">
            <Sparkles size={14} className="text-stardust-400" />
            Lucky Details
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <LuckyItem icon={Hash} label="Number" value={String(content.lucky.number)} />
            <LuckyItem icon={Palette} label="Color" value={content.lucky.color} />
            <LuckyItem icon={Users} label="Match" value={content.lucky.compatibility} />
          </div>
        </div>

        {/* Related Content */}
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dust-300">
            Explore More
          </h3>
          <div className="space-y-2">
            <Link
              href="/birth-chart"
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
            >
              <span>Your {signName} Birth Chart</span>
              <ArrowRight size={14} className="text-celestial-400" />
            </Link>
            <Link
              href="/compatibility"
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
            >
              <span>{signName} Compatibility</span>
              <ArrowRight size={14} className="text-celestial-400" />
            </Link>
            <Link
              href="/zodiac"
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
            >
              <span>About {signName}</span>
              <ArrowRight size={14} className="text-celestial-400" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
