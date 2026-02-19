/**
 * Automated engagement cron script — reply-first strategy.
 *
 * Three-tier targeting system:
 *   Tier 1: Target accounts — monitor specific high-value accounts, reply fast (recency-sorted, no like threshold)
 *   Tier 2: Crossover niches — astrology × crypto, dating, TV, wellness, memes (engagement-sorted)
 *   Tier 3: General astrology — broad keyword pool for reach (engagement-sorted)
 *
 * Safety guards:
 * - Max 8 replies + 2 QTs per run, 35/day cap
 * - Never replies to the same tweet twice (reply_log table)
 * - Never replies to the same author twice per day
 * - Skips own tweets
 * - 15-second delay between replies to avoid spam detection
 * - Min 1 like on tweet to engage (except target accounts — being first matters more)
 * - Min 25 likes for quote tweets
 * - Requires Twitter Basic tier ($100/mo) for search API
 *
 * Crontab entry (every 2 hours, 8am-10pm = 8 runs/day):
 *   0 8,10,12,14,16,18,20,22 * * * cd ~/Astrology/api && set -a && . ./.env && set +a && /usr/bin/npx tsx src/social/engage.ts >> ~/social-engage.log 2>&1
 */

import Anthropic from '@anthropic-ai/sdk';
import db from '../db.js';
import { searchRecentTweets, replyToTweet, quoteTweet, type SearchedTweet } from './twitter.js';

// --- Volume knobs ---
const MAX_REPLIES_PER_RUN = 8;           // was 15 — halved to reduce account activity
const QUOTE_TWEETS_PER_RUN = 2;          // was 5
const REPLY_DELAY_MS = 30_000;           // was 15_000 — slower to look more human
const MIN_LIKES_FOR_QT = 25;
const DAILY_CAP = 35;                    // was 75 — halved to reduce account activity
const QUERIES_PER_RUN = 3;              // was 5 — now 1 crossover + 2 general (target queries always run in addition)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// --- Target accounts: monitor these for fast replies ---
// Being first to reply to big accounts = maximum visibility.
// These accounts get: no like threshold, recency sorting, priority processing.
const TARGET_ACCOUNTS: string[] = [
  // --- Major astrology voices ---
  'chaninicholas',       // Chani Nicholas — biggest modern astrology voice, book author
  'thezodiacstea',       // ~1M followers, astrology memes, high engagement
  'sanctuarywrld',       // Sanctuary World — shareable astrology visuals/memes
  'jakesastrology',      // Cosmopolitan horoscope writer, strong IG crossover
  'jessica_lanyadoo',    // well-known astrologer, mainstream media appearances
  'emma_vee',            // modern lifestyle/astrology content creator
  '1meccanism',          // Mecca Woods — published astrologer
  'QueerCosmos',         // Colin Bedell — astrology + relationship analysis
  'aquiriusmaximus',     // tarot/astrology blend, strong engagement
  'notallgeminis',       // zodiac humour
  'CosmicRX',            // astrology + wellness
  'glossy_zodiac',       // astro aesthetics
  'astaborea',           // astrology meme account
  // --- Finance/crypto × astrology ---
  'astrologycrypto',     // astrology × crypto sentiment community
  'FinanceAstr',         // Financial Astrology — planetary patterns × markets
  'CryptoWendyO',        // crypto personality
  'BitcoinHuddler',      // crypto (proven: 3.7K impressions on mercury retro reply)
  // --- Pop culture / crossover (the voice that gets the most engagement) ---
  'ashanism',            // pop culture (proven: 42 likes on saturn return reply)
  'betches',             // pop culture/dating memes
  'therapyforblkgirls',  // wellness/therapy
];

// Build target account queries — 3 accounts per query to stay under 512-char query limit
function buildTargetAccountQueries(): string[] {
  const queries: string[] = [];
  for (let i = 0; i < TARGET_ACCOUNTS.length; i += 3) {
    const batch = TARGET_ACCOUNTS.slice(i, i + 3);
    const fromClauses = batch.map(u => `from:${u}`).join(' OR ');
    queries.push(`(${fromClauses}) -is:retweet lang:en`);
  }
  return queries;
}

// --- Search queries: three tiers ---

