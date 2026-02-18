// Cron-compatible posting script.
//
// Designed to be called every 30 minutes by cron.
// It checks the current time and posts any scheduled posts
// that fall within the current 30-minute window.
//
// Crontab entry (runs every 30 min from 7am-10pm):
//   */30 7-22 * * * cd ~/Astrology/api && npx tsx src/social/cron.ts >> ~/social-posts.log 2>&1

import { SIGNS, HOROSCOPE_TEASERS, HOROSCOPE_RATINGS, getFullHoroscope } from './content.js';
import { postToTwitter, postThread, uploadMedia } from './twitter.js';
import { postToFacebook, threadToFacebookPost } from './facebook.js';
import { postToInstagram, buildInstagramCaption, threadToInstagramCaption } from './instagram.js';
import { PostResult, sendFailureAlert, appendResults } from './notify.js';
import { generateHoroscopeCard, generateEngagementCard } from './image.js';

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
  // 1. Element battles
  [
    "Fire signs (Aries, Leo, Sag) vs Water signs (Cancer, Scorpio, Pisces) — who handles heartbreak better?\n\nDrop your sign and your answer",
    "Earth signs are the backbone of every friend group and you can't change my mind\n\nTaurus, Virgo, Capricorn — tag yourselves",
    "Air signs talk about their feelings. Water signs drown in them. Fire signs burn through them.\n\nWhich is healthiest? Comment your sign",
  ],
  // 2. Compatibility bait (CTA)
  [
    "Name your sign and your partner's sign — I'll tell you the one thing you need to watch out for\n\nFull compatibility report — link in bio",
    "The most UNDERRATED zodiac pairing? I'll go first: Virgo x Scorpio\n\nWhat's yours? Check yours — link in bio",
    "Your worst match isn't who you think it is.\n\nFind out — link in bio",
  ],
  // 3. Birth chart CTA — direct
  [
    "Your birth chart is literally a cosmic blueprint for your entire life and most people have never read theirs.\n\nGet yours free in 30 seconds — link in bio",
    "Stop reading just your Sun sign horoscope. Your Moon and Rising signs are just as important.\n\nDiscover your Big Three free — link in bio",
    "The most accurate horoscope reads your FULL chart — not just your Sun sign.\n\nGet yours free — link in bio",
  ],
  // 4. Birth chart CTA — curiosity
  [
    "Your Rising sign changes every 2 hours. Born 20 minutes later and you'd be a completely different person.\n\nDiscover yours — link in bio",
    "I don't trust people who don't know their Moon sign.\n\nIf that's you, it takes 30 seconds — link in bio",
    "Your Venus sign reveals more about your love life than your Sun sign ever could.\n\nFind yours free — link in bio",
  ],
  // 5. Hot takes
  [
    "Unpopular opinion: Scorpios aren't intimidating — you're just not used to someone seeing through you\n\nScorpios, back me up",
    "Cancers aren't \"too emotional\" — they just feel everything at full volume while the rest of you are on mute",
    "Capricorns don't have a cold heart. They have a guarded one. There's a massive difference",
  ],
  // 6. Sign rankings / polls
  [
    "Signs most likely to text back immediately:\n1. Libra\n2. Leo\n3. Gemini\n\nSigns most likely to leave you on read:\n1. Aquarius\n2. Capricorn\n3. Scorpio\n\nAccurate?",
    "The zodiac signs as red flags:\nAries — moves too fast\nTaurus — never compromises\nGemini — too many versions\nCancer — guilt trips\n\nWant the rest? Comment your sign",
    "Ranking signs by how fast they catch feelings:\n\n1. Pisces\n2. Cancer\n3. Libra\n...\n12. Aquarius\n\nDo you agree?",
  ],
  // 7. Relatable / viral
  [
    "Every zodiac sign has that ONE friend they keep going back to. For Libra it's Scorpio. For Aries it's a terrible idea.\n\nTag them",
    "Your sign's toxic trait:\nAries: arguing for sport\nGemini: 3 personalities in a group chat\nScorpio: investigating someone before the first date\n\nContinue the thread",
    "POV: you're dating a Taurus and they planned the entire weekend without telling you. Including snacks.",
  ],
  // 8. This or that
  [
    "Would you rather date someone with the same sign as you or your complete opposite?\n\nComment your sign",
    "Which sign gives the BEST advice?\n\nRank: Virgo, Scorpio, Capricorn, Aquarius",
    "Brutally honest or gently comforting — which do you need from a partner?\n\nLet me guess your Moon sign",
  ],
  // 9. Sign call-outs (engagement magnets)
  [
    "Aries and Scorpio in the same room is either instant chemistry or a crime scene. No in between.\n\nWhich was it for you?",
    "Virgos will reorganise your entire life, fix your resume, and still say \"I'm not that helpful.\"\n\nTag a Virgo who needs to hear this",
    "Leos don't want attention. They want APPRECIATION. There's a difference and most of you don't get it",
  ],
  // 10. Horoscope teaser (engagement hooks — no links)
  [
    "Today's energy is chaotic for 3 signs in particular.\n\nAre you one of them? Drop your sign below",
    "One sign is about to have a major breakthrough this week.\n\nWhich sign is it? Guess below",
    "The stars are being LOUD today. Some of you are going to feel this hard.\n\nWhich 3 signs? Reply with yours",
  ],
  // 11. Love & relationships (soft CTA)
  [
    "The sign you can't stop dating says more about YOUR chart than theirs.\n\nYour chart has the answer — link in bio",
    "Your love language is literally written in your Venus sign. Most people have no idea what theirs is.\n\nMost people have no idea. Find yours — link in bio",
    "If you keep attracting the same type, your 7th house has the answer.\n\nYour chart has the answer",
  ],
  // 12. Astro education (shareable — no links)
  [
    "Mercury retrograde gets all the blame but Saturn return is the one that actually changes your life.\n\nIf you're 27-30, you're IN it right now",
    "Your Sun sign = who you are\nYour Moon sign = who you need\nYour Rising sign = who people meet\n\nKnow all three?",
    "There are 12 houses in your birth chart and each one rules a different area of your life.\n\nMost people only know their Sun sign. That's 1 out of 40+ placements",
  ],
  // 13. Debate starters
  [
    "What's the most emotionally intelligent sign? Wrong answers only.\n\n(We all know it's Cancer or Pisces)",
    "Geminis get called two-faced but Libras literally can't pick a side and nobody talks about it",
    "Name a sign that's loyal to a fault. I'll wait.\n\nHint: it starts with T and ends with aurus",
  ],
  // 14. Signs as trends
  [
    "The signs as things they Google at 2am:\nAries: \"Am I being too aggressive\"\nVirgo: \"Is it normal to plan 3 months ahead\"\nPisces: \"Why do I cry at everything\"\n\nComment yours",
    "Your sign's emotional armour:\nAries — anger\nGemini — humour\nScorpio — silence\nCapricorn — work\nPisces — daydreaming\n\nWhich one?",
    "The signs as toxic texts they'd send:\nLeo: \"You'll never find someone like me\"\nScorpio: \"I already knew\"\nAquarius: *leaves you on delivered for 3 days*",
  ],
  // 15. Weekly forecast teaser (no links — pure teaser)
  [
    "This week's energy shifts are going to hit different for mutable signs (Gemini, Virgo, Sag, Pisces).\n\nBrace yourselves",
    "Cardinal signs (Aries, Cancer, Libra, Capricorn) — this week is YOUR week. Don't waste it.",
    "Fixed signs (Taurus, Leo, Scorpio, Aquarius) — something you've been resisting is about to click.\n\nReady or not, it's clicking",
  ],
  // 16. Controversial / spicy (no links — engagement drivers)
  [
    "Some of you are out here blaming Mercury retrograde when your chart has been screaming the answer for years.\n\nRead your chart (link in bio)",
    "Astrology isn't about excusing bad behaviour. It's about understanding patterns so you can break them.\n\nStart with your own chart",
    "Your ex wasn't toxic because of their sign. They were toxic because they never looked at their chart.\n\nDon't be like them. Know your chart",
  ],
  // 17. Friendship dynamics
  [
    "The friend group always has:\n- The Virgo who plans everything\n- The Leo who hypes everyone up\n- The Aquarius who disappears for 2 weeks\n- The Pisces who cries at the dinner table\n\nTag them",
    "Fire + Air friendships = chaos that somehow always works\nEarth + Water friendships = deep loyalty forever\n\nWhich combo is your best friendship?",
    "Which sign do you get along with that you're NOT supposed to?\n\nAstrology says it shouldn't work but here you are",
  ],
  // 18. Self-discovery CTA
  [
    "Most people have NO idea why they react the way they do. Your Moon sign has the answer.\n\nDiscover yours — link in bio",
    "Feeling stuck? Your Saturn placement literally tells you what lesson you're here to learn.\n\nFull chart breakdown — link in bio",
    "You are so much more than your Sun sign. Your chart has 40+ placements that make you YOU.\n\nExplore your full chart free — link in bio",
  ],
  // 19. Question hooks (reply magnets — no links, replies ARE the goal)
  [
    "Drop your sign and I'll tell you the ONE thing you need to hear today.",
    "What sign do you attract the most? And is it the one you actually WANT?",
    "Be honest — do you read your horoscope daily or only when life gets messy?",
  ],
  // 20. Conversion / urgency
  [
    "2,847 people checked their birth chart on Stellara this week. Most were shocked by their Moon sign.\n\nJoin them — link in bio",
    "Your birth chart has been waiting your entire life for you to read it.\n\nIt takes 30 seconds. It's free. Link in bio",
    "The difference between reading your Sun sign horoscope and your FULL chart horoscope is like reading a headline vs the whole article.\n\nGet the full story — link in bio",
  ],
];

