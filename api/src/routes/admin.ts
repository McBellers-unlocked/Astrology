import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import db from '../db.js';
import { verifyToken } from '../lib/jwt.js';

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

export default router;
