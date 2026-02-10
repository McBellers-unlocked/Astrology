import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Star,
  Heart,
  MessageCircle,
  Shield,
  Clock,
  Lock,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Zodiac sign data (extended with modality & ruler)                         */
/* -------------------------------------------------------------------------- */

interface SignData {
  slug: string;
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
}

const SIGNS: SignData[] = [
  { slug: 'aries', name: 'Aries', symbol: '\u2648', element: 'Fire', modality: 'Cardinal', ruler: 'Mars' },
  { slug: 'taurus', name: 'Taurus', symbol: '\u2649', element: 'Earth', modality: 'Fixed', ruler: 'Venus' },
  { slug: 'gemini', name: 'Gemini', symbol: '\u264A', element: 'Air', modality: 'Mutable', ruler: 'Mercury' },
  { slug: 'cancer', name: 'Cancer', symbol: '\u264B', element: 'Water', modality: 'Cardinal', ruler: 'Moon' },
  { slug: 'leo', name: 'Leo', symbol: '\u264C', element: 'Fire', modality: 'Fixed', ruler: 'Sun' },
  { slug: 'virgo', name: 'Virgo', symbol: '\u264D', element: 'Earth', modality: 'Mutable', ruler: 'Mercury' },
  { slug: 'libra', name: 'Libra', symbol: '\u264E', element: 'Air', modality: 'Cardinal', ruler: 'Venus' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', element: 'Water', modality: 'Fixed', ruler: 'Pluto' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', element: 'Air', modality: 'Fixed', ruler: 'Uranus' },
  { slug: 'pisces', name: 'Pisces', symbol: '\u2653', element: 'Water', modality: 'Mutable', ruler: 'Neptune' },
];

/* -------------------------------------------------------------------------- */
/*  Element & modality compatibility matrices                                 */
/* -------------------------------------------------------------------------- */

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  Fire:  { Fire: 85, Air: 80, Earth: 45, Water: 40 },
  Earth: { Earth: 85, Water: 80, Fire: 45, Air: 40 },
  Air:   { Air: 85, Fire: 80, Water: 45, Earth: 40 },
  Water: { Water: 85, Earth: 80, Air: 45, Fire: 40 },
};

const MODALITY_COMPAT: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: 60, Fixed: 75, Mutable: 80 },
  Fixed:    { Fixed: 55, Cardinal: 75, Mutable: 70 },
  Mutable:  { Mutable: 65, Cardinal: 80, Fixed: 70 },
};

/* -------------------------------------------------------------------------- */
/*  Deterministic hash for seeding per-pairing variation                      */
/* -------------------------------------------------------------------------- */

