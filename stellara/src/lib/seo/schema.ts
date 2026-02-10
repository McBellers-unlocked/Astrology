/**
 * JSON-LD Structured Data generators for Answer Engine Optimization (AEO).
 *
 * Each function returns a plain object that can be serialized into a
 * <script type="application/ld+json"> tag via the JsonLd component.
 */

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

const SITE_NAME = 'Stellara';
const BASE_URL = 'https://stellara.app';
const LOGO_URL = `${BASE_URL}/logo.png`;

/* ------------------------------------------------------------------
   WebSite schema (with SearchAction)
   ------------------------------------------------------------------ */

export function generateWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description:
      'Your personal astrology companion. Daily horoscopes, birth charts, compatibility reports, and personalized cosmic insights.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}

/* ------------------------------------------------------------------
   Organization schema
   ------------------------------------------------------------------ */

export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: LOGO_URL,
    description:
      'Stellara is a modern astrology platform offering daily horoscopes, detailed birth charts, zodiac compatibility reports, and AI-powered personal readings.',
    sameAs: [
      'https://twitter.com/stellaraapp',
      'https://instagram.com/stellaraapp',
      'https://facebook.com/stellaraapp',
      'https://tiktok.com/@stellaraapp',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@stellara.app',
      availableLanguage: ['English', 'Spanish', 'Portuguese', 'Hindi', 'French'],
    },
    foundingDate: '2024-01-01',
  };
}

/* ------------------------------------------------------------------
   FAQPage schema
   ------------------------------------------------------------------ */

interface FAQInput {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQInput[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/* ------------------------------------------------------------------
   Article schema (for zodiac/horoscope content)
   ------------------------------------------------------------------ */

interface ArticleInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
  section?: string;
  keywords?: string[];
}

export function generateArticleSchema(article: ArticleInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image ?? `${BASE_URL}/og-default.png`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Organization',
      name: article.authorName ?? SITE_NAME,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    articleSection: article.section ?? 'Astrology',
    keywords: article.keywords?.join(', ') ?? 'astrology, horoscope, zodiac',
    inLanguage: 'en-US',
  };
}

/* ------------------------------------------------------------------
   Product schema (for pricing tiers)
   ------------------------------------------------------------------ */

interface ProductTierInput {
  name: string;
  description: string;
  price: number;
  priceCurrency?: string;
  billingPeriod?: 'month' | 'year';
  url?: string;
  features?: string[];
}

export function generateProductSchema(tier: ProductTierInput): Record<string, unknown> {
  const isFree = tier.price === 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_NAME} ${tier.name}`,
    description: tier.description,
    brand: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    url: tier.url ?? `${BASE_URL}/pricing`,
    offers: {
      '@type': 'Offer',
      price: tier.price.toFixed(2),
      priceCurrency: tier.priceCurrency ?? 'USD',
      availability: 'https://schema.org/InStock',
      ...(isFree
        ? {}
        : {
            priceValidUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000,
            ).toISOString().split('T')[0],
            billingIncrement: 1,
            billingPeriod: tier.billingPeriod === 'year' ? 'P1Y' : 'P1M',
          }),
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
    ...(tier.features && tier.features.length > 0
      ? {
          additionalProperty: tier.features.map((feature) => ({
            '@type': 'PropertyValue',
            name: 'Feature',
            value: feature,
          })),
        }
      : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '12000',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/* ------------------------------------------------------------------
   BreadcrumbList schema
   ------------------------------------------------------------------ */

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/* ------------------------------------------------------------------
   HowTo schema (for birth chart generation)
   ------------------------------------------------------------------ */

export function generateHowToSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate Your Natal Birth Chart',
    description:
      'Learn how to create your complete astrological birth chart with Stellara. Discover your planet placements, house positions, and aspects in just a few steps.',
    image: `${BASE_URL}/og-birth-chart.png`,
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Your birth date',
      },
      {
        '@type': 'HowToSupply',
        name: 'Your birth time (as accurate as possible)',
      },
      {
        '@type': 'HowToSupply',
        name: 'Your birth location (city and country)',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Stellara Birth Chart Calculator',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Navigate to the Birth Chart page',
        text: 'Open Stellara and go to the Birth Chart section from the main navigation.',
        url: `${BASE_URL}/birth-chart`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter your birth date',
        text: 'Select your date of birth using the date picker. Make sure to choose the correct year, month, and day.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Enter your birth time',
        text: 'Input your birth time as accurately as possible. Check your birth certificate if unsure. The birth time affects your Ascendant and house placements.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Enter your birth location',
        text: 'Type your birth city and select it from the suggestions. The location is used to calculate the exact astronomical positions at the time of your birth.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Generate your chart',
        text: 'Click the "Generate Chart" button. Stellara will calculate all planet positions, house cusps, and aspects using precision astronomical algorithms.',
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Explore your results',
        text: 'Review your complete natal chart including your Big Three (Sun, Moon, Rising), all planet placements, house positions, aspects, and personalized interpretations.',
      },
    ],
  };
}
