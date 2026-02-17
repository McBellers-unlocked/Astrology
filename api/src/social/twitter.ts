/**
 * Twitter/X API v2 posting module.
 *
 * Uses OAuth 1.0a User Context for tweet creation.
 * Requires these env vars:
 *   TWITTER_API_KEY        (Consumer Key)
 *   TWITTER_API_SECRET     (Consumer Secret)
 *   TWITTER_ACCESS_TOKEN   (User Access Token)
 *   TWITTER_ACCESS_SECRET  (User Access Token Secret)
 */

import crypto from 'crypto';

const API_KEY = process.env.TWITTER_API_KEY ?? '';
const API_SECRET = process.env.TWITTER_API_SECRET ?? '';
const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN ?? '';
const ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET ?? '';

const TWEET_URL = 'https://api.twitter.com/2/tweets';
const SEARCH_URL = 'https://api.twitter.com/2/tweets/search/recent';
const MEDIA_UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';

interface TweetResult {
  id: string;
  text: string;
}

export interface SearchedTweet {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  likeCount: number;
  retweetCount: number;
  createdAt: string;
}

/** Build OAuth 1.0a Authorization header */
function buildOAuthHeader(method: string, url: string, extraParams?: Record<string, string>): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const params: Record<string, string> = {
    oauth_consumer_key: API_KEY,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: ACCESS_TOKEN,
    oauth_version: '1.0',
    ...extraParams,
  };

  // Create signature base string
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  const signingKey = `${encodeURIComponent(API_SECRET)}&${encodeURIComponent(ACCESS_SECRET)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  params['oauth_signature'] = signature;

  // Only include oauth_ params in the header (not extra body params)
  const header = Object.keys(params)
    .filter((k) => k.startsWith('oauth_'))
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(', ');

  return `OAuth ${header}`;
}

/** Upload an image to Twitter and return the media_id_string */
export async function uploadMedia(imageBuffer: Buffer): Promise<string> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  const mediaData = imageBuffer.toString('base64');

  // For media upload, include media_data in the signature
  const authHeader = buildOAuthHeader('POST', MEDIA_UPLOAD_URL, {
    media_data: mediaData,
  });

  // Build form-urlencoded body
  const body = `media_data=${encodeURIComponent(mediaData)}`;

  const res = await fetch(MEDIA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Twitter media upload error (${res.status}): ${error}`);
  }

  const data = (await res.json()) as { media_id_string: string };
  return data.media_id_string;
}

/** Post a tweet via Twitter API v2, optionally with an attached image */
export async function postToTwitter(text: string, mediaId?: string): Promise<TweetResult> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  // Twitter character limit is 280
  const trimmedText = text.length > 280 ? text.slice(0, 277) + '...' : text;

  const tweetBody: Record<string, unknown> = { text: trimmedText };
  if (mediaId) {
    tweetBody.media = { media_ids: [mediaId] };
  }

  const body = JSON.stringify(tweetBody);
  const authHeader = buildOAuthHeader('POST', TWEET_URL);

  const res = await fetch(TWEET_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Twitter API error (${res.status}): ${error}`);
  }

  const data = (await res.json()) as { data: TweetResult };
  return data.data;
}

/** Search recent tweets. Requires Twitter API Basic tier ($100/mo). */
export async function searchRecentTweets(query: string, maxResults = 10): Promise<SearchedTweet[]> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  const params: Record<string, string> = {
    query,
    max_results: String(Math.min(Math.max(maxResults, 10), 100)),
    'tweet.fields': 'created_at,public_metrics',
    expansions: 'author_id',
    'user.fields': 'username,name,public_metrics',
  };

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `${SEARCH_URL}?${queryString}`;

  // For GET requests, include query params in the OAuth signature
  const authHeader = buildOAuthHeader('GET', SEARCH_URL, params);

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Twitter search error (${res.status}): ${error}`);
  }

  const json = (await res.json()) as {
    data?: Array<{
      id: string;
      text: string;
      author_id: string;
      created_at: string;
      public_metrics: { like_count: number; retweet_count: number };
    }>;
    includes?: {
      users?: Array<{ id: string; username: string; name: string; public_metrics?: { followers_count: number } }>;
    };
  };

  if (!json.data) return [];

  const usersMap = new Map<string, { username: string; name: string }>();
  for (const u of json.includes?.users ?? []) {
    usersMap.set(u.id, { username: u.username, name: u.name });
  }

  return json.data.map((t) => {
    const author = usersMap.get(t.author_id) ?? { username: 'unknown', name: 'Unknown' };
    return {
      id: t.id,
      text: t.text,
      authorId: t.author_id,
      authorUsername: author.username,
      authorName: author.name,
      likeCount: t.public_metrics.like_count,
      retweetCount: t.public_metrics.retweet_count,
      createdAt: t.created_at,
    };
  });
}

