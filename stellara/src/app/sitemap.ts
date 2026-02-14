import type { MetadataRoute } from 'next';
import type { ZodiacSign } from '@/types/astrology';
import { BLOG_POSTS } from '@/data/blog-posts';

export const dynamic = 'force-static';

const BASE_URL = 'https://stellara.co';

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /* ---- Static pages ---- */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/horoscope`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/birth-chart`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compatibility`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/zodiac`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  /* ---- Horoscope sign pages (daily frequency) ---- */
  const horoscopePages: MetadataRoute.Sitemap = SIGNS.map((sign) => ({
    url: `${BASE_URL}/horoscope/${sign}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  /* ---- Zodiac sign pages (weekly frequency) ---- */
  const zodiacPages: MetadataRoute.Sitemap = SIGNS.map((sign) => ({
    url: `${BASE_URL}/zodiac/${sign}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  /* ---- Compatibility pairing pages (all 144 combinations, weekly) ---- */
  const compatibilityPages: MetadataRoute.Sitemap = [];
  for (const sign1 of SIGNS) {
    for (const sign2 of SIGNS) {
      compatibilityPages.push({
        url: `${BASE_URL}/compatibility/${sign1}-${sign2}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  }

  /* ---- Blog posts ---- */
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticPages,
    ...horoscopePages,
    ...zodiacPages,
    ...compatibilityPages,
    ...blogPages,
  ];
}
