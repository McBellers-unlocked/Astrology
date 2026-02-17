/**
 * Automated engagement cron script.
 *
 * Searches for trending astrology tweets from mid-size accounts (10K-100K followers),
 * generates witty replies using Claude, and posts them.
 *
 * Safety guards:
 * - Max 10 replies per run, 40/day cap
 * - Never replies to the same tweet twice (reply_log table)
 * - Never replies to the same author twice per day
 * - Skips own tweets
 * - 15-second delay between replies to avoid spam detection
 * - Min 1 like on tweet to engage (catch fresh tweets early)
 * - Requires Twitter Basic tier ($100/mo) for search API
 *
 * Crontab entry (5x daily):
 *   15 8,11,14,17,20 * * * cd ~/Astrology/api && set -a && . ./.env && set +a && /usr/bin/npx tsx src/social/engage.ts >> ~/social-engage.log 2>&1
 */

import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';
import { searchRecentTweets, replyToTweet, quoteTweet, type SearchedTweet } from './twitter.js';

const MAX_REPLIES_PER_RUN = 10;
const QUOTE_TWEETS_PER_RUN = 2;   // Top-engagement tweets get QT'd (visible on our timeline)
const REPLY_DELAY_MS = 15_000;
const MIN_LIKES_FOR_QT = 10;      // Only QT tweets with decent engagement

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Search queries — broad pool, 2 queried per run (rotated)
const SEARCH_QUERIES = [
  '"birth chart" OR "natal chart" -is:retweet -is:reply lang:en',
  '"mercury retrograde" OR "saturn return" -is:retweet -is:reply lang:en',
  '"sun sign" OR "rising sign" OR "moon sign" -is:retweet -is:reply lang:en',
  '"venus sign" OR "mars sign" OR "venus in" -is:retweet -is:reply lang:en',
  'horoscope today -is:retweet -is:reply lang:en',
  '"zodiac sign" OR "zodiac compatibility" -is:retweet -is:reply lang:en',
  '"pisces season" OR "aries season" OR "aquarius season" -is:retweet -is:reply lang:en',
  '"big three" astrology -is:retweet -is:reply lang:en',
  '"solar eclipse" OR "lunar eclipse" astrology -is:retweet -is:reply lang:en',
  '"co-star" OR "costar app" OR "the pattern" astrology -is:retweet -is:reply lang:en',
  '"12th house" OR "8th house" OR "7th house" -is:retweet -is:reply lang:en',
  '"scorpio" OR "sagittarius" OR "capricorn" horoscope -is:retweet -is:reply lang:en',
];

// ---- Prepared statements ----

const wasRepliedTo = db.prepare(
  'SELECT id FROM reply_log WHERE original_tweet_id = ?',
);

const repliedToAuthorToday = db.prepare(
  `SELECT id FROM reply_log
   WHERE author_username = ?
   AND created_at >= datetime('now', '-1 day')`,
);

const todayReplyCount = db.prepare(
  `SELECT COUNT(*) as count FROM reply_log
   WHERE created_at >= datetime('now', '-1 day')`,
);

const insertReply = db.prepare(
  `INSERT OR IGNORE INTO reply_log (original_tweet_id, author_username, reply_tweet_id, reply_text)
   VALUES (?, ?, ?, ?)`,
);

// ---- Claude reply generation ----

