'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  Star,
  Sparkles,
  Crown,
  Shield,
  ChevronDown,
  Users,
  Zap,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

/* ------------------------------------------------------------------
   Tier data
   ------------------------------------------------------------------ */

interface PricingTier {
  id: 'free' | 'stellar' | 'cosmic';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthly: number;
  popular: boolean;
  icon: React.ReactNode;
  features: string[];
  cta: string;
  ctaHref: string;
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Stargazer',
    tagline: 'Begin your cosmic journey',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    popular: false,
    icon: <Star className="h-6 w-6 text-celestial-300" />,
    features: [
      'Daily sun sign horoscope',
      'Basic birth chart (Big Three only)',
      'Simple compatibility scores',
      '12 zodiac profiles',
    ],
    cta: 'Get Started Free',
    ctaHref: '/birth-chart',
  },
  {
    id: 'stellar',
    name: 'Stellar',
    tagline: 'For the dedicated stargazer',
    monthlyPrice: 9.99,
    annualPrice: 95.88,
    annualMonthly: 7.99,
    popular: true,
    icon: <Sparkles className="h-6 w-6 text-stardust-400" />,
    features: [
      'Everything in Free, plus:',
      'Moon & Rising sign horoscopes',
      'Full birth chart with all planets, houses & aspects',
      'Detailed compatibility reports',
      'Transit alerts & notifications',
      'Personalized monthly forecasts',
      'Ad-free experience',
    ],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/birth-chart',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    tagline: 'The ultimate celestial experience',
    monthlyPrice: 19.99,
    annualPrice: 191.88,
    annualMonthly: 15.99,
    popular: false,
    icon: <Crown className="h-6 w-6 text-nebula-400" />,
    features: [
      'Everything in Stellar, plus:',
      'Full synastry & composite chart reports',
      'Downloadable PDF birth chart reports',
      'Priority AI-powered personal readings',
      'Relationship timeline predictions',
      'Solar return charts',
      'Unlimited saved charts',
    ],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/birth-chart',
  },
];

/* ------------------------------------------------------------------
   FAQ data
   ------------------------------------------------------------------ */

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings. When upgrading, you only pay the prorated difference. When downgrading, your current plan features remain active until the end of the billing cycle.',
  },
  {
    question: 'How does the 7-day free trial work?',
    answer:
      "When you sign up for Stellar or Cosmic, you get full access to all features for 7 days at no charge. We'll send you a reminder before your trial ends. If you decide it's not for you, simply cancel before the trial period ends and you won't be charged.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) as well as Apple Pay and Google Pay. All payments are processed securely through Stripe.',
  },
  {
    question: 'Is there a money-back guarantee?',
    answer:
      "Yes. If you're not satisfied with your subscription for any reason, contact us within 30 days of your purchase and we'll issue a full refund, no questions asked.",
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your saved charts, readings, and profile data are retained for 90 days after cancellation. You can re-subscribe at any time during this period and pick up right where you left off. After 90 days, data is permanently deleted per our privacy policy.',
  },
  {
    question: 'Do I need my exact birth time for the birth chart?',
    answer:
      'An exact birth time produces the most accurate chart, especially for your Ascendant and house placements. If you do not know your birth time, we can still generate a chart using a noon default, though some features like house positions will be approximate.',
  },
];

/* ------------------------------------------------------------------
   FAQ Accordion Item
   ------------------------------------------------------------------ */

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-celestial-400/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-celestial-200"
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-heading text-base font-semibold text-foreground sm:text-lg">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-dust-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-celestial-300' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-dust-400 sm:text-base">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Pricing Tier Card
   ------------------------------------------------------------------ */

