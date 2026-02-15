/**
 * Social media horoscope post generator + auto-poster
 *
 * Generates 12 daily sign posts + 8 engagement posts,
 * then posts them to Twitter/X via their API.
 *
 * Usage:
 *   npx tsx src/social/post.ts              # Generate + post today's content
 *   npx tsx src/social/post.ts --dry-run    # Preview without posting
 *   npx tsx src/social/post.ts --json       # Output JSON for other tools
 */

import { SIGNS, HOROSCOPE_TEASERS, HOROSCOPE_RATINGS, getFullHoroscope } from './content.js';
import { postToTwitter } from './twitter.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Deterministic daily seed so content varies per day but is reproducible */
function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Horoscope post hooks — the opening line that stops the scroll     */
/* ------------------------------------------------------------------ */

const HOOKS: Record<string, string[]> = {
  aries: [
    "Aries, the universe is daring you to go first today",
    "Something bold is written in your stars today, Aries",
    "Aries — your fire burns brightest when others doubt you",
    "The cosmos just handed Aries the green light",
    "Aries, today your courage gets rewarded",
  ],
  taurus: [
    "Taurus, the stars are aligning around something you've been building",
    "Slow and steady wins today, Taurus — but the prize might surprise you",
    "Taurus, the universe is about to validate your patience",
    "Something luxurious is heading your way, Taurus",
    "The cosmos is protecting what you've planted, Taurus",
  ],
  gemini: [
    "Gemini, both sides of you agree on this one",
    "A conversation today changes everything, Gemini",
    "Gemini — the stars have a message you need to hear",
    "Your words carry extra power today, Gemini",
    "The cosmos is connecting dots for you today, Gemini",
  ],
  cancer: [
    "Cancer, your intuition is screaming — listen to it",
    "The moon has a gift for you today, Cancer",
    "Cancer, something beautiful is brewing beneath the surface",
    "Trust your gut over your head today, Cancer",
    "The stars are wrapping you in protection today, Cancer",
  ],
  leo: [
    "Leo, the spotlight finds you whether you're ready or not",
    "Your main character energy peaks today, Leo",
    "Leo — the universe wrote today's script just for you",
    "Something royal is in your stars today, Leo",
    "The cosmos can't stop watching you today, Leo",
  ],
  virgo: [
    "Virgo, that thing you've been overthinking? The answer is here",
    "The details you noticed are about to pay off, Virgo",
    "Virgo, the stars are rewarding your precision today",
    "Something clicks into place for you today, Virgo",
    "The universe appreciates your effort today, Virgo",
  ],
  libra: [
    "Libra, the scales tip in your favour today",
    "Balance meets beauty in your stars today, Libra",
    "Libra — a decision you've been avoiding just got easier",
    "The cosmos is harmonising something important for you, Libra",
    "Libra, someone is about to match your energy",
  ],
  scorpio: [
    "Scorpio, the truth you've been sensing? It's about to surface",
    "Something transformative is written in your stars today, Scorpio",
    "Scorpio — the universe rewards those who aren't afraid of the deep end",
    "Your power is magnetic today, Scorpio",
    "The cosmos is revealing what's been hidden, Scorpio",
  ],
  sagittarius: [
    "Sagittarius, adventure is calling louder than usual today",
    "The stars are expanding your world today, Sagittarius",
    "Sagittarius — your optimism is about to be proven right",
    "Something exciting is on the horizon, Sagittarius",
    "The cosmos is pointing you toward uncharted territory, Sag",
  ],
  capricorn: [
    "Capricorn, your hard work is about to compound",
    "The mountain you've been climbing? Check the view today, Capricorn",
    "Capricorn — the stars are fast-tracking something you deserve",
    "Discipline meets destiny in your chart today, Capricorn",
    "The cosmos respects the grind, Capricorn — and today it shows",
  ],
  aquarius: [
    "Aquarius, the future you've been imagining is closer than you think",
    "Your unconventional approach is exactly right today, Aquarius",
    "Aquarius — the cosmos is amplifying your vision",
    "Something innovative sparks in your stars today, Aquarius",
    "The universe is rewarding your originality, Aquarius",
  ],
  pisces: [
    "Pisces, the dream and reality are merging today",
    "Your intuition is crystal clear today, Pisces",
    "Pisces — the universe is speaking to you through feelings",
    "Something magical is unfolding in your stars, Pisces",
    "The cosmos is turning your imagination into something real, Pisces",
  ],
};