function hashPair(a: string, b: string): number {
  const str = a + ':' + b;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* -------------------------------------------------------------------------- */
/*  Trait vocabulary keyed by element                                         */
/* -------------------------------------------------------------------------- */

const ELEMENT_TRAITS: Record<string, string[]> = {
  Fire: ['passionate', 'bold', 'enthusiastic', 'action-oriented', 'courageous', 'dynamic', 'warm-hearted', 'spontaneous'],
  Earth: ['grounded', 'dependable', 'sensual', 'pragmatic', 'patient', 'loyal', 'steady', 'nurturing'],
  Air: ['intellectual', 'communicative', 'curious', 'social', 'analytical', 'witty', 'visionary', 'adaptable'],
  Water: ['intuitive', 'emotional', 'empathetic', 'deep', 'nurturing', 'imaginative', 'sensitive', 'compassionate'],
};

const MODALITY_TRAITS: Record<string, string[]> = {
  Cardinal: ['initiative-driven', 'natural leaders', 'ambitious', 'pioneering'],
  Fixed: ['determined', 'persistent', 'focused', 'deeply committed'],
  Mutable: ['flexible', 'versatile', 'open-minded', 'adaptable'],
};

const ELEMENT_DESCRIPTORS: Record<string, string> = {
  Fire: 'fiery energy',
  Earth: 'earthy stability',
  Air: 'airy intellect',
  Water: 'emotional depth',
};

/* -------------------------------------------------------------------------- */
/*  Content generation engine                                                 */
/* -------------------------------------------------------------------------- */

interface PairingContent {
  overallScore: number;
  ratings: {
    love: number;
    communication: number;
    trust: number;
    sharedValues: number;
    longTerm: number;
  };
  overview: [string, string];
  loveRomance: [string, string];
  communicationStyle: [string, string];
  trustLoyalty: [string, string];
  longTermPotential: [string, string];
}

function generatePairingContent(sign1: SignData, sign2: SignData): PairingContent {
  const seed = hashPair(sign1.slug, sign2.slug);
  const rng = seededRandom(seed);

  /* --- Scores --- */
  const elementBase = ELEMENT_COMPAT[sign1.element][sign2.element];
  const modalityBase = MODALITY_COMPAT[sign1.modality][sign2.modality];

  const sameSign = sign1.slug === sign2.slug;
  const sameBonus = sameSign ? 8 : 0;

  const overallScore = Math.min(
    99,
    Math.max(
      28,
      Math.round(elementBase * 0.55 + modalityBase * 0.35 + sameBonus + (rng() * 12 - 4))
    )
  );

  const ratingFromScore = (base: number, variance: number): number => {
    const raw = base / 20 + (rng() * variance - variance / 2);
    return Math.min(5, Math.max(1, Math.round(raw)));
  };

  const love = ratingFromScore(
    overallScore + (sign1.ruler === 'Venus' || sign2.ruler === 'Venus' ? 10 : 0),
    1.2
  );
  const communication = ratingFromScore(
    overallScore + (sign1.element === 'Air' || sign2.element === 'Air' ? 8 : 0),
    1.0
  );
  const trust = ratingFromScore(
    overallScore + (sign1.modality === 'Fixed' || sign2.modality === 'Fixed' ? 8 : 0),
    1.4
  );
  const sharedValues = ratingFromScore(
    overallScore + (sign1.element === sign2.element ? 10 : 0),
    1.0
  );
  const longTerm = ratingFromScore(
    overallScore +
      (sign1.modality === sign2.modality ? 5 : 0) +
      (sign1.element === sign2.element ? 5 : 0),
    1.2
  );

  /* --- Helper to pick traits --- */
  const t1 = ELEMENT_TRAITS[sign1.element];
  const t2 = ELEMENT_TRAITS[sign2.element];
  const m1 = MODALITY_TRAITS[sign1.modality];
  const m2 = MODALITY_TRAITS[sign2.modality];
  const pick = (arr: string[]): string => arr[Math.floor(rng() * arr.length)];
  const d1 = ELEMENT_DESCRIPTORS[sign1.element];
  const d2 = ELEMENT_DESCRIPTORS[sign2.element];

  const sameElement = sign1.element === sign2.element;
  const complementary =
    (sign1.element === 'Fire' && sign2.element === 'Air') ||
    (sign1.element === 'Air' && sign2.element === 'Fire') ||
    (sign1.element === 'Earth' && sign2.element === 'Water') ||
    (sign1.element === 'Water' && sign2.element === 'Earth');
  const challenging =
    (sign1.element === 'Fire' && sign2.element === 'Water') ||
    (sign1.element === 'Water' && sign2.element === 'Fire') ||
    (sign1.element === 'Earth' && sign2.element === 'Air') ||
    (sign1.element === 'Air' && sign2.element === 'Earth');

  /* --- Overview --- */
  let overview1: string;
  let overview2: string;

  if (sameSign) {
    overview1 = `When two ${sign1.name} natives come together, the result is a mirror-like connection that amplifies everything both partners bring to the table. Ruled by ${sign1.ruler} and sharing the same ${sign1.element} element with a ${sign1.modality} modality, this pairing understands each other on an instinctive level that others rarely achieve. The ${pick(t1)} nature of ${sign1.name} is doubled, creating a relationship brimming with shared energy, mutual understanding, and an almost telepathic sense of what the other person needs.`;
    overview2 = `The challenge for two ${sign1.name} partners lies in navigating the very traits they share. When both individuals are equally ${pick(m1)} and ${pick(t1)}, power dynamics can become tricky. However, this pairing also has extraordinary potential for growth\u2014each partner serves as a reflection, helping the other see both their strengths and their blind spots with remarkable clarity. When this couple learns to celebrate rather than compete with each other\u2019s ${d1}, they become an unstoppable force.`;
  } else if (sameElement) {
    overview1 = `${sign1.name} and ${sign2.name} share the ${sign1.element} element, creating an intuitive understanding that forms the bedrock of this pairing. ${sign1.name}, ruled by ${sign1.ruler}, brings ${pick(t1)} energy with a ${sign1.modality.toLowerCase()} approach, while ${sign2.name}, guided by ${sign2.ruler}, contributes their own ${pick(t2)} and ${pick(m2)} nature. Together, they speak the same elemental language, allowing trust and rapport to develop naturally from the very first encounter.`;
    overview2 = `Where this pairing truly shines is in shared values and life philosophy. Both ${sign1.name} and ${sign2.name} approach the world through the lens of ${d1}, which means their priorities, rhythms, and emotional needs tend to align organically. The key difference\u2014their modalities (${sign1.modality} versus ${sign2.modality})\u2014actually adds productive variety, with ${sign1.name} contributing ${pick(m1)} qualities and ${sign2.name} offering a more ${pick(m2)} perspective. This complementary dynamic prevents the relationship from becoming stagnant.`;
  } else if (complementary) {
    overview1 = `${sign1.name} and ${sign2.name} form one of astrology\u2019s naturally complementary pairings, blending ${sign1.name}\u2019s ${d1} with ${sign2.name}\u2019s ${d2} in a way that energizes both partners. Ruled by ${sign1.ruler}, ${sign1.name} brings a ${pick(t1)} and ${pick(m1)} presence to the relationship, while ${sign2.ruler}-governed ${sign2.name} responds with ${pick(t2)} and ${pick(m2)} energy. Their elements feed each other\u2014${sign1.element} and ${sign2.element} form a classic astrological alliance that promotes growth and mutual inspiration.`;
    overview2 = `This pairing thrives because each sign offers what the other lacks. ${sign1.name}\u2019s ${pick(t1)} drive is tempered and enriched by ${sign2.name}\u2019s ${pick(t2)} qualities, while ${sign2.name} finds motivation and excitement in ${sign1.name}\u2019s ${pick(t1)} spirit. The ${sign1.modality}/${sign2.modality} dynamic adds another layer of complexity\u2014when channeled constructively, it means one partner initiates while the other refines, creating a relationship that is both visionary and grounded in reality.`;
  } else if (challenging) {
    overview1 = `${sign1.name} and ${sign2.name} represent one of astrology\u2019s more complex pairings, bringing together the ${d1} of ${sign1.name} with the ${d2} of ${sign2.name}. Ruled by ${sign1.ruler}, ${sign1.name} operates with ${pick(t1)} and ${pick(m1)} energy, while ${sign2.ruler}-guided ${sign2.name} leads with a ${pick(t2)} and ${pick(m2)} approach. These fundamental differences can create friction, but they also generate the kind of dynamic tension that fuels deep growth and irresistible attraction.`;
    overview2 = `The beauty of the ${sign1.name}\u2013${sign2.name} connection lies in its transformative potential. Each partner challenges the other to expand beyond their comfort zone\u2014${sign1.name} learns greater sensitivity from ${sign2.name}, while ${sign2.name} discovers new reserves of courage through ${sign1.name}\u2019s influence. It takes patience and willingness to bridge the gap between ${sign1.element} and ${sign2.element}, but couples who do the work discover a relationship richer and more multi-dimensional than many easier pairings.`;
  } else {
    overview1 = `${sign1.name} and ${sign2.name} create an intriguing pairing that blends ${sign1.name}\u2019s ${d1} with ${sign2.name}\u2019s ${d2}. Under the guidance of ${sign1.ruler}, ${sign1.name} brings ${pick(t1)} and ${pick(m1)} energy to the relationship, while ${sign2.name}, ruled by ${sign2.ruler}, contributes a ${pick(t2)} and ${pick(m2)} perspective. This combination of ${sign1.element} and ${sign2.element} elements creates a dynamic that requires conscious effort but offers unique rewards for partners willing to explore their differences.`;
    overview2 = `What makes the ${sign1.name}\u2013${sign2.name} bond work is the diversity of perspective each sign brings. ${sign1.name}\u2019s ${sign1.modality.toLowerCase()} nature drives the relationship forward with ${pick(t1)} intent, while ${sign2.name}\u2019s ${sign2.modality.toLowerCase()} approach ensures that both partners remain ${pick(t2)} and receptive to each other\u2019s needs. When these two learn to value rather than resist each other\u2019s fundamental approach to life, they unlock a partnership that covers all bases\u2014from the practical to the emotional to the intellectual.`;
  }

  /* --- Love & Romance --- */
  let love1: string;
  let love2: string;

  if (overallScore >= 70) {
    love1 = `Romantic chemistry between ${sign1.name} and ${sign2.name} flows with a natural magnetism that both partners can feel from the very beginning. ${sign1.name}\u2019s ${pick(t1)} approach to love is beautifully received by ${sign2.name}\u2019s ${pick(t2)} heart, creating a dynamic where both feel seen, desired, and appreciated. Physical attraction is strong\u2014${sign1.name}\u2019s ${sign1.ruler}-influenced passion meets ${sign2.name}\u2019s ${sign2.ruler}-governed sensibility in ways that keep the spark alive long after the initial honeymoon phase fades.`;
    love2 = `In the bedroom and beyond, this pair discovers that their ${d1} and ${d2} combination translates into a rich, evolving romantic life. ${sign1.name} brings spontaneity and ${pick(t1)} intensity, while ${sign2.name} adds ${pick(t2)} tenderness and depth. Date nights feel effortless, expressions of love feel genuine, and even their disagreements carry an undercurrent of passion that ultimately strengthens the bond. This is a pairing where love, once kindled, has the fuel to burn brightly for years.`;
  } else if (overallScore >= 50) {
    love1 = `Love between ${sign1.name} and ${sign2.name} develops at its own pace, often beginning with a curiosity that deepens into genuine affection over time. ${sign1.name}\u2019s ${pick(t1)} romantic style may initially feel different from ${sign2.name}\u2019s ${pick(t2)} approach, but this difference becomes the source of the relationship\u2019s richest moments. ${sign1.ruler}\u2019s influence on ${sign1.name} creates a lover who is ${pick(m1)}, while ${sign2.ruler} gifts ${sign2.name} with a ${pick(m2)} quality in matters of the heart.`;
    love2 = `The key to unlocking the romantic potential of this pairing lies in learning each other\u2019s love language. ${sign1.name} tends to express affection through ${sign1.element === 'Fire' ? 'grand gestures and enthusiastic declarations' : sign1.element === 'Earth' ? 'acts of service and physical presence' : sign1.element === 'Air' ? 'words of affirmation and intellectual engagement' : 'deep emotional availability and intuitive care'}, while ${sign2.name} feels most loved through ${sign2.element === 'Fire' ? 'excitement, adventure, and open admiration' : sign2.element === 'Earth' ? 'consistency, reliability, and tangible devotion' : sign2.element === 'Air' ? 'stimulating conversation and shared ideas' : 'emotional intimacy and soulful connection'}. Once they crack this code, the romance deepens significantly.`;
  } else {
    love1 = `Romance between ${sign1.name} and ${sign2.name} requires patience, intentionality, and a willingness to meet each other outside familiar territory. ${sign1.name}\u2019s ${pick(t1)} approach to love operates on a fundamentally different wavelength than ${sign2.name}\u2019s ${pick(t2)} style, which can lead to misunderstandings in the early stages. ${sign1.name} may feel that ${sign2.name} is too ${sign2.element === 'Water' ? 'emotionally intense' : sign2.element === 'Earth' ? 'cautious and reserved' : sign2.element === 'Air' ? 'detached and cerebral' : 'impulsive and overwhelming'}, while ${sign2.name} might perceive ${sign1.name} as ${sign1.element === 'Fire' ? 'reckless with their heart' : sign1.element === 'Earth' ? 'too slow to open up' : sign1.element === 'Air' ? 'emotionally unavailable' : 'too clingy or moody'}.`;
    love2 = `Despite these challenges, the ${sign1.name}\u2013${sign2.name} romance holds a secret advantage: the tension between ${d1} and ${d2} can generate a magnetic attraction that smoother pairings never experience. When ${sign1.name} makes the effort to understand ${sign2.name}\u2019s deeper ${pick(t2)} needs, and ${sign2.name} learns to appreciate ${sign1.name}\u2019s ${pick(t1)} way of showing love, they discover a relationship that is hard-won but deeply rewarding. The couples who make this work often describe it as the most growth-inspiring love of their lives.`;
  }

  /* --- Communication Style --- */
  let comm1: string;
  let comm2: string;

  const airPresent = sign1.element === 'Air' || sign2.element === 'Air';
  const mercuryPresent = sign1.ruler === 'Mercury' || sign2.ruler === 'Mercury';

  if (airPresent || mercuryPresent) {
    comm1 = `Communication flows with particular ease in this pairing, ${airPresent ? 'thanks to the Air element\u2019s natural affinity for dialogue and exchange of ideas' : `aided by Mercury\u2019s influence on ${sign1.ruler === 'Mercury' ? sign1.name : sign2.name}`}. ${sign1.name} communicates with a ${pick(t1)} directness shaped by their ${sign1.modality.toLowerCase()} nature, while ${sign2.name} brings a ${pick(t2)} and ${pick(m2)} communication style to the table. Together, they create conversations that are both stimulating and productive\u2014the kind of talks that go from lighthearted banter to profound revelation without missing a beat.`;
    comm2 = `Where this pair excels is in problem-solving through dialogue. ${sign1.name}\u2019s ${sign1.ruler}-influenced perspective offers ${pick(m1)} solutions, while ${sign2.name}\u2019s ${sign2.ruler}-guided mind provides ${pick(m2)} alternatives. Arguments, when they arise, tend to be resolved relatively quickly because both partners value clarity over winning. The main caution is ensuring that intellectual connection doesn\u2019t substitute for emotional vulnerability\u2014the deepest conversations require heart as well as mind.`;
  } else {
    comm1 = `Communication between ${sign1.name} and ${sign2.name} follows a rhythm unique to their elemental pairing. ${sign1.name}, influenced by ${sign1.ruler}, tends to express themselves in a ${pick(t1)} and ${pick(m1)} manner\u2014${sign1.element === 'Fire' ? 'direct, passionate, and sometimes blunt' : sign1.element === 'Earth' ? 'measured, practical, and rooted in facts' : 'emotionally nuanced, intuitive, and deeply personal'}. ${sign2.name}, under ${sign2.ruler}\u2019s guidance, communicates with ${pick(t2)} and ${pick(m2)} qualities\u2014${sign2.element === 'Fire' ? 'enthusiasm that lights up the room' : sign2.element === 'Earth' ? 'deliberate care that builds trust word by word' : 'sensitivity that reads between every line'}.`;
    comm2 = `The communication challenge for ${sign1.name} and ${sign2.name} is bridging the gap between their different processing styles. ${sign1.name} may need to slow down and create space for ${sign2.name}\u2019s more ${pick(t2)} approach, while ${sign2.name} benefits from matching some of ${sign1.name}\u2019s ${pick(t1)} energy in discussions. The breakthrough moment often comes when both partners realize that different communication styles aren\u2019t wrong\u2014they\u2019re just different dialects of the same desire to connect. Patience and active listening transform this area from a challenge into a genuine strength.`;
  }

  /* --- Trust & Loyalty --- */
  let trust1: string;
  let trust2: string;

  const fixedPresent = sign1.modality === 'Fixed' || sign2.modality === 'Fixed';
  const saturnPresent = sign1.ruler === 'Saturn' || sign2.ruler === 'Saturn';

  if (fixedPresent || saturnPresent) {
    trust1 = `Trust in the ${sign1.name}\u2013${sign2.name} relationship benefits from ${fixedPresent ? `the unwavering loyalty that ${sign1.modality === 'Fixed' ? sign1.name : sign2.name}\u2019s Fixed modality brings to the partnership` : `Saturn\u2019s influence on ${sign1.ruler === 'Saturn' ? sign1.name : sign2.name}, which prioritizes commitment and long-term stability`}. ${sign1.name}\u2019s ${pick(t1)} nature means they approach trust with ${sign1.modality === 'Fixed' ? 'absolute devotion once earned' : sign1.modality === 'Cardinal' ? 'bold initiative in building the foundation' : 'adaptable openness that grows over time'}, while ${sign2.name} builds trust through their ${pick(t2)} and ${pick(m2)} consistency.`;
    trust2 = `Loyalty is rarely the issue for this pair\u2014once committed, both ${sign1.name} and ${sign2.name} take their bond seriously. The trust challenges that do arise tend to stem from their different ways of demonstrating reliability. ${sign1.name} shows trustworthiness through ${sign1.element === 'Fire' ? 'fierce protectiveness and transparent intentions' : sign1.element === 'Earth' ? 'steadfast actions and practical dependability' : sign1.element === 'Air' ? 'honest communication and intellectual fidelity' : 'emotional attunement and intuitive faithfulness'}, while ${sign2.name} proves their loyalty through ${sign2.element === 'Fire' ? 'passionate defense and open-hearted honesty' : sign2.element === 'Earth' ? 'reliable presence and unwavering support' : sign2.element === 'Air' ? 'consistent engagement and transparent dialogue' : 'deep emotional investment and psychic-level devotion'}. Understanding these different trust languages prevents unnecessary doubt.`;
  } else {
    trust1 = `Building trust between ${sign1.name} and ${sign2.name} is a journey that rewards patience and consistency. ${sign1.name}\u2019s ${sign1.modality.toLowerCase()}, ${sign1.ruler}-influenced nature approaches trust with ${pick(t1)} openness, while ${sign2.name}\u2019s ${sign2.modality.toLowerCase()} temperament under ${sign2.ruler}\u2019s guidance takes a more ${pick(t2)} path to vulnerability. Neither approach is wrong\u2014they simply represent different timelines for the same destination: a secure, reliable bond.`;
    trust2 = `The most important trust-building practice for ${sign1.name} and ${sign2.name} is consistency over grand gestures. ${sign1.name} earns ${sign2.name}\u2019s trust by showing up reliably in the small moments\u2014keeping promises, remembering details, and being present rather than performative. ${sign2.name} deepens ${sign1.name}\u2019s trust by honoring their ${pick(t1)} nature without trying to change it, and by creating a safe space where ${sign1.name}\u2019s ${d1} is welcomed rather than judged. Over time, this pairing can develop a trust so deep it becomes the relationship\u2019s most powerful asset.`;
  }

  /* --- Long-term Potential --- */
  let lt1: string;
  let lt2: string;

  if (overallScore >= 70) {
    lt1 = `The long-term outlook for ${sign1.name} and ${sign2.name} is genuinely promising. Their ${sameElement ? 'shared ' + sign1.element + ' element' : sign1.element + '/' + sign2.element + ' elemental blend'} creates a foundation that supports both stability and growth\u2014the two essential ingredients for a lasting partnership. ${sign1.name}\u2019s ${pick(m1)} drive combines with ${sign2.name}\u2019s ${pick(m2)} qualities to create a relationship that evolves naturally through life\u2019s chapters, from the excitement of early connection to the deep comfort of mature partnership.`;
    lt2 = `As years pass, ${sign1.name} and ${sign2.name} often find that their bond deepens rather than fades. ${sign1.name}\u2019s ${sign1.ruler}-influenced ${pick(t1)} energy keeps the relationship vibrant, while ${sign2.name}\u2019s ${sign2.ruler}-guided ${pick(t2)} presence provides the emotional or practical anchoring that prevents things from unraveling during difficult seasons. This is a pairing that improves with time\u2014their shared experiences become a rich tapestry of memories, inside jokes, mutual respect, and the kind of deep knowing that only comes from choosing each other again and again.`;
  } else if (overallScore >= 50) {
    lt1 = `Long-term success for ${sign1.name} and ${sign2.name} depends largely on how well both partners navigate their core differences. The ${sign1.element}/${sign2.element} dynamic presents both opportunities and challenges over time\u2014${sign1.name}\u2019s ${pick(t1)} nature can either invigorate or exhaust ${sign2.name}\u2019s ${pick(t2)} sensibility, depending on how consciously they manage the balance. The ${sign1.modality}/${sign2.modality} interplay adds another dimension, with ${sign1.name} bringing ${pick(m1)} energy and ${sign2.name} offering ${pick(m2)} adaptability.`;
    lt2 = `The couples in this pairing who go the distance share a common trait: they treat their differences as features rather than bugs. ${sign1.name} learns to value ${sign2.name}\u2019s ${d2} as a complement to their own ${d1}, and ${sign2.name} discovers that ${sign1.name}\u2019s ${pick(t1)} way of moving through the world opens doors they never would have found alone. Shared goals, mutual respect, and a genuine willingness to grow together transform a moderate-compatibility pairing into a love story that defies astrological expectations.`;
  } else {
    lt1 = `The long-term path for ${sign1.name} and ${sign2.name} is one that requires significant conscious effort from both partners. The fundamental tension between ${d1} and ${d2} doesn\u2019t disappear with time\u2014it simply evolves, requiring new strategies and deeper understanding at each stage. ${sign1.name}\u2019s ${pick(m1)} approach to life goals may clash with ${sign2.name}\u2019s ${pick(m2)} priorities, and without regular, honest communication about where they\u2019re heading, these two can drift onto very different paths.`;
    lt2 = `However, astrology describes tendencies, not destinies. The ${sign1.name}\u2013${sign2.name} couples who build lasting partnerships are often among the most resilient and self-aware in the zodiac. The work required to bridge their differences develops extraordinary relationship skills\u2014empathy, patience, flexibility, and deep listening. ${sign1.name} brings ${pick(t1)} determination to the relationship\u2019s growth, while ${sign2.name} contributes ${pick(t2)} wisdom about the emotional terrain. Together, they prove that love\u2019s greatest victories are earned, not given.`;
  }

  return {
    overallScore,
    ratings: { love, communication, trust, sharedValues, longTerm },
    overview: [overview1, overview2],
    loveRomance: [love1, love2],
    communicationStyle: [comm1, comm2],
    trustLoyalty: [trust1, trust2],
    longTermPotential: [lt1, lt2],
  };
}

/* -------------------------------------------------------------------------- */
/*  Static params: all 144 pairings (12 x 12)                                */
/* -------------------------------------------------------------------------- */

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const s1 of SIGNS) {
    for (const s2 of SIGNS) {
      params.push({ slug: `${s1.slug}-${s2.slug}` });
    }
  }
  return params;
}

