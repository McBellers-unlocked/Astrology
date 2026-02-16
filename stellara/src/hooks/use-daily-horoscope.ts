'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getFullHoroscope, HOROSCOPE_TEASERS, HOROSCOPE_RATINGS } from '@/lib/zodiac-data';

export interface DailyHoroscope {
  teaser: string;
  ratings: { overall: number; love: number; career: number; wellness: number };
  paragraphs: string[];
  lucky: { number: number; color: string; compatibility: string };
  moonReading: string[];
  risingReading: string[];
}

/** Convert static zodiac-data.ts content into the same shape as the API response */
function staticFallback(slug: string): DailyHoroscope {
  const full = getFullHoroscope(slug);
  const ratings = HOROSCOPE_RATINGS[slug] ?? { overall: 3, love: 3, career: 3, wellness: 3 };
  return {
    teaser: HOROSCOPE_TEASERS[slug] ?? '',
    ratings,
    paragraphs: full.paragraphs,
    lucky: {
      number: full.luckyNumber,
      color: full.luckyColor,
      compatibility: full.compatibility,
    },
    moonReading: full.moonReading,
    risingReading: full.risingReading,
  };
}

/**
 * Fetches today's horoscope for a single sign from the API.
 * Falls back to static content if the API is unavailable.
 */
export function useDailyHoroscope(slug: string): DailyHoroscope | null {
  const [content, setContent] = useState<DailyHoroscope | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.get<DailyHoroscope>(`/horoscopes/today/${slug}`)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        // API unavailable — use static fallback
        if (!cancelled) setContent(staticFallback(slug));
      });

    return () => { cancelled = true; };
  }, [slug]);

  return content;
}

interface HubContent {
  teaser: string;
  ratings: { overall: number; love: number; career: number; wellness: number };
}

/**
 * Fetches today's horoscopes for all 12 signs (hub page).
 * Falls back to static content if the API is unavailable.
 */
export function useDailyHubContent(): Map<string, HubContent> | null {
  const [content, setContent] = useState<Map<string, HubContent> | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.get<{ horoscopes: Record<string, { teaser: string; ratings: HubContent['ratings'] }> }>('/horoscopes/today')
      .then((data) => {
        if (cancelled) return;
        const map = new Map<string, HubContent>();
        for (const [slug, h] of Object.entries(data.horoscopes)) {
          map.set(slug, { teaser: h.teaser, ratings: h.ratings });
        }
        setContent(map);
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback to static content
        const map = new Map<string, HubContent>();
        for (const [slug, teaser] of Object.entries(HOROSCOPE_TEASERS)) {
          const ratings = HOROSCOPE_RATINGS[slug] ?? { overall: 3, love: 3, career: 3, wellness: 3 };
          map.set(slug, { teaser, ratings });
        }
        setContent(map);
      });

    return () => { cancelled = true; };
  }, []);

  return content;
}