// Tier 2: Crossover niche queries (highest value after target accounts)
// These produced our best engagement: crypto x astro, TV x astro, dating x signs
const CROSSOVER_QUERIES = [
  // Crypto x astrology
  '"mercury retrograde" (crypto OR bitcoin OR market OR trading) -is:retweet -is:reply lang:en',
  '(astrology OR horoscope) (bitcoin OR ethereum OR crypto) -is:retweet -is:reply lang:en',
  '"not financial advice" (zodiac OR mercury OR retrograde) -is:retweet -is:reply lang:en',
  // Dating/relationships x signs
  '"what sign" (dating OR boyfriend OR girlfriend OR crush OR situationship) -is:retweet -is:reply lang:en',
  '(zodiac OR sign) ("red flag" OR "green flag" OR "the ick") -is:retweet -is:reply lang:en',
  '"compatible signs" OR "zodiac compatibility" (dating OR love) -is:retweet -is:reply lang:en',
  // Pop culture / TV x astrology
  '(zodiac OR astrology) ("reality tv" OR bachelor OR "love island" OR "white lotus") -is:retweet -is:reply lang:en',
  '"what sign is" (character OR celebrity) -is:retweet -is:reply lang:en',
  // Wellness / therapy x astrology
  '(saturn return OR mercury retrograde) (therapy OR "mental health" OR wellness OR healing) -is:retweet -is:reply lang:en',
  '"birth chart" (therapist OR therapy OR "inner child" OR attachment) -is:retweet -is:reply lang:en',
  // Memes/humor x signs
  '"as a" (scorpio OR gemini OR virgo OR aries OR leo) "I" -is:retweet -is:reply lang:en',
  '(zodiac OR horoscope) (meme OR "I feel attacked" OR "called out") -is:retweet -is:reply lang:en',
];

// Tier 3: General astrology queries (the existing pool, kept for breadth)
const GENERAL_QUERIES = [
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
  `INSERT OR IGNORE INTO reply_log (original_tweet_id, author_username, reply_tweet_id, reply_text, source_type)
   VALUES (?, ?, ?, ?, ?)`,
);

// ---- Types ----

type SourceType = 'target_account' | 'crossover' | 'general';

interface CandidateTweet extends SearchedTweet {
  sourceType: SourceType;
}

// ---- Claude reply generation ----

async function generateReply(tweet: CandidateTweet): Promise<string | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('  [skip] ANTHROPIC_API_KEY not set — cannot generate replies');
    return null;
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Build context hint based on source type
  const sourceHint = tweet.sourceType === 'target_account'
    ? `This is a tweet from a high-profile account (@${tweet.authorUsername}, ${tweet.followerCount.toLocaleString()} followers). Being early and memorable matters. Make the reply stand out.`
    : tweet.sourceType === 'crossover'
    ? `This tweet crosses astrology with another topic. The BEST Stellara replies connect astrology to the tweet's subject in an unexpected, clever way. Lean into the crossover — don't just make a generic astrology comment.`
    : '';

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
- Rarely (about 10% of the time) include a natural mention of stellera.co — but ONLY if it fits naturally
- Never use hashtags
- Match the energy of the original tweet (funny → funny, serious → insightful)
- Feel like a real astrology-enthusiast friend replying, not a brand
- When the tweet is about crypto, dating, TV, wellness, or any non-astrology topic, connect it to astrology in a surprising and clever way (e.g., "mercury retrograde is not market-moving energy" or "that's such a saturn return breakup")
- The BEST replies make people think "wait, that's actually a good point" — astrology as an unexpected lens on their topic

