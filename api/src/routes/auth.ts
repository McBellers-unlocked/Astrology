import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import resend, { FROM_EMAIL } from '../lib/resend.js';

const router = Router();

/* ----------------------------------------------------------------
   POST /auth/signup
   ---------------------------------------------------------------- */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const id = uuid();
    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
    ).run(id, email.toLowerCase().trim(), passwordHash, name.trim());

    const token = signToken({ userId: id, email: email.toLowerCase().trim() });

    // Send welcome email via Resend (non-blocking)
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to Stellara — your cosmic journey begins',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
            <h1 style="color: #7c3aed;">Welcome to Stellara, ${name}!</h1>
            <p>Your cosmic journey begins now. Here&rsquo;s what you can do:</p>
            <ul>
              <li><strong>Generate your birth chart</strong> &mdash; discover your Big Three (Sun, Moon &amp; Rising)</li>
              <li><strong>Read your daily horoscope</strong> &mdash; updated every morning</li>
              <li><strong>Check compatibility</strong> &mdash; explore chemistry with any sign</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="https://stellera.co/birth-chart" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Get Your Free Birth Chart</a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 32px;">Your stars, decoded. &mdash; Stellara</p>
          </div>
        `,
      })
      .catch((err) => console.error('Welcome email failed:', err));

    res.status(201).json({
      token,
      user: { id, email, name, subscriptionTier: 'free', subscriptionStatus: 'none' },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ----------------------------------------------------------------
   POST /auth/login
   ---------------------------------------------------------------- */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db
      .prepare(
        'SELECT id, email, password_hash, name, subscription_tier, subscription_status FROM users WHERE email = ?',
      )
      .get(email.toLowerCase().trim()) as
      | { id: string; email: string; password_hash: string; name: string; subscription_tier: string; subscription_status: string }
      | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: user.subscription_status,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ----------------------------------------------------------------
   GET /auth/me
   ---------------------------------------------------------------- */
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db
      .prepare(
        `SELECT id, email, name, subscription_tier, subscription_status, subscription_end_date,
                birth_date, birth_time, birth_location, sun_sign, moon_sign, rising_sign
         FROM users WHERE id = ?`,
      )
      .get(req.user!.userId) as Record<string, string | null> | undefined;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: user.subscription_status,
        subscriptionEndDate: user.subscription_end_date,
        birthDate: user.birth_date,
        birthTime: user.birth_time,
        birthLocation: user.birth_location,
        sunSign: user.sun_sign,
        moonSign: user.moon_sign,
        risingSign: user.rising_sign,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
