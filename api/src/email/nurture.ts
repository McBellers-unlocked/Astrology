/**
 * Email nurture sequence cron script.
 *
 * Runs once per hour. For each user created in the last 15 days,
 * checks which nurture emails are due and haven't been sent yet,
 * then sends them via Resend.
 *
 * Crontab entry:
 *   0 * * * * cd ~/Astrology/api && npx tsx src/email/nurture.ts >> ~/email-nurture.log 2>&1
 */

import db from '../db.js';
import resend, { FROM_EMAIL } from '../lib/resend.js';

// ---- Types ----

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  subscription_tier: string;
  subscription_status: string;
  email_unsubscribed: number;
}

interface NurtureEmail {
  key: string;
  delayDays: number;
  shouldSend: (user: User) => boolean;
  subject: (user: User) => string;
  html: (user: User) => string;
}

// ---- Helpers ----

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hasBigThree(user: User): boolean {
  return !!(user.sun_sign && user.moon_sign && user.rising_sign);
}

function isPremium(user: User): boolean {
  return user.subscription_status === 'active' || user.subscription_status === 'trialing';
}

const API_URL = process.env.FRONTEND_URL ?? 'https://stellera.co';

function unsubscribeUrl(userId: string): string {
  const token = Buffer.from(userId).toString('base64url');
  const apiUrl = process.env.API_URL ?? 'https://api.stellera.co';
  return `${apiUrl}/email/unsubscribe?token=${token}`;
}

function emailFooter(userId: string): string {
  return `
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />
    <p style="color: #999; font-size: 11px; text-align: center;">
      Your stars, decoded. &mdash; Stellara<br />
      <a href="${unsubscribeUrl(userId)}" style="color: #999;">Unsubscribe</a>
    </p>
  `;
}