${sourceHint}

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
  if (todayCount >= DAILY_CAP) {
    console.log(`  Already sent ${todayCount} replies today — daily limit (${DAILY_CAP}) reached`);
    return;
  }
  const remainingBudget = DAILY_CAP - todayCount;

  // Get our own Twitter user ID to avoid replying to ourselves
  const ownUsername = (process.env.TWITTER_USERNAME ?? 'stelleraapp').toLowerCase();
  const seenIds = new Set<string>();

  // ---- TIER 1: Target account tweets (recency-sorted, no like threshold) ----
  const targetTweets: CandidateTweet[] = [];
  const targetQueries = buildTargetAccountQueries();
  console.log(`  --- Tier 1: Target accounts (${TARGET_ACCOUNTS.length} accounts, ${targetQueries.length} queries) ---`);

  for (const query of targetQueries) {
    console.log(`  [target] ${query.slice(0, 70)}...`);
    try {
      const results = await searchRecentTweets(query, 20);
      for (const t of results) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          targetTweets.push({ ...t, sourceType: 'target_account' });
        }
      }
    } catch (err) {
      console.error('  [target] Search failed:', err instanceof Error ? err.message : err);
    }
  }

  // Filter target tweets: skip own, skip already-replied, skip same-author-today
  // NO like threshold for target accounts — being first matters more than engagement
  const targetCandidates = targetTweets.filter((t) => {
    if (t.authorUsername.toLowerCase() === ownUsername) return false;
    if (wasRepliedTo.get(t.id)) return false;
    if (repliedToAuthorToday.get(t.authorUsername)) return false;
    return true;
  });

  // Sort target tweets by RECENCY (newest first), not engagement
  targetCandidates.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  console.log(`  [target] ${targetTweets.length} found, ${targetCandidates.length} eligible`);

  // ---- TIER 2: Crossover niche queries (engagement-sorted, standard filters) ----
  const crossoverTweets: CandidateTweet[] = [];
  const crossoverCount = 1;  // was 2 — halved
  const crossoverBase = (now.getHours() * 2 + Math.floor(now.getMinutes() / 30)) % CROSSOVER_QUERIES.length;

  console.log(`  --- Tier 2: Crossover niches (${crossoverCount} queries) ---`);
  for (let i = 0; i < crossoverCount; i++) {
    const idx = (crossoverBase + i) % CROSSOVER_QUERIES.length;
    const query = CROSSOVER_QUERIES[idx];
    console.log(`  [crossover] ${query.slice(0, 70)}...`);
    try {
      const results = await searchRecentTweets(query, 20);
      for (const t of results) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          crossoverTweets.push({ ...t, sourceType: 'crossover' });
        }
      }
    } catch (err) {
      console.error('  [crossover] Search failed:', err instanceof Error ? err.message : err);
    }
  }

  const crossoverCandidates = crossoverTweets.filter((t) => {
    if (t.authorUsername.toLowerCase() === ownUsername) return false;
    if (wasRepliedTo.get(t.id)) return false;
    if (repliedToAuthorToday.get(t.authorUsername)) return false;
    if (t.likeCount < 1) return false;
    return true;
  });
  crossoverCandidates.sort((a, b) => (b.likeCount + b.retweetCount) - (a.likeCount + a.retweetCount));
  console.log(`  [crossover] ${crossoverTweets.length} found, ${crossoverCandidates.length} eligible`);

  // ---- TIER 3: General astrology queries (existing behavior) ----
  const generalTweets: CandidateTweet[] = [];
  const generalCount = QUERIES_PER_RUN - crossoverCount; // 5 - 2 = 3 general queries
  const generalBase = (now.getHours() * 3 + now.getDate()) % GENERAL_QUERIES.length;

  console.log(`  --- Tier 3: General astrology (${generalCount} queries) ---`);
  for (let i = 0; i < generalCount; i++) {
    const idx = (generalBase + i) % GENERAL_QUERIES.length;
    const query = GENERAL_QUERIES[idx];
    console.log(`  [general] ${query.slice(0, 70)}...`);
    try {
      const results = await searchRecentTweets(query, 20);
      for (const t of results) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          generalTweets.push({ ...t, sourceType: 'general' });
        }
      }
    } catch (err) {
      console.error('  [general] Search failed:', err instanceof Error ? err.message : err);
    }
  }

  const generalCandidates = generalTweets.filter((t) => {
    if (t.authorUsername.toLowerCase() === ownUsername) return false;
    if (wasRepliedTo.get(t.id)) return false;
    if (repliedToAuthorToday.get(t.authorUsername)) return false;
    if (t.likeCount < 1) return false;
    return true;
  });
  generalCandidates.sort((a, b) => (b.likeCount + b.retweetCount) - (a.likeCount + a.retweetCount));
  console.log(`  [general] ${generalTweets.length} found, ${generalCandidates.length} eligible`);

  // ---- Combine candidates with priority: target > crossover > general ----
  const allCandidates: CandidateTweet[] = [
    ...targetCandidates,
    ...crossoverCandidates,
    ...generalCandidates,
  ];

  // Split: QT only from crossover + general (replying to target accounts builds relationship; QT'ing feels adversarial)
  const qtCandidates = allCandidates
    .filter((t) => t.sourceType !== 'target_account' && t.likeCount >= MIN_LIKES_FOR_QT)
    .slice(0, QUOTE_TWEETS_PER_RUN);

  const qtIds = new Set(qtCandidates.map((t) => t.id));
  const replyCandidates = allCandidates
    .filter((t) => !qtIds.has(t.id))
    .slice(0, Math.min(MAX_REPLIES_PER_RUN, remainingBudget));

  console.log(`\n  TOTALS: ${allCandidates.length} eligible — ${qtCandidates.length} QTs, ${replyCandidates.length} replies`);
  console.log(`    Target: ${targetCandidates.length} | Crossover: ${crossoverCandidates.length} | General: ${generalCandidates.length}`);

  let sent = 0;
  let quoted = 0;
  let errors = 0;

  // ---- Quote tweets first (these show on OUR timeline = visibility) ----
  for (const tweet of qtCandidates) {
    console.log(`  [QT|${tweet.sourceType}] @${tweet.authorUsername} (${tweet.likeCount} likes): "${tweet.text.slice(0, 60)}..."`);

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
        insertReply.run(tweet.id, tweet.authorUsername, result.id, `[QT] ${replyText}`, tweet.sourceType);
        quoted++;
      } else {
        console.log(`    [dry] Would QT: "${replyText}"`);
        insertReply.run(tweet.id, tweet.authorUsername, null, `[QT] ${replyText}`, tweet.sourceType);
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
    console.log(`  [${tweet.sourceType}] @${tweet.authorUsername} (${tweet.likeCount} likes, ${tweet.followerCount.toLocaleString()} followers): "${tweet.text.slice(0, 60)}..."`);

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
        insertReply.run(tweet.id, tweet.authorUsername, result.id, replyText, tweet.sourceType);
        sent++;
      } else {
        console.log(`    [dry] Would reply: "${replyText}"`);
        insertReply.run(tweet.id, tweet.authorUsername, null, replyText, tweet.sourceType);
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
