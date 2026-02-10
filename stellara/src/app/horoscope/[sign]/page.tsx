import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import {
  Star,
  Heart,
  Briefcase,
  Activity,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lock,
  Calendar,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Hash,
  Palette,
  Users,
  Moon,
  Sunrise,
  ArrowRight,
} from 'lucide-react';
import {
  SIGNS,
  ELEMENT_COLORS,
  HOROSCOPE_RATINGS,
  getFullHoroscope,
} from '@/lib/zodiac-data';

/* -------------------------------------------------------------------------- */
/*  Static generation                                                         */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
  return SIGNS.map((sign) => ({ sign: sign.slug }));
}

/* -------------------------------------------------------------------------- */
/*  Dynamic metadata per sign                                                 */
/* -------------------------------------------------------------------------- */

type PageProps = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = SIGNS.find((s) => s.slug === slug);
  if (!sign) return {};

  const today = format(new Date(), 'MMMM d, yyyy');

  return {
    title: `${sign.name} Daily Horoscope | ${today} | Stellara`,
    description: `Read today\u2019s ${sign.name} (${sign.dates}) horoscope. Get personalized insights for love, career, wellness, and more. Updated daily on Stellara.`,
    openGraph: {
      title: `${sign.symbol} ${sign.name} Horoscope \u2013 ${today}`,
      description: `Your daily ${sign.name} cosmic forecast with ratings for love, career, and wellness.`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Element icons                                                             */
/* -------------------------------------------------------------------------- */

const ELEMENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Fire: Flame,
  Earth: Mountain,
  Air: Wind,
  Water: Droplets,
};

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

function PremiumLockedSection({
  title,
  icon: Icon,
  previewText,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  previewText: string;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-celestial-300" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="premium-badge ml-auto">Premium</span>
        </div>
      </div>

      <div className="relative px-6 py-5">
        {/* Visible preview paragraph */}
        <p className="mb-4 text-sm leading-relaxed text-dust-300">
          {previewText}
        </p>

        {/* Blurred / locked section */}
        <div className="relative">
          <div
            className="select-none text-sm leading-relaxed text-dust-300"
            style={{
              filter: 'blur(6px)',
              WebkitFilter: 'blur(6px)',
              userSelect: 'none',
            }}
            aria-hidden="true"
          >
            The celestial alignment continues to reveal deeper patterns in your
            emotional landscape. This transit activates hidden strengths and
            brings unconscious desires to the surface. A pivotal moment of
            self-understanding awaits as the planetary energies converge in your
            chart, offering rare clarity on matters of the heart and soul. The
            coming hours hold transformative potential that builds on the
            foundation described above, weaving together threads of past
            experience and future possibility into a tapestry of profound
            personal growth.
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gradient-to-t from-space-900/95 via-space-900/80 to-transparent">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stardust-500/30 bg-stardust-500/10">
                <Lock size={18} className="text-stardust-400" />
              </div>
              <p className="text-sm font-medium text-dust-200">
                Unlock with Stellara Premium
              </p>
              <Link
                href="/pricing"
                className="btn-glow inline-flex items-center gap-2 !px-5 !py-2 text-xs"
              >
                <Sparkles size={12} />
                Get Premium Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default async function SignHoroscopePage({ params }: PageProps) {
  const { sign: slug } = await params;
  const signIndex = SIGNS.findIndex((s) => s.slug === slug);
  if (signIndex === -1) notFound();

  const sign = SIGNS[signIndex];
  const prevSign = SIGNS[(signIndex - 1 + SIGNS.length) % SIGNS.length];
  const nextSign = SIGNS[(signIndex + 1) % SIGNS.length];

  const ratings = HOROSCOPE_RATINGS[sign.slug];
  const horoscope = getFullHoroscope(sign.slug);
  const elementStyle = ELEMENT_COLORS[sign.element];
  const ElementIcon = ELEMENT_ICONS[sign.element];

  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM do, yyyy');

  return (
    <main className="relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-celestial-500/[0.04] blur-[120px]" />
        <div className="absolute right-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-nebula-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-dust-500">
          <Link
            href="/horoscope"
            className="transition-colors hover:text-celestial-300"
          >
            Daily Horoscope
          </Link>
          <ChevronRight size={14} />
          <span className="text-dust-300">{sign.name}</span>
        </nav>

        {/* Sign Header */}
        <header className="mb-10 text-center">
          <div
            className={`mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border ${elementStyle.border} ${elementStyle.bg} ${elementStyle.glow}`}
          >
            <span className={`text-5xl ${elementStyle.text}`}>
              {sign.symbol}
            </span>
          </div>

          <h1 className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">
            {sign.name}
          </h1>

          <p className="mb-3 text-dust-400">{sign.dates}</p>

          <div className="flex items-center justify-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${elementStyle.bg} ${elementStyle.text} ${elementStyle.border}`}
            >
              <ElementIcon size={12} />
              {sign.element} Sign
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-dust-400">
            <Calendar size={14} />
            <time dateTime={today.toISOString().split('T')[0]}>
              {formattedDate}
            </time>
          </div>
        </header>

        {/* Main Content Grid */}
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
                {horoscope.paragraphs.map((paragraph, index) => (
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
            <PremiumLockedSection
              title="Your Moon Sign Reading"
              icon={Moon}
              previewText={horoscope.moonReading[0]}
            />

            {/* Rising Sign Reading */}
            <PremiumLockedSection
              title="Your Rising Sign Reading"
              icon={Sunrise}
              previewText={horoscope.risingReading[0]}
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
                <RatingCard
                  icon={Sparkles}
                  label="Overall"
                  rating={ratings.overall}
                />
                <RatingCard icon={Heart} label="Love" rating={ratings.love} />
                <RatingCard
                  icon={Briefcase}
                  label="Career"
                  rating={ratings.career}
                />
                <RatingCard
                  icon={Activity}
                  label="Wellness"
                  rating={ratings.wellness}
                />
              </div>
            </div>

            {/* Lucky Details */}
            <div className="glass-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-dust-300">
                <Sparkles size={14} className="text-stardust-400" />
                Lucky Details
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <LuckyItem
                  icon={Hash}
                  label="Number"
                  value={String(horoscope.luckyNumber)}
                />
                <LuckyItem
                  icon={Palette}
                  label="Color"
                  value={horoscope.luckyColor}
                />
                <LuckyItem
                  icon={Users}
                  label="Match"
                  value={horoscope.compatibility}
                />
              </div>
            </div>

            {/* Related Content */}
            <div className="glass-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dust-300">
                Explore More
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/birth-chart`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
                >
                  <span>Your {sign.name} Birth Chart</span>
                  <ArrowRight size={14} className="text-celestial-400" />
                </Link>
                <Link
                  href={`/compatibility`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
                >
                  <span>{sign.name} Compatibility</span>
                  <ArrowRight size={14} className="text-celestial-400" />
                </Link>
                <Link
                  href={`/zodiac`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
                >
                  <span>About {sign.name}</span>
                  <ArrowRight size={14} className="text-celestial-400" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Section Divider */}
        <hr className="section-divider my-12" />

        {/* Previous / Next Sign Navigation */}
        <nav className="grid grid-cols-2 gap-4">
          <Link
            href={`/horoscope/${prevSign.slug}`}
            className="glass-card-hover group flex items-center gap-4 p-5"
          >
            <ChevronLeft
              size={20}
              className="shrink-0 text-dust-500 transition-transform group-hover:-translate-x-1 group-hover:text-celestial-300"
            />
            <div className="min-w-0">
              <p className="text-xs text-dust-500">Previous Sign</p>
              <p className="truncate text-lg font-semibold text-foreground">
                {prevSign.symbol} {prevSign.name}
              </p>
              <p className="text-xs text-dust-500">{prevSign.dates}</p>
            </div>
          </Link>

          <Link
            href={`/horoscope/${nextSign.slug}`}
            className="glass-card-hover group flex items-center justify-end gap-4 p-5 text-right"
          >
            <div className="min-w-0">
              <p className="text-xs text-dust-500">Next Sign</p>
              <p className="truncate text-lg font-semibold text-foreground">
                {nextSign.name} {nextSign.symbol}
              </p>
              <p className="text-xs text-dust-500">{nextSign.dates}</p>
            </div>
            <ChevronRight
              size={20}
              className="shrink-0 text-dust-500 transition-transform group-hover:translate-x-1 group-hover:text-celestial-300"
            />
          </Link>
        </nav>

        {/* All Signs Link */}
        <div className="mt-8 text-center">
          <Link
            href="/horoscope"
            className="inline-flex items-center gap-2 text-sm text-celestial-300 transition-colors hover:text-celestial-100"
          >
            <span>View All Signs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