// Thread content — educational multi-tweet threads that get 10-50x more impressions
const THREAD_TEMPLATES: string[][][] = [
  // Thread 1: "Your Big Three explained"
  [
    [
      "Your Big Three in astrology is the key to understanding yourself.\n\nMost people only know their Sun sign. That's like reading the title of a book and calling it done.\n\nHere's what your Big Three actually means (thread)",
      "Your SUN SIGN is your core identity — the conscious you.\n\nIt's who you are at your centre, your ego, your life force. When someone asks \"what's your sign?\" this is what they mean.\n\nBut it's only 1/3 of the picture.",
      "Your MOON SIGN is your emotional blueprint.\n\nIt rules your inner world — how you process feelings, what you need to feel safe, and how you love behind closed doors.\n\nThis is the sign your therapist would relate to most.",
      "Your RISING SIGN (Ascendant) is your social mask.\n\nIt's the first impression you give, how you walk into a room, and the energy people feel before they know you.\n\nIt changes every 2 hours — born 20 min later and you'd be a different person.",
      "Put them together and you get a 3D picture of who you are:\n\nSun = what drives you\nMoon = what you need\nRising = how you show up\n\nDiscover your Big Three free: stellera.co/birth-chart",
    ],
  ],
  // Thread 2: "Signs as..." ranking thread
  [
    [
      "Ranking every zodiac sign's emotional intelligence from highest to lowest.\n\nThis is going to make some of you mad. Let's go (thread)",
      "12. Sagittarius — genuinely doesn't notice you're upset until you're crying in the car\n\n11. Aries — notices, but their solution is \"just don't think about it\"\n\n10. Aquarius — intellectually understands emotions, emotionally does not",
      "9. Gemini — reads the room perfectly but processes it as gossip not empathy\n\n8. Leo — deeply empathetic but only when it's about them\n\n7. Capricorn — secretly very emotional, publicly a brick wall",
      "6. Libra — excellent at making YOU feel heard, terrible at feeling their own stuff\n\n5. Virgo — shows love through fixing your problems (even when you didn't ask)\n\n4. Taurus — steady, loyal emotional support but will NOT talk about it",
      "3. Scorpio — reads your soul before you speak, feels EVERYTHING intensely\n\n2. Cancer — the emotional backbone of every friend group, absorbs your pain like a sponge\n\n1. Pisces — literally feels what you feel before you feel it\n\nAccurate? Fight me in the comments",
    ],
  ],
  // Thread 3: "Houses explained"
  [
    [
      "Your birth chart has 12 HOUSES and each one rules a different part of your life.\n\nMost people have no idea this exists. Here's the cheat sheet (thread)",
      "Houses 1-4 (Personal foundations):\n\n1st — Self, identity, first impressions\n2nd — Money, possessions, self-worth\n3rd — Communication, siblings, daily routine\n4th — Home, family, emotional roots",
      "Houses 5-8 (Relationships & power):\n\n5th — Romance, creativity, fun, children\n6th — Health, work, daily habits\n7th — Partnerships, marriage, contracts\n8th — Transformation, intimacy, shared finances (the spicy house)",
      "Houses 9-12 (Higher purpose):\n\n9th — Travel, philosophy, higher education\n10th — Career, public image, legacy\n11th — Community, hopes, friendships\n12th — Subconscious, secrets, spirituality (the hidden house)",
      "The SIGN on each house cusp + any PLANETS inside it shape how that area plays out in YOUR life.\n\nTwo Scorpios can have completely different careers because of their 10th house placement.\n\nSee your full house chart: stellera.co/birth-chart",
    ],
  ],
  // Thread 4: "Why you keep dating the same sign"
  [
    [
      "You keep dating the same type of person and it's not a coincidence.\n\nYour birth chart literally explains the pattern. Here's how (thread)",
      "Your 7th HOUSE rules partnerships and attraction.\n\nThe sign on your 7th house cusp is the energy you're naturally drawn to in relationships — even if it's your \"worst match\" on paper.",
      "Your VENUS sign reveals how you love and what you value in a partner.\n\nVenus in Aries? You want passion and independence.\nVenus in Cancer? You want safety and emotional depth.\nVenus in Aquarius? You want space and intellectual connection.",
      "Your MARS sign reveals what turns you on and how you pursue what you want.\n\nCombine your Venus + Mars + 7th house and you've basically got a roadmap of your love life (for better or worse).",
      "This is why two Leos can have completely different relationship patterns.\n\nYour Sun sign is just the headline. Your chart tells the full love story.\n\nDiscover your Venus, Mars & 7th house: stellera.co/birth-chart",
    ],
  ],
  // Thread 5: "Moon signs and how you handle stress"
  [
    [
      "Your Moon sign reveals exactly how you cope with stress.\n\nThis is the stuff people close to you see but strangers don't (thread)",
      "Fire Moons (Aries, Leo, Sag):\n\nYou blow up fast, burn through it, and move on. You process emotions through action — working out, ranting, doing something dramatic. You don't hold grudges, you hold the mic.",
      "Earth Moons (Taurus, Virgo, Capricorn):\n\nYou go quiet. You clean, organise, plan, work. Emotions get filed under \"deal with later.\" You need physical comfort — good food, nature, your own space. Crying happens alone, if at all.",
      "Air Moons (Gemini, Libra, Aquarius):\n\nYou talk it out (or overthink it into oblivion). You rationalise feelings instead of feeling them. Detachment is your superpower and your biggest blind spot.",
      "Water Moons (Cancer, Scorpio, Pisces):\n\nYou ABSORB everything. Other people's stress becomes your stress. You need alone time to decompress or you'll explode. The most emotionally intuitive — and the most easily overwhelmed.\n\nFind your Moon sign: stellera.co/birth-chart",
    ],
  ],
  // Thread 6: "Mercury retrograde survival guide"
  [
    [
      "Mercury retrograde is NOT out to ruin your life.\n\nBut it IS affecting you differently based on your sign. Here's your actual survival guide (thread)",
      "What Mercury retrograde ACTUALLY does:\n\n- Slows communication (texts go wrong, emails get lost)\n- Revisits the past (exes resurface, old issues return)\n- Forces you to review, not start\n\nIt's not chaos — it's a cosmic audit.",
      "Fire signs (Aries, Leo, Sag):\nYou'll feel impatient. Things won't move fast enough. DON'T make impulsive decisions. Channel the frustration into revisiting old projects.\n\nEarth signs (Taurus, Virgo, Cap):\nYour plans will get disrupted. Let them. Flexibility is the lesson.",
      "Air signs (Gemini, Libra, Aquarius):\nCommunication is YOUR domain and it's glitching. Double-check every text, email, and contract. Re-read before you send.\n\nWater signs (Cancer, Scorpio, Pisces):\nEmotions from the past hit harder. Let them surface — this is healing, not regression.",
      "The #1 rule: Mercury retrograde is for RE- words.\n\nReview. Reflect. Revisit. Reconnect. Redo.\n\nDon't launch anything new. Polish what exists.\n\nYour full retrograde forecast: stellera.co/horoscope",
    ],
  ],
];

