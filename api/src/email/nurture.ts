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
import {
  userEmailHtml,
  subscriberEmailHtml,
  ctaButton,
  infoBox,
  goldDivider,
  socialProofBlock,
} from './template.js';

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

// ---- The 7-email nurture sequence ----

const SEQUENCE: NurtureEmail[] = [
  // Day 1: Activation — get them to generate their birth chart
  {
    key: 'nurture_1_birth_chart',
    delayDays: 1,
    shouldSend: (user) => !user.sun_sign,
    subject: (user) => `Your cosmic blueprint is ready, ${user.name}`,
    html: (user) => userEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">The Stars Aligned for You</h1>
      <p>Hi ${user.name},</p>
      <p>The stars aligned in a unique pattern the moment you were born &mdash; a cosmic fingerprint that belongs to no one else. Your birth chart maps the exact position of every planet at that moment, revealing who you truly are beneath the surface.</p>
      <p>Here&rsquo;s the thing most people don&rsquo;t realize: <strong>your Sun sign is only about a third of the picture.</strong></p>
      ${infoBox(`
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9788; Sun Sign</strong> &mdash; Your core identity and life path</p>
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9789; Moon Sign</strong> &mdash; Your emotional world and deepest needs</p>
        <p style="margin:0;"><strong style="color:#7C3AED;">&#8599; Rising Sign</strong> &mdash; The mask you wear and how others perceive you</p>
      `)}
      <p>It takes just 30 seconds. All you need is your birth date, time, and location.</p>
      ${ctaButton('Map Your Birth Chart', `${API_URL}/birth-chart`)}
      <p style="color:#666;font-size:13px;margin-top:20px;">Over 14,000 stargazers have already discovered their cosmic blueprint.</p>
    `, user.id, 'It takes 30 seconds to map the stars at your birth'),
  },

  // Day 3: Engagement — explain their Big Three (or nudge again)
  {
    key: 'nurture_2_big_three',
    delayDays: 3,
    shouldSend: () => true,
    subject: (user) => hasBigThree(user)
      ? `${capitalize(user.sun_sign!)} Sun, ${capitalize(user.moon_sign!)} Moon, ${capitalize(user.rising_sign!)} Rising \u2014 what your Big Three reveal`
      : `The 3 placements that define you, ${user.name}`,
    html: (user) => hasBigThree(user)
      ? userEmailHtml(`
        <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Your Big Three, Decoded</h1>
        <p>Hi ${user.name},</p>
        <p>Your particular combination of <strong>${capitalize(user.sun_sign!)} Sun</strong>, <strong>${capitalize(user.moon_sign!)} Moon</strong>, and <strong>${capitalize(user.rising_sign!)} Rising</strong> is rare and revealing. Here&rsquo;s what each placement says about you:</p>
        ${infoBox(`
          <p style="margin:0 0 14px;"><strong style="color:#7C3AED;">&#9788; ${capitalize(user.sun_sign!)} Sun</strong> &mdash; Your core identity. This is who you are at your essence &mdash; your ego, vitality, and the traits you grow into throughout your life. ${capitalize(user.sun_sign!)} energy shapes your fundamental approach to the world.</p>
          <p style="margin:0 0 14px;"><strong style="color:#7C3AED;">&#9789; ${capitalize(user.moon_sign!)} Moon</strong> &mdash; Your emotional world. This governs how you feel, what you need for security, and how you process your deepest emotions. Your ${capitalize(user.moon_sign!)} Moon is why you react the way you do when things get intense.</p>
          <p style="margin:0;"><strong style="color:#7C3AED;">&#8599; ${capitalize(user.rising_sign!)} Rising</strong> &mdash; Your outer self. This is your first impression, your social mask, and the lens through which opportunities find you. People meet your ${capitalize(user.rising_sign!)} Rising before they meet your Sun.</p>
        `)}
        <p>This is what professional astrologers read first. Your full chart goes even deeper &mdash; with planetary aspects, house placements, and transit patterns that paint the complete picture.</p>
        ${ctaButton('Explore Your Full Chart', `${API_URL}/dashboard`)}
      `, user.id, 'Your cosmic identity decoded in 60 seconds')
      : userEmailHtml(`
        <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">There&rsquo;s More to You Than Your Zodiac Sign</h1>
        <p>Hi ${user.name},</p>
        <p>Most people know their Sun sign. Few know the two other placements that matter just as much &mdash; and in some ways, even more.</p>
        ${infoBox(`
          <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9788; Sun Sign</strong> &mdash; Your core identity and life path (the one everyone knows)</p>
          <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9789; Moon Sign</strong> &mdash; Why you react the way you do emotionally</p>
          <p style="margin:0;"><strong style="color:#7C3AED;">&#8599; Rising Sign</strong> &mdash; How others perceive you before they really know you</p>
        `)}
        <p>Together, these three placements form your <strong>Big Three</strong> &mdash; the foundation of your cosmic identity. Knowing them changes how you read your horoscope, understand your relationships, and navigate your life.</p>
        <p>Generate your birth chart to discover yours. It takes 30 seconds.</p>
        ${ctaButton('Discover Your Big Three', `${API_URL}/birth-chart`)}
        <p style="color:#666;font-size:13px;margin-top:20px;">Over 14,000 people have already discovered their Big Three with Stellara.</p>
      `, user.id, 'Your Sun sign is just the beginning'),
  },

  // Day 5: Engagement — establish the daily horoscope habit
  {
    key: 'nurture_3_daily_horoscope',
    delayDays: 5,
    shouldSend: () => true,
    subject: (user) => user.sun_sign
      ? `${capitalize(user.sun_sign)}, today the stars say...`
      : 'Your daily cosmic forecast is live',
    html: (user) => {
      const signPath = user.sun_sign ? `/horoscope/${user.sun_sign}` : '/horoscope';
      const signName = user.sun_sign ? capitalize(user.sun_sign) : 'your sign';
      return userEmailHtml(`
        <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Today&rsquo;s Cosmic Forecast</h1>
        <p>Hi ${user.name},</p>
        <p>Every day, the planets shift &mdash; and so does the energy around you. Your ${signName} horoscope has been updated with today&rsquo;s cosmic weather.</p>
        ${infoBox(`
          <p style="margin:0 0 8px;"><strong>&#9734; Overall energy</strong> &mdash; what the stars have in store today</p>
          <p style="margin:0 0 8px;"><strong>&#10084; Love &amp; relationships</strong> &mdash; cosmic chemistry insights</p>
          <p style="margin:0 0 8px;"><strong>&#9733; Career &amp; money</strong> &mdash; your professional outlook</p>
          <p style="margin:0;"><strong>&#10023; Wellness</strong> &mdash; mind, body, and spirit guidance</p>
        `)}
        <p>Think of it as your cosmic weather forecast &mdash; a 2-minute morning ritual that helps you align with the day&rsquo;s energy before you step out the door.</p>
        ${ctaButton("Read Today's Forecast", `${API_URL}${signPath}`)}
        <p style="color:#666;font-size:13px;margin-top:20px;">Thousands of Stellara readers check their horoscope before their first cup of coffee.</p>
      `, user.id, `Love, career, wellness \u2014 what the stars have in store today`);
    },
  },

  // Day 7: Engagement — showcase compatibility
  {
    key: 'nurture_4_compatibility',
    delayDays: 7,
    shouldSend: () => true,
    subject: (user) => `The cosmic chemistry between you and...anyone, ${user.name}`,
    html: (user) => {
      const compatIntro = user.sun_sign
        ? `As a ${capitalize(user.sun_sign)}, you have natural fire with some signs and fascinating tension with others. The elements (fire, earth, air, water) and modes (cardinal, fixed, mutable) between your signs create a unique chemistry.`
        : 'Every zodiac pairing has its own unique chemistry. The elements and modes between two signs create patterns of attraction, friction, and growth.';
      return userEmailHtml(`
        <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Cosmic Chemistry</h1>
        <p>Hi ${user.name},</p>
        <p>Ever met someone and felt instant chemistry? Or immediate friction with no logical explanation? The stars might have the answer.</p>
        <p>${compatIntro}</p>
        <p>Stellara&rsquo;s compatibility tool breaks down any two signs &mdash; revealing where you click, where you clash, and how to make it work. Try it with:</p>
        <ul style="padding-left:20px;color:#1a1a2e;">
          <li style="margin-bottom:6px;">Your partner or crush</li>
          <li style="margin-bottom:6px;">Your best friend</li>
          <li style="margin-bottom:6px;">Your boss or coworker</li>
          <li style="margin-bottom:6px;">Your parent or sibling</li>
        </ul>
        ${ctaButton('Check Your Compatibility', `${API_URL}/compatibility`)}
      `, user.id, 'Why you click with some people and clash with others');
    },
  },

  // Day 9: Conversion — tease Moon/Rising (premium feature)
  {
    key: 'nurture_5_moon_rising_tease',
    delayDays: 9,
    shouldSend: (user) => !isPremium(user),
    subject: (user) => `You're only reading 1/3 of your horoscope, ${user.name}`,
    html: (user) => userEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">What If You Could Read the Other Two-Thirds?</h1>
      <p>Hi ${user.name},</p>
      <p>Your daily Sun sign horoscope captures your core energy. But here&rsquo;s something professional astrologers know: <strong>a Sun sign reading is only about a third of the picture.</strong></p>
      ${infoBox(`
        <p style="margin:0 0 10px;"><strong>&#9788; Sun horoscope</strong> &mdash; Your public life and identity <span style="color:#22c55e;font-weight:600;">&#10003; Free</span></p>
        <p style="margin:0 0 10px;"><strong>&#9789; Moon horoscope</strong> &mdash; Your emotional needs and inner world <span style="color:#7C3AED;font-weight:600;">&#9733; Premium</span></p>
        <p style="margin:0;"><strong>&#8599; Rising horoscope</strong> &mdash; How opportunities and challenges reach you <span style="color:#7C3AED;font-weight:600;">&#9733; Premium</span></p>
      `)}
      <p>Every professional astrologer reads all three. The Moon horoscope alone explains why some days <em>feel</em> off even when nothing external has changed. The Rising horoscope reveals the lens through which the day&rsquo;s events actually reach you.</p>
      ${goldDivider()}
      ${socialProofBlock('Reading all three horoscopes changed my entire morning routine. The Moon reading especially \u2014 it explains so much about my emotional patterns that my Sun sign alone never captured.', 'Stellara Premium member')}
      ${ctaButton('Unlock Your Full Reading', `${API_URL}/pricing`, { variant: 'gold' })}
    `, user.id, 'Your Moon and Rising horoscopes tell the rest of the story'),
  },

  // Day 12: Conversion — free trial CTA
  {
    key: 'nurture_6_trial_offer',
    delayDays: 12,
    shouldSend: (user) => !isPremium(user),
    subject: () => '7 days free: your complete cosmic profile awaits',
    html: (user) => userEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Experience Everything Stellara Has to Offer</h1>
      <p>Hi ${user.name},</p>
      <p>For the next 7 days, everything Stellara offers is yours &mdash; completely free. No strings attached.</p>
      ${infoBox(`
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9789; Moon &amp; Rising horoscopes</strong> &mdash; The full daily picture, not just the headline</p>
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9734; Complete birth chart analysis</strong> &mdash; Every planet, house, and aspect decoded</p>
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#10084; Deep compatibility reports</strong> &mdash; Beyond surface-level sign matching</p>
        <p style="margin:0;"><strong style="color:#7C3AED;">&#9888; Transit alerts</strong> &mdash; Know when Mercury retrograde is coming before it hits</p>
      `)}
      ${goldDivider()}
      <p style="text-align:center;font-size:16px;font-weight:600;color:#1a1a2e;">No credit card tricks. Cancel with one tap.<br />If it&rsquo;s not for you, you pay nothing.</p>
      ${ctaButton('Start Your Free 7 Days', `${API_URL}/pricing`, { variant: 'gold' })}
      <p style="color:#666;font-size:13px;margin-top:20px;text-align:center;">Plans start at $7.99/mo when billed annually after trial. Join thousands of stargazers who read the complete cosmic picture.</p>
    `, user.id, 'Full Moon & Rising horoscopes, detailed charts, compatibility reports \u2014 on us'),
  },

  // Day 14: Conversion — final nudge with warmth
  {
    key: 'nurture_7_last_chance',
    delayDays: 14,
    shouldSend: (user) => !isPremium(user),
    subject: (user) => `${user.name}, the stars have more to tell you`,
    html: (user) => userEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Your Cosmic Story Has More Chapters</h1>
      <p>Hi ${user.name},</p>
      <p>Over the past two weeks, you&rsquo;ve started reading your cosmic story with Stellara. You&rsquo;ve explored your horoscope, maybe checked a compatibility match, maybe even mapped your birth chart.</p>
      ${user.sun_sign ? `<p>As a <strong>${capitalize(user.sun_sign)}</strong>, your Sun horoscope gives you the headline. But your Moon and Rising signs add the nuance that changes everything &mdash; the difference between a weather summary and a detailed forecast tailored to your exact coordinates.</p>` : '<p>But there&rsquo;s so much more the stars have to tell you. Your Moon and Rising sign horoscopes add the depth and nuance that a Sun sign reading alone can&rsquo;t capture.</p>'}
      ${socialProofBlock('I was skeptical, but reading all three horoscopes genuinely helps me prepare for my day. The Moon horoscope especially \u2014 it explains so much about my emotional patterns that I couldn\u2019t see before.', 'Sarah K., Stellara Premium')}
      ${goldDivider()}
      <p>Your 7-day free trial is still available. We&rsquo;d love for you to experience the full depth of what the stars have to say.</p>
      ${ctaButton('Try 7 Days Free', `${API_URL}/pricing`, { variant: 'gold' })}
      <p style="color:#888;font-size:13px;margin-top:24px;text-align:center;font-style:italic;">Not ready? No pressure. Keep using Stellara free &mdash; we&rsquo;re glad to have you either way.</p>
    `, user.id, 'Your free trial offer is still available'),
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

const SUBSCRIBER_SEQUENCE: SubscriberEmail[] = [
  // Day 0: Welcome
  {
    key: 'sub_nurture_0_welcome',
    delayDays: 0,
    subject: 'Welcome to the cosmos \u2014 your first horoscope is waiting',
    html: (sub) => subscriberEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Welcome, Stargazer</h1>
      <p>You&rsquo;re officially part of the Stellara community. Here&rsquo;s what to expect in your inbox:</p>
      ${infoBox(`
        <p style="margin:0 0 8px;"><strong style="color:#7C3AED;">&#9734; Daily horoscope insights</strong> for all 12 signs</p>
        <p style="margin:0 0 8px;"><strong style="color:#7C3AED;">&#9789; Major transit alerts</strong> &mdash; Mercury retrograde, full moons, eclipses</p>
        <p style="margin:0;"><strong style="color:#7C3AED;">&#10022; Weekly cosmic energy forecasts</strong></p>
      `)}
      <p>Start by reading today&rsquo;s horoscope &mdash; tap your sign and see what the stars have in store.</p>
      ${ctaButton("Read Today's Horoscope", `${API_URL}/horoscope`)}
      <p style="color:#666;font-size:13px;margin-top:20px;">Want personalized readings? <a href="${API_URL}/signup" style="color:#7C3AED;text-decoration:underline;">Create a free account</a> to unlock your birth chart and Big Three.</p>
    `, sub.id, 'Daily horoscopes, transit alerts, and cosmic energy forecasts'),
  },

  // Day 3: Drive to site — daily horoscope
  {
    key: 'sub_nurture_1_horoscope',
    delayDays: 3,
    subject: 'Your cosmic forecast is live \u2014 what do the stars say today?',
    html: (sub) => subscriberEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Today&rsquo;s Cosmic Forecast Is Ready</h1>
      <p>Hey there!</p>
      <p>Your daily horoscope has been updated with fresh insights. Stellara covers all 12 signs with guidance for:</p>
      ${infoBox(`
        <p style="margin:0 0 8px;"><strong>&#9734; Overall energy</strong> &mdash; what the stars have in store today</p>
        <p style="margin:0 0 8px;"><strong>&#10084; Love &amp; relationships</strong> &mdash; cosmic chemistry insights</p>
        <p style="margin:0 0 8px;"><strong>&#9733; Career &amp; money</strong> &mdash; your professional outlook</p>
        <p style="margin:0;"><strong>&#10023; Wellness</strong> &mdash; mind, body, and spirit guidance</p>
      `)}
      <p>Make it a morning ritual &mdash; 2 minutes with your horoscope over coffee. Thousands of readers already do.</p>
      ${ctaButton("Read Today's Horoscope", `${API_URL}/horoscope`)}
    `, sub.id, 'Love, career, wellness: today\u2019s full zodiac breakdown'),
  },

  // Day 7: Convert to account — birth chart
  {
    key: 'sub_nurture_2_birth_chart',
    delayDays: 7,
    subject: 'There\u2019s more to you than your zodiac sign',
    html: (sub) => subscriberEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Your Zodiac Sign Is Just the Beginning</h1>
      <p>Hey there!</p>
      <p>Most people know their zodiac sign. But did you know your birth chart reveals two other placements that matter just as much &mdash; and in some ways, even more?</p>
      ${infoBox(`
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9788; Sun Sign</strong> &mdash; Your core identity (the one everyone knows)</p>
        <p style="margin:0 0 10px;"><strong style="color:#7C3AED;">&#9789; Moon Sign</strong> &mdash; Your emotional landscape and deepest needs</p>
        <p style="margin:0;"><strong style="color:#7C3AED;">&#8599; Rising Sign</strong> &mdash; How the world perceives you</p>
      `)}
      <p>Create a free Stellara account and generate your birth chart in 30 seconds &mdash; all you need is your birth date, time, and location.</p>
      ${ctaButton('Get Your Free Birth Chart', `${API_URL}/birth-chart`)}
      <p style="color:#666;font-size:13px;margin-top:20px;">Over 14,000 people have already discovered their Big Three with Stellara.</p>
    `, sub.id, 'Your birth chart reveals your Moon sign, Rising sign, and so much more'),
  },

  // Day 14: Re-engagement — compatibility
  {
    key: 'sub_nurture_3_compatibility',
    delayDays: 14,
    subject: 'Who are you cosmically compatible with?',
    html: (sub) => subscriberEmailHtml(`
      <h1 style="color:#7C3AED;margin:0 0 16px;font-size:24px;">Cosmic Compatibility</h1>
      <p>Hey there!</p>
      <p>Ever wonder why you click instantly with some people and clash with others for no apparent reason? The answer might be written in the stars.</p>
      <p>Stellara&rsquo;s compatibility tool analyzes the elemental and modal dynamics between any two zodiac signs &mdash; revealing where you connect, where you create friction, and how to make it work.</p>
      <p>Try it with your partner, best friend, coworker, or anyone you&rsquo;re curious about.</p>
      ${ctaButton('Check Your Compatibility', `${API_URL}/compatibility`)}
      <p style="color:#666;font-size:13px;margin-top:20px;">For even deeper insights, <a href="${API_URL}/signup" style="color:#7C3AED;text-decoration:underline;">create a free account</a> and get your personalized birth chart.</p>
    `, sub.id, 'The stars explain why you click with some people and clash with others'),
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
