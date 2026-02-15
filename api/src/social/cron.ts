// Cron-compatible posting script.
//
// Designed to be called every 30 minutes by cron.
// It checks the current time and posts any scheduled posts
// that fall within the current 30-minute window.
//
// Crontab entry (runs every 30 min from 7am-10pm):
//   */30 7-22 * * * cd ~/Astrology/api && npx tsx src/social/cron.ts >> ~/social-posts.log 2>&1

import { SIGNS, HOROSCOPE_TEASERS, HOROSCOPE_RATINGS, getFullHoroscope } from './content.js';
import { postToTwitter } from './twitter.js';

/* Re-use the same generation logic from post.ts */

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

/* Import the hooks and engagement posts inline to keep this self-contained */
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

const ENGAGEMENT_POSTS: string[][] = [
  [
    "Fire signs (Aries, Leo, Sag) vs Water signs (Cancer, Scorpio, Pisces) — who handles heartbreak better?\n\nDrop your sign and your answer",
    "Earth signs are the backbone of every friend group and you can't change my mind\n\nTaurus, Virgo, Capricorn — tag yourselves",
  ],
  [
    "Name your sign and your partner's sign — I'll tell you the one thing you need to watch out for\n\nCheck your full compatibility: stellera.co/compatibility",
    "The most UNDERRATED zodiac pairing? I'll go first: Virgo x Scorpio\n\nWhat's yours?",
  ],
  [
    "Would you rather date someone with the same sign as you or your complete opposite?\n\nComment your sign",
    "Which sign gives the BEST advice?\n\nRank: Virgo, Scorpio, Capricorn, Aquarius",
  ],
  [
    "Your Rising sign changes every 2 hours. Born 20 minutes later and you'd be a completely different person.\n\nDiscover yours free: stellera.co/birth-chart",
    "Mercury retrograde gets all the blame but Saturn return is the one that actually changes your life.\n\nIf you're 27-30, you're IN it right now",
  ],
  [
    "Unpopular opinion: Scorpios aren't intimidating — you're just not used to someone seeing through you\n\nScorpios, back me up",
    "Cancers aren't \"too emotional\" — they just feel everything at full volume while the rest of you are on mute",
  ],
  [
    "Signs most likely to text back immediately:\n1. Libra\n2. Leo\n3. Gemini\n\nSigns most likely to leave you on read:\n1. Aquarius\n2. Capricorn\n3. Scorpio\n\nAccurate?",
    "The zodiac signs as red flags:\nAries — moves too fast\nTaurus — never compromises\nGemini — too many versions\nCancer — guilt trips\n\nWant the rest? Comment your sign",
  ],
  [
    "Your birth chart is literally a cosmic blueprint for your entire life and most people have never read theirs.\n\nGet yours free in 30 seconds: stellera.co/birth-chart",
    "Stop reading just your Sun sign horoscope. Your Moon and Rising signs are just as important.\n\nDiscover your Big Three free: stellera.co/birth-chart",
  ],
  [
    "Every zodiac sign has that ONE friend they keep going back to. For Libra it's Scorpio. For Aries it's a terrible idea.\n\nTag them",
    "I don't trust people who don't know their Moon sign.\n\nIf that's you: stellera.co/birth-chart (it takes 30 seconds)",
  ],
];

interface ScheduledPost {
  text: string;
  type: 'horoscope' | 'engagement';
  scheduledFor: string;
  sign?: string;
}

function generateAllPosts(): ScheduledPost[] {
  const seed = daySeed();
  const posts: ScheduledPost[] = [];

  // 12 sign posts: 07:00 - 07:55
  SIGNS.forEach((sign, i) => {
    const horoscope = getFullHoroscope(sign.slug);
    const ratings = HOROSCOPE_RATINGS[sign.slug];
    const teaser = HOROSCOPE_TEASERS[sign.slug];
    const firstSentence = teaser.split(/\.\s/)[0] + '.';
    const hook = pick(HOOKS[sign.slug], seed + i);
    const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

    const formats = [
      `${sign.symbol} ${hook}.\n\n${firstSentence}\n\nLove ${stars(ratings.love)}\nCareer ${stars(ratings.career)}\nWellness ${stars(ratings.wellness)}\n\nFull reading: stellera.co/horoscope/${sign.slug}`,
      `${sign.symbol} ${sign.name} — ${formatDate()}\n\n${hook}.\n\n${firstSentence}\n\nLucky number: ${horoscope.luckyNumber} | Best match: ${horoscope.compatibility}\n\nRead more: stellera.co/horoscope/${sign.slug}`,
      `${sign.symbol} ${sign.name} daily horoscope\n\n${hook}.\n\n${firstSentence}\n\nYour full reading is waiting: stellera.co/horoscope/${sign.slug}`,
    ];

    const minuteOffset = i * 5;
    const hour = 7 + Math.floor(minuteOffset / 60);
    const minute = minuteOffset % 60;

    posts.push({
      text: pick(formats, seed + i),
      type: 'horoscope',
      sign: sign.slug,
      scheduledFor: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    });
  });

  // 8 engagement posts spread through the day
  const engTimes = ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '19:00', '21:00'];
  engTimes.forEach((time, i) => {
    const category = ENGAGEMENT_POSTS[i % ENGAGEMENT_POSTS.length];
    posts.push({
      text: pick(category, seed + i),
      type: 'engagement',
      scheduledFor: time,
    });
  });

  return posts;
}

/** Check if a scheduled time is within the current 30-min window */
function isInCurrentWindow(scheduledTime: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [h, m] = scheduledTime.split(':').map(Number);
  const scheduledMinutes = h * 60 + m;

  // Post if scheduled time is within [now - 30min, now)
  return scheduledMinutes >= currentMinutes - 30 && scheduledMinutes < currentMinutes;
}

async function main() {
  const allPosts = generateAllPosts();
  const duePosts = allPosts.filter((p) => isInCurrentWindow(p.scheduledFor));

  if (duePosts.length === 0) {
    console.log(`[${new Date().toISOString()}] No posts due in this window.`);
    return;
  }

  console.log(`[${new Date().toISOString()}] ${duePosts.length} posts due:`);

  for (const post of duePosts) {
    console.log(`  ${post.scheduledFor} | ${post.type} ${post.sign ?? ''}`);

    if (process.env.TWITTER_API_KEY) {
      try {
        const result = await postToTwitter(post.text);
        console.log(`  ✓ Posted to Twitter: ${result.id}`);
      } catch (err) {
        console.error(`  ✗ Failed:`, err);
      }
    } else {
      console.log(`  [dry] ${post.text.slice(0, 80)}...`);
    }

    // Space out posts by 10 seconds to avoid rate limits
    await new Promise((r) => setTimeout(r, 10_000));
  }
}

main().catch(console.error);
