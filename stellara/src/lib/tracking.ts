/**
 * UTM parameter capture and persistence.
 *
 * Captures utm_source, utm_medium, utm_campaign, utm_term, utm_content
 * from the landing URL and stores them in sessionStorage so they persist
 * across page navigations but not across sessions.
 */

const UTM_KEY = 'stellara_utm';

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_url?: string;
}

/**
 * Call this on initial page load to capture UTM params from the URL.
 * Only captures if UTM params are present and haven't been captured yet.
 */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');

  // Only capture if there's at least a source param and we haven't captured yet
  if (!utmSource) return;
  if (sessionStorage.getItem(UTM_KEY)) return;

  const utm: UtmParams = {
    utm_source: utmSource || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    landing_url: window.location.href,
  };

  sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
}

/**
 * Retrieve stored UTM params (returns null if none captured).
 */
export function getUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem(UTM_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as UtmParams;
  } catch {
    return null;
  }
}