/* -------------------------------------------------------------------------- */
/*  SEO metadata                                                             */
/* -------------------------------------------------------------------------- */

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: 'Compatibility | Stellara' };

  const { sign1, sign2 } = parsed;
  const content = generatePairingContent(sign1, sign2);

  return {
    title: `${sign1.name} & ${sign2.name} Compatibility | Love, Trust & More | Stellara`,
    description: `Discover ${sign1.name} and ${sign2.name} compatibility (${content.overallScore}% match). Detailed analysis of love, communication, trust, shared values, and long-term potential between ${sign1.name} (${sign1.element}) and ${sign2.name} (${sign2.element}).`,
    openGraph: {
      title: `${sign1.symbol} ${sign1.name} & ${sign2.symbol} ${sign2.name} Compatibility \u2013 Stellara`,
      description: `${content.overallScore}% compatibility score. See how ${sign1.name} and ${sign2.name} match in love, trust, and communication.`,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Helper: parse slug into two sign data objects                             */
/* -------------------------------------------------------------------------- */

function parseSlug(slug: string): { sign1: SignData; sign2: SignData } | null {
  const parts = slug.split('-');
  for (let i = 1; i <= parts.length - 1; i++) {
    const candidate1 = parts.slice(0, i).join('-');
    const candidate2 = parts.slice(i).join('-');
    const s1 = SIGNS.find((s) => s.slug === candidate1);
    const s2 = SIGNS.find((s) => s.slug === candidate2);
    if (s1 && s2) return { sign1: s1, sign2: s2 };
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function CompatStarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating
              ? 'fill-stardust-400 text-stardust-400'
              : 'fill-transparent text-dust-600'
          }
        />
      ))}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? 'text-aurora-400'
      : score >= 50
        ? 'text-stardust-400'
        : 'text-nebula-400';

  const glowColor =
    score >= 75
      ? 'rgba(52,211,153,0.3)'
      : score >= 50
        ? 'rgba(251,191,36,0.3)'
        : 'rgba(244,114,182,0.3)';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background ring */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-space-700"
        />
        {/* Score ring */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-foreground">{score}</span>
        <span className="text-xs text-dust-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

function ContentSection({
  icon: Icon,
  title,
  paragraphs,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  paragraphs: [string, string];
}) {
  return (
    <section className="glass-card p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-celestial-500/10 border border-celestial-500/20">
          <Icon size={18} className="text-celestial-300" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-dust-300 sm:text-base sm:leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function RatingRow({
  icon: Icon,
  label,
  rating,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  rating: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-dust-300">
        <Icon size={15} className="text-dust-400" />
        <span>{label}</span>
      </div>
      <CompatStarRating rating={rating} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default async function CompatibilityPairingPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const { sign1, sign2 } = parsed;
  const content = generatePairingContent(sign1, sign2);

  /* Related pairings: 2 involving sign1, 2 involving sign2 (excluding current) */
  const seed = hashPair(sign1.slug, sign2.slug);
  const rng = seededRandom(seed + 999);
  const otherSigns = SIGNS.filter(
    (s) => s.slug !== sign1.slug && s.slug !== sign2.slug
  );
  const shuffled = [...otherSigns].sort(() => rng() - 0.5);
  const related = [
    { s1: sign1, s2: shuffled[0] },
    { s1: sign1, s2: shuffled[1] },
    { s1: sign2, s2: shuffled[2] },
    { s1: sign2, s2: shuffled[3] },
  ];

  return (
    <main className="relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-celestial-500/[0.04] blur-[120px]" />
        <div className="absolute right-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-nebula-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[350px] w-[350px] rounded-full bg-stardust-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/*  Breadcrumb                                                      */}
        {/* ---------------------------------------------------------------- */}
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-dust-500"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-celestial-300">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/compatibility"
            className="transition-colors hover:text-celestial-300"
          >
            Compatibility
          </Link>
          <ChevronRight size={14} />
          <span className="text-dust-300">
            {sign1.name} &amp; {sign2.name}
          </span>
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/*  Header                                                          */}
        {/* ---------------------------------------------------------------- */}
        <header className="mb-12 text-center">
          {/* Zodiac symbols */}
          <div className="mb-6 flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-6xl sm:text-7xl lg:text-8xl"
                aria-hidden="true"
              >
                {sign1.symbol}
              </span>
              <span className="text-sm font-medium text-dust-400">
                {sign1.name}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Heart size={28} className="text-nebula-400" />
              <span className="text-xs text-dust-500">&amp;</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span
                className="text-6xl sm:text-7xl lg:text-8xl"
                aria-hidden="true"
              >
                {sign2.symbol}
              </span>
              <span className="text-sm font-medium text-dust-400">
                {sign2.name}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="gradient-text text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {sign1.name} &amp; {sign2.name} Compatibility
          </h1>

          {/* Element badges */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-celestial-500/20 bg-celestial-500/5 px-3 py-1 text-xs font-medium text-celestial-200">
              {sign1.element} &middot; {sign1.modality}
            </span>
            <span className="text-dust-600">&times;</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-celestial-500/20 bg-celestial-500/5 px-3 py-1 text-xs font-medium text-celestial-200">
              {sign2.element} &middot; {sign2.modality}
            </span>
          </div>

          {/* Overall Score */}
          <div className="mt-8">
            <ScoreRing score={content.overallScore} />
            <p className="mt-3 text-sm text-dust-400">
              Overall Compatibility Score
            </p>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/*  Main content grid                                               */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column: content sections */}
          <div className="space-y-8">
            {/* Ratings grid */}
            <section className="glass-card p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stardust-500/10 border border-stardust-500/20">
                  <Sparkles size={18} className="text-stardust-400" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Compatibility Ratings
                </h2>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <RatingRow
                  icon={Heart}
                  label="Love"
                  rating={content.ratings.love}
                />
                <RatingRow
                  icon={MessageCircle}
                  label="Communication"
                  rating={content.ratings.communication}
                />
                <RatingRow
                  icon={Shield}
                  label="Trust"
                  rating={content.ratings.trust}
                />
                <RatingRow
                  icon={Star}
                  label="Shared Values"
                  rating={content.ratings.sharedValues}
                />
                <RatingRow
                  icon={Clock}
                  label="Long-term Potential"
                  rating={content.ratings.longTerm}
                />
              </div>
            </section>

            <hr className="section-divider" />

            {/* Content sections */}
            <ContentSection
              icon={Sparkles}
              title="Overview"
              paragraphs={content.overview}
            />

            <ContentSection
              icon={Heart}
              title="Love & Romance"
              paragraphs={content.loveRomance}
            />

            <ContentSection
              icon={MessageCircle}
              title="Communication Style"
              paragraphs={content.communicationStyle}
            />

            <ContentSection
              icon={Shield}
              title="Trust & Loyalty"
              paragraphs={content.trustLoyalty}
            />

            <ContentSection
              icon={Clock}
              title="Long-term Potential"
              paragraphs={content.longTermPotential}
            />

            <hr className="section-divider" />

            {/* -------------------------------------------------------------- */}
            {/*  Premium locked section: Full Synastry Chart Analysis           */}
            {/* -------------------------------------------------------------- */}
            <section className="glass-card overflow-hidden">
              <div className="border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-celestial-300" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Full Synastry Chart Analysis
                  </h2>
                  <span className="premium-badge ml-auto">Premium</span>
                </div>
              </div>

              <div className="relative px-6 py-5">
                {/* Visible preview paragraph */}
                <p className="mb-4 text-sm leading-relaxed text-dust-300">
                  A full synastry chart overlays {sign1.name}&apos;s and{' '}
                  {sign2.name}&apos;s complete natal charts to reveal the
                  deepest patterns of compatibility. This analysis examines
                  every planetary aspect between both charts, including
                  Venus-Mars connections for romantic chemistry, Moon-Moon
                  aspects for emotional attunement, and Saturn contacts for
                  long-term stability.
                </p>

                {/* Blurred / locked content */}
                <div className="relative">
                  <div
                    className="select-none text-sm leading-relaxed text-dust-300"
                    style={{
                      filter: 'blur(6px)',
                      WebkitFilter: 'blur(6px)',
                      userSelect: 'none',
                    }}
                    aria-hidden="true"
                  >
                    The interaspect analysis between {sign1.name} and{' '}
                    {sign2.name} reveals a fascinating pattern of planetary
                    connections that go far beyond sun-sign compatibility. Your
                    Venus in relation to their Mars creates a magnetic attraction
                    axis, while the Moon-Saturn contacts suggest a karmic bond
                    that spans multiple lifetimes. The composite chart midpoints
                    indicate areas of extraordinary creative potential and shared
                    purpose that become increasingly powerful as the relationship
                    matures. Additionally, the nodal axis connections reveal the
                    spiritual lessons this partnership is designed to teach both
                    individuals, offering a roadmap for conscious evolution
                    through love.
                  </div>

                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gradient-to-t from-space-900/95 via-space-900/80 to-transparent">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stardust-500/30 bg-stardust-500/10">
                        <Lock size={18} className="text-stardust-400" />
                      </div>
                      <p className="text-sm font-medium text-dust-200">
                        Unlock the full synastry analysis
                      </p>
                      <Link
                        href="/pricing"
                        className="btn-glow inline-flex items-center gap-2 !px-5 !py-2 text-xs"
                      >
                        <Sparkles size={12} />
                        Get Premium Access
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/*  Right column: sidebar                                           */}
          {/* ---------------------------------------------------------------- */}
          <aside className="space-y-6">
            {/* Sign details card */}
            <div className="glass-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-dust-300">
                <Sparkles size={14} className="text-stardust-400" />
                Sign Details
              </h3>
              <div className="space-y-4">
                {[sign1, sign2].map((sign) => (
                  <div
                    key={sign.slug}
                    className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{sign.symbol}</span>
                      <span className="font-semibold text-foreground text-sm">
                        {sign.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-dust-400">
                      <span>Element:</span>
                      <span className="text-dust-200">{sign.element}</span>
                      <span>Modality:</span>
                      <span className="text-dust-200">{sign.modality}</span>
                      <span>Ruler:</span>
                      <span className="text-dust-200">{sign.ruler}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related pairings */}
            <div className="glass-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-dust-300">
                <Heart size={14} className="text-nebula-400" />
                Related Pairings
              </h3>
              <div className="space-y-2">
                {related.map(({ s1, s2 }, i) => {
                  const pairScore = generatePairingContent(s1, s2).overallScore;
                  return (
                    <Link
                      key={i}
                      href={`/compatibility/${s1.slug}-${s2.slug}`}
                      className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground group"
                    >
                      <span className="flex items-center gap-2">
                        <span>{s1.symbol}</span>
                        <span>&amp;</span>
                        <span>{s2.symbol}</span>
                        <span className="ml-1">
                          {s1.name} &amp; {s2.name}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-dust-500">
                          {pairScore}%
                        </span>
                        <ArrowRight
                          size={14}
                          className="text-celestial-400 group-hover:translate-x-0.5 transition-transform"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Navigation links to both signs' zodiac pages */}
            <div className="glass-card p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-dust-300">
                Explore These Signs
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/horoscope/${sign1.slug}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
                >
                  <span>
                    {sign1.symbol} {sign1.name} Horoscope
                  </span>
                  <ArrowRight size={14} className="text-celestial-400" />
                </Link>
                <Link
                  href={`/horoscope/${sign2.slug}`}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-sm text-dust-300 transition-all hover:border-celestial-500/20 hover:bg-celestial-500/5 hover:text-foreground"
                >
                  <span>
                    {sign2.symbol} {sign2.name} Horoscope
                  </span>
                  <ArrowRight size={14} className="text-celestial-400" />
                </Link>
              </div>
            </div>

            {/* Premium CTA sidebar */}
            <div className="glass-card p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stardust-500/30 bg-stardust-500/10 mx-auto mb-3">
                <Sparkles size={20} className="text-stardust-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Want Deeper Insights?
              </h3>
              <p className="text-xs text-dust-400 mb-4 leading-relaxed">
                Unlock full synastry charts, transit alerts, and personalized
                compatibility reports with Stellara Premium.
              </p>
              <Link
                href="/pricing"
                className="btn-glow inline-flex items-center gap-2 !px-5 !py-2.5 text-xs w-full justify-center"
              >
                <Star size={14} />
                View Premium Plans
              </Link>
            </div>
          </aside>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  Section divider                                                  */}
        {/* ---------------------------------------------------------------- */}
        <hr className="section-divider my-12" />

        {/* ---------------------------------------------------------------- */}
        {/*  Bottom navigation: both sign zodiac pages                       */}
        {/* ---------------------------------------------------------------- */}
        <nav className="grid grid-cols-2 gap-4">
          <Link
            href={`/horoscope/${sign1.slug}`}
            className="glass-card-hover group flex items-center gap-4 p-5"
          >
            <span className="text-3xl">{sign1.symbol}</span>
            <div className="min-w-0">
              <p className="text-xs text-dust-500">Learn more about</p>
              <p className="truncate text-lg font-semibold text-foreground">
                {sign1.name}
              </p>
              <p className="text-xs text-dust-500">
                {sign1.element} &middot; {sign1.modality}
              </p>
            </div>
            <ArrowRight
              size={18}
              className="ml-auto shrink-0 text-dust-500 transition-transform group-hover:translate-x-1 group-hover:text-celestial-300"
            />
          </Link>
          <Link
            href={`/horoscope/${sign2.slug}`}
            className="glass-card-hover group flex items-center gap-4 p-5"
          >
            <span className="text-3xl">{sign2.symbol}</span>
            <div className="min-w-0">
              <p className="text-xs text-dust-500">Learn more about</p>
              <p className="truncate text-lg font-semibold text-foreground">
                {sign2.name}
              </p>
              <p className="text-xs text-dust-500">
                {sign2.element} &middot; {sign2.modality}
              </p>
            </div>
            <ArrowRight
              size={18}
              className="ml-auto shrink-0 text-dust-500 transition-transform group-hover:translate-x-1 group-hover:text-celestial-300"
            />
          </Link>
        </nav>

        {/* All compatibility link */}
        <div className="mt-8 text-center">
          <Link
            href="/compatibility"
            className="inline-flex items-center gap-2 text-sm text-celestial-300 transition-colors hover:text-celestial-100"
          >
            <span>View All Compatibility Pairings</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
