import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Briefcase,
  Users,
  Star,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  SIGNS,
  ELEMENT_STYLES,
  getSignBySlug,
  calculateCompatibility,
  SIGN_PROFILES,
  type SignData,
} from '@/data/zodiac';

// ---------------------------------------------------------------------------
// Static Generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return SIGNS.map((s) => ({ sign: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = getSignBySlug(slug);
  if (!sign) return { title: 'Zodiac Sign | Stellara' };

  return {
    title: `${sign.name} Zodiac Sign: Personality, Traits & Compatibility | Stellara`,
    description: `Everything about ${sign.name} (${sign.dates}). Explore ${sign.name} personality traits, strengths, weaknesses, love compatibility, career insights, and famous ${sign.name} people. ${sign.element} sign ruled by ${sign.ruler}.`,
    openGraph: {
      title: `${sign.symbol} ${sign.name} — The Complete Guide`,
      description: `${sign.name} (${sign.dates}): ${sign.element} ${sign.modality} sign ruled by ${sign.ruler}. Discover personality, compatibility, career, and more.`,
    },
  };
}

// ---------------------------------------------------------------------------
// Element Badge
// ---------------------------------------------------------------------------

function ElementBadge({ label, variant }: { label: string; variant: string }) {
  const style = ELEMENT_STYLES[variant] ?? ELEMENT_STYLES['Fire'];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section Wrapper
// ---------------------------------------------------------------------------

function Section({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-12">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-celestial-300">{icon}</span>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Mini Compat Bar
// ---------------------------------------------------------------------------

function MiniCompatBar({ sign1, sign2, score }: { sign1: SignData; sign2: SignData; score: number }) {
  const barColor =
    score >= 85 ? 'bg-aurora-400' : score >= 70 ? 'bg-celestial-400' : score >= 55 ? 'bg-stardust-400' : 'bg-nebula-400';
  return (
    <Link
      href={`/compatibility/${sign1.slug}-${sign2.slug}`}
      className="flex items-center gap-3 py-2 group"
    >
      <span className="text-lg shrink-0">{sign2.symbol}</span>
      <span className="text-sm text-dust-300 group-hover:text-dust-100 transition-colors w-24 shrink-0">
        {sign2.name}
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-dust-300 w-10 text-right">{score}%</span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function ZodiacSignPage({ params }: { params: Promise<{ sign: string }> }) {
  const { sign: slug } = await params;
  const sign = getSignBySlug(slug);

  if (!sign) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-dust-400">Sign not found.</p>
      </main>
    );
  }

  const profile = SIGN_PROFILES[slug];
  const style = ELEMENT_STYLES[sign.element];

  // Compatibility scores with all signs
  const compatScores = SIGNS.map((s) => ({
    sign: s,
    score: calculateCompatibility(slug, s.slug),
  })).sort((a, b) => b.score - a.score);

  return (
    <main className="relative min-h-screen pb-24">
      {/* ----- Breadcrumb ----- */}
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-dust-400">
          <Link href="/" className="hover:text-celestial-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/zodiac" className="hover:text-celestial-300 transition-colors">Zodiac</Link>
          <span>/</span>
          <span className="text-dust-200">{sign.name}</span>
        </div>
      </nav>

      {/* ----- Hero ----- */}
      <section className="pt-8 pb-12 text-center px-4">
        <div className="mx-auto max-w-3xl">
          <span className="text-8xl sm:text-9xl mb-4 inline-block drop-shadow-lg">
            {sign.symbol}
          </span>
          <h1 className="gradient-text text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
            {sign.name}
          </h1>
          <p className="text-lg text-dust-300 mb-5">{sign.dates}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ElementBadge label={sign.element} variant={sign.element} />
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 text-dust-300 border border-white/10">
              {sign.modality}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-celestial-500/10 text-celestial-200 border border-celestial-500/20">
              Ruled by {sign.ruler}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* ----- Main Content ----- */}
          <div>
            {/* Overview */}
            <Section title="Overview" icon={<Sparkles size={22} />} id="overview">
              <div className="space-y-4">
                {profile.overview.map((para, i) => (
                  <p key={i} className="text-dust-300 text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </Section>

            {/* Key Traits */}
            <Section title="Key Personality Traits" icon={<Zap size={22} />} id="traits">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.traits.map((trait) => (
                  <div
                    key={trait}
                    className="glass-card px-4 py-3 text-center text-sm font-medium text-dust-200"
                  >
                    {trait}
                  </div>
                ))}
              </div>
            </Section>

            {/* Strengths & Weaknesses */}
            <Section title="Strengths & Weaknesses" icon={<Shield size={22} />} id="strengths">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-sm uppercase tracking-wider text-aurora-400 font-semibold mb-4">
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {profile.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-dust-200 leading-relaxed">
                        <span className="text-aurora-400 shrink-0">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-sm uppercase tracking-wider text-nebula-400 font-semibold mb-4">
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {profile.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-dust-200 leading-relaxed">
                        <span className="text-nebula-400 shrink-0">&ndash;</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Love & Relationships */}
            <Section title="Love & Relationships" icon={<Heart size={22} />} id="love">
              <div className="glass-card p-6">
                <p className="text-dust-300 text-sm leading-relaxed">{profile.loveDescription}</p>
              </div>
            </Section>

            {/* Career & Money */}
            <Section title="Career & Money" icon={<Briefcase size={22} />} id="career">
              <div className="glass-card p-6">
                <p className="text-dust-300 text-sm leading-relaxed">{profile.careerDescription}</p>
              </div>
            </Section>

            {/* Compatibility Quick Guide */}
            <Section title="Compatibility Quick Guide" icon={<Users size={22} />} id="compatibility">
              <div className="glass-card p-6">
                <p className="text-dust-400 text-xs mb-4">
                  How {sign.name} connects with each sign of the zodiac. Click any pairing for the full analysis.
                </p>
                <div className="space-y-1">
                  {compatScores.map(({ sign: otherSign, score }) => (
                    <MiniCompatBar
                      key={otherSign.slug}
                      sign1={sign}
                      sign2={otherSign}
                      score={score}
                    />
                  ))}
                </div>
              </div>
            </Section>

            {/* Famous People */}
            <Section title={`Famous ${sign.name} People`} icon={<Star size={22} />} id="famous">
              <div className="grid sm:grid-cols-2 gap-4">
                {profile.famousPeople.map((person) => (
                  <div key={person.name} className="glass-card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-celestial-500/10 border border-celestial-500/20 flex items-center justify-center text-lg shrink-0">
                      {sign.symbol}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{person.name}</div>
                      <div className="text-xs text-dust-400">{person.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* CTA */}
            <div className="glass-card p-8 text-center">
              <Sparkles className="mx-auto mb-3 text-stardust-400" size={28} />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Get Your {sign.name} Birth Chart
              </h3>
              <p className="text-dust-300 text-sm mb-6 max-w-md mx-auto">
                Your Sun in {sign.name} is just the beginning. Discover your Moon sign, Rising sign,
                and the complete planetary picture of your unique cosmic blueprint.
              </p>
              <Link
                href="/birth-chart"
                className="btn-glow px-8 py-3.5 text-base font-semibold rounded-xl"
              >
                <Sparkles size={18} />
                Generate Free Chart
              </Link>
            </div>
          </div>

          {/* ----- Sidebar ----- */}
          <aside className="space-y-6">
            {/* Quick Facts Card */}
            <div className="glass-card p-6 sticky top-6">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-dust-400">Symbol</span>
                  <span className="text-2xl">{sign.symbol}</span>
                </div>
                <div className="border-b border-white/5" />
                <div className="flex justify-between">
                  <span className="text-dust-400">Dates</span>
                  <span className="text-dust-200 font-medium">{sign.dates}</span>
                </div>
                <div className="border-b border-white/5" />
                <div className="flex justify-between">
                  <span className="text-dust-400">Element</span>
                  <span className={`font-medium ${style.text}`}>{sign.element}</span>
                </div>
                <div className="border-b border-white/5" />
                <div className="flex justify-between">
                  <span className="text-dust-400">Modality</span>
                  <span className="text-dust-200 font-medium">{sign.modality}</span>
                </div>
                <div className="border-b border-white/5" />
                <div className="flex justify-between">
                  <span className="text-dust-400">Ruler</span>
                  <span className="text-dust-200 font-medium">{sign.ruler}</span>
                </div>
                <div className="border-b border-white/5" />
                <div className="flex justify-between">
                  <span className="text-dust-400">Best Match</span>
                  <Link
                    href={`/compatibility/${sign.slug}-${compatScores[0].sign.slug}`}
                    className="text-celestial-200 font-medium hover:text-celestial-100 transition-colors"
                  >
                    {compatScores[0].sign.symbol} {compatScores[0].sign.name}
                  </Link>
                </div>
              </div>

              {/* In-page nav */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <h4 className="text-xs uppercase tracking-wider text-dust-500 mb-3">On This Page</h4>
                <nav className="space-y-1.5">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'traits', label: 'Key Traits' },
                    { id: 'strengths', label: 'Strengths & Weaknesses' },
                    { id: 'love', label: 'Love & Relationships' },
                    { id: 'career', label: 'Career & Money' },
                    { id: 'compatibility', label: 'Compatibility Guide' },
                    { id: 'famous', label: 'Famous People' },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-1.5 text-xs text-dust-400 hover:text-celestial-300 transition-colors py-0.5"
                    >
                      <ChevronRight size={11} />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Other Signs */}
            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-wider text-celestial-300 font-semibold mb-4">
                Other Signs
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {SIGNS.filter((s) => s.slug !== slug).map((s) => (
                  <Link
                    key={s.slug}
                    href={`/zodiac/${s.slug}`}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{s.symbol}</span>
                    <span className="text-[9px] text-dust-400 group-hover:text-dust-200 transition-colors">{s.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Compatibility CTA */}
            <div className="glass-card p-6 text-center">
              <Heart className="mx-auto mb-3 text-nebula-400" size={24} />
              <h3 className="text-sm font-bold text-foreground mb-2">
                {sign.name} Compatibility
              </h3>
              <p className="text-xs text-dust-400 mb-4">
                See how {sign.name} connects with every other sign.
              </p>
              <Link
                href="/compatibility"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-celestial-300 hover:text-celestial-200 transition-colors"
              >
                Check Compatibility
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