interface ScheduledPost {
  text: string;
  type: 'horoscope' | 'engagement' | 'thread';
  scheduledFor: string;
  sign?: string;
  threadTweets?: string[];
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

    // No external links — image has stellera.co watermark
    const formats = [
      `${sign.symbol} ${hook}.\n\n${firstSentence}\n\nLove ${stars(ratings.love)}\nCareer ${stars(ratings.career)}\nWellness ${stars(ratings.wellness)}\n\nFull reading in bio`,
      `${sign.symbol} ${sign.name} — ${formatDate()}\n\n${hook}.\n\n${firstSentence}\n\nLucky number: ${horoscope.luckyNumber} | Best match: ${horoscope.compatibility}\n\nWhat resonates? Reply with your sign`,
      `${sign.symbol} ${sign.name} daily horoscope\n\n${hook}.\n\n${firstSentence}\n\nSave this & check back tonight`,
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

  // 20 engagement posts spread through the day (08:30 - 22:00, ~45 min apart)
  const engTimes = [
    '08:30', '09:15', '10:00', '10:45', '11:30',
    '12:15', '13:00', '13:45', '14:30', '15:15',
    '16:00', '16:45', '17:30', '18:15', '19:00',
    '19:45', '20:15', '20:45', '21:15', '21:45',
  ];
  engTimes.forEach((time, i) => {
    const category = ENGAGEMENT_POSTS[i % ENGAGEMENT_POSTS.length];
    posts.push({
      text: pick(category, seed + i),
      type: 'engagement',
      scheduledFor: time,
    });
  });

  // 2 threads per day at 12:00 and 18:00 (high-engagement times)
  const threadTimes = ['12:00', '18:00'];
  threadTimes.forEach((time, i) => {
    const templateIndex = (seed + i) % THREAD_TEMPLATES.length;
    const variantIndex = (seed + i) % THREAD_TEMPLATES[templateIndex].length;
    const threadTweets = THREAD_TEMPLATES[templateIndex][variantIndex];

    posts.push({
      text: threadTweets[0],
      type: 'thread',
      scheduledFor: time,
      threadTweets,
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

  const results: PostResult[] = [];

  const hasFB = !!(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_TOKEN);
  const hasIG = !!(process.env.INSTAGRAM_ACCOUNT_ID && process.env.FACEBOOK_PAGE_TOKEN);

  for (const post of duePosts) {
    console.log(`  ${post.scheduledFor} | ${post.type} ${post.sign ?? ''}`);

    // Generate image once — reuse across all platforms
    const imageBuffer = post.type === 'thread'
      ? await generateEngagementCard()
      : post.type === 'horoscope' && post.sign
        ? await generateHoroscopeCard(post.sign)
        : await generateEngagementCard();

    // --- Twitter ---
    if (process.env.TWITTER_API_KEY) {
      try {
        const mediaId = await uploadMedia(imageBuffer);
        if (post.type === 'thread' && post.threadTweets) {
          const threadResults = await postThread(post.threadTweets, mediaId);
          console.log(`  [twitter] Thread posted (${threadResults.length} tweets): ${threadResults[0].id}`);
          results.push({
            timestamp: new Date().toISOString(),
            scheduledFor: post.scheduledFor,
            type: post.type,
            sign: post.sign,
            success: true,
            tweetId: threadResults[0].id,
          });
        } else {
          const result = await postToTwitter(post.text, mediaId);
          console.log(`  [twitter] Posted: ${result.id}`);
          results.push({
            timestamp: new Date().toISOString(),
            scheduledFor: post.scheduledFor,
            type: post.type,
            sign: post.sign,
            success: true,
            tweetId: result.id,
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`  [twitter] Failed:`, errorMsg);
        const failResult: PostResult = {
          timestamp: new Date().toISOString(),
          scheduledFor: post.scheduledFor,
          type: post.type,
          sign: post.sign,
          success: false,
          error: `Twitter: ${errorMsg}`,
        };
        results.push(failResult);
        await sendFailureAlert(failResult);
      }
    } else {
      console.log(`  [twitter][dry] ${post.text.slice(0, 80)}...`);
    }

    // --- Facebook ---
    if (hasFB) {
      try {
        const fbText = post.type === 'thread' && post.threadTweets
          ? threadToFacebookPost(post.threadTweets)
          : post.text;
        const fbResult = await postToFacebook(fbText, imageBuffer);
        console.log(`  [facebook] Posted: ${fbResult.id}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`  [facebook] Failed:`, errorMsg);
      }
    }

    // --- Instagram ---
    if (hasIG) {
      try {
        const igCaption = post.type === 'thread' && post.threadTweets
          ? threadToInstagramCaption(post.threadTweets, post.sign)
          : buildInstagramCaption(post.text, post.sign);
        const igResult = await postToInstagram(igCaption, imageBuffer);
        console.log(`  [instagram] Posted: ${igResult.id}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`  [instagram] Failed:`, errorMsg);
      }
    }

    // Space out posts by 10 seconds to avoid rate limits
    await new Promise((r) => setTimeout(r, 10_000));
  }

  // Persist results for daily digest
  if (results.length > 0) {
    appendResults(results);
  }
}

main().catch(console.error);
