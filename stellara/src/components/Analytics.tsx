'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 + Meta Pixel analytics component.
 * Set NEXT_PUBLIC_GA_ID and NEXT_PUBLIC_META_PIXEL_ID in your environment.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-XXXXXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export default function Analytics() {
  const hasGA = GA_ID !== 'G-XXXXXXXXXX';
  const hasMeta = META_PIXEL_ID.length > 0;

  if (!hasGA && !hasMeta) return null;

  return (
    <>
      {/* Google Analytics 4 */}
      {hasGA && (
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
      )}

      {/* Meta (Facebook) Pixel */}
      {hasMeta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}

/**
 * Track a custom event in GA4.
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

/**
 * Track a Meta Pixel standard or custom event.
 *
 * Standard events: 'Lead', 'CompleteRegistration', 'InitiateCheckout', 'Subscribe', 'Purchase'
 * Custom events: any string (tracked as trackCustom)
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, string | number>,
) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as Record<string, unknown>;
  if (typeof w.fbq !== 'function') return;

  const fbq = w.fbq as (...args: unknown[]) => void;

  const standardEvents = [
    'PageView', 'Lead', 'CompleteRegistration', 'InitiateCheckout',
    'Subscribe', 'Purchase', 'ViewContent', 'AddToCart',
  ];

  if (standardEvents.includes(eventName)) {
    fbq('track', eventName, params);
  } else {
    fbq('trackCustom', eventName, params);
  }
}
