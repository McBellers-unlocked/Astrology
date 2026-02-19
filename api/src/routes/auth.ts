import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import resend, { FROM_EMAIL } from '../lib/resend.js';
import { userEmailHtml, transactionalEmailHtml, ctaButton } from '../email/template.js';

const router = Router();

/* ----------------------------------------------------------------
   POST /auth/signup
   ---------------------------------------------------------------- */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, utm_source, utm_medium, utm_campaign } = req.body;

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
      'INSERT INTO users (id, email, password_hash, name, utm_source, utm_medium, utm_campaign) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(id, email.toLowerCase().trim(), passwordHash, name.trim(), utm_source || null, utm_medium || null, utm_campaign || null);

    const token = signToken({ userId: id, email: email.toLowerCase().trim() });

    // Send welcome email via Resend (non-blocking IIFE with proper error checking)
    const frontendBase = process.env.FRONTEND_URL || 'https://stellera.co';
    (async () => {
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Welcome to Stellara, ${name} \u2014 your cosmic journey begins`,
          html: userEmailHtml(`
            <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Welcome to Stellara!</h1>
            <p>Hi ${name}, your cosmic journey starts now. Here are three things you can do right away:</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #ede9fe;">
                  <strong style="color:#7C3AED;">&#9788; Map your birth chart</strong><br />
                  <span style="color:#666;font-size:14px;">Discover your Big Three (Sun, Moon &amp; Rising) in 30 seconds</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #ede9fe;">
                  <strong style="color:#7C3AED;">&#9734; Read your daily horoscope</strong><br />
                  <span style="color:#666;font-size:14px;">Updated every morning with love, career, and wellness insights</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;">
                  <strong style="color:#7C3AED;">&#10084; Check your compatibility</strong><br />
                  <span style="color:#666;font-size:14px;">Explore the cosmic chemistry between any two signs</span>
                </td>
              </tr>
            </table>
            <p>Start with your birth chart &mdash; it&rsquo;s the foundation of everything else.</p>
            ${ctaButton('Map Your Birth Chart', `${frontendBase}/birth-chart`)}
            <p style="color:#666;font-size:13px;margin-top:20px;">Join over 14,000 stargazers who&rsquo;ve mapped their cosmic blueprint.</p>
          `, id, 'Your birth chart, daily horoscope, and compatibility tools are ready'),
        });
        if (error) {
          console.error('Welcome email Resend error:', JSON.stringify(error));
        } else {
          console.log('Welcome email sent:', data?.id);
        }
      } catch (err) {
        console.error('Welcome email exception:', err);
      }
    })();

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

/* ----------------------------------------------------------------
   PUT /auth/profile
   Update user's birth chart data and Big Three
   ---------------------------------------------------------------- */
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { birthDate, birthTime, birthLocation, sunSign, moonSign, risingSign } = req.body;

    if (!birthDate) {
      res.status(400).json({ error: 'Birth date is required' });
      return;
    }

    db.prepare(
      `UPDATE users SET
        birth_date = ?, birth_time = ?, birth_location = ?,
        sun_sign = ?, moon_sign = ?, rising_sign = ?
       WHERE id = ?`,
    ).run(
      birthDate,
      birthTime || null,
      birthLocation || null,
      sunSign || null,
      moonSign || null,
      risingSign || null,
      req.user!.userId,
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ----------------------------------------------------------------
   POST /auth/forgot-password
   Send a password reset link via email
   ---------------------------------------------------------------- */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = db
      .prepare('SELECT id, name FROM users WHERE email = ?')
      .get(email.toLowerCase().trim()) as { id: string; name: string } | undefined;

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ success: true });
      return;
    }

    // Generate a reset token (random UUID) with 1-hour expiry
    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Remove any existing reset tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);

    // Insert new token
    db.prepare(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    ).run(uuid(), user.id, token, expiresAt);

    // Send reset email
    const frontendUrl = process.env.FRONTEND_URL || 'https://stellera.co';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    resend.emails
      .send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset your Stellara password',
        html: transactionalEmailHtml(`
          <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Reset Your Password</h1>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your Stellara password. Click the button below to choose a new one:</p>
          ${ctaButton('Reset My Password', resetUrl)}
          <p style="color:#666;font-size:13px;margin-top:24px;">This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your account is secure.</p>
        `, 'Click the button below to set a new password'),
      })
      .catch((err) => console.error('Reset email failed:', err));

    res.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ----------------------------------------------------------------
   POST /auth/reset-password
   Validate token and set new password
   ---------------------------------------------------------------- */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const resetRecord = db
      .prepare('SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?')
      .get(token) as { user_id: string; expires_at: string } | undefined;

    if (!resetRecord) {
      res.status(400).json({ error: 'Invalid or expired reset link' });
      return;
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      // Token expired — clean up
      db.prepare('DELETE FROM password_reset_tokens WHERE token = ?').run(token);
      res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      return;
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, resetRecord.user_id);

    // Remove used token
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(resetRecord.user_id);

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