/** Reply to a specific tweet */
export async function replyToTweet(text: string, inReplyToTweetId: string): Promise<TweetResult> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  const trimmedText = text.length > 280 ? text.slice(0, 277) + '...' : text;

  const tweetBody = {
    text: trimmedText,
    reply: { in_reply_to_tweet_id: inReplyToTweetId },
  };

  const body = JSON.stringify(tweetBody);
  const authHeader = buildOAuthHeader('POST', TWEET_URL);

  const res = await fetch(TWEET_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`Twitter reply failed — status: ${res.status}, tweet_id: ${inReplyToTweetId}, response: ${error}`);
    throw new Error(`Twitter reply error (${res.status}): ${error}`);
  }

  const data = (await res.json()) as { data: TweetResult };
  return data.data;
}

/** Quote-tweet another tweet (shows the original embedded beneath your comment) */
export async function quoteTweet(text: string, quotedTweetId: string): Promise<TweetResult> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  const trimmedText = text.length > 280 ? text.slice(0, 277) + '...' : text;

  const tweetBody = {
    text: trimmedText,
    quote_tweet_id: quotedTweetId,
  };

  const body = JSON.stringify(tweetBody);
  const authHeader = buildOAuthHeader('POST', TWEET_URL);

  const res = await fetch(TWEET_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`Twitter quote tweet failed — status: ${res.status}, quoted_id: ${quotedTweetId}, response: ${error}`);
    throw new Error(`Twitter quote tweet error (${res.status}): ${error}`);
  }

  const data = (await res.json()) as { data: TweetResult };
  return data.data;
}

/** Post a thread (array of tweets, each replying to the previous) */
export async function postThread(tweets: string[], mediaId?: string): Promise<TweetResult[]> {
  if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_SECRET) {
    throw new Error('Twitter API credentials not configured');
  }

  const results: TweetResult[] = [];
  let previousTweetId: string | undefined;

  for (let i = 0; i < tweets.length; i++) {
    const text = tweets[i].length > 280 ? tweets[i].slice(0, 277) + '...' : tweets[i];

    const tweetBody: Record<string, unknown> = { text };

    // First tweet can have an image
    if (i === 0 && mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    // All tweets after the first reply to the previous one
    if (previousTweetId) {
      tweetBody.reply = { in_reply_to_tweet_id: previousTweetId };
    }

    const body = JSON.stringify(tweetBody);
    const authHeader = buildOAuthHeader('POST', TWEET_URL);

    const res = await fetch(TWEET_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Twitter thread tweet ${i + 1}/${tweets.length} failed — status: ${res.status}, response: ${error}`);
      throw new Error(`Twitter thread error on tweet ${i + 1} (${res.status}): ${error}`);
    }

    const data = (await res.json()) as { data: TweetResult };
    results.push(data.data);
    previousTweetId = data.data.id;

    // Small delay between thread tweets to avoid rate limits
    if (i < tweets.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return results;
}