/* ------------------------------------------------------------------ */
/*  Engagement post templates (the 8 non-sign posts)                  */
/* ------------------------------------------------------------------ */

const ENGAGEMENT_POSTS: string[][] = [
  // Element battles
  [
    "Fire signs (Aries, Leo, Sag) vs Water signs (Cancer, Scorpio, Pisces) — who handles heartbreak better?\n\nDrop your sign and your answer",
    "Earth signs are the backbone of every friend group and you can't change my mind\n\nTaurus, Virgo, Capricorn — tag yourselves",
    "Air signs (Gemini, Libra, Aquarius) process emotions by talking about them. Water signs process by FEELING them.\n\nWhich is healthier?",
  ],
  // Compatibility
  [
    "Name your sign and your partner's sign — I'll tell you the one thing you need to watch out for\n\nCheck your full compatibility: stellera.co/compatibility",
    "The most UNDERRATED zodiac pairing? I'll go first: Virgo x Scorpio\n\nWhat's yours?",
    "Your Sun sign is who you are. Your Moon sign is who you NEED. Your Rising is who people MEET.\n\nKnow your Big Three? stellera.co/birth-chart",
  ],
  // This or that
  [
    "Would you rather date someone with the same sign as you or your complete opposite?\n\nComment your sign",
    "Which sign gives the BEST advice?\n\nRank: Virgo, Scorpio, Capricorn, Aquarius",
    "Brutally honest or gently comforting — which do you need from a partner?\n\nLet me guess your Moon sign based on your answer",
  ],
  // Astro facts
  [
    "Your Rising sign changes every 2 hours. Born 20 minutes later and you'd be a completely different person.\n\nDiscover yours free: stellera.co/birth-chart",
    "Mercury retrograde gets all the blame but Saturn return is the one that actually changes your life.\n\nIf you're 27-30, you're IN it right now",
    "The sign your Venus is in reveals more about your love life than your Sun sign ever could.\n\nGet your full chart: stellera.co/birth-chart",
  ],
  // Hot takes
  [
    "Unpopular opinion: Scorpios aren't intimidating — you're just not used to someone seeing through you\n\nScorpios, back me up",
    "Cancers aren't \"too emotional\" — they just feel everything at full volume while the rest of you are on mute\n\nCancers, how accurate?",
    "Capricorns don't have a cold heart. They have a guarded one. There's a massive difference.\n\nCaps, drop a if you agree",
  ],
  // Polls / lists
  [
    "Signs most likely to text back immediately:\n1. Libra\n2. Leo\n3. Gemini\n\nSigns most likely to leave you on read:\n1. Aquarius\n2. Capricorn\n3. Scorpio\n\nAccurate?",
    "The zodiac signs as red flags:\nAries — moves too fast\nTaurus — never compromises\nGemini — too many versions\nCancer — guilt trips\n\nWant the rest? Comment your sign",
    "Ranking the signs by how hard they fall in love:\n\n12. Aquarius\n11. Gemini\n10. Sagittarius\n...\n1. Pisces (obviously)\n\nFull ranking in thread",
  ],
  // CTA-heavy
  [
    "Your birth chart is literally a cosmic blueprint for your entire life and most people have never read theirs.\n\nGet yours free in 30 seconds: stellera.co/birth-chart",
    "Stop reading just your Sun sign horoscope. Your Moon and Rising signs are just as important.\n\nDiscover your Big Three free: stellera.co/birth-chart",
    "The most accurate horoscope isn't the generic one — it's the one that knows your FULL chart.\n\nUnlock yours: stellera.co/horoscope",
  ],
  // Relatable / viral
  [
    "Every zodiac sign has that ONE friend they keep going back to. For Libra it's Scorpio. For Aries it's a terrible idea.\n\nTag them",
    "Your sign's toxic trait:\nAries: arguing for sport\nGemini: having 3 different personalities in a group chat\nScorpio: investigating someone's entire life before the first date\n\nContinue the thread",
    "I don't trust people who don't know their Moon sign.\n\nIf that's you: stellera.co/birth-chart (it takes 30 seconds)",
  ],
];

