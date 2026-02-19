import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import resend, { FROM_EMAIL } from '../lib/resend.js';
import { subscriberEmailHtml, ctaButton } from '../email/template.js';

const router = Router();

/* ----------------------------------------------------------------
   POST /email/subscribe
   ---------------------------------------------------------------- */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Upsert subscriber
    const id = uuid();
    db.prepare(
      'INSERT OR IGNORE INTO email_subscribers (id, email, source) VALUES (?, ?, ?)',
    ).run(id, email.toLowerCase().trim(), source ?? 'unknown');

    // Send newsletter welcome via Resend (non-blocking)
    const frontendUrl = process.env.FRONTEND_URL || 'https://stellera.co';
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: email,
        subject: "You're in! Your cosmic updates start now",
        html: subscriberEmailHtml(`
          <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Welcome, Stargazer!</h1>
          <p>You&rsquo;re now part of the Stellara community. Here&rsquo;s what&rsquo;s coming to your inbox:</p>
          <ul style="padding-left:20px;color:#1a1a2e;">
            <li style="margin-bottom:8px;"><strong>Daily horoscope insights</strong> for all 12 signs</li>
            <li style="margin-bottom:8px;"><strong>Major transit alerts</strong> &mdash; Mercury retrograde, full moons, eclipses</li>
            <li style="margin-bottom:8px;"><strong>Weekly cosmic energy forecasts</strong></li>
          </ul>
          <p>Your first update is already waiting &mdash; read today&rsquo;s horoscope now.</p>
          ${ctaButton("Read Today's Horoscope", `${frontendUrl}/horoscope`)}
          <p style="color:#666;font-size:13px;margin-top:20px;">Want personalized readings? <a href="${frontendUrl}/signup" style="color:#7C3AED;text-decoration:underline;">Create a free account</a> to unlock your birth chart and Big Three.</p>
        `, id, 'Daily horoscopes, transit alerts, and weekly forecasts delivered to your inbox'),
      })
      .catch((err) => console.error('Newsletter welcome email failed:', err));

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Email subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ----------------------------------------------------------------
   GET /email/unsubscribe?token=...
   Token is base64-encoded user ID
   ---------------------------------------------------------------- */
router.get('/unsubscribe', (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send('<h1>Invalid unsubscribe link</h1>');
      return;
    }

    const userId = Buffer.from(token, 'base64url').toString('utf-8');

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as { id: string } | undefined;
    if (!user) {
      res.status(404).send('<h1>User not found</h1>');
      return;
    }

    db.prepare('UPDATE users SET email_unsubscribed = 1 WHERE id = ?').run(userId);

    res.send(`
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 60px auto; text-align: center; color: #1a1a2e;">
        <h1 style="color: #7c3aed;">Unsubscribed</h1>
        <p>You&rsquo;ve been unsubscribed from Stellara emails.</p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Changed your mind? Just <a href="https://stellera.co/login" style="color: #7c3aed;">log in</a> and we&rsquo;ll re-subscribe you.
        </p>
      </div>
    `);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send('<h1>Something went wrong</h1>');
  }
});

/* ----------------------------------------------------------------
   GET /email/unsubscribe-subscriber?token=...
   Token is base64-encoded subscriber ID — removes from email_subscribers
   ---------------------------------------------------------------- */
router.get('/unsubscribe-subscriber', (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).send('<h1>Invalid unsubscribe link</h1>');
      return;
    }

    const subscriberId = Buffer.from(token, 'base64url').toString('utf-8');

    const result = db.prepare('DELETE FROM email_subscribers WHERE id = ?').run(subscriberId);
    if (result.changes === 0) {
      res.status(404).send('<h1>Subscriber not found</h1>');
      return;
    }

    res.send(`
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 60px auto; text-align: center; color: #1a1a2e;">
        <h1 style="color: #7c3aed;">Unsubscribed</h1>
        <p>You&rsquo;ve been unsubscribed from Stellara emails.</p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          We&rsquo;re sorry to see you go. You can always re-subscribe at <a href="https://stellera.co" style="color: #7c3aed;">stellera.co</a>.
        </p>
      </div>
    `);
  } catch (err) {
    console.error('Subscriber unsubscribe error:', err);
    res.status(500).send('<h1>Something went wrong</h1>');
  }
});

export default router;