function emailWrapper(content: string, userId: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
      ${content}
      ${emailFooter(userId)}
    </div>
  `;
}

function ctaButton(text: string, href: string): string {
  return `
    <p style="margin-top: 24px;">
      <a href="${href}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${text}</a>
    </p>
  `;
}

// ---- The 7-email nurture sequence ----

const SEQUENCE: NurtureEmail[] = [
  // Day 1: Activation — get them to generate their birth chart
  {
    key: 'nurture_1_birth_chart',
    delayDays: 1,
    shouldSend: (user) => !user.sun_sign,
    subject: (user) => `Your birth chart is waiting, ${user.name}`,
    html: (user) => emailWrapper(`
      <h1 style="color: #7c3aed;">Your Cosmic Blueprint Awaits</h1>
      <p>Hi ${user.name},</p>
      <p>Did you know your birth chart reveals far more than just your Sun sign? It maps the exact position of every planet at the moment you were born &mdash; your cosmic fingerprint.</p>
      <p>It takes just 30 seconds to generate yours. All you need is your birth date, time, and location.</p>
      ${ctaButton('Generate Your Birth Chart', `${API_URL}/birth-chart`)}
      <p style="color: #666; font-size: 13px; margin-top: 24px;">Your Sun sign is just the beginning. Your Moon and Rising signs reveal your emotional world and how others see you.</p>
    `, user.id),
  },

  // Day 3: Engagement — explain their Big Three (or nudge again)
  {
    key: 'nurture_2_big_three',
    delayDays: 3,
    shouldSend: () => true,
    subject: (user) => hasBigThree(user)
      ? `${capitalize(user.sun_sign!)} Sun, ${capitalize(user.moon_sign!)} Moon, ${capitalize(user.rising_sign!)} Rising — here's what it means`
      : `Discover your cosmic identity, ${user.name}`,
    html: (user) => hasBigThree(user)
      ? emailWrapper(`
        <h1 style="color: #7c3aed;">Your Big Three, Explained</h1>
        <p>Hi ${user.name}, here&rsquo;s what your placements reveal:</p>
        <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="margin: 0 0 12px;"><strong style="color: #7c3aed;">&#9788; ${capitalize(user.sun_sign!)} Sun</strong> &mdash; Your core identity. This is who you are at your essence &mdash; your ego, your vitality, and the traits you grow into throughout your life.</p>
          <p style="margin: 0 0 12px;"><strong style="color: #7c3aed;">&#9789; ${capitalize(user.moon_sign!)} Moon</strong> &mdash; Your emotional world. This governs how you feel, what you need for security, and how you process your deepest emotions.</p>
          <p style="margin: 0;"><strong style="color: #7c3aed;">&#8599; ${capitalize(user.rising_sign!)} Rising</strong> &mdash; Your outer self. This is the mask you wear, your first impression, and how the world perceives you.</p>
        </div>
        <p>Together, these three placements paint a far richer picture than your Sun sign alone.</p>
        ${ctaButton('View Your Full Chart', `${API_URL}/dashboard`)}
      `, user.id)
      : emailWrapper(`
        <h1 style="color: #7c3aed;">Your Cosmic Identity Is Waiting</h1>
        <p>Hi ${user.name},</p>
        <p>Everyone knows their Sun sign &mdash; but your <strong>Moon sign</strong> reveals your emotional core, and your <strong>Rising sign</strong> shapes how the world sees you.</p>
        <p>Together, your Big Three form your cosmic identity. Generate your birth chart to discover yours:</p>
        ${ctaButton('Generate Your Birth Chart', `${API_URL}/birth-chart`)}
      `, user.id),
  },

  // Day 5: Engagement — establish the daily horoscope habit
  {
    key: 'nurture_3_daily_horoscope',
    delayDays: 5,
    shouldSend: () => true,
    subject: (user) => user.sun_sign
      ? `Your ${capitalize(user.sun_sign)} horoscope is live today`
      : 'Your daily horoscope is ready',
    html: (user) => {
      const signPath = user.sun_sign ? `/horoscope/${user.sun_sign}` : '/horoscope';
      const signName = user.sun_sign ? capitalize(user.sun_sign) : 'your sign';
      return emailWrapper(`
        <h1 style="color: #7c3aed;">Today&rsquo;s Cosmic Forecast</h1>
        <p>Hi ${user.name},</p>
        <p>Your daily ${signName} horoscope has been updated this morning. It covers:</p>
        <ul>
          <li><strong>Overall energy</strong> &mdash; what the stars have in store today</li>
          <li><strong>Love &amp; relationships</strong> &mdash; cosmic chemistry insights</li>
          <li><strong>Career &amp; money</strong> &mdash; your professional outlook</li>
          <li><strong>Wellness</strong> &mdash; mind, body, and spirit guidance</li>
        </ul>
        <p>Make it a morning ritual &mdash; check in with the stars over your coffee.</p>
        ${ctaButton("Read Today's Horoscope", `${API_URL}${signPath}`)}
      `, user.id);
    },
  },

  // Day 7: Engagement — showcase compatibility
  {
    key: 'nurture_4_compatibility',
    delayDays: 7,
    shouldSend: () => true,
    subject: (user) => `Who are you most compatible with, ${user.name}?`,
    html: (user) => {
      const compatIntro = user.sun_sign
        ? `As a ${capitalize(user.sun_sign)}, you have natural chemistry with some signs and cosmic tension with others.`
        : 'Every zodiac sign has natural allies and challenging matches.';
      return emailWrapper(`
        <h1 style="color: #7c3aed;">Cosmic Compatibility</h1>
        <p>Hi ${user.name},</p>
        <p>${compatIntro}</p>
        <p>Our compatibility tool analyzes the elemental and modal dynamics between any two signs &mdash; revealing where you click, where you clash, and how to make it work.</p>
        <p>Try it with your partner, best friend, boss, or anyone you&rsquo;re curious about.</p>
        ${ctaButton('Check Your Compatibility', `${API_URL}/compatibility`)}
      `, user.id);
    },
  },

  // Day 9: Conversion — tease Moon/Rising (premium feature)
  {
    key: 'nurture_5_moon_rising_tease',
    delayDays: 9,
    shouldSend: (user) => !isPremium(user),
    subject: () => "You're only reading 1/3 of your horoscope",
    html: (user) => emailWrapper(`
      <h1 style="color: #7c3aed;">There&rsquo;s More to Your Horoscope</h1>
      <p>Hi ${user.name},</p>
      <p>Your Sun sign horoscope? That&rsquo;s just the surface &mdash; about a third of the picture.</p>
      <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>&#9788; Sun horoscope</strong> &mdash; Your public life and identity <span style="color: #22c55e;">&#10003; Free</span></p>
        <p style="margin: 0 0 8px;"><strong>&#9789; Moon horoscope</strong> &mdash; Your emotional landscape and inner needs <span style="color: #7c3aed;">&#9733; Premium</span></p>
        <p style="margin: 0;"><strong>&#8599; Rising horoscope</strong> &mdash; How opportunities and challenges appear to you <span style="color: #7c3aed;">&#9733; Premium</span></p>
      </div>
      <p>Astrologers recommend reading all three for the most accurate daily guidance. Stellara Premium unlocks your complete picture.</p>
      ${ctaButton('Unlock Full Readings', `${API_URL}/pricing`)}
    `, user.id),
  },

  // Day 12: Conversion — free trial CTA
  {
    key: 'nurture_6_trial_offer',
    delayDays: 12,
    shouldSend: (user) => !isPremium(user),
    subject: () => '7 days free — unlock your full cosmic profile',
    html: (user) => emailWrapper(`
      <h1 style="color: #7c3aed;">Try Stellara Premium Free for 7 Days</h1>
      <p>Hi ${user.name},</p>
      <p>We&rsquo;d love for you to experience the full depth of Stellara. Start a free 7-day trial and get:</p>
      <ul>
        <li><strong>Moon &amp; Rising horoscopes</strong> &mdash; the complete daily picture</li>
        <li><strong>Detailed birth chart analysis</strong> &mdash; every planet, house, and aspect explained</li>
        <li><strong>Full compatibility reports</strong> &mdash; beyond Sun sign matching</li>
        <li><strong>Priority access</strong> &mdash; new features launch for Premium members first</li>
      </ul>
      <p>No commitment required. Cancel anytime during your trial &mdash; you won&rsquo;t be charged.</p>
      ${ctaButton('Start Your Free Trial', `${API_URL}/pricing`)}
      <p style="color: #666; font-size: 13px; margin-top: 16px;">Plans start at $9.99/month after trial.</p>
    `, user.id),
  },

  // Day 14: Conversion — final nudge with urgency
  {
    key: 'nurture_7_last_chance',
    delayDays: 14,
    shouldSend: (user) => !isPremium(user),
    subject: (user) => `Last chance: your stars have something to say, ${user.name}`,
    html: (user) => emailWrapper(`
      <h1 style="color: #7c3aed;">Your Full Cosmic Story Is Waiting</h1>
      <p>Hi ${user.name},</p>
      <p>Over the past two weeks, you&rsquo;ve started exploring your cosmic blueprint with Stellara. But there&rsquo;s so much more the stars have to tell you.</p>
      ${user.sun_sign ? `<p>As a <strong>${capitalize(user.sun_sign)}</strong>, you&rsquo;ve been reading your Sun sign horoscope. But your Moon and Rising signs add crucial context that can change the entire reading.</p>` : ''}
      <p>Join thousands of stargazers who&rsquo;ve unlocked their full cosmic profile:</p>
      <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <p style="margin: 0; font-style: italic; color: #666;">&ldquo;Reading all three horoscopes changed my mornings. It&rsquo;s like the difference between a weather forecast and a detailed climate report.&rdquo;</p>
      </div>
      ${ctaButton('See What You\'re Missing', `${API_URL}/pricing`)}
    `, user.id),
  },
];