function TierCard({
  tier,
  isAnnual,
}: {
  tier: PricingTier;
  isAnnual: boolean;
}) {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const price = isAnnual ? tier.annualMonthly : tier.monthlyPrice;
  const isFree = tier.id === 'free';
  const isCurrentPlan = user && (
    (tier.id === 'free' && !isPremium) ||
    (tier.id === user.subscriptionTier)
  );

  const handleCheckout = async () => {
    if (isFree) {
      router.push('/birth-chart');
      return;
    }

    if (!user) {
      router.push('/signup');
      return;
    }

    setCheckoutLoading(true);
    try {
      const data = await api.post<{ url: string }>('/checkout/create-session', {
        tier: tier.id,
        interval: isAnnual ? 'year' : 'month',
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl p-px',
        tier.popular
          ? 'bg-gradient-to-b from-celestial-400 via-nebula-500/60 to-stardust-500/40'
          : 'bg-celestial-400/15',
      ].join(' ')}
    >
      {/* Popular label */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant="premium">MOST POPULAR</Badge>
        </div>
      )}

      <div
        className={[
          'flex h-full flex-col rounded-[calc(1rem-1px)] bg-space-900/95 px-6 py-8 sm:px-8',
          tier.popular ? 'shadow-glow-lg' : '',
        ].join(' ')}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            {tier.icon}
            <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
              {tier.name}
            </h3>
          </div>
          <p className="text-sm text-dust-400">{tier.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              ${isFree ? '0' : price.toFixed(2)}
            </span>
            <span className="text-sm text-dust-400">
              {isFree ? '/forever' : '/mo'}
            </span>
          </div>
          {!isFree && isAnnual && (
            <p className="mt-1.5 text-xs text-aurora-400">
              ${tier.annualPrice.toFixed(2)}/year &mdash; Save 20%
            </p>
          )}
          {!isFree && !isAnnual && (
            <p className="mt-1.5 text-xs text-dust-500">
              Billed monthly
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mb-8">
          {isCurrentPlan ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-aurora-500/20 bg-aurora-500/10 py-3 text-sm font-medium text-aurora-300">
              <CheckCircle className="h-4 w-4" />
              Current Plan
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className={`btn-glow flex w-full items-center justify-center gap-2 py-3 text-sm font-medium disabled:opacity-60 ${
                tier.id === 'cosmic' ? 'bg-gradient-to-r from-stardust-500 to-nebula-500' : ''
              }`}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : !user && !isFree ? (
                'Sign Up to Start Trial'
              ) : (
                tier.cta
              )}
            </button>
          )}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-3.5">
          {tier.features.map((feature, i) => {
            const isHeader = feature.endsWith(':');
            return (
              <li key={i} className="flex items-start gap-3">
                {!isHeader && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-aurora-400" />
                )}
                <span
                  className={
                    isHeader
                      ? 'text-xs font-semibold uppercase tracking-wider text-celestial-300'
                      : 'text-sm leading-relaxed text-dust-300'
                  }
                >
                  {feature}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Pricing Page
   ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <Suspense>
      <PricingPageInner />
    </Suspense>
  );
}

function PricingPageInner() {
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('success') === '1';
  const checkoutCanceled = searchParams.get('canceled') === '1';
  const { refreshUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Refresh user data after successful checkout
  useEffect(() => {
    if (checkoutSuccess) {
      refreshUser();
    }
  }, [checkoutSuccess, refreshUser]);

  /* FAQ structured data for AEO / Answer Engine Optimisation */
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-24 pt-16 sm:pt-24">
      {/* FAQ Schema for Google / AI answer engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Checkout result banners */}
      {checkoutSuccess && (
        <div className="mx-auto mb-8 max-w-lg rounded-xl border border-aurora-500/20 bg-aurora-500/10 px-6 py-4 text-center">
          <CheckCircle className="mx-auto mb-2 h-6 w-6 text-aurora-400" />
          <p className="font-semibold text-aurora-300">Welcome to Stellara Premium!</p>
          <p className="mt-1 text-sm text-dust-400">Your subscription is now active. Enjoy the full cosmic experience.</p>
        </div>
      )}
      {checkoutCanceled && (
        <div className="mx-auto mb-8 max-w-lg rounded-xl border border-stardust-500/20 bg-stardust-500/10 px-6 py-4 text-center">
          <p className="font-semibold text-stardust-300">Checkout canceled</p>
          <p className="mt-1 text-sm text-dust-400">No worries — you can start your trial anytime.</p>
        </div>
      )}

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(236,72,153,0.06) 0%, transparent 50%)',
        }}
      />

      <Container size="lg" as="section">
        {/* ---- Header ---- */}
        <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          <h1 className="gradient-text mb-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Unlock the Full Cosmos
          </h1>
          <p className="text-lg text-dust-400 sm:text-xl">
            Choose your celestial journey
          </p>

          {/* Billing toggle */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-celestial-400/15 bg-space-800/60 px-2 py-2 backdrop-blur-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={[
                'rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200',
                !isAnnual
                  ? 'bg-celestial-600 text-white shadow-glow-sm'
                  : 'text-dust-400 hover:text-dust-200',
              ].join(' ')}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={[
                'relative rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200',
                isAnnual
                  ? 'bg-celestial-600 text-white shadow-glow-sm'
                  : 'text-dust-400 hover:text-dust-200',
              ].join(' ')}
            >
              Annual
              <span className="ml-2 inline-flex rounded-full bg-aurora-500/20 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-aurora-300">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* ---- Tier Cards ---- */}
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3 lg:gap-8">
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} isAnnual={isAnnual} />
          ))}
        </div>

        {/* ---- Social Proof ---- */}
        <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center sm:mt-20">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-celestial-300" />
            <span className="text-sm font-semibold text-dust-300">
              Trusted by 100,000+ stargazers
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-stardust-400 text-stardust-400"
              />
            ))}
            <span className="ml-2 text-xs text-dust-400">
              4.9/5 from 12,000+ reviews
            </span>
          </div>
        </div>

        {/* ---- Money-Back Guarantee ---- */}
        <div className="mx-auto mt-10 flex max-w-sm items-center justify-center gap-3 rounded-2xl border border-aurora-400/20 bg-aurora-500/5 px-6 py-4 backdrop-blur-sm">
          <Shield className="h-8 w-8 shrink-0 text-aurora-400" />
          <div>
            <p className="text-sm font-semibold text-aurora-300">
              30-Day Money-Back Guarantee
            </p>
            <p className="text-xs text-dust-400">
              Not satisfied? Get a full refund, no questions asked.
            </p>
          </div>
        </div>

        {/* ---- Feature Comparison Highlights ---- */}
        <div className="mx-auto mt-20 max-w-3xl sm:mt-28">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-stardust-400" />
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="mb-10 text-center text-sm text-dust-400">
            Everything you need to know about Stellara plans and billing.
          </p>

          <div className="glass-card px-6 py-2 sm:px-8">
            {faqs.map((faq, i) => (
              <FAQAccordion
                key={i}
                item={faq}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* ---- Bottom CTA ---- */}
        <div className="mx-auto mt-20 max-w-xl text-center sm:mt-28">
          <h2 className="gradient-text mb-4 font-heading text-2xl font-bold sm:text-3xl">
            Ready to explore your stars?
          </h2>
          <p className="mb-8 text-dust-400">
            Start with our free plan and upgrade whenever you are ready. The cosmos will wait for you.
          </p>
          <Button variant="primary" size="lg" href="/birth-chart">
            Get Started Free
          </Button>
        </div>
      </Container>
    </main>
  );
}
