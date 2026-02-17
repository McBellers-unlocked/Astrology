/**
 * Instagram posting module via Instagram Graph API.
 *
 * Uses the Instagram Content Publishing API (requires Business/Creator account
 * linked to a Facebook Page).
 *
 * Requires these env vars:
 *   INSTAGRAM_ACCOUNT_ID   (Instagram Business Account ID — numeric)
 *   FACEBOOK_PAGE_TOKEN    (Same Page Access Token — needs instagram_content_publish)
 *   API_BASE_URL           (Public API URL, e.g. https://api.stellera.co)
 */

import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const IG_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID ?? '';
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN ?? '';
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.stellera.co';
const GRAPH_URL = 'https://graph.facebook.com/v19.0';

// Directory for temporary images that Instagram will fetch
const IMAGE_DIR = join(process.cwd(), 'public', 'social-images');

interface IGPostResult {
  id: string;
}

// Ensure image directory exists
try {
  mkdirSync(IMAGE_DIR, { recursive: true });
} catch {
  /* exists */
}

/** Save image buffer to temp file, return public URL + file path for cleanup */
function saveImageForIG(imageBuffer: Buffer): { url: string; filePath: string } {
  const filename = `ig-${crypto.randomBytes(8).toString('hex')}.png`;
  const filePath = join(IMAGE_DIR, filename);
  writeFileSync(filePath, imageBuffer);
  return {
    url: `${API_BASE_URL}/social-images/${filename}`,
    filePath,
  };
}

/** Post an image + caption to Instagram */
export async function postToInstagram(caption: string, imageBuffer: Buffer): Promise<IGPostResult> {
  if (!IG_ACCOUNT_ID || !PAGE_TOKEN) {
    throw new Error('Instagram credentials not configured');
  }

  // Step 1: Save image to publicly accessible URL
  const { url: imageUrl, filePath } = saveImageForIG(imageBuffer);

  try {
    // Step 2: Create media container
    const createRes = await fetch(`${GRAPH_URL}/${IG_ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: PAGE_TOKEN,
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.text();
      throw new Error(`Instagram container error (${createRes.status}): ${error}`);
    }

    const { id: containerId } = (await createRes.json()) as { id: string };

    // Step 3: Wait for processing (poll until FINISHED)
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status === 'IN_PROGRESS' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const checkRes = await fetch(
        `${GRAPH_URL}/${containerId}?fields=status_code&access_token=${PAGE_TOKEN}`,
      );
      const checkData = (await checkRes.json()) as { status_code?: string };
      status = checkData.status_code ?? 'FINISHED';
      attempts++;
    }

    if (status !== 'FINISHED') {
      throw new Error(
        `Instagram container not ready after ${attempts} attempts (status: ${status})`,
      );
    }

    // Step 4: Publish
    const publishRes = await fetch(`${GRAPH_URL}/${IG_ACCOUNT_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: PAGE_TOKEN,
      }),
    });

    if (!publishRes.ok) {
      const error = await publishRes.text();
      throw new Error(`Instagram publish error (${publishRes.status}): ${error}`);
    }

    return (await publishRes.json()) as IGPostResult;
  } finally {
    // Clean up temp image after a delay (give Instagram time to fetch it)
    setTimeout(() => {
      try {
        unlinkSync(filePath);
      } catch {
        /* already cleaned */
      }
    }, 60_000);
  }
}

/** Hashtag sets for Instagram captions */
const CORE_HASHTAGS = [
  '#astrology',
  '#zodiac',
  '#horoscope',
  '#zodiacsigns',
  '#birthchart',
  '#zodiacfacts',
  '#dailyhoroscope',
  '#cosmicenergy',
  '#starsaligned',
  '#stellara',
];

const SIGN_HASHTAGS: Record<string, string[]> = {
  aries: ['#aries', '#ariesseason', '#firesign'],
  taurus: ['#taurus', '#taurusseason', '#earthsign'],
  gemini: ['#gemini', '#geminiseason', '#airsign'],
  cancer: ['#cancer', '#cancerseason', '#watersign'],
  leo: ['#leo', '#leoseason', '#firesign'],
  virgo: ['#virgo', '#virgoseason', '#earthsign'],
  libra: ['#libra', '#libraseason', '#airsign'],
  scorpio: ['#scorpio', '#scorpioseason', '#watersign'],
  sagittarius: ['#sagittarius', '#sagseason', '#firesign'],
  capricorn: ['#capricorn', '#capricornseason', '#earthsign'],
  aquarius: ['#aquarius', '#aquariusseason', '#airsign'],
  pisces: ['#pisces', '#piscesseason', '#watersign'],
};

/** Build an Instagram caption from text + optional sign, appending relevant hashtags */
export function buildInstagramCaption(text: string, sign?: string): string {
  const tags = [...CORE_HASHTAGS];
  if (sign && SIGN_HASHTAGS[sign]) {
    tags.push(...SIGN_HASHTAGS[sign]);
  }
  // Instagram caption limit is 2200 chars
  const caption = text.length > 2000 ? text.slice(0, 2000) : text;
  return `${caption}\n\n${tags.join(' ')}`;
}

/** Adapt a thread (array of tweets) into a single Instagram caption */
export function threadToInstagramCaption(tweets: string[], sign?: string): string {
  const combined = tweets.join('\n\n');
  return buildInstagramCaption(combined, sign);
}
