import type { Metadata } from 'next';
import type { ZodiacSign } from '@/types/astrology';
import { ZODIAC_SIGNS } from '@/data/zodiac/signs';

/* ------------------------------------------------------------------
   Constants
   ------------------------------------------------------------------ */

const SITE_NAME = 'Stellara';
const BASE_URL = 'https://stellara.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'hi', 'fr'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/* ------------------------------------------------------------------
   Helper: build language alternates
   ------------------------------------------------------------------ */

function buildLanguageAlternates(path: string): Record<SupportedLocale, string> {
  const alternates = {} as Record<SupportedLocale, string>;
  for (const locale of SUPPORTED_LOCALES) {
    alternates[locale] = locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
  }
  return alternates;
}

/* ------------------------------------------------------------------
   Core metadata generator
   ------------------------------------------------------------------ */

export type PageKey =
  | 'home'
  | 'horoscope'
  | 'birth-chart'
  | 'compatibility'
  | 'zodiac'
  | 'pricing';

interface PageMetaConfig {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  ogType?: 'website' | 'article';
  changeFrequency?: 'daily' | 'weekly' | 'monthly';
}

const PAGE_CONFIGS: Record<PageKey, PageMetaConfig> = {
  home: {
    title: 'Stellara - Your Personal Astrology Companion',
    description:
      'Discover your cosmic blueprint with Stellara. Get daily horoscopes, detailed birth charts, compatibility reports, and personalized astrological insights powered by precision astronomy.',
    keywords: [
      'astrology',
      'horoscope',
      'birth chart',
      'natal chart',
      'zodiac',
      'compatibility',
      'daily horoscope',
      'astrology app',
    ],
    path: '/',
    ogType: 'website',
  },
  horoscope: {
    title: 'Daily Horoscopes',
    description:
      'Read your free daily horoscope for all 12 zodiac signs. Get personalized Sun, Moon, and Rising sign forecasts with love, career, and wellness ratings from Stellara.',
    keywords: [
      'daily horoscope',
      'horoscope today',
      'zodiac horoscope',
      'sun sign horoscope',
      'moon sign horoscope',
      'rising sign horoscope',
      'free horoscope',
    ],
    path: '/horoscope',
    changeFrequency: 'daily',
  },
  'birth-chart': {
    title: 'Free Birth Chart Calculator',
    description:
      'Generate your complete natal birth chart for free. Discover your planet placements, house positions, aspects, and cosmic personality blueprint with Stellara\'s precision astrology engine.',
    keywords: [
      'birth chart',
      'natal chart',
      'birth chart calculator',
      'free birth chart',
      'natal chart calculator',
      'astrology chart',
      'planet placements',
      'house positions',
    ],
    path: '/birth-chart',
  },
  compatibility: {
    title: 'Zodiac Compatibility Calculator',
    description:
      'Check your astrological compatibility with any zodiac sign. Get detailed synastry reports, love compatibility scores, and relationship insights from Stellara.',
    keywords: [
      'zodiac compatibility',
      'astrology compatibility',
      'love compatibility',
      'synastry',
      'relationship astrology',
      'sign compatibility',
      'compatible signs',
    ],
    path: '/compatibility',
  },
  zodiac: {
    title: 'Zodiac Signs Guide',
    description:
      'Explore all 12 zodiac signs with in-depth personality profiles, traits, strengths, weaknesses, and compatibility. Your complete guide to the astrological signs from Aries to Pisces.',
    keywords: [
      'zodiac signs',
      'astrology signs',
      'zodiac traits',
      'zodiac personality',
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ],
    path: '/zodiac',
  },
  pricing: {
    title: 'Pricing Plans',
    description:
      'Choose the perfect Stellara plan for your astrological journey. Free daily horoscopes, premium birth charts, AI-powered readings, and more. Start with a 7-day free trial.',
    keywords: [
      'stellara pricing',
      'astrology subscription',
      'premium horoscope',
      'astrology app plans',
      'birth chart premium',
    ],
    path: '/pricing',
  },
};

/**
 * Generate a complete Next.js Metadata object for a known page.
 */
export function generatePageMetadata(
  page: PageKey,
  params?: Record<string, string>,
): Metadata {
  const config = PAGE_CONFIGS[page];
  const title = config.title.includes('Stellara')
    ? config.title
    : `${config.title} | ${SITE_NAME}`;

  const url = `${BASE_URL}${config.path}`;

  return {
    title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title,
      description: config.description,
      type: config.ogType ?? 'website',
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - ${config.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: config.description,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(config.path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/* ------------------------------------------------------------------
   Per-sign metadata generators
   ------------------------------------------------------------------ */

/**
 * Generate metadata for /horoscope/[sign] pages.
 */
export function generateHoroscopeSignMetadata(sign: ZodiacSign): Metadata {
  const info = ZODIAC_SIGNS[sign];
  const title = `${info.name} Daily Horoscope | ${SITE_NAME}`;
  const description = `Read today's ${info.name} horoscope. Get your daily ${info.name} (${info.symbol}) Sun, Moon, and Rising sign forecast with love, career, and wellness ratings.`;
  const path = `/horoscope/${sign}`;
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords: [
      `${sign} horoscope`,
      `${sign} horoscope today`,
      `${info.name} daily horoscope`,
      `${info.name} zodiac`,
      `${sign} forecast`,
      `${info.name} astrology`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/og-horoscope-${sign}.png`,
          width: 1200,
          height: 630,
          alt: `${info.name} Daily Horoscope`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for /zodiac/[sign] pages.
 */
export function generateZodiacSignMetadata(sign: ZodiacSign): Metadata {
  const info = ZODIAC_SIGNS[sign];
  const title = `${info.name} (${info.symbol}) Zodiac Sign: Traits, Compatibility & More | ${SITE_NAME}`;
  const description = `Everything about ${info.name} (${info.dateRange.start.replace('-', '/')} - ${info.dateRange.end.replace('-', '/')}). Explore ${info.name} personality traits, strengths, weaknesses, compatibility, and ruling planet ${info.rulingPlanet}.`;
  const path = `/zodiac/${sign}`;
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords: [
      `${info.name} zodiac`,
      `${sign} sign`,
      `${info.name} traits`,
      `${info.name} personality`,
      `${info.name} compatibility`,
      `${info.name} horoscope`,
      `${info.element} sign`,
      `${info.name} ${info.element} element`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/og-zodiac-${sign}.png`,
          width: 1200,
          height: 630,
          alt: `${info.name} Zodiac Sign Profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for /compatibility/[slug] pages.
 * Slug format: "aries-leo"
 */
export function generateCompatibilityPairingMetadata(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
): Metadata {
  const info1 = ZODIAC_SIGNS[sign1];
  const info2 = ZODIAC_SIGNS[sign2];
  const title = `${info1.name} & ${info2.name} Compatibility | ${SITE_NAME}`;
  const description = `Are ${info1.name} and ${info2.name} compatible? Discover the ${info1.name}-${info2.name} love compatibility score, relationship strengths, challenges, and synastry insights.`;
  const slug = `${sign1}-${sign2}`;
  const path = `/compatibility/${slug}`;
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords: [
      `${info1.name} ${info2.name} compatibility`,
      `${sign1} and ${sign2}`,
      `${info1.name} ${info2.name} love`,
      `${info1.name} ${info2.name} relationship`,
      'zodiac compatibility',
      'astrology compatibility',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/og-compatibility.png`,
          width: 1200,
          height: 630,
          alt: `${info1.name} & ${info2.name} Compatibility`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
