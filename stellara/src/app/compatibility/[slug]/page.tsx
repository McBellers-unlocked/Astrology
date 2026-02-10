import { Metadata } from 'next';
import Link from 'next/link';
import { Star, Heart, ArrowRight, Lock, MessageCircle, Shield, Gem, Brain, Sparkles } from 'lucide-react';
import {
  SIGNS,
  getSignBySlug,
  calculateCompatibility,
  getCompatibilityRatings,
  getCompatibilityStrengths,
  getCompatibilityChallenges,
  getCompatibilitySummary,
  getCompatibilityContent,
  ELEMENT_STYLES,
  type SignData,
  type CompatibilityRatings,
} from '@/data/zodiac';

// ---------------------------------------------------------------------------
// Static Generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const s1 of SIGNS) {
    for (const s2 of SIGNS) {
      params.push({ slug: `${s1.slug}-${s2.slug}` });
    }
  }
  return params;
}

function parseSlugs(slug: string): [string, string] | null {
  const parts = slug.split('-');
  // Handle multi-word sign names like "sagittarius"
  // Since all sign slugs are single words, the format is always "sign1-sign2"
  if (parts.length === 2) return [parts[0], parts[1]];
  // Edge case: try finding the split point
  for (let i = 1; i < parts.length; i++) {
    const left = parts.slice(0, i).join('-');
    const right = parts.slice(i).join('-');
    if (getSignBySlug(left) && getSignBySlug(right)) return [left, right];
  }
  return null;
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const pair = parseSlugs(slug);
    if (!pair) return { title: 'Compatibility | Stellara' };
    const s1 = getSignBySlug(pair[0]);
    const s2 = getSignBySlug(pair[1]);
    if (!s1 || !s2) return { title: 'Compatibility | Stellara' };
    const score = calculateCompatibility(pair[0], pair[1]);
    return {
      title: `${s1.name} and ${s2.name} Compatibility (${score}%) | Stellara`,
      description: `Explore the ${s1.name} and ${s2.name} compatibility score of ${score}%. Detailed analysis of love, communication, trust, and long-term potential between ${s1.name} (${s1.element}) and ${s2.name} (${s2.element}).`,
      openGraph: {
        title: `${s1.symbol} ${s1.name} & ${s2.symbol} ${s2.name} Compatibility`,
        description: `${score}% compatibility. Discover how ${s1.name} and ${s2.name} connect in love, communication, trust, and more.`,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Score Ring
// ---------------------------------------------------------------------------

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color =
    score >= 85 ? '#10B981' : score >= 70 ? '#7C3AED' : score >= 55 ? '#FBBF24' : '#EC4899';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground">{score}</span>
        <span className="text-sm text-dust-400">/ 100</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Star Rating
// ---------------------------------------------------------------------------

function StarRating({ rating, label, icon }: { rating: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-celestial-300">{icon}</span>
        <span className="text-sm font-medium text-dust-200">{label}</span>
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={16} className={i <= rating ? 'text-stardust-400 fill-stardust-400' : 'text-dust-600'} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content Section
// ---------------------------------------------------------------------------

function ContentSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-celestial-300">{icon}</span>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-dust-300 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Element Badge
// ---------------------------------------------------------------------------

function ElementBadge({ sign }: { sign: SignData }) {
  const style = ELEMENT_STYLES[sign.element];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
      {sign.element} &middot; {sign.modality}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function CompatibilityPairingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pair = parseSlugs(slug);

  if (!pair) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-dust-400">Invalid compatibility pairing.</p>
      </main>
    );
  }

  const [slug1, slug2] = pair;
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const score = calculateCompatibility(slug1, slug2);
  const ratings = getCompatibilityRatings(slug1, slug2);
  const strengths = getCompatibilityStrengths(slug1, slug2);
  const challenges = getCompatibilityChallenges(slug1, slug2);
  const summary = getCompatibilitySummary(slug1, slug2);
  const content = getCompatibilityContent(slug1, slug2);

  // Related pairings: other pairings involving either sign
  const relatedPairings = SIGNS
    .filter((s) => s.slug !== slug1 && s.slug !== slug2)
    .slice(0, 6)
    .flatMap((s) => [
      { slug: `${slug1}-${s.slug}`, s1: s1, s2: s },
      { slug: `${slug2}-${s.slug}`, s1: s2, s2: s },
    ])
    .slice(0, 8);

  return (
    <main className="relative min-h-screen pb-24">
      {/* ----- Breadcrumb ----- */}
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-dust-400">
          <Link href="/" className="hover:text-celestial-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/compatibility" className="hover:text-celestial-300 transition-colors">Compatibility</Link>
          <span>/</span>
          <span className="text-dust-200">{s1.name} & {s2.name}</span>
        </div>
      </nav>

      {/* ----- Hero ----- */}
      <section className="pt-8 pb-10 text-center px-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-2">{s1.symbol}</span>
              <span className="text-lg font-bold text-foreground">{s1.name}</span>
              <ElementBadge sign={s1} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Heart className="text-nebula-400" size={28} />
              <span className="text-xs text-dust-500 uppercase tracking-widest">compatibility</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-2">{s2.symbol}</span>
              <span className="text-lg font-bold text-foreground">{s2.name}</span>
              <ElementBadge sign={s2} />
            </div>
          </div>
          <h1 className="gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {s1.name} & {s2.name} Compatibility
          </h1>
          <p className="text-dust-400 text-sm">
            Ruled by {s1.ruler} & {s2.ruler} &mdash; {s1.element} meets {s2.element}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* ----- Main Content Column ----- */}
          <div>
            {/* Score & Ratings Card */}
            <div className="glass-card p-8 mb-10">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <ScoreRing score={score} />
                  <span className="text-xs text-dust-400 uppercase tracking-wider font-semibold">
                    Overall Score
                  </span>
                </div>
                <div className="flex-1 w-full">
                  <StarRating rating={ratings.love} label="Love & Romance" icon={<Heart size={16} />} />
                  <StarRating rating={ratings.communication} label="Communication" icon={<MessageCircle size={16} />} />
                  <StarRating rating={ratings.trust} label="Trust & Loyalty" icon={<Shield size={16} />} />
                  <StarRating rating={ratings.sharedValues} label="Shared Values" icon={<Gem size={16} />} />
                  <StarRating rating={ratings.emotionalConnection} label="Emotional Connection" icon={<Brain size={16} />} />
                </div>
              </div>

              {/* Strengths & Challenges */}
              <hr className="section-divider my-6" />
              <div className="grid sm:grid-cols-2 gap-6">
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
            </div>

            {/* Content Sections */}
            <ContentSection title="Overview" icon={<Sparkles size={20} />}>
              <p>{content.overview}</p>
            </ContentSection>

            <ContentSection title="Love & Romance" icon={<Heart size={20} />}>
              <p>{content.loveRomance}</p>
            </ContentSection>

            <ContentSection title="Communication Style" icon={<MessageCircle size={20} />}>
              <p>{content.communicationStyle}</p>
            </ContentSection>

            <ContentSection title="Trust & Loyalty" icon={<Shield size={20} />}>
              <p>{content.trustLoyalty}</p>
            </ContentSection>

            <ContentSection title="Long-term Potential" icon={<ArrowRight size={20} />}>
              <p>{content.longTermPotential}</p>
            </ContentSection>

            {/* Summary */}
            <div className="glass-card p-6 mb-10">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-3">
                Summary
              </h3>
              <p className="text-dust-200 text-sm leading-relaxed">{summary}</p>
            </div>

            {/* Premium Locked Section */}
            <div className="relative glass-card p-8 overflow-hidden mb-10">
              <div className="absolute inset-0 bg-gradient-to-t from-space-900/95 via-space-900/60 to-transparent z-10" />
              <div className="relative z-0 opacity-30 select-none pointer-events-none">
                <h3 className="text-lg font-bold text-foreground mb-2">Full Synastry Chart Analysis</h3>
                <p className="text-sm text-dust-300 mb-4">
                  Discover the planetary aspects between your complete birth charts, including Moon
                  sign compatibility, Venus-Mars dynamics, composite chart analysis, and predictive
                  transit overlays for the year ahead.
                </p>
                <div className="h-32 bg-celestial-400/5 rounded-lg" />
              </div>
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
                <Lock className="text-stardust-400" size={32} />
                <h3 className="text-xl font-bold text-foreground text-center">
                  Full Synastry Chart Analysis
                </h3>
                <p className="text-dust-300 text-sm text-center max-w-md">
                  Unlock planetary aspects, Moon compatibility, Venus-Mars dynamics, composite charts,
                  and personalized transit forecasts.
                </p>
                <Link
                  href="/pricing"
                  className="btn-glow px-6 py-3 text-sm font-semibold rounded-xl"
                >
                  <span className="premium-badge text-[9px] mr-1">PRO</span>
                  Unlock Full Report
                </Link>
              </div>
            </div>
          </div>

          {/* ----- Sidebar ----- */}
          <aside className="space-y-6">
            {/* Quick Facts */}
            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dust-400">Score</span>
                  <span className="font-semibold text-foreground">{score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dust-400">Elements</span>
                  <span className="text-dust-200">{s1.element} + {s2.element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dust-400">Modalities</span>
                  <span className="text-dust-200">{s1.modality} + {s2.modality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dust-400">Rulers</span>
                  <span className="text-dust-200">{s1.ruler} + {s2.ruler}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dust-400">Best For</span>
                  <span className="text-dust-200">
                    {score >= 80 ? 'Romance & Marriage' : score >= 65 ? 'Friendship & Dating' : 'Growth & Learning'}
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Sign Links */}
            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-4">
                Explore Each Sign
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/zodiac/${slug1}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="text-2xl">{s1.symbol}</span>
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-celestial-200 transition-colors">
                      {s1.name} Profile
                    </div>
                    <div className="text-xs text-dust-400">{s1.dates}</div>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-dust-500 group-hover:text-celestial-300 transition-colors" />
                </Link>
                <Link
                  href={`/zodiac/${slug2}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="text-2xl">{s2.symbol}</span>
                  <div>
                    <div className="text-sm font-medium text-foreground group-hover:text-celestial-200 transition-colors">
                      {s2.name} Profile
                    </div>
                    <div className="text-xs text-dust-400">{s2.dates}</div>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-dust-500 group-hover:text-celestial-300 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Related Pairings */}
            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-4">
                Related Pairings
              </h3>
              <div className="space-y-1.5">
                {relatedPairings.map((rp) => {
                  const rpScore = calculateCompatibility(rp.s1.slug, rp.s2.slug);
                  return (
                    <Link
                      key={rp.slug}
                      href={`/compatibility/${rp.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors group text-sm"
                    >
                      <span className="text-dust-300 group-hover:text-dust-100 transition-colors">
                        {rp.s1.symbol} {rp.s1.name} & {rp.s2.symbol} {rp.s2.name}
                      </span>
                      <span className="text-xs text-celestial-300 font-medium">{rpScore}%</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-6 text-center">
              <Sparkles className="mx-auto mb-3 text-stardust-400" size={24} />
              <h3 className="text-sm font-bold text-foreground mb-2">
                Get Your Birth Chart
              </h3>
              <p className="text-xs text-dust-400 mb-4">
                Go beyond sun signs. Discover your complete astrological blueprint.
              </p>
              <Link
                href="/birth-chart"
                className="btn-glow px-5 py-2.5 text-xs font-semibold rounded-xl w-full"
              >
                Generate Free Chart
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Reverse pairing link */}
      {slug1 !== slug2 && (
        <div className="text-center mt-12">
          <Link
            href={`/compatibility/${slug2}-${slug1}`}
            className="text-sm text-dust-400 hover:text-celestial-300 transition-colors"
          >
            See {s2.name} & {s1.name} compatibility from {s2.name}&apos;s perspective &rarr;
          </Link>
        </div>
      )}
    </main>
  );
}
