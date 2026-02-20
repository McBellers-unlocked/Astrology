import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import db from '../db.js';
import { verifyToken } from '../lib/jwt.js';
import { readTodayResults, type PostResult } from '../social/notify.js';
import { postToTwitter, postThread, uploadMedia, replyToTweet, quoteTweet } from '../social/twitter.js';

const router = Router();

// ------------------------------------------------------------------
// Admin middleware — checks JWT + is_admin flag
// ------------------------------------------------------------------
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = db
      .prepare('SELECT is_admin FROM users WHERE id = ?')
      .get(payload.userId) as { is_admin: number } | undefined;

    if (!user || !user.is_admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.use(requireAdmin);

// ------------------------------------------------------------------
// GET /admin/stats — Dashboard KPIs
// ------------------------------------------------------------------
router.get('/stats', (_req, res) => {
  try {
    const totalUsers = (
      db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    ).count;

    const todayStr = new Date().toISOString().slice(0, 10);
    const usersToday = (
      db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?").get(todayStr) as { count: number }
    ).count;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const usersThisWeek = (
      db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?").get(sevenDaysAgo) as { count: number }
    ).count;

    const premiumActive = (
      db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE subscription_status IN ('active', 'trialing')",
      ).get() as { count: number }
    ).count;

    const tierBreakdown = db
      .prepare(
        `SELECT subscription_tier as tier, COUNT(*) as count FROM users GROUP BY subscription_tier`,
      )
      .all() as Array<{ tier: string; count: number }>;

    const statusBreakdown = db
      .prepare(
        `SELECT subscription_status as status, COUNT(*) as count FROM users GROUP BY subscription_status`,
      )
      .all() as Array<{ status: string; count: number }>;

    const emailSubscribers = (
      db.prepare('SELECT COUNT(*) as count FROM email_subscribers').get() as { count: number }
    ).count;

    const unsubscribed = (
      db.prepare('SELECT COUNT(*) as count FROM users WHERE email_unsubscribed = 1').get() as { count: number }
    ).count;

    const withBirthChart = (
      db.prepare('SELECT COUNT(*) as count FROM users WHERE sun_sign IS NOT NULL').get() as { count: number }
    ).count;

    const withBigThree = (
      db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE sun_sign IS NOT NULL AND moon_sign IS NOT NULL AND rising_sign IS NOT NULL',
      ).get() as { count: number }
    ).count;

    // Estimate MRR: stellar=$9.99, cosmic=$19.99
    const stellarActive = (
      db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE subscription_tier = 'stellar' AND subscription_status IN ('active', 'trialing')",
      ).get() as { count: number }
    ).count;
    const cosmicActive = (
      db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE subscription_tier = 'cosmic' AND subscription_status IN ('active', 'trialing')",
      ).get() as { count: number }
    ).count;
    const estimatedMRR = stellarActive * 9.99 + cosmicActive * 19.99;

    // User signups over last 30 days (by day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const signupsByDay = db
      .prepare(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM users WHERE created_at >= ?
         GROUP BY DATE(created_at) ORDER BY date`,
      )
      .all(thirtyDaysAgo) as Array<{ date: string; count: number }>;

    // UTM source breakdown
    const utmSources = db
      .prepare(
        `SELECT utm_source as source, COUNT(*) as count
         FROM users WHERE utm_source IS NOT NULL
         GROUP BY utm_source ORDER BY count DESC LIMIT 10`,
      )
      .all() as Array<{ source: string; count: number }>;

    // Email subscriber sources
    const subscriberSources = db
      .prepare(
        `SELECT source, COUNT(*) as count
         FROM email_subscribers WHERE source IS NOT NULL
         GROUP BY source ORDER BY count DESC`,
      )
      .all() as Array<{ source: string; count: number }>;

    // Social engagement stats
    const totalReplies = (
      db.prepare('SELECT COUNT(*) as count FROM reply_log').get() as { count: number }
    ).count;
    const repliesToday = (
      db.prepare('SELECT COUNT(*) as count FROM reply_log WHERE created_at >= ?').get(todayStr) as { count: number }
    ).count;

    // Nurture sequence progress
    const nurtureStats = db
      .prepare(
        `SELECT email_key, COUNT(*) as count FROM email_sequence_log GROUP BY email_key ORDER BY email_key`,
      )
      .all() as Array<{ email_key: string; count: number }>;

    // Sun sign distribution
    const signDistribution = db
      .prepare(
        `SELECT sun_sign as sign, COUNT(*) as count
         FROM users WHERE sun_sign IS NOT NULL
         GROUP BY sun_sign ORDER BY count DESC`,
      )
      .all() as Array<{ sign: string; count: number }>;

    res.json({
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        premiumActive,
        tierBreakdown,
        statusBreakdown,
        withBirthChart,
        withBigThree,
        signupsByDay,
        signDistribution,
      },
      revenue: {
        estimatedMRR: Math.round(estimatedMRR * 100) / 100,
        stellarActive,
        cosmicActive,
      },
      email: {
        subscribers: emailSubscribers,
        unsubscribed,
        subscriberSources,
        nurtureStats,
      },
      social: {
        totalReplies,
        repliesToday,
      },
      utm: utmSources,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/users — Paginated user list
// ------------------------------------------------------------------
router.get('/users', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const search = (req.query.search as string) || '';
    const tier = (req.query.tier as string) || '';
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params: unknown[] = [];

    if (search) {
      whereClause += ' AND (email LIKE ? OR name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tier) {
      whereClause += ' AND subscription_tier = ?';
      params.push(tier);
    }

    const total = (
      db.prepare(`SELECT COUNT(*) as count FROM users WHERE ${whereClause}`).get(...params) as { count: number }
    ).count;

    const users = db
      .prepare(
        `SELECT id, email, name, created_at, subscription_tier, subscription_status,
                subscription_end_date, sun_sign, moon_sign, rising_sign,
                utm_source, utm_medium, utm_campaign, email_unsubscribed, is_admin
         FROM users WHERE ${whereClause}
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset) as Array<Record<string, unknown>>;

    // Get nurture sequence status for each user
    const userIds = users.map((u) => u.id as string);
    const nurtureMap = new Map<string, string[]>();
    if (userIds.length > 0) {
      const placeholders = userIds.map(() => '?').join(',');
      const nurtureRows = db
        .prepare(
          `SELECT user_id, email_key FROM email_sequence_log WHERE user_id IN (${placeholders})`,
        )
        .all(...userIds) as Array<{ user_id: string; email_key: string }>;
      for (const row of nurtureRows) {
        const existing = nurtureMap.get(row.user_id) ?? [];
        existing.push(row.email_key);
        nurtureMap.set(row.user_id, existing);
      }
    }

    const enrichedUsers = users.map((u) => ({
      ...u,
      nurtureEmails: nurtureMap.get(u.id as string) ?? [],
    }));

    res.json({
      users: enrichedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/subscribers — Email subscriber list
// ------------------------------------------------------------------
router.get('/subscribers', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const total = (
      db.prepare('SELECT COUNT(*) as count FROM email_subscribers').get() as { count: number }
    ).count;

    const subscribers = db
      .prepare(
        'SELECT id, email, source, created_at FROM email_subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?',
      )
      .all(limit, offset) as Array<Record<string, unknown>>;

    res.json({
      subscribers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Admin subscribers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/user/:id — Single user detail
// ------------------------------------------------------------------
router.get('/user/:id', (req, res) => {
  try {
    const user = db
      .prepare(
        `SELECT id, email, name, created_at, subscription_tier, subscription_status,
                subscription_end_date, stripe_customer_id, birth_date, birth_time,
                birth_location, sun_sign, moon_sign, rising_sign,
                utm_source, utm_medium, utm_campaign, email_unsubscribed, is_admin
         FROM users WHERE id = ?`,
      )
      .get(req.params.id) as Record<string, unknown> | undefined;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const nurtureEmails = db
      .prepare('SELECT email_key, sent_at FROM email_sequence_log WHERE user_id = ? ORDER BY sent_at')
      .all(req.params.id) as Array<{ email_key: string; sent_at: string }>;

    res.json({ user, nurtureEmails });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/social — Social posting & engagement stats
// ------------------------------------------------------------------
router.get('/social', (_req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    // --- JSONL post results (today) ---
    const todayPosts = readTodayResults();
    const totalPosts = todayPosts.length;
    const successPosts = todayPosts.filter((r) => r.success).length;
    const failedPosts = totalPosts - successPosts;

    const byType: Record<string, { total: number; success: number }> = {
      horoscope: { total: 0, success: 0 },
      engagement: { total: 0, success: 0 },
      thread: { total: 0, success: 0 },
    };
    for (const r of todayPosts) {
      const bucket = byType[r.type] ?? { total: 0, success: 0 };
      bucket.total++;
      if (r.success) bucket.success++;
    }

    // --- Reply log from SQLite ---
    const totalReplies = (
      db.prepare('SELECT COUNT(*) as count FROM reply_log').get() as { count: number }
    ).count;

    const repliesToday = (
      db.prepare('SELECT COUNT(*) as count FROM reply_log WHERE created_at >= ?').get(todayStr) as {
        count: number;
      }
    ).count;

    const successfulRepliesToday = (
      db
        .prepare(
          'SELECT COUNT(*) as count FROM reply_log WHERE created_at >= ? AND reply_tweet_id IS NOT NULL',
        )
        .get(todayStr) as { count: number }
    ).count;

    const failedRepliesToday = repliesToday - successfulRepliesToday;

    // Replies over last 7 days (by day)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const repliesByDay = db
      .prepare(
        `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM reply_log WHERE created_at >= ?
         GROUP BY DATE(created_at) ORDER BY date`,
      )
      .all(sevenDaysAgo) as Array<{ date: string; count: number }>;

    // Top engaged authors (most replies sent to)
    const topAuthors = db
      .prepare(
        `SELECT author_username as username, COUNT(*) as count
         FROM reply_log
         GROUP BY author_username ORDER BY count DESC LIMIT 10`,
      )
      .all() as Array<{ username: string; count: number }>;

    // Recent replies (last 20)
    const recentReplies = db
      .prepare(
        `SELECT original_tweet_id, author_username, reply_tweet_id, reply_text, created_at
         FROM reply_log ORDER BY created_at DESC LIMIT 20`,
      )
      .all() as Array<{
      original_tweet_id: string;
      author_username: string;
      reply_tweet_id: string | null;
      reply_text: string;
      created_at: string;
    }>;

    res.json({
      posts: {
        today: todayPosts,
        totalToday: totalPosts,
        successToday: successPosts,
        failedToday: failedPosts,
        byType,
      },
      replies: {
        total: totalReplies,
        today: repliesToday,
        successfulToday: successfulRepliesToday,
        failedToday: failedRepliesToday,
        repliesByDay,
        topAuthors,
        recentReplies,
      },
    });
  } catch (err) {
    console.error('Admin social error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/drafts — List draft posts
// ------------------------------------------------------------------
router.get('/drafts', (req, res) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const drafts = db
      .prepare(
        `SELECT id, type, text, sign, thread_tweets, reply_to_tweet_id, reply_to_username,
                reply_to_text, source_type, status, posted_tweet_id, created_at, acted_at,
                CASE WHEN image_buffer IS NOT NULL THEN 1 ELSE 0 END as has_image
         FROM post_drafts WHERE status = ?
         ORDER BY created_at DESC LIMIT 100`,
      )
      .all(status);

    res.json({ drafts });
  } catch (err) {
    console.error('Admin drafts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// GET /admin/drafts/:id/image — Serve draft image
// ------------------------------------------------------------------
router.get('/drafts/:id/image', (req, res) => {
  try {
    const draft = db
      .prepare('SELECT image_buffer FROM post_drafts WHERE id = ?')
      .get(req.params.id) as { image_buffer: Buffer | null } | undefined;

    if (!draft?.image_buffer) {
      res.status(404).json({ error: 'No image found' });
      return;
    }

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(draft.image_buffer);
  } catch (err) {
    console.error('Admin draft image error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ------------------------------------------------------------------
// POST /admin/drafts/:id/post — Post a draft to Twitter
// ------------------------------------------------------------------
router.post('/drafts/:id/post', async (req, res) => {
  try {
    const draft = db
      .prepare(
        `SELECT id, type, text, sign, thread_tweets, reply_to_tweet_id,
                reply_to_username, image_buffer, source_type, status
         FROM post_drafts WHERE id = ?`,
      )
      .get(req.params.id) as {
      id: number;
      type: string;
      text: string;
      sign: string | null;
      thread_tweets: string | null;
      reply_to_tweet_id: string | null;
      reply_to_username: string | null;
      image_buffer: Buffer | null;
      source_type: string | null;
      status: string;
    } | undefined;

    if (!draft || draft.status !== 'pending') {
      res.status(404).json({ error: 'Draft not found or already acted on' });
      return;
    }

    let postedTweetId: string | undefined;

    if (draft.type === 'thread' && draft.thread_tweets) {
      const tweets = JSON.parse(draft.thread_tweets) as string[];
      const mediaId = draft.image_buffer ? await uploadMedia(draft.image_buffer) : undefined;
      const results = await postThread(tweets, mediaId);
      postedTweetId = results[0].id;
    } else if (draft.type === 'reply' && draft.reply_to_tweet_id) {
      const mentionPrefix = draft.reply_to_username ? `@${draft.reply_to_username} ` : '';
      const fullReply = draft.text.startsWith('@') ? draft.text : mentionPrefix + draft.text;
      const result = await replyToTweet(fullReply, draft.reply_to_tweet_id);
      postedTweetId = result.id;
    } else if (draft.type === 'quote_tweet' && draft.reply_to_tweet_id) {
      const result = await quoteTweet(draft.text, draft.reply_to_tweet_id);
      postedTweetId = result.id;
    } else {
      const mediaId = draft.image_buffer ? await uploadMedia(draft.image_buffer) : undefined;
      const result = await postToTwitter(draft.text, mediaId);
      postedTweetId = result.id;
    }

    db.prepare(
      `UPDATE post_drafts SET status = 'posted', posted_tweet_id = ?, acted_at = datetime('now') WHERE id = ?`,
    ).run(postedTweetId ?? null, draft.id);

    res.json({ success: true, tweetId: postedTweetId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Admin draft post error:', errorMsg);
    res.status(500).json({ error: errorMsg });
  }
});

// ------------------------------------------------------------------
// POST /admin/drafts/:id/skip — Skip a draft
// ------------------------------------------------------------------
router.post('/drafts/:id/skip', (req, res) => {
  try {
    const result = db
      .prepare(
        `UPDATE post_drafts SET status = 'skipped', acted_at = datetime('now') WHERE id = ? AND status = 'pending'`,
      )
      .run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Draft not found or already acted on' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin draft skip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
