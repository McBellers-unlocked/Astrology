'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 component.
 * Replace GA_MEASUREMENT_ID with your actual GA4 property ID.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-XXXXXXXXXX';

export default function Analytics() {
  if (GA_ID === 'G-XXXXXXXXXX') return null; // Don't load until a real ID is set

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track a custom event in GA4.
 * Use this from any component: trackEvent('chart_generated', { sign: 'Aries' })
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as Record<string, unknown> & { gtag: (...args: unknown[]) => void }).gtag(
      'event',
      eventName,
      params,
    );
  }
}