// ---- Prepared statements ----

const findSentEmails = db.prepare(
  'SELECT email_key FROM email_sequence_log WHERE user_id = ?',
);

const recordSent = db.prepare(
  'INSERT OR IGNORE INTO email_sequence_log (user_id, email_key) VALUES (?, ?)',
);

// ---- Subscriber types & sequence ----

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

interface SubscriberEmail {
  key: string;
  delayDays: number;
  subject: string;
  html: (sub: Subscriber) => string;
}

function subscriberEmailFooter(subscriberId: string): string {
  const token = Buffer.from(subscriberId).toString('base64url');
  const apiUrl = process.env.API_URL ?? 'https://api.stellera.co';
  return `
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />
    <p style="color: #999; font-size: 11px; text-align: center;">
      Your stars, decoded. &mdash; Stellara<br />
      <a href="${apiUrl}/email/unsubscribe-subscriber?token=${token}" style="color: #999;">Unsubscribe</a>
    </p>
  `;
}

function subscriberWrapper(content: string, subscriberId: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
      ${content}
      ${subscriberEmailFooter(subscriberId)}
    </div>
  `;
}

const SUBSCRIBER_SEQUENCE: SubscriberEmail[] = [
  // Day 0: Welcome — missed the real-time welcome email
  {
    key: 'sub_nurture_0_welcome',
    delayDays: 0,
    subject: "Welcome to Stellara — your cosmic journey begins",
    html: (sub) => subscriberWrapper(`
      <h1 style="color: #7c3aed;">Welcome, stargazer!</h1>
      <p>You&rsquo;re now subscribed to Stellara&rsquo;s cosmic updates. Here&rsquo;s what to expect:</p>
      <ul>
        <li><strong>Daily horoscope insights</strong> for all 12 signs</li>
        <li><strong>Major transit alerts</strong> &mdash; Mercury retrograde, full moons, eclipses</li>
        <li><strong>Weekly cosmic energy forecasts</strong></li>
      </ul>
      <p>Start by reading today&rsquo;s horoscope &mdash; tap your sign and see what the stars have in store.</p>
      ${ctaButton("Read Today's Horoscope", `${API_URL}/horoscope`)}
      <p style="color: #666; font-size: 13px; margin-top: 24px;">Your stars, decoded. &mdash; Stellara</p>
    `, sub.id),
  },

  // Day 3: Drive to site — daily horoscope
  {
    key: 'sub_nurture_1_horoscope',
    delayDays: 3,
    subject: 'Your daily horoscope is live — what do the stars say?',
    html: (sub) => subscriberWrapper(`
      <h1 style="color: #7c3aed;">Today&rsquo;s Cosmic Forecast Is Ready</h1>
      <p>Hey there!</p>
      <p>Your daily horoscope has been updated. Stellara covers all 12 signs with personalized insights for:</p>
      <ul>
        <li><strong>Overall energy</strong> &mdash; what the stars have in store today</li>
        <li><strong>Love &amp; relationships</strong> &mdash; cosmic chemistry insights</li>
        <li><strong>Career &amp; money</strong> &mdash; your professional outlook</li>
        <li><strong>Wellness</strong> &mdash; mind, body, and spirit guidance</li>
      </ul>
      <p>Make it a morning ritual &mdash; check in with the stars over your coffee.</p>
      ${ctaButton("Read Today's Horoscope", `${API_URL}/horoscope`)}
    `, sub.id),
  },

  // Day 7: Convert to account — birth chart
  {
    key: 'sub_nurture_2_birth_chart',
    delayDays: 7,
    subject: 'Your cosmic blueprint — free birth chart inside',
    html: (sub) => subscriberWrapper(`
      <h1 style="color: #7c3aed;">Unlock Your Cosmic Blueprint</h1>
      <p>Hey there!</p>
      <p>Did you know your zodiac sign is just the beginning? Your birth chart maps every planet&rsquo;s position at the exact moment you were born &mdash; revealing your emotional world, how others see you, and so much more.</p>
      <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <p style="margin: 0 0 12px;"><strong style="color: #7c3aed;">&#9788; Sun Sign</strong> &mdash; Your core identity</p>
        <p style="margin: 0 0 12px;"><strong style="color: #7c3aed;">&#9789; Moon Sign</strong> &mdash; Your emotional landscape</p>
        <p style="margin: 0;"><strong style="color: #7c3aed;">&#8599; Rising Sign</strong> &mdash; How the world sees you</p>
      </div>
      <p>Create a free Stellara account and generate your birth chart in 30 seconds &mdash; all you need is your birth date, time, and location.</p>
      ${ctaButton('Generate Your Free Birth Chart', `${API_URL}/birth-chart`)}
    `, sub.id),
  },

  // Day 14: Re-engagement — compatibility
  {
    key: 'sub_nurture_3_compatibility',
    delayDays: 14,
    subject: 'Who are you cosmically compatible with?',
    html: (sub) => subscriberWrapper(`
      <h1 style="color: #7c3aed;">Cosmic Compatibility</h1>
      <p>Hey there!</p>
      <p>Ever wonder why you click with some people and clash with others? The stars might have the answer.</p>
      <p>Stellara&rsquo;s compatibility tool analyzes the elemental and modal dynamics between any two zodiac signs &mdash; revealing where you click, where you clash, and how to make it work.</p>
      <p>Try it with your partner, best friend, coworker, or anyone you&rsquo;re curious about.</p>
      ${ctaButton('Check Your Compatibility', `${API_URL}/compatibility`)}
      <p style="color: #666; font-size: 13px; margin-top: 24px;">For even deeper insights, create a free account and get your personalized birth chart included.</p>
    `, sub.id),
  },
];

const findSubSentEmails = db.prepare(
  'SELECT email_key FROM subscriber_sequence_log WHERE subscriber_id = ?',
);

const recordSubSent = db.prepare(
  'INSERT OR IGNORE INTO subscriber_sequence_log (subscriber_id, email_key) VALUES (?, ?)',
);

// ---- Main logic ----

async function runUserNurture(now: Date): Promise<{ sent: number; skipped: number; errors: number }> {
  const users = db.prepare(`
    SELECT id, email, name, created_at,
           sun_sign, moon_sign, rising_sign,
           subscription_tier, subscription_status,
           email_unsubscribed
    FROM users
    WHERE created_at >= datetime('now', '-15 days')
    ORDER BY created_at ASC
  `).all() as User[];

  console.log(`  Found ${users.length} registered users in nurture window`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    if (user.email_unsubscribed) continue;

    const sentRows = findSentEmails.all(user.id) as { email_key: string }[];
    const sentKeys = new Set(sentRows.map((r) => r.email_key));
    const userCreated = new Date(user.created_at + 'Z');

    for (const email of SEQUENCE) {
      if (sentKeys.has(email.key)) continue;

      const sendAfter = new Date(userCreated.getTime() + email.delayDays * 24 * 60 * 60 * 1000);
      if (now < sendAfter) continue;

      if (!email.shouldSend(user)) {
        recordSent.run(user.id, email.key);
        skipped++;
        console.log(`  [SKIP] ${email.key} -> ${user.email} (condition not met)`);
        continue;
      }

      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: email.subject(user),
          html: email.html(user),
        });

        if (error) {
          console.error(`  [FAIL] ${email.key} -> ${user.email}: ${JSON.stringify(error)}`);
          errors++;
        } else {
          recordSent.run(user.id, email.key);
          sent++;
          console.log(`  [SENT] ${email.key} -> ${user.email} (${data?.id})`);
        }
      } catch (err) {
        console.error(`  [ERROR] ${email.key} -> ${user.email}:`, err);
        errors++;
      }

      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return { sent, skipped, errors };
}

async function runSubscriberNurture(now: Date): Promise<{ sent: number; skipped: number; errors: number }> {
  // Get subscribers from the last 15 days who are NOT also registered users
  const subscribers = db.prepare(`
    SELECT s.id, s.email, s.created_at
    FROM email_subscribers s
    LEFT JOIN users u ON LOWER(s.email) = LOWER(u.email)
    WHERE s.created_at >= datetime('now', '-15 days')
      AND u.id IS NULL
    ORDER BY s.created_at ASC
  `).all() as Subscriber[];

  console.log(`  Found ${subscribers.length} email-only subscribers in nurture window`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const sub of subscribers) {
    const sentRows = findSubSentEmails.all(sub.id) as { email_key: string }[];
    const sentKeys = new Set(sentRows.map((r) => r.email_key));
    const subCreated = new Date(sub.created_at + 'Z');

    for (const email of SUBSCRIBER_SEQUENCE) {
      if (sentKeys.has(email.key)) continue;

      const sendAfter = new Date(subCreated.getTime() + email.delayDays * 24 * 60 * 60 * 1000);
      if (now < sendAfter) continue;

      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: sub.email,
          subject: email.subject,
          html: email.html(sub),
        });

        if (error) {
          console.error(`  [FAIL] ${email.key} -> ${sub.email}: ${JSON.stringify(error)}`);
          errors++;
        } else {
          recordSubSent.run(sub.id, email.key);
          sent++;
          console.log(`  [SENT] ${email.key} -> ${sub.email} (${data?.id})`);
        }
      } catch (err) {
        console.error(`  [ERROR] ${email.key} -> ${sub.email}:`, err);
        errors++;
      }

      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return { sent, skipped, errors };
}

async function main() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Nurture cron starting...`);

  // Run both nurture sequences
  console.log('\n--- Registered User Nurture ---');
  const userStats = await runUserNurture(now);

  console.log('\n--- Email Subscriber Nurture ---');
  const subStats = await runSubscriberNurture(now);

  const totalSent = userStats.sent + subStats.sent;
  const totalSkipped = userStats.skipped + subStats.skipped;
  const totalErrors = userStats.errors + subStats.errors;

  console.log(`\n[${now.toISOString()}] Done. Sent: ${totalSent}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
}

main().catch((err) => {
  console.error('Nurture cron fatal error:', err);
  process.exit(1);
});