async function generateReply(tweet: SearchedTweet): Promise<string | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('  [skip] ANTHROPIC_API_KEY not set — cannot generate replies');
    return null;
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `You are the social media voice of Stellara, an astrology app. Generate a witty, engaging reply to this tweet. The reply should:

- Be conversational and fun (not corporate or salesy)
- Show genuine astrology knowledge
- Be under 200 characters (short and punchy)
- Occasionally (30% of the time) include a natural mention of stellera.co — but ONLY if it fits naturally
- Never use hashtags
- Match the energy of the original tweet (funny → funny, serious → insightful)
- Feel like a real astrology-enthusiast friend replying, not a brand

Tweet from @${tweet.authorUsername}:
"${tweet.text}"

Reply (under 200 characters, no quotes):`,
      },
    ],
  });

  const text = response.content[0];
  if (text.type !== 'text') return null;

  // Clean up and enforce length
  let reply = text.text.trim().replace(/^["']|["']$/g, '');
  if (reply.length > 280) reply = reply.slice(0, 277) + '...';

  return reply;
}

// ---- Main logic ----

async function main() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Engagement cron starting...`);

  // Check daily reply budget
  const { count: todayCount } = todayReplyCount.get() as { count: number };
  if (todayCount >= 40) {
    console.log(`  Already sent ${todayCount} replies today — daily limit reached`);
    return;
  }

  // Get our own Twitter user ID to avoid replying to ourselves
  const ownUsername = (process.env.TWITTER_USERNAME ?? 'stelleraapp').toLowerCase();

  // Run 2 different queries per session for a wider candidate pool
  const QUERIES_PER_RUN = 2;
  const baseIndex = (now.getHours() * 2 + Math.floor(now.getMinutes() / 30)) % SEARCH_QUERIES.length;

  const tweets: SearchedTweet[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < QUERIES_PER_RUN; i++) {
    const queryIndex = (baseIndex + i) % SEARCH_QUERIES.length;
    const query = SEARCH_QUERIES[queryIndex];
    console.log(`  Search ${i + 1}: ${query.slice(0, 60)}...`);

    try {
      const results = await searchRecentTweets(query, 20);
      for (const t of results) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          tweets.push(t);
        }
      }
    } catch (err) {
      console.error('  Search failed:', err instanceof Error ? err.message : err);
    }
  }

  console.log(`  Found ${tweets.length} unique tweets across ${QUERIES_PER_RUN} queries`);

  // Filter: skip our own tweets, already-replied tweets, and low-engagement tweets
  const candidates = tweets.filter((t) => {
    // Skip our own tweets
    if (t.authorUsername.toLowerCase() === ownUsername) return false;
    // Skip tweets we already replied to
    if (wasRepliedTo.get(t.id)) return false;
    // Skip if we replied to this author today
    if (repliedToAuthorToday.get(t.authorUsername)) return false;
    // Require some engagement (at least 5 likes)
    if (t.likeCount < 1) return false;
    return true;
  });

  // Sort by engagement (likes + retweets), pick the top ones
  candidates.sort((a, b) => (b.likeCount + b.retweetCount) - (a.likeCount + a.retweetCount));

  // Split: top high-engagement tweets get quote-tweeted (visible on our timeline),
  // rest get regular replies (hidden in threads)
  const qtCandidates = candidates.filter((t) => t.likeCount >= MIN_LIKES_FOR_QT).slice(0, QUOTE_TWEETS_PER_RUN);
  const qtIds = new Set(qtCandidates.map((t) => t.id));
  const replyCandidates = candidates.filter((t) => !qtIds.has(t.id)).slice(0, MAX_REPLIES_PER_RUN);

  console.log(`  ${candidates.length} eligible — ${qtCandidates.length} quote tweets, ${replyCandidates.length} replies`);

  let sent = 0;
  let quoted = 0;
  let errors = 0;

  // ---- Quote tweets first (these show on OUR timeline = visibility) ----
  for (const tweet of qtCandidates) {
    console.log(`  [QT] @${tweet.authorUsername} (${tweet.likeCount} likes): "${tweet.text.slice(0, 60)}..."`);

    try {
      const replyText = await generateReply(tweet);
      if (!replyText) {
        console.log('    [skip] No reply generated');
        continue;
      }

      console.log(`    QT text: "${replyText}"`);

      if (process.env.TWITTER_API_KEY) {
        const result = await quoteTweet(replyText, tweet.id);
        console.log(`    [QT SENT] Quote tweet posted: ${result.id}`);
        insertReply.run(tweet.id, tweet.authorUsername, result.id, `[QT] ${replyText}`);
        quoted++;
      } else {
        console.log(`    [dry] Would QT: "${replyText}"`);
        insertReply.run(tweet.id, tweet.authorUsername, null, `[QT] ${replyText}`);
        quoted++;
      }
    } catch (err) {
      console.error(`    [ERROR]`, err instanceof Error ? err.message : err);
      errors++;
    }

    console.log(`    Waiting ${REPLY_DELAY_MS / 1000}s...`);
    await new Promise((r) => setTimeout(r, REPLY_DELAY_MS));
  }

  // ---- Regular replies ----
  for (const tweet of replyCandidates) {
    console.log(`  @${tweet.authorUsername} (${tweet.likeCount} likes): "${tweet.text.slice(0, 60)}..."`);

    try {
      const replyText = await generateReply(tweet);
      if (!replyText) {
        console.log('    [skip] No reply generated');
        continue;
      }

      console.log(`    Reply: "${replyText}"`);

      // Post the reply — prepend @username so Twitter threads it correctly
      if (process.env.TWITTER_API_KEY) {
        const mentionPrefix = `@${tweet.authorUsername} `;
        const fullReply = replyText.startsWith(`@${tweet.authorUsername}`)
          ? replyText
          : mentionPrefix + replyText;
        const result = await replyToTweet(fullReply, tweet.id);
        console.log(`    [SENT] Reply posted: ${result.id}`);
        insertReply.run(tweet.id, tweet.authorUsername, result.id, replyText);
        sent++;
      } else {
        console.log(`    [dry] Would reply: "${replyText}"`);
        insertReply.run(tweet.id, tweet.authorUsername, null, replyText);
        sent++;
      }
    } catch (err) {
      console.error(`    [ERROR]`, err instanceof Error ? err.message : err);
      errors++;
    }

    // Wait between replies to avoid spam detection
    if (replyCandidates.indexOf(tweet) < replyCandidates.length - 1) {
      console.log(`    Waiting ${REPLY_DELAY_MS / 1000}s...`);
      await new Promise((r) => setTimeout(r, REPLY_DELAY_MS));
    }
  }

  console.log(`[${now.toISOString()}] Done. Replies: ${sent}, QTs: ${quoted}, Errors: ${errors}, Today total: ${todayCount + sent + quoted}`);
}

main().catch((err) => {
  console.error('Engagement cron fatal error:', err);
  process.exit(1);
});