/* ------------------------------------------------------------------ */
/*  Generate sign post                                                */
/* ------------------------------------------------------------------ */

interface SocialPost {
  text: string;
  type: 'horoscope' | 'engagement';
  sign?: string;
  scheduledFor?: string; // HH:MM format
}

function generateSignPost(slug: string, signIndex: number): SocialPost {
  const sign = SIGNS.find((s) => s.slug === slug)!;
  const horoscope = getFullHoroscope(slug);
  const ratings = HOROSCOPE_RATINGS[slug];
  const seed = daySeed() + signIndex;

  const hook = pick(HOOKS[slug], seed);

  // Build a short, enticing excerpt from the full horoscope
  const teaser = HOROSCOPE_TEASERS[slug];
  // Grab first sentence of the teaser
  const firstSentence = teaser.split(/\.\s/)[0] + '.';

  // Star rating display
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  // Rotating post formats
  const formats = [
    // Format 1: Hook + teaser + ratings
    () =>
      `${sign.symbol} ${hook}.\n\n${firstSentence}\n\nLove ${stars(ratings.love)}\nCareer ${stars(ratings.career)}\nWellness ${stars(ratings.wellness)}\n\nFull reading: stellera.co/horoscope/${slug}`,

    // Format 2: Hook + lucky info + CTA
    () =>
      `${sign.symbol} ${sign.name} — ${formatDate()}\n\n${hook}.\n\n${firstSentence}\n\nLucky number: ${horoscope.luckyNumber} | Best match: ${horoscope.compatibility}\n\nRead more: stellera.co/horoscope/${slug}`,

    // Format 3: Short and punchy
    () =>
      `${sign.symbol} ${sign.name} daily horoscope\n\n${hook}.\n\n${firstSentence}\n\nYour full reading is waiting: stellera.co/horoscope/${slug}`,
  ];

  const format = pick(formats, seed);

  // Schedule: signs post from 7:00-8:10 AM, 5-6 min apart
  const minuteOffset = signIndex * 5;
  const hour = 7 + Math.floor(minuteOffset / 60);
  const minute = minuteOffset % 60;

  return {
    text: format(),
    type: 'horoscope',
    sign: slug,
    scheduledFor: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Generate engagement posts                                         */
/* ------------------------------------------------------------------ */

function generateEngagementPosts(): SocialPost[] {
  const seed = daySeed();
  const times = ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '19:00', '21:00'];

  return times.map((time, i) => {
    const category = ENGAGEMENT_POSTS[i % ENGAGEMENT_POSTS.length];
    const post = pick(category, seed + i);
    return {
      text: post,
      type: 'engagement' as const,
      scheduledFor: time,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jsonMode = args.includes('--json');

  // Generate all 20 posts
  const signPosts = SIGNS.map((sign, i) => generateSignPost(sign.slug, i));
  const engagementPosts = generateEngagementPosts();
  const allPosts = [...signPosts, ...engagementPosts].sort((a, b) =>
    (a.scheduledFor ?? '').localeCompare(b.scheduledFor ?? ''),
  );

  if (jsonMode) {
    console.log(JSON.stringify(allPosts, null, 2));
    return;
  }

  console.log(`\n📱 Stellara Daily Social Posts — ${formatDate()}\n`);
  console.log(`Total: ${allPosts.length} posts (${signPosts.length} horoscopes + ${engagementPosts.length} engagement)\n`);

  for (const post of allPosts) {
    const label = post.type === 'horoscope'
      ? `${post.scheduledFor} | ${post.sign?.toUpperCase()}`
      : `${post.scheduledFor} | ENGAGEMENT`;

    console.log(`--- ${label} ---`);
    console.log(post.text);
    console.log(`(${post.text.length} chars)\n`);

    if (!dryRun && process.env.TWITTER_API_KEY) {
      try {
        const result = await postToTwitter(post.text);
        console.log(`  ✓ Posted to Twitter: ${result.id}\n`);
      } catch (err) {
        console.error(`  ✗ Twitter post failed:`, err);
      }
    }
  }

  if (dryRun) {
    console.log('--- DRY RUN — nothing was posted ---');
  } else if (!process.env.TWITTER_API_KEY) {
    console.log('--- TWITTER_API_KEY not set — posts generated but not sent ---');
    console.log('--- Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in .env ---');
  }
}

main().catch(console.error);
