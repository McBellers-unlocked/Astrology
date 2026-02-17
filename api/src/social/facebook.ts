/**
 * Facebook Page posting module via Meta Graph API.
 *
 * Uses a Page Access Token for publishing.
 * Requires these env vars:
 *   FACEBOOK_PAGE_ID     (Page ID)
 *   FACEBOOK_PAGE_TOKEN  (Page Access Token with pages_manage_posts, pages_read_engagement)
 */

const PAGE_ID = process.env.FACEBOOK_PAGE_ID ?? '';
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN ?? '';
const GRAPH_URL = 'https://graph.facebook.com/v19.0';

interface FBPostResult {
  id: string;
}

/** Post a text + image to the Facebook Page via multipart photo upload */
export async function postToFacebook(text: string, imageBuffer?: Buffer): Promise<FBPostResult> {
  if (!PAGE_ID || !PAGE_TOKEN) {
    throw new Error('Facebook credentials not configured');
  }

  if (imageBuffer) {
    const form = new FormData();
    form.append('message', text);
    form.append('source', new Blob([imageBuffer as unknown as ArrayBuffer], { type: 'image/png' }), 'post.png');
    form.append('access_token', PAGE_TOKEN);

    const res = await fetch(`${GRAPH_URL}/${PAGE_ID}/photos`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Facebook photo post error (${res.status}): ${error}`);
    }

    return (await res.json()) as FBPostResult;
  }

  // Text-only post
  const res = await fetch(`${GRAPH_URL}/${PAGE_ID}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      access_token: PAGE_TOKEN,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Facebook post error (${res.status}): ${error}`);
  }

  return (await res.json()) as FBPostResult;
}

/** Adapt a Twitter thread (array of tweets) into a single Facebook long-form post */
export function threadToFacebookPost(tweets: string[]): string {
  return tweets.join('\n\n---\n\n');
}
