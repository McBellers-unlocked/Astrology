import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Metadata } from 'next';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Wind,
  Mountain,
  ArrowRight,
} from 'lucide-react';
import {
  SIGNS,
  ELEMENT_COLORS,
} from '@/lib/zodiac-data';
import TodayDate from '@/components/TodayDate';
import DailyHoroscopeContent from '@/components/DailyHoroscopeContent';

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
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default async function SignHoroscopePage({ params }: PageProps) {
  const { sign: slug } = await params;
  const signIndex = SIGNS.findIndex((s) => s.slug === slug);
  if (signIndex === -1) notFound();

  const sign = SIGNS[signIndex];
  const prevSign = SIGNS[(signIndex - 1 + SIGNS.length) % SIGNS.length];
  const nextSign = SIGNS[(signIndex + 1) % SIGNS.length];

  const elementStyle = ELEMENT_COLORS[sign.element];
  const ElementIcon = ELEMENT_ICONS[sign.element];

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

          <div className="mt-4 text-sm">
            <TodayDate />
          </div>
        </header>

        {/* Main Content Grid — dynamic daily content via API */}
        <DailyHoroscopeContent slug={sign.slug} signName={sign.name} />

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
