import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import resend, { FROM_EMAIL } from '../lib/resend.js';

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
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: email,
        subject: "You're in! Your daily horoscope starts tomorrow",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
            <h1 style="color: #7c3aed;">Welcome, stargazer!</h1>
            <p>You&rsquo;re now subscribed to Stellara&rsquo;s cosmic updates. Here&rsquo;s what to expect:</p>
            <ul>
              <li>Daily horoscope insights in your inbox</li>
              <li>Major transit alerts (Mercury retrograde, full moons, eclipses)</li>
              <li>Weekly cosmic energy forecasts</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="https://stellara.co/horoscope" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Read Today&rsquo;s Horoscope</a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 32px;">Your stars, decoded. &mdash; Stellara</p>
          </div>
        `,
      })
      .catch((err) => console.error('Newsletter welcome email failed:', err));

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Email subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
