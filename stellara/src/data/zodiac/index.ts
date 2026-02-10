// ============================================================================
// Stellara — Zodiac Data & Compatibility Engine
// Shared data, scoring logic, and content generation used across all pages
// ============================================================================

export interface SignData {
  slug: string;
  name: string;
  symbol: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  shortDescription: string;
}

export const SIGNS: SignData[] = [
  {
    slug: 'aries', name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19',
    element: 'Fire', modality: 'Cardinal', ruler: 'Mars',
    shortDescription: 'Bold and ambitious, Aries dives headfirst into even the most challenging situations with unwavering determination and fiery enthusiasm.',
  },
  {
    slug: 'taurus', name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20',
    element: 'Earth', modality: 'Fixed', ruler: 'Venus',
    shortDescription: 'Reliable and devoted, Taurus savors the beauty of the physical world with an unmatched appreciation for comfort, luxury, and sensory pleasure.',
  },
  {
    slug: 'gemini', name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20',
    element: 'Air', modality: 'Mutable', ruler: 'Mercury',
    shortDescription: 'Expressive and quick-witted, Gemini represents two different personalities in one, endlessly curious and socially vibrant.',
  },
  {
    slug: 'cancer', name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22',
    element: 'Water', modality: 'Cardinal', ruler: 'Moon',
    shortDescription: 'Deeply intuitive and sentimental, Cancer navigates the world through emotion and nurtures those they love with fierce protectiveness.',
  },
  {
    slug: 'leo', name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22',
    element: 'Fire', modality: 'Fixed', ruler: 'Sun',
    shortDescription: 'Creative and dramatic, Leo commands attention with natural charisma, warmth, and an unmistakable desire to be celebrated.',
  },
  {
    slug: 'virgo', name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22',
    element: 'Earth', modality: 'Mutable', ruler: 'Mercury',
    shortDescription: 'Analytical and practical, Virgo approaches life with methodical precision and a deep desire to be of service to others.',
  },
  {
    slug: 'libra', name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22',
    element: 'Air', modality: 'Cardinal', ruler: 'Venus',
    shortDescription: 'Diplomatic and gracious, Libra seeks harmony and balance in all things, drawn to beauty, partnership, and fair-minded ideals.',
  },
  {
    slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21',
    element: 'Water', modality: 'Fixed', ruler: 'Pluto',
    shortDescription: 'Passionate and assertive, Scorpio lives with unmatched intensity, wielding emotional depth as both shield and compass.',
  },
  {
    slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21',
    element: 'Fire', modality: 'Mutable', ruler: 'Jupiter',
    shortDescription: 'Adventurous and optimistic, Sagittarius chases freedom and truth across every horizon with philosophical curiosity and infectious enthusiasm.',
  },
  {
    slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19',
    element: 'Earth', modality: 'Cardinal', ruler: 'Saturn',
    shortDescription: 'Disciplined and responsible, Capricorn masters the art of patience, steadily climbing toward ambitious goals with quiet resilience.',
  },
  {
    slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18',
    element: 'Air', modality: 'Fixed', ruler: 'Uranus',
    shortDescription: 'Progressive and original, Aquarius is the humanitarian visionary of the zodiac, driven by ideals and a fierce commitment to independence.',
  },
  {
    slug: 'pisces', name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20',
    element: 'Water', modality: 'Mutable', ruler: 'Neptune',
    shortDescription: 'Compassionate and artistic, Pisces swims through life guided by intuition, empathy, and an otherworldly connection to the collective unconscious.',
  },
];

// ============================================================================
// Element Metadata
// ============================================================================

export const ELEMENT_STYLES: Record<string, { text: string; bg: string; border: string; icon: string }> = {
  Fire:  { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: '\uD83D\uDD25' },
  Earth: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '\uD83C\uDF3F' },
  Air:   { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: '\uD83D\uDCA8' },
  Water: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '\uD83C\uDF0A' },
};

export const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Fire: 'Passionate, dynamic, and temperamental. Fire signs are driven by inspiration and desire.',
  Earth: 'Grounded, practical, and stable. Earth signs build lasting foundations through patience and persistence.',
  Air: 'Intellectual, communicative, and social. Air signs navigate the world through ideas and connection.',
  Water: 'Intuitive, emotional, and sensitive. Water signs flow through life guided by feeling and instinct.',
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getSignBySlug(slug: string): SignData | undefined {
  return SIGNS.find(s => s.slug === slug);
}

function getSignIndex(slug: string): number {
  return SIGNS.findIndex(s => s.slug === slug);
}

function deterministicHash(s1: string, s2: string): number {
  const combined = s1 + '-' + s2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

type AspectKind = 'conjunction' | 'semi-sextile' | 'sextile' | 'square' | 'trine' | 'quincunx' | 'opposition';

export function getAspect(slug1: string, slug2: string): AspectKind {
  const i1 = getSignIndex(slug1);
  const i2 = getSignIndex(slug2);
  const distance = Math.min(Math.abs(i1 - i2), 12 - Math.abs(i1 - i2));
  const map: AspectKind[] = ['conjunction', 'semi-sextile', 'sextile', 'square', 'trine', 'quincunx', 'opposition'];
  return map[distance] ?? 'conjunction';
}

// ============================================================================
// Compatibility Scoring
// ============================================================================

export function calculateCompatibility(slug1: string, slug2: string): number {
  const aspect = getAspect(slug1, slug2);
  const jitter = deterministicHash(slug1, slug2);

  const ranges: Record<AspectKind, [number, number]> = {
    conjunction:  [75, 85],
    semi_sextile: [60, 70] as [number, number],
    sextile:      [76, 86],
    square:       [55, 68],
    trine:        [85, 95],
    quincunx:     [54, 66],
    opposition:   [78, 90],
  } as Record<string, [number, number]>;

  const key = aspect.replace('-', '_') as string;
  const range = (ranges as Record<string, [number, number]>)[key] ?? [65, 75];
  const [min, max] = range;
  return min + (jitter % (max - min + 1));
}

export interface CompatibilityRatings {
  love: number;
  communication: number;
  trust: number;
  sharedValues: number;
  emotionalConnection: number;
}

export function getCompatibilityRatings(slug1: string, slug2: string): CompatibilityRatings {
  const base = calculateCompatibility(slug1, slug2);
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const h = deterministicHash(slug1, slug2);

  const toStars = (score: number) => Math.max(1, Math.min(5, Math.round(score / 20)));

  // Love bonus: Venus-ruled signs, water signs
  let love = base + ((['Venus'].includes(s1.ruler) || ['Venus'].includes(s2.ruler)) ? 8 : 0)
    + (s1.element === 'Water' || s2.element === 'Water' ? 4 : 0) - (h % 7);

  // Communication bonus: Mercury-ruled, air signs
  let comm = base + ((['Mercury'].includes(s1.ruler) || ['Mercury'].includes(s2.ruler)) ? 8 : 0)
    + (s1.element === 'Air' || s2.element === 'Air' ? 5 : 0) - ((h >> 3) % 8);

  // Trust bonus: fixed signs, earth signs
  let trust = base + ((s1.modality === 'Fixed' || s2.modality === 'Fixed') ? 7 : 0)
    + (s1.element === 'Earth' || s2.element === 'Earth' ? 5 : 0) - ((h >> 5) % 9);

  // Shared values: same modality bonus
  let values = base + (s1.modality === s2.modality ? 10 : 0)
    + (s1.element === s2.element ? 8 : 0) - ((h >> 7) % 8);

  // Emotional: water signs, moon-ruled
  let emotional = base + (s1.element === 'Water' && s2.element === 'Water' ? 12 : 0)
    + ((['Moon', 'Neptune', 'Pluto'].includes(s1.ruler) || ['Moon', 'Neptune', 'Pluto'].includes(s2.ruler)) ? 6 : 0)
    - ((h >> 9) % 7);

  return {
    love: toStars(love),
    communication: toStars(comm),
    trust: toStars(trust),
    sharedValues: toStars(values),
    emotionalConnection: toStars(emotional),
  };
}

// ============================================================================
// Compatibility Content Generation
// ============================================================================

export function getCompatibilityStrengths(slug1: string, slug2: string): string[] {
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const aspect = getAspect(slug1, slug2);

  const pool: Record<AspectKind, string[]> = {
    conjunction: [
      `Both partners intuitively understand each other's needs, creating a mirror-like emotional resonance that deepens over time.`,
      `Their shared ${s1.element} nature means they approach challenges with the same energy and temperament, reducing fundamental conflicts.`,
      `A powerful sense of recognition and familiarity bonds them from the very first meeting, as if they've known each other for lifetimes.`,
    ],
    'semi-sextile': [
      `${s1.name}'s ${s1.element} energy and ${s2.name}'s ${s2.element} nature create a complementary dynamic where each fills the other's gaps.`,
      `The slight friction between adjacent signs generates growth — both partners evolve faster together than they ever would alone.`,
      `Their different approaches to life keep the relationship fresh, preventing the staleness that can plague more "compatible" pairings.`,
    ],
    sextile: [
      `A natural ease flows between ${s1.name} and ${s2.name}, with ${s1.element} and ${s2.element} energies blending harmoniously.`,
      `They stimulate each other intellectually and emotionally without overwhelming, creating a partnership that feels both exciting and safe.`,
      `Shared social values and compatible communication styles make them a couple that others admire and gravitate toward.`,
    ],
    square: [
      `The tension between ${s1.name} and ${s2.name} generates powerful passion — this pairing rarely suffers from boredom or complacency.`,
      `Both ${s1.modality} signs possess a determination that, when aligned toward shared goals, makes them an unstoppable force.`,
      `Challenges in this relationship become catalysts for profound personal growth, pushing both partners to become their best selves.`,
    ],
    trine: [
      `As fellow ${s1.element} signs, ${s1.name} and ${s2.name} share a fundamental understanding that requires no explanation — they simply get each other.`,
      `Their relationship has an effortless quality that allows both partners to relax and be authentic without fear of judgment.`,
      `Shared values around ${s1.element === 'Fire' ? 'passion and adventure' : s1.element === 'Earth' ? 'stability and material security' : s1.element === 'Air' ? 'intellectual freedom and social connection' : 'emotional depth and intuitive understanding'} create a solid foundation for lasting partnership.`,
    ],
    quincunx: [
      `The unexpected combination of ${s1.name} and ${s2.name} creates a unique dynamic that neither would experience with a more "typical" match.`,
      `Both partners bring entirely different skill sets to the table, making them a versatile team that can handle any situation life throws their way.`,
      `The need for constant adjustment keeps both partners present and engaged — this is never a relationship that runs on autopilot.`,
    ],
    opposition: [
      `The magnetic attraction between opposite signs ${s1.name} and ${s2.name} creates one of the most compelling connections in the zodiac.`,
      `Each partner possesses exactly the qualities the other lacks, creating a sense of wholeness and completion when they come together.`,
      `Their ${s1.element}-${s2.element} polarity creates a balanced dynamic where both perspectives are represented, leading to wiser decisions as a couple.`,
    ],
  };

  return pool[aspect];
}

export function getCompatibilityChallenges(slug1: string, slug2: string): string[] {
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const aspect = getAspect(slug1, slug2);

  const pool: Record<AspectKind, string[]> = {
    conjunction: [
      `Being so alike can create blind spots — both partners may share the same weaknesses, with neither able to compensate for the other.`,
      `Competition can arise when two ${s1.name} energies occupy the same space, leading to ego clashes over who leads and who follows.`,
      `The comfort of sameness may prevent growth; both partners need to actively seek new experiences outside their shared comfort zone.`,
    ],
    'semi-sextile': [
      `Different rhythms and pacing can cause frustration, as ${s1.name} and ${s2.name} often want different things at different times.`,
      `The subtle disconnect between ${s1.element} and ${s2.element} energies can make deep emotional intimacy harder to achieve without conscious effort.`,
      `Misunderstandings are common because they process the world through fundamentally different lenses, requiring extra patience and communication.`,
    ],
    sextile: [
      `The ease of this connection can lead to complacency — both partners may coast rather than invest in deeper emotional work.`,
      `${s1.name}'s ${s1.modality} approach may sometimes clash with ${s2.name}'s ${s2.modality} energy when making important decisions.`,
      `Surface-level harmony can mask unaddressed issues that eventually surface if not proactively discussed and resolved.`,
    ],
    square: [
      `Fundamental differences in how ${s1.name} (${s1.element}) and ${s2.name} (${s2.element}) approach life can lead to recurring arguments on the same topics.`,
      `Power struggles are likely, as both signs possess strong wills and neither backs down easily during conflicts.`,
      `The intensity of this pairing can be emotionally exhausting, requiring regular breaks and individual space to recharge.`,
    ],
    trine: [
      `Too much comfort can breed complacency — without external challenges, the relationship may lack the friction needed for growth.`,
      `Both partners may enable each other's less productive tendencies since they share similar weaknesses inherent to the ${s1.element} element.`,
      `The ease of understanding can lead to assumptions — both partners may stop actively communicating because they believe they already know what the other thinks.`,
    ],
    quincunx: [
      `Neither partner fully understands the other's motivations, requiring constant translation of needs and expectations.`,
      `${s1.name}'s ${s1.element} nature may feel fundamentally alien to ${s2.name}'s ${s2.element} approach, creating moments of deep disconnect.`,
      `The relationship requires more maintenance and conscious effort than either partner may initially realize, testing patience over time.`,
    ],
    opposition: [
      `The same qualities that create magnetic attraction can become sources of deep frustration when the initial excitement fades.`,
      `Opposite perspectives on fundamentals — ${s1.name} approaches from ${s1.element} while ${s2.name} leads with ${s2.element} — can create an exhausting tug-of-war.`,
      `Both partners may project their own unresolved issues onto the other, using the relationship as a mirror in uncomfortable ways.`,
    ],
  };

  return pool[aspect];
}

export function getCompatibilitySummary(slug1: string, slug2: string): string {
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const score = calculateCompatibility(slug1, slug2);
  const aspect = getAspect(slug1, slug2);

  if (aspect === 'trine') {
    return `The ${s1.name}-${s2.name} pairing is one of the zodiac's most naturally harmonious connections. With a compatibility score of ${score}, their shared ${s1.element} element creates an intuitive bond that deepens effortlessly over time. While they should guard against complacency, this is a partnership built on genuine understanding, mutual respect, and a shared vision for the future. When both partners remain intentional about growth, this connection has the potential to be truly extraordinary.`;
  }
  if (aspect === 'opposition') {
    return `${s1.name} and ${s2.name} embody the classic "opposites attract" dynamic, scoring ${score} in overall compatibility. Their ${s1.element}-${s2.element} polarity creates a magnetic pull that is both thrilling and demanding. This is a relationship that offers profound opportunities for wholeness — each partner holds the key to the other's growth. Success depends on mutual respect, willingness to compromise, and the maturity to see differences as gifts rather than obstacles.`;
  }
  if (aspect === 'sextile') {
    return `With a score of ${score}, ${s1.name} and ${s2.name} enjoy one of the zodiac's friendlier connections. Their ${s1.element} and ${s2.element} energies blend with natural ease, creating a partnership marked by good communication, shared interests, and genuine affection. This pairing thrives when both partners make the effort to go beyond surface-level harmony and explore the deeper emotional and spiritual dimensions of their bond.`;
  }
  if (aspect === 'square') {
    return `The ${s1.name}-${s2.name} connection, with a compatibility score of ${score}, is one of the zodiac's most dynamic and growth-oriented pairings. The tension between their ${s1.element} and ${s2.element} natures creates friction that can either forge an unbreakable bond or drive them apart. This is not a relationship for the faint of heart — it demands vulnerability, patience, and a willingness to grow. But for those who embrace the challenge, the rewards are transformative.`;
  }
  if (aspect === 'conjunction') {
    return `When two ${s1.name} souls come together, scoring ${score} in compatibility, the result is a relationship of extraordinary depth and mirror-like understanding. They share the same fundamental nature — the same ${s1.element} fire, the same ${s1.modality} rhythm, the same planetary influence of ${s1.ruler}. The key to success lies in embracing individuality within unity, ensuring that each partner maintains their own identity while celebrating their profound connection.`;
  }
  if (aspect === 'quincunx') {
    return `At ${score} compatibility, the ${s1.name}-${s2.name} connection is one of the zodiac's more unconventional pairings. Their ${s1.element} and ${s2.element} energies don't blend intuitively, requiring constant creative adjustment. Yet it's precisely this mismatch that makes the relationship fascinating — both partners are continually surprised and challenged, preventing the staleness that can affect easier connections. Success requires open-mindedness, humor, and genuine curiosity about each other's inner world.`;
  }
  // semi-sextile
  return `${s1.name} and ${s2.name} sit side by side in the zodiac wheel, scoring ${score} in compatibility. Like neighbors who must learn to share a fence, their ${s1.element} and ${s2.element} energies require adjustment and compromise. This pairing may not be the most intuitive, but it offers valuable lessons in acceptance and growth. When both partners commit to understanding rather than changing each other, this connection can evolve into something surprisingly beautiful and enduring.`;
}

export interface CompatibilityContent {
  overview: string;
  loveRomance: string;
  communicationStyle: string;
  trustLoyalty: string;
  longTermPotential: string;
}

export function getCompatibilityContent(slug1: string, slug2: string): CompatibilityContent {
  const s1 = getSignBySlug(slug1)!;
  const s2 = getSignBySlug(slug2)!;
  const aspect = getAspect(slug1, slug2);

  const overviews: Record<AspectKind, string> = {
    conjunction: `When two ${s1.name} individuals enter a relationship, the result is a powerful amplification of everything this sign represents. Ruled by ${s1.ruler} and driven by ${s1.element} energy, both partners share an innate understanding of each other's desires, fears, and motivations. This creates an instant sense of recognition — a feeling of looking into a cosmic mirror that reflects both your greatest strengths and your deepest vulnerabilities. The ${s1.modality} nature they share means they approach life's challenges with the same rhythm, though this can create friction when both want to lead in the same direction.`,

    'semi-sextile': `${s1.name} and ${s2.name} occupy neighboring positions in the zodiac, creating a relationship dynamic that is both intimate and slightly off-kilter. As a ${s1.element} sign ruled by ${s1.ruler}, ${s1.name} approaches the world with a fundamentally different energy than ${s2.name}, who draws from ${s2.element} wisdom under the guidance of ${s2.ruler}. This proximity in the zodiac wheel means they share a seasonal transition — the energy that completes ${s1.name} is the energy that births ${s2.name}. Learning to honor this liminal space between them is the key to unlocking the hidden potential of this pairing.`,

    sextile: `The connection between ${s1.name} and ${s2.name} carries a natural warmth that makes companionship feel easy and rewarding. ${s1.name}'s ${s1.element} energy harmonizes beautifully with ${s2.name}'s ${s2.element} nature, creating a dynamic where inspiration and support flow freely in both directions. Under the respective guidance of ${s1.ruler} and ${s2.ruler}, these two signs stimulate each other's growth without the intensity that can overwhelm less resilient pairings. Their ${s1.modality} and ${s2.modality} approaches complement each other, building a relationship that is both intellectually engaging and emotionally fulfilling.`,

    square: `${s1.name} and ${s2.name} form one of the zodiac's most dynamic and challenging aspects — the square. This 90-degree angle in the celestial wheel creates a tension between ${s1.name}'s ${s1.element} nature and ${s2.name}'s ${s2.element} essence that is impossible to ignore. Ruled by ${s1.ruler} and ${s2.ruler} respectively, these two signs approach life from fundamentally different angles. Yet it is precisely this friction that generates the spark of passion, creativity, and growth that defines this pairing. The square demands evolution — and for those willing to do the work, it delivers transformation.`,

    trine: `The ${s1.name}-${s2.name} connection represents one of the most naturally flowing partnerships in astrology. As fellow ${s1.element} signs, they share a fundamental wavelength that creates instant rapport and deep mutual understanding. ${s1.name}, guided by the energy of ${s1.ruler}, brings a ${s1.modality} approach that blends seamlessly with ${s2.name}'s ${s2.modality} rhythm under the influence of ${s2.ruler}. Together, they create a relationship characterized by ease, shared enthusiasm, and a profound sense of being truly seen and understood by another soul.`,

    quincunx: `The relationship between ${s1.name} and ${s2.name} is one of astrology's more enigmatic connections. Separated by five signs in the zodiac wheel, these two share no element, modality, or obvious common ground. ${s1.name}'s ${s1.element} fire — directed by ${s1.ruler} — and ${s2.name}'s ${s2.element} essence — shaped by ${s2.ruler} — seem to speak entirely different languages. And yet, it is this very disconnect that can make the relationship fascinating. The quincunx demands creative adaptation, and in the process of adjusting to each other, both partners discover aspects of themselves they never knew existed.`,

    opposition: `${s1.name} and ${s2.name} sit across from each other on the zodiac wheel, creating one of astrology's most magnetic and complex connections. This opposition between ${s1.element} and ${s2.element} energies generates a pull that is both irresistible and demanding. Under the guidance of ${s1.ruler} and ${s2.ruler}, these two signs are like two halves of a whole — each possessing exactly what the other lacks. The ${s1.modality} energy they share gives them a common approach to action, even as their elemental natures pull them in different directions.`,
  };

  const love: Record<AspectKind, string> = {
    conjunction: `In matters of the heart, two ${s1.name} partners experience love with doubled intensity. The romantic dynamic is one of passionate recognition — each partner sees their own capacity for love reflected in the other. ${s1.ruler}'s influence means that both express affection in the same language, eliminating many of the translation issues that plague other pairings. Physical chemistry is often strong, as their shared ${s1.element} nature creates a harmonious rhythm of desire and expression. However, both partners must guard against the assumption that shared understanding eliminates the need for romantic effort. Even mirrors need to be polished.`,

    'semi-sextile': `Romance between ${s1.name} and ${s2.name} is a study in contrasts that can be either delightful or disorienting. ${s1.name}'s approach to love, shaped by ${s1.ruler} and the ${s1.element} element, emphasizes ${s1.element === 'Fire' ? 'passionate pursuit and bold declarations' : s1.element === 'Earth' ? 'steady devotion and tangible gestures' : s1.element === 'Air' ? 'intellectual connection and verbal affirmation' : 'emotional depth and intuitive bonding'}. ${s2.name}, influenced by ${s2.ruler}, favors ${s2.element === 'Fire' ? 'excitement, spontaneity, and dramatic expression' : s2.element === 'Earth' ? 'reliability, physical touch, and acts of service' : s2.element === 'Air' ? 'witty conversation, shared ideas, and social engagement' : 'deep emotional fusion, nurturing, and unspoken understanding'}. Finding the sweet spot between these approaches requires patience, but the discovery process itself can be deeply romantic.`,

    sextile: `Love between ${s1.name} and ${s2.name} unfolds with a pleasing naturalness that makes dating feel like coming home. The sextile between their signs creates a gentle chemistry — not the explosive, all-consuming passion of harder aspects, but a warm, sustaining flame that grows steadily brighter. ${s1.name}'s ${s1.element} approach to romance complements ${s2.name}'s ${s2.element} style, with ${s1.ruler} and ${s2.ruler} guiding them toward expressions of love that the other genuinely appreciates. Physical affection, shared experiences, and meaningful conversation all come naturally to this pairing.`,

    square: `The romantic tension between ${s1.name} and ${s2.name} is nothing short of electric. The square aspect creates a push-pull dynamic that generates intense physical chemistry and emotional passion. ${s1.name}'s ${s1.element} approach to love can clash dramatically with ${s2.name}'s ${s2.element} style, but it's this very friction that keeps the spark alive long after other couples have settled into routine. Arguments may be heated, but reconciliation is equally passionate. Under ${s1.ruler} and ${s2.ruler}, both partners must learn that love is not a battlefield but a dance — one that requires both partners to occasionally let the other lead.`,

    trine: `Romance flows beautifully between ${s1.name} and ${s2.name}, powered by their shared ${s1.element} nature. Both partners express love through the same elemental language — ${s1.element === 'Fire' ? 'grand gestures, passionate declarations, and adventurous dates' : s1.element === 'Earth' ? 'devoted reliability, sensual touch, and building a beautiful shared life' : s1.element === 'Air' ? 'stimulating conversation, social adventures, and intellectual courtship' : 'deep emotional attunement, intuitive care, and soulful intimacy'}. The influence of ${s1.ruler} and ${s2.ruler} adds nuance to their shared approach, ensuring that while they speak the same love language, each brings their own unique dialect. Physical chemistry is often strong and sustained, built on genuine understanding rather than novelty.`,

    quincunx: `Love between ${s1.name} and ${s2.name} is an exercise in creative adaptation. Their romantic styles — ${s1.name}'s ${s1.element}-influenced approach versus ${s2.name}'s ${s2.element} sensibility — don't overlap in obvious ways, which can make the early stages of courtship feel like navigating without a map. Yet this unfamiliarity is also what makes the connection compelling. ${s1.ruler} drives ${s1.name} to express love in ways that ${s2.ruler}-influenced ${s2.name} may never have experienced before. When both partners approach these differences with curiosity rather than judgment, they discover entirely new dimensions of romantic expression.`,

    opposition: `The romantic chemistry between ${s1.name} and ${s2.name} is legendary in astrological circles, and for good reason. The opposition creates a gravitational pull that is both deeply romantic and deeply challenging. ${s1.name}'s ${s1.element} approach to love — guided by ${s1.ruler} — is the exact complement to ${s2.name}'s ${s2.element} style, shaped by ${s2.ruler}. When they come together, there's a sense of completion, as if each partner has found the missing piece of their romantic puzzle. The initial attraction can be overwhelming in its intensity, and sustaining it requires both partners to respect and celebrate rather than try to resolve their fundamental differences.`,
  };

  const communication: Record<AspectKind, string> = {
    conjunction: `Communication between two ${s1.name} partners is instinctive and immediate. They share ${s1.ruler}'s communicative influence, which means they process and express information through the same ${s1.element} filter. Arguments, when they arise, tend to follow predictable patterns — both partners escalate and de-escalate at the same pace, which can be either efficient or frustrating. The danger lies in assuming that understanding is automatic. Even when two people share the same sign, individual experiences create different perspectives that deserve to be heard. Active listening remains essential, especially when it feels unnecessary.`,

    'semi-sextile': `Conversation between ${s1.name} and ${s2.name} requires a translator — not literally, but energetically. ${s1.name} communicates through the lens of ${s1.element}, favoring ${s1.element === 'Fire' ? 'directness, enthusiasm, and action-oriented language' : s1.element === 'Earth' ? 'practical details, proven facts, and measured deliberation' : s1.element === 'Air' ? 'abstract ideas, playful debate, and rapid-fire exchange' : 'emotional nuance, intuitive sensing, and non-verbal cues'}. ${s2.name}'s ${s2.element} style leans toward ${s2.element === 'Fire' ? 'bold statements and immediate responses' : s2.element === 'Earth' ? 'careful reasoning and concrete examples' : s2.element === 'Air' ? 'conceptual exploration and intellectual variety' : 'feeling-based processing and empathic listening'}. Successful communication requires both partners to slow down and verify that what was intended matches what was received.`,

    sextile: `${s1.name} and ${s2.name} enjoy an easy conversational rapport that makes them excellent communicators as a couple. The sextile between their signs means that ${s1.element} and ${s2.element} energies create a natural back-and-forth rhythm — ${s1.name} brings ${s1.element === 'Fire' ? 'enthusiastic initiative' : s1.element === 'Earth' ? 'grounded perspective' : s1.element === 'Air' ? 'intellectual curiosity' : 'emotional insight'}, while ${s2.name} responds with ${s2.element === 'Fire' ? 'passionate engagement' : s2.element === 'Earth' ? 'practical wisdom' : s2.element === 'Air' ? 'fresh ideas' : 'empathic understanding'}. Difficult topics are navigated with relative grace, though both should be mindful not to avoid hard conversations simply because easier ones flow so well.`,

    square: `Communication is often the greatest challenge and the greatest opportunity in the ${s1.name}-${s2.name} dynamic. The square aspect means their conversational styles frequently clash — ${s1.name}'s ${s1.element} approach can feel ${s2.element === 'Water' ? 'insensitive' : s2.element === 'Earth' ? 'reckless' : s2.element === 'Air' ? 'overbearing' : 'chaotic'} to ${s2.name}, while ${s2.name}'s ${s2.element} style may strike ${s1.name} as ${s1.element === 'Fire' ? 'too slow or indirect' : s1.element === 'Earth' ? 'too abstract or unreliable' : s1.element === 'Air' ? 'too heavy or restrictive' : 'too detached or superficial'}. The breakthrough comes when both partners stop trying to convert the other and instead learn to appreciate the wisdom in an unfamiliar communication style.`,

    trine: `Communication between ${s1.name} and ${s2.name} is one of this pairing's greatest assets. Sharing the ${s1.element} element means they instinctively understand not just what the other says, but why they say it. ${s1.modality === s2.modality ? 'Their shared ' + s1.modality + ' approach adds another layer of synchronicity' : s1.name + "'s " + s1.modality + ' communication style and ' + s2.name + "'s " + s2.modality + ' approach create a complementary dynamic'}. Conversations range effortlessly from deep philosophical discussions to lighthearted banter, and both partners feel genuinely heard. The only caveat is that shared understanding can lead to unspoken assumptions — making time for explicit check-ins prevents small misunderstandings from becoming larger issues.`,

    quincunx: `The quincunx between ${s1.name} and ${s2.name} makes communication one of this pairing's most demanding aspects. ${s1.name}'s ${s1.element}-based expression — shaped by ${s1.ruler} — operates on an entirely different frequency than ${s2.name}'s ${s2.element} style under ${s2.ruler}'s influence. What feels like a clear statement to one partner may land as a confusing riddle to the other. The gift hidden in this challenge is that both partners develop exceptional communication skills through necessity. They learn to be precise, patient, and creative in expressing their needs — skills that serve them well in every area of life.`,

    opposition: `Communication between ${s1.name} and ${s2.name} is a fascinating dance of contrasting perspectives that, when managed well, leads to extraordinary mutual understanding. ${s1.name}'s ${s1.element} communication style — forthright and shaped by ${s1.ruler} — is the mirror image of ${s2.name}'s ${s2.element} approach, guided by ${s2.ruler}. Each has the ability to express exactly what the other has been thinking but couldn't articulate. Arguments can be intense because both partners have an uncanny ability to identify the other's vulnerabilities. When this insight is used with compassion rather than as ammunition, their conversations become some of the most illuminating either has ever experienced.`,
  };

  const trust: Record<AspectKind, string> = {
    conjunction: `Trust between two ${s1.name} individuals develops rapidly because they recognize their own patterns in their partner's behavior. There are few surprises in the early stages — each understands intuitively why the other acts the way they do. This familiarity accelerates trust-building but can also create a false sense of security. Both partners share the same ${s1.element} tendencies toward ${s1.element === 'Fire' ? 'impulsive action' : s1.element === 'Earth' ? 'stubborn entrenchment' : s1.element === 'Air' ? 'intellectual detachment' : 'emotional intensity'}, which means trust violations tend to follow similar patterns. Building genuine trust requires both partners to demonstrate growth beyond their sign's default behavior.`,

    'semi-sextile': `Trust develops slowly between ${s1.name} and ${s2.name}, largely because their different natures make each other's motivations hard to read. ${s1.name}, operating from ${s1.element} instincts, may struggle to interpret ${s2.name}'s ${s2.element} motivations, and vice versa. This is not a reflection of untrustworthiness but rather of unfamiliarity. As both partners invest time in understanding each other's natural rhythms — recognizing that ${s1.name}'s way of showing loyalty differs fundamentally from ${s2.name}'s — trust solidifies into something surprisingly durable. Patience during the early stages pays enormous dividends.`,

    sextile: `Trust comes more naturally to ${s1.name} and ${s2.name} than to many other pairings. The sextile's harmonious energy means that both partners' default behaviors generally inspire confidence rather than suspicion. ${s1.name}'s ${s1.element} nature feels trustworthy to ${s2.name}'s ${s2.element} sensibility, creating a baseline of reliability. Both ${s1.ruler} and ${s2.ruler} contribute to a dynamic where promises are generally kept and boundaries are naturally respected. This doesn't mean trust can be taken for granted — but the foundation for it is solid from the start.`,

    square: `Trust is perhaps the most challenging dimension of the ${s1.name}-${s2.name} square. The fundamental tension between ${s1.element} and ${s2.element} can create suspicion about motives, especially during conflicts. ${s1.name} may question ${s2.name}'s commitment when their ${s2.element} nature pulls them in an incomprehensible direction, and ${s2.name} may doubt ${s1.name}'s reliability when ${s1.element} impulses seem erratic. Building trust in this pairing requires consistent action over time — words alone are rarely sufficient. Both partners must prove through behavior that their differences don't diminish their devotion.`,

    trine: `Trust forms quickly and deeply between ${s1.name} and ${s2.name}, anchored by their shared ${s1.element} understanding. Both partners instinctively recognize loyalty when they see it because they express it in the same elemental language. ${s1.name}'s ${s1.modality} nature and ${s2.name}'s ${s2.modality} approach mean they may have different timelines for trust-building, but the destination is the same: a deep, unshakeable confidence in each other's faithfulness. The challenge is not building trust but maintaining it through the complacency that ease can breed.`,

    quincunx: `Trust between ${s1.name} and ${s2.name} requires extraordinary patience and the willingness to release preconceptions about what loyalty looks like. ${s1.name}'s ${s1.element} expression of faithfulness — influenced by ${s1.ruler} — may be unrecognizable to ${s2.name}, whose ${s2.element} nature under ${s2.ruler} demonstrates commitment in entirely different ways. The partner who insists their way is the "right" way to show trust will create unnecessary conflict. When both learn to recognize and value the other's unique expression of devotion, they build a trust that is remarkably resilient precisely because it's been tested by difference.`,

    opposition: `Trust between ${s1.name} and ${s2.name} follows a fascinating trajectory — it may be withheld initially due to the instinctive wariness each feels toward their zodiacal opposite, but once established, it becomes profoundly deep. The opposition means that each partner can see through the other's defenses with unsettling clarity, which initially feels threatening but eventually becomes the foundation of radical honesty. When ${s1.name}'s ${s1.element} transparency meets ${s2.name}'s ${s2.element} depth, the result is a partnership where both parties know they can never truly hide — and discover they don't want to.`,
  };

  const longTerm: Record<AspectKind, string> = {
    conjunction: `The long-term potential for two ${s1.name} partners is strong, provided both individuals are committed to personal growth alongside the relationship. Their shared understanding creates a comfortable foundation, but comfort alone doesn't sustain a partnership for decades. Under ${s1.ruler}'s continued influence, both partners will experience the same life themes and cycles simultaneously, which can be deeply bonding — facing the same challenges at the same time, celebrating the same kinds of victories. The couples who thrive are those who cultivate individual interests and friendships that bring fresh energy back into the relationship. A shared ${s1.element} element provides the fuel; intentional growth provides the direction.`,

    'semi-sextile': `Long-term success for ${s1.name} and ${s2.name} depends heavily on both partners' willingness to embrace perpetual learning. This is not a pairing that ever fully "clicks" in an effortless way — and that's actually its strength. The slight discomfort between ${s1.element} and ${s2.element} energies prevents stagnation, ensuring that both partners continue evolving throughout the relationship. Couples who make it through the first few years of adjustment often discover that their differences have forged an unusually resilient bond, one that can weather life's storms precisely because both partners are accustomed to navigating rough waters together.`,

    sextile: `${s1.name} and ${s2.name} have excellent long-term prospects, supported by the sextile's gentle harmony between ${s1.element} and ${s2.element}. This is a couple that ages well together — shared interests deepen over time, communication improves with practice, and the affection between them matures into something truly beautiful. The influence of ${s1.ruler} and ${s2.ruler} creates a dynamic where both partners continue to find each other interesting, even after years together. To reach their full potential, this couple should consciously seek growth-promoting experiences and avoid the temptation to settle into a pleasant but unchallenging routine.`,

    square: `The long-term outlook for ${s1.name} and ${s2.name} depends entirely on how they choose to channel the square's inherent tension. Couples who view their differences as fuel for growth build partnerships of remarkable depth and resilience. The ${s1.element}-${s2.element} dynamic ensures they never run out of things to teach each other, and the passion that initially drew them together can evolve into a profound mutual respect. However, couples who resist the growth the square demands may find themselves locked in repetitive cycles of conflict. The key milestone is learning to disagree without threatening the foundation of the relationship.`,

    trine: `The long-term potential for ${s1.name} and ${s2.name} is among the highest in the zodiac. Their shared ${s1.element} foundation creates a partnership that feels sustainable and nourishing over decades. As ${s1.ruler} and ${s2.ruler} continue to shape their individual journeys, both partners grow in complementary directions while remaining anchored to common values. The greatest risk to this pairing's longevity is not conflict but complacency — the relationship flows so naturally that both partners may neglect the intentional work that keeps love vibrant. Couples who consciously infuse their shared life with novelty, challenge, and continued courtship build truly legendary partnerships.`,

    quincunx: `Long-term commitment between ${s1.name} and ${s2.name} is an ongoing project rather than a destination. The quincunx's inherent awkwardness never fully resolves — and long-term couples in this pairing learn to find humor and beauty in their perpetual dance of adjustment. What sustains them is the genuine fascination they maintain for each other's different worlds. Under the ongoing influence of ${s1.ruler} and ${s2.ruler}, both partners continue to surprise each other well into their later years. This is a pairing that defies prediction, and for the right two people, that unpredictability is exactly what keeps the relationship alive.`,

    opposition: `The long-term potential for ${s1.name} and ${s2.name} is extraordinary — but only for those who master the art of integration. The opposition's initial magnetic attraction must evolve into a mature appreciation for what each partner brings to the whole. As ${s1.ruler} and ${s2.ruler} guide their respective journeys, the couple who learns to leverage their ${s1.element}-${s2.element} polarity creates a partnership that is genuinely greater than the sum of its parts. The most successful ${s1.name}-${s2.name} couples are those who stop trying to change each other and instead build a life that honors both perspectives equally.`,
  };

  return {
    overview: overviews[aspect],
    loveRomance: love[aspect],
    communicationStyle: communication[aspect],
    trustLoyalty: trust[aspect],
    longTermPotential: longTerm[aspect],
  };
}

// ============================================================================
// Popular Pairings
// ============================================================================

export const POPULAR_PAIRINGS = [
  'aries-leo', 'taurus-cancer', 'gemini-libra', 'cancer-scorpio',
  'leo-sagittarius', 'virgo-capricorn', 'libra-aquarius', 'scorpio-pisces',
  'aries-libra', 'taurus-scorpio', 'gemini-sagittarius', 'cancer-capricorn',
];

// ============================================================================
// Sign Profile Data
// ============================================================================

export interface SignProfile {
  overview: string[];
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  loveDescription: string;
  careerDescription: string;
  famousPeople: { name: string; role: string }[];
}

export const SIGN_PROFILES: Record<string, SignProfile> = {
  aries: {
    overview: [
      'Aries, the first sign of the zodiac, embodies the raw energy of new beginnings. Ruled by Mars, the planet of action and desire, those born under this sign possess an innate drive to initiate, compete, and conquer. They are the trailblazers of the zodiac, rushing headfirst into uncharted territory with a courage that others can only admire.',
      'As a Cardinal Fire sign, Aries combines the spark of inspiration with the drive to act on it immediately. They are natural leaders, not because they seek authority, but because they simply cannot stand still while there is something to be done. Their enthusiasm is infectious, their energy seemingly boundless, and their optimism almost impossible to extinguish.',
      'The shadow side of Aries is impatience and impulsiveness. Their desire to move quickly can lead to reckless decisions, and their competitive nature sometimes blinds them to the feelings of those around them. Learning to temper their fire with patience and empathy is the lifelong journey of every Aries.',
    ],
    traits: ['Courageous', 'Determined', 'Confident', 'Enthusiastic', 'Honest', 'Passionate', 'Competitive', 'Spontaneous'],
    strengths: ['Natural leadership ability', 'Unmatched courage and bravery', 'Infectious enthusiasm', 'Ability to take decisive action', 'Resilience in the face of adversity'],
    weaknesses: ['Impulsive decision-making', 'Quick temper', 'Can be self-centered', 'Difficulty with patience', 'Tendency to leave projects unfinished'],
    loveDescription: 'In love, Aries is passionate, direct, and fiercely devoted. They pursue their romantic interests with the same intensity they bring to everything else in life. Aries lovers are generous, adventurous, and always willing to fight for their relationship. They need a partner who can match their energy and who isn\'t intimidated by their bold approach to love. The ideal partner for Aries understands that their independence is not a rejection of intimacy but a fundamental part of who they are.',
    careerDescription: 'Aries thrives in careers that offer autonomy, challenge, and opportunities for advancement. They excel as entrepreneurs, emergency responders, athletes, and military leaders. Their natural competitiveness makes them outstanding salespeople and negotiators. Aries struggles in rigid hierarchies where they cannot take initiative or express their ideas freely. The key to career satisfaction for Aries is finding a role that values their drive and allows them to see the direct impact of their efforts.',
    famousPeople: [
      { name: 'Lady Gaga', role: 'Singer & Actress' },
      { name: 'Robert Downey Jr.', role: 'Actor' },
      { name: 'Leonardo da Vinci', role: 'Renaissance Polymath' },
      { name: 'Maya Angelou', role: 'Poet & Author' },
    ],
  },
  taurus: {
    overview: [
      'Taurus, the second sign of the zodiac, represents the Earth in its most fertile and abundant form. Ruled by Venus, the planet of beauty, love, and value, Taureans have an instinctive appreciation for the finer things in life and an unshakeable determination to build a world of comfort and security around themselves.',
      'As a Fixed Earth sign, Taurus embodies stability, persistence, and endurance. Where Aries initiates, Taurus sustains. They are the builders of the zodiac, capable of turning raw potential into tangible reality through sheer patience and dedication. Their connection to the physical world gives them an exceptional ability to create beauty, wealth, and lasting structures.',
      'The challenge for Taurus lies in their resistance to change. Their love of stability can calcify into stubbornness, and their appreciation for comfort can become possessiveness or materialism. The most evolved Taureans learn to hold their values firmly while remaining open to the natural cycles of change that keep life vibrant.',
    ],
    traits: ['Reliable', 'Patient', 'Practical', 'Devoted', 'Sensual', 'Stubborn', 'Grounded', 'Determined'],
    strengths: ['Exceptional reliability and loyalty', 'Natural financial acumen', 'Artistic sensibility and taste', 'Remarkable patience and endurance', 'Ability to create comfort and beauty'],
    weaknesses: ['Excessive stubbornness', 'Resistance to necessary change', 'Possessive tendencies', 'Can be materialistic', 'Slow to forgive once trust is broken'],
    loveDescription: 'Taurus approaches love with the same patience and devotion they bring to everything that matters. They are sensual, affectionate, and deeply loyal partners who express love through tangible acts of care — cooking a beautiful meal, creating a comfortable home, offering a steady presence through life\'s storms. Taurus needs a partner who values stability and can match their depth of commitment. They fall in love slowly but completely, and once committed, their devotion is unshakeable.',
    careerDescription: 'Taurus excels in careers that combine practicality with aesthetics. They make outstanding architects, chefs, financial advisors, musicians, and landscape designers. Their patience and persistence make them exceptional at any long-term project. Taurus thrives when they can build something tangible and lasting, and they struggle in chaotic or constantly changing work environments. Financial security is a primary career motivator, and many Taureans develop impressive portfolios through consistent, strategic investment.',
    famousPeople: [
      { name: 'Adele', role: 'Singer & Songwriter' },
      { name: 'Dwayne Johnson', role: 'Actor & Entrepreneur' },
      { name: 'Queen Elizabeth II', role: 'Monarch' },
      { name: 'William Shakespeare', role: 'Playwright' },
    ],
  },
  gemini: {
    overview: [
      'Gemini, the third sign of the zodiac, is the embodiment of intellectual curiosity and communicative brilliance. Ruled by Mercury, the swift-footed messenger of the gods, Geminis possess minds that move at extraordinary speed, leaping from idea to idea with an agility that leaves others breathless.',
      'As a Mutable Air sign, Gemini is the most adaptable communicator in the zodiac. They are the connectors, the storytellers, the ones who weave threads of conversation between disparate people and ideas. Their dual nature — symbolized by the Twins — reflects not duplicity but multiplicity, an ability to see every situation from multiple perspectives simultaneously.',
      'The challenge Gemini faces is depth. Their fascination with breadth of experience can prevent them from diving deep into any single pursuit. Their quick minds can also create an inner restlessness that manifests as anxiety or inconsistency. The most fulfilled Geminis learn to balance their love of variety with the rewards of sustained focus.',
    ],
    traits: ['Adaptable', 'Curious', 'Communicative', 'Witty', 'Social', 'Versatile', 'Intellectual', 'Playful'],
    strengths: ['Exceptional communication skills', 'Quick-witted intelligence', 'Remarkable adaptability', 'Natural networking ability', 'Ability to learn anything quickly'],
    weaknesses: ['Inconsistency and restlessness', 'Difficulty with commitment', 'Can be superficial', 'Tendency toward anxiety', 'May struggle with follow-through'],
    loveDescription: 'For Gemini, love begins in the mind. They need a partner who can keep up with their rapid-fire conversation, match their intellectual curiosity, and embrace their need for variety and social stimulation. Gemini lovers are playful, communicative, and endlessly entertaining. They express love through words, shared experiences, and genuine interest in their partner\'s inner world. The ideal relationship for Gemini is one that feels like an ongoing adventure of mutual discovery.',
    careerDescription: 'Gemini thrives in careers that involve communication, variety, and intellectual stimulation. They excel as journalists, teachers, marketers, writers, salespeople, and social media strategists. Their adaptability makes them valuable in fast-paced industries where the ability to pivot quickly is essential. Gemini struggles with repetitive tasks and rigid routines. The key to their professional fulfillment is a career that never stops teaching them something new.',
    famousPeople: [
      { name: 'Marilyn Monroe', role: 'Actress & Icon' },
      { name: 'Kanye West', role: 'Musician & Designer' },
      { name: 'Angelina Jolie', role: 'Actress & Humanitarian' },
      { name: 'John F. Kennedy', role: '35th U.S. President' },
    ],
  },
  cancer: {
    overview: [
      'Cancer, the fourth sign of the zodiac, is the great nurturer of the astrological world. Ruled by the Moon, which governs emotion, intuition, and the tides of inner life, Cancerians possess an emotional depth and sensitivity that connects them to the unseen currents flowing beneath the surface of everyday existence.',
      'As a Cardinal Water sign, Cancer initiates through feeling. They are the ones who sense what a room needs before anyone speaks, who remember birthdays and anniversaries not because they have to but because they genuinely care. Their protective nature extends not just to loved ones but to traditions, memories, and anything that holds emotional significance.',
      'The shadow side of Cancer is their tendency to retreat into their shell when threatened, building emotional walls that can isolate them from the very connections they crave. Their sensitivity, while a gift, can also make them moody, clingy, or passive-aggressive. The most evolved Cancers learn to protect their hearts without closing them.',
    ],
    traits: ['Nurturing', 'Intuitive', 'Protective', 'Loyal', 'Empathetic', 'Tenacious', 'Sentimental', 'Home-loving'],
    strengths: ['Deep emotional intelligence', 'Fierce loyalty and protectiveness', 'Natural caregiving abilities', 'Strong intuition and empathy', 'Remarkable memory and sentimentality'],
    weaknesses: ['Moodiness and emotional volatility', 'Tendency to cling to the past', 'Can be overly defensive', 'Passive-aggressive communication', 'Difficulty letting go of grudges'],
    loveDescription: 'Cancer loves with their entire being. They are the partners who remember every detail of your first date, who create a home that feels like a sanctuary, who will fiercely defend your honor and tenderly nurse your wounds. In return, Cancer needs emotional security, reassurance, and a partner who can navigate their changing emotional tides with patience and compassion. They fall in love deeply and completely, and betrayal is something they rarely fully recover from.',
    careerDescription: 'Cancer excels in professions that involve nurturing, creativity, or preserving the past. They make exceptional therapists, nurses, chefs, historians, real estate agents, and interior designers. Their intuitive understanding of what people need makes them naturally gifted in hospitality and healthcare. Cancer needs a work environment that feels emotionally safe and values loyalty. Many Cancerians also excel in home-based businesses, where they can create their ideal work environment.',
    famousPeople: [
      { name: 'Princess Diana', role: 'Princess of Wales' },
      { name: 'Tom Hanks', role: 'Actor' },
      { name: 'Frida Kahlo', role: 'Artist' },
      { name: 'Meryl Streep', role: 'Actress' },
    ],
  },
  leo: {
    overview: [
      'Leo, the fifth sign of the zodiac, radiates with the unmistakable warmth and brilliance of its ruler, the Sun. Just as the Sun is the center of our solar system, Leos have a natural magnetism that draws others into their orbit. They are the performers, the leaders, and the generous hearts of the zodiac.',
      'As a Fixed Fire sign, Leo combines the enduring quality of fixedness with the passionate intensity of Fire. This creates a personality that is both dramatically expressive and remarkably consistent. Leos don\'t burn hot and fade like a match — they sustain their fire like a hearth, providing warmth, light, and a gathering point for those around them.',
      'The challenge for Leo is learning that true confidence doesn\'t require external validation. Their need for recognition can become an insatiable hunger that overshadows their genuine warmth. The most evolved Leos channel their natural charisma into uplifting others, discovering that the spotlight shines brightest when it\'s shared.',
    ],
    traits: ['Charismatic', 'Generous', 'Dramatic', 'Confident', 'Creative', 'Warm-hearted', 'Loyal', 'Ambitious'],
    strengths: ['Natural charisma and leadership', 'Boundless generosity and warmth', 'Creative self-expression', 'Ability to inspire and motivate others', 'Unwavering loyalty to loved ones'],
    weaknesses: ['Need for constant admiration', 'Tendency toward arrogance', 'Difficulty accepting criticism', 'Can be domineering', 'Struggles with sharing the spotlight'],
    loveDescription: 'Leo loves with theatrical passion and genuine warmth. They are the partners who plan grand romantic gestures, who celebrate their loved ones publicly and privately, who make their partner feel like the most special person in the world. Leo needs a partner who appreciates their generous nature, can handle their occasional need for drama, and isn\'t threatened by their larger-than-life presence. In return, Leo offers a love that is fierce, protective, and genuinely celebratory.',
    careerDescription: 'Leo shines in careers that allow for creative expression and public recognition. They excel as performers, directors, executives, teachers, politicians, and brand ambassadors. Their natural authority and charisma make them effective leaders who inspire loyalty in their teams. Leo needs a career that offers both creative fulfillment and the opportunity for advancement and recognition. Many Leos are drawn to entrepreneurship, where they can build something that bears their personal stamp.',
    famousPeople: [
      { name: 'Barack Obama', role: '44th U.S. President' },
      { name: 'Madonna', role: 'Singer & Cultural Icon' },
      { name: 'Jennifer Lopez', role: 'Entertainer' },
      { name: 'Napoleon Bonaparte', role: 'Emperor of France' },
    ],
  },
  virgo: {
    overview: [
      'Virgo, the sixth sign of the zodiac, embodies the principle of refinement and service. Ruled by Mercury, the planet of intellect and communication, Virgo processes the world through a lens of exacting analysis, always seeking to understand, improve, and perfect the systems and people around them.',
      'As a Mutable Earth sign, Virgo combines the adaptability of mutability with the practicality of Earth. They are the editors of the zodiac — taking the raw material of experience and shaping it into something more functional, more beautiful, more useful. Their attention to detail is legendary, and their desire to be of service is genuine and deeply felt.',
      'Virgo\'s challenge is learning to direct their analytical powers with compassion rather than criticism — particularly toward themselves. Their pursuit of perfection can become a prison when they hold themselves and others to impossible standards. The most evolved Virgos learn that imperfection is not a flaw to be corrected but a quality to be embraced as part of the human experience.',
    ],
    traits: ['Analytical', 'Meticulous', 'Practical', 'Modest', 'Diligent', 'Helpful', 'Observant', 'Health-conscious'],
    strengths: ['Exceptional attention to detail', 'Genuine desire to help others', 'Analytical problem-solving ability', 'Practical and efficient approach', 'Strong work ethic and reliability'],
    weaknesses: ['Excessive self-criticism', 'Tendency toward perfectionism', 'Can be overly critical of others', 'Prone to worry and anxiety', 'Difficulty relaxing and letting go'],
    loveDescription: 'Virgo shows love through acts of service and careful attention to their partner\'s needs. They are the ones who remember how you take your coffee, who organize your life when it falls into chaos, who quietly handle the details so you can focus on the big picture. Virgo needs a partner who recognizes and appreciates these gestures as expressions of deep love. Their ideal relationship is one built on mutual respect, shared routines, and a commitment to growing together through practical support and honest communication.',
    careerDescription: 'Virgo excels in careers that require precision, analysis, and a commitment to excellence. They thrive as doctors, researchers, editors, accountants, nutritionists, and software developers. Their natural inclination toward service makes them outstanding healthcare professionals and counselors. Virgo needs a work environment that values quality and offers opportunities for continuous improvement. Many Virgos find deep satisfaction in behind-the-scenes roles where their meticulous work makes everything else run smoothly.',
    famousPeople: [
      { name: 'Beyonce', role: 'Singer & Entrepreneur' },
      { name: 'Keanu Reeves', role: 'Actor' },
      { name: 'Mother Teresa', role: 'Humanitarian' },
      { name: 'Michael Jackson', role: 'King of Pop' },
    ],
  },
  libra: {
    overview: [
      'Libra, the seventh sign of the zodiac, stands at the balancing point of the astrological year and embodies the principle of harmony in all its forms. Ruled by Venus, the planet of beauty and love, Libra possesses an innate aesthetic sensibility and a deep-seated need for balance, fairness, and harmonious connection.',
      'As a Cardinal Air sign, Libra initiates through relationship and intellectual engagement. They are the diplomats and peacemakers of the zodiac, possessing an almost supernatural ability to see all sides of a situation and find the middle ground where compromise becomes possible. Their charm is both genuine and strategic — they truly believe that the world is better when people get along.',
      'The shadow of Libra is indecision and people-pleasing. Their desire for harmony can lead them to suppress their own needs, avoid necessary conflict, and struggle with making choices when no option satisfies everyone. The most evolved Libras learn that true balance sometimes requires the courage to be unbalanced — to take a stand, even when it disrupts the peace.',
    ],
    traits: ['Diplomatic', 'Gracious', 'Fair-minded', 'Charming', 'Aesthetic', 'Cooperative', 'Idealistic', 'Romantic'],
    strengths: ['Exceptional diplomatic skills', 'Natural sense of fairness and justice', 'Refined aesthetic taste', 'Ability to create harmony in any environment', 'Genuinely charming and likeable presence'],
    weaknesses: ['Chronic indecisiveness', 'Tendency to avoid conflict', 'Can be superficial', 'May lose themselves in relationships', 'Difficulty with solitude'],
    loveDescription: 'Libra is perhaps the most partnership-oriented sign in the zodiac. They come alive in relationship, finding their best self through the mirror of an intimate connection. Libra lovers are romantic, attentive, and deeply invested in creating a beautiful shared life. They need a partner who values fairness, appreciates beauty, and can engage in the intellectual and emotional give-and-take that Libra craves. The ideal relationship for Libra is an elegant dance of two equals.',
    careerDescription: 'Libra thrives in careers that involve aesthetics, negotiation, or partnership. They excel as lawyers, designers, art directors, mediators, public relations specialists, and wedding planners. Their ability to see multiple perspectives makes them invaluable in any role that requires consensus-building. Libra needs a work environment that is both visually pleasing and socially harmonious. Many Libras are drawn to the arts, where their refined taste and creative vision can find full expression.',
    famousPeople: [
      { name: 'Kim Kardashian', role: 'Media Personality' },
      { name: 'John Lennon', role: 'Musician & Peace Activist' },
      { name: 'Mahatma Gandhi', role: 'Independence Leader' },
      { name: 'Serena Williams', role: 'Tennis Champion' },
    ],
  },
  scorpio: {
    overview: [
      'Scorpio, the eighth sign of the zodiac, dwells in the realm of transformation, power, and the hidden depths of human experience. Ruled by Pluto, the planet of death and rebirth, Scorpios possess an intensity that penetrates beneath surface appearances to reveal the truth that others prefer to leave buried.',
      'As a Fixed Water sign, Scorpio combines emotional depth with unwavering determination. They are the investigators, the psychologists, and the alchemists of the zodiac — driven to understand the fundamental mechanics of power, desire, and transformation. Their emotional nature runs deep and still, like an underground river that has carved its path through solid rock over millennia.',
      'Scorpio\'s challenge is learning to wield their considerable power with wisdom and restraint. Their intensity can become obsession, their perceptiveness can become manipulation, and their self-protective instincts can isolate them behind walls of distrust. The most evolved Scorpios channel their transformative energy into healing, both for themselves and for others.',
    ],
    traits: ['Intense', 'Passionate', 'Resourceful', 'Perceptive', 'Determined', 'Strategic', 'Magnetic', 'Transformative'],
    strengths: ['Extraordinary emotional depth', 'Unwavering determination and willpower', 'Exceptional perceptiveness and intuition', 'Ability to transform and regenerate', 'Fierce loyalty to those they trust'],
    weaknesses: ['Jealousy and possessiveness', 'Tendency toward manipulation', 'Difficulty forgiving betrayal', 'Can be secretive and controlling', 'Prone to emotional extremes'],
    loveDescription: 'Scorpio loves with an all-or-nothing intensity that can be both exhilarating and overwhelming. They seek a soul-deep connection that goes far beyond surface attraction, craving a partner willing to be completely vulnerable and honest. Scorpio lovers are fiercely devoted, deeply passionate, and capable of a level of emotional intimacy that most other signs can only imagine. They need a partner who can handle their intensity, respect their need for privacy, and meet their depth without flinching.',
    careerDescription: 'Scorpio excels in careers that involve investigation, transformation, or managing power. They make exceptional detectives, surgeons, psychologists, researchers, financial strategists, and crisis managers. Their ability to see beneath the surface makes them invaluable in any role that requires uncovering hidden information. Scorpio needs work that feels meaningful and impactful — they cannot tolerate careers that feel trivial or superficial. Many Scorpios are drawn to fields that deal with life, death, and fundamental change.',
    famousPeople: [
      { name: 'Leonardo DiCaprio', role: 'Actor & Environmentalist' },
      { name: 'Marie Curie', role: 'Nobel Prize Physicist' },
      { name: 'Pablo Picasso', role: 'Artist' },
      { name: 'Drake', role: 'Musician' },
    ],
  },
  sagittarius: {
    overview: [
      'Sagittarius, the ninth sign of the zodiac, is the eternal seeker of truth, meaning, and adventure. Ruled by Jupiter, the planet of expansion and wisdom, Sagittarians possess a boundless optimism and philosophical curiosity that drives them to explore every corner of the physical and intellectual world.',
      'As a Mutable Fire sign, Sagittarius combines the passionate enthusiasm of Fire with the adaptability of the Mutable modality. They are the philosophers, the travelers, and the comedians of the zodiac — approaching life as an endless series of adventures to be embraced with open arms and a hearty laugh. Their arrow points ever upward, toward meaning, growth, and the next horizon.',
      'The challenge for Sagittarius is commitment and follow-through. Their love of freedom can become restlessness, their optimism can become recklessness, and their directness can become tactlessness. The most evolved Sagittarians learn that true freedom is not the absence of commitment but the ability to choose commitments that align with their deepest values.',
    ],
    traits: ['Adventurous', 'Optimistic', 'Philosophical', 'Generous', 'Honest', 'Humorous', 'Freedom-loving', 'Open-minded'],
    strengths: ['Boundless optimism and enthusiasm', 'Natural philosophical wisdom', 'Generous spirit and big-heartedness', 'Ability to find meaning in any experience', 'Infectious humor and joyfulness'],
    weaknesses: ['Commitment avoidance', 'Tactless honesty', 'Tendency toward restlessness', 'Can be irresponsible', 'Difficulty with routine and detail'],
    loveDescription: 'Sagittarius approaches love as the greatest adventure of all. They seek a partner who can be their fellow explorer — someone willing to embrace spontaneity, engage in deep philosophical conversation, and share in the joy of discovery. Sagittarius lovers are generous, fun, and refreshingly honest. They need a partner who respects their independence and shares their sense of humor. The ideal relationship for Sagittarius is one that expands both partners\' horizons without constraining their individual freedom.',
    careerDescription: 'Sagittarius thrives in careers that offer freedom, variety, and the opportunity to share knowledge. They excel as professors, travel writers, motivational speakers, foreign correspondents, and outdoor adventure guides. Their natural optimism and vision make them inspiring entrepreneurs and startup founders. Sagittarius struggles in careers that feel confining or meaningless. The key to their professional fulfillment is a career that feeds their twin passions for learning and exploration.',
    famousPeople: [
      { name: 'Taylor Swift', role: 'Singer & Songwriter' },
      { name: 'Brad Pitt', role: 'Actor & Producer' },
      { name: 'Walt Disney', role: 'Entertainment Pioneer' },
      { name: 'Bruce Lee', role: 'Martial Artist & Philosopher' },
    ],
  },
  capricorn: {
    overview: [
      'Capricorn, the tenth sign of the zodiac, embodies the principle of mastery through discipline and time. Ruled by Saturn, the planet of structure, responsibility, and karmic lessons, Capricorns approach life with a seriousness of purpose and a long-term vision that sets them apart from the rest of the zodiac.',
      'As a Cardinal Earth sign, Capricorn initiates through practical action and strategic planning. They are the architects of the zodiac, building empires — whether personal, professional, or creative — with patient determination and an unshakeable belief in the power of sustained effort. Like the mountain goat that symbolizes them, they climb steadily upward, undeterred by obstacles that would turn others back.',
      'Capricorn\'s challenge is learning to value the journey as much as the destination. Their focus on achievement can lead to workaholism, emotional suppression, and a tendency to measure their own worth solely through accomplishments. The most evolved Capricorns learn that true success includes joy, connection, and the ability to rest without guilt.',
    ],
    traits: ['Disciplined', 'Ambitious', 'Responsible', 'Patient', 'Pragmatic', 'Traditional', 'Strategic', 'Resilient'],
    strengths: ['Extraordinary discipline and work ethic', 'Strategic long-term thinking', 'Remarkable resilience and persistence', 'Natural authority and leadership', 'Ability to build lasting structures'],
    weaknesses: ['Emotional repression', 'Tendency toward workaholism', 'Can be excessively rigid', 'Difficulty expressing vulnerability', 'Prone to pessimism under stress'],
    loveDescription: 'Capricorn approaches love with the same strategic patience they bring to their career. They are not looking for fleeting passion but for a partnership that can stand the test of time. Capricorn lovers are reliable, devoted, and quietly demonstrative — showing love through consistent action rather than grand declarations. They need a partner who respects their ambition, shares their values of loyalty and commitment, and can gently coax them out of their workaholic tendencies into the warmth of genuine emotional intimacy.',
    careerDescription: 'Capricorn is perhaps the most career-oriented sign in the zodiac. They excel as CEOs, engineers, architects, judges, financial planners, and government officials. Their natural understanding of hierarchy and systems makes them effective administrators and organizational leaders. Capricorn needs a career with a clear path to advancement and measurable markers of success. Many Capricorns become increasingly successful as they age, as Saturn rewards patience and discipline over time.',
    famousPeople: [
      { name: 'Martin Luther King Jr.', role: 'Civil Rights Leader' },
      { name: 'Michelle Obama', role: 'Former First Lady & Author' },
      { name: 'David Bowie', role: 'Musician & Artist' },
      { name: 'Muhammad Ali', role: 'Boxing Champion' },
    ],
  },
  aquarius: {
    overview: [
      'Aquarius, the eleventh sign of the zodiac, is the visionary rebel of the astrological world. Ruled by Uranus, the planet of innovation, revolution, and sudden change, Aquarians see the world not as it is but as it could be — and they dedicate their considerable intellect to bridging the gap between present reality and future possibility.',
      'As a Fixed Air sign, Aquarius combines the intellectual nature of Air with the determined persistence of the Fixed modality. They are the inventors, the activists, and the eccentrics of the zodiac — committed to ideas and ideals with a fervor that can surprise those who mistake their cool exterior for indifference. Their fixedness manifests not as stubbornness about material things but as an unwavering commitment to their vision of a better world.',
      'The challenge for Aquarius is learning to connect with others on an emotional, not just intellectual, level. Their focus on humanity as a concept can sometimes make them distant from the actual humans in their lives. The most evolved Aquarians learn that true progress requires not just brilliant ideas but the emotional intelligence to implement them with compassion.',
    ],
    traits: ['Innovative', 'Independent', 'Humanitarian', 'Intellectual', 'Unconventional', 'Progressive', 'Friendly', 'Visionary'],
    strengths: ['Brilliant original thinking', 'Genuine humanitarian concern', 'Fierce independence of thought', 'Ability to envision the future', 'Natural community-building skills'],
    weaknesses: ['Emotional detachment', 'Stubbornness about ideas', 'Can be contrarian for its own sake', 'Difficulty with emotional intimacy', 'Tendency to be unpredictable'],
    loveDescription: 'Aquarius approaches love as a meeting of minds first and hearts second. They need a partner who can engage with their ideas, respect their fierce independence, and accept their unconventional approach to relationships. Aquarius lovers are loyal, intellectually stimulating, and genuinely interested in their partner\'s personal growth. They struggle with traditional romantic expectations and need space to be themselves. The ideal relationship for Aquarius feels more like a progressive partnership between two independent individuals than a conventional romantic merger.',
    careerDescription: 'Aquarius thrives in careers that involve innovation, social change, or technology. They excel as scientists, inventors, social activists, software engineers, humanitarian workers, and futurists. Their ability to see patterns that others miss makes them invaluable in research and development. Aquarius needs a career that aligns with their values and offers the freedom to think unconventionally. Many Aquarians are drawn to nonprofit work or social enterprises where they can combine their intellectual gifts with their desire to make a positive impact.',
    famousPeople: [
      { name: 'Oprah Winfrey', role: 'Media Mogul & Philanthropist' },
      { name: 'Harry Styles', role: 'Musician & Actor' },
      { name: 'Bob Marley', role: 'Reggae Legend' },
      { name: 'Ellen DeGeneres', role: 'Comedian & TV Host' },
    ],
  },
  pisces: {
    overview: [
      'Pisces, the twelfth and final sign of the zodiac, carries within it the accumulated wisdom, compassion, and creative essence of every sign that came before. Ruled by Neptune, the planet of dreams, illusion, and spiritual transcendence, Pisceans navigate reality and fantasy with equal fluidity, often perceiving dimensions of existence that remain invisible to more earthbound signs.',
      'As a Mutable Water sign, Pisces embodies emotional adaptability in its most profound form. They are the mystics, the artists, and the empaths of the zodiac, absorbing the feelings of those around them like a sponge absorbs water. Their boundaries between self and other are thin, which gives them extraordinary compassion but also makes them vulnerable to emotional overwhelm.',
      'The challenge for Pisces is learning to ground their vast inner world in practical reality. Their sensitivity can lead to escapism, their compassion can become self-sacrifice, and their idealism can leave them vulnerable to manipulation. The most evolved Pisceans learn to channel their spiritual and creative gifts through disciplined practice, transforming their dreams into tangible contributions to the world.',
    ],
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Empathic', 'Dreamy', 'Spiritual', 'Imaginative'],
    strengths: ['Extraordinary empathy and compassion', 'Profound artistic and creative abilities', 'Powerful intuition and psychic sensitivity', 'Ability to heal and comfort others', 'Spiritual depth and wisdom'],
    weaknesses: ['Tendency toward escapism', 'Difficulty with boundaries', 'Can be overly idealistic', 'Vulnerability to manipulation', 'Struggle with practical responsibilities'],
    loveDescription: 'Pisces loves with a depth and tenderness that transcends the ordinary. They seek a soulmate in the truest sense — a partner who connects with them on spiritual, emotional, and creative levels. Pisces lovers are romantic, devoted, and capable of a selfless generosity that can be both beautiful and unsustainable. They need a partner who can ground them without dimming their light, protect them without controlling them, and match their emotional depth without drowning in it. The ideal relationship for Pisces is one that feels like a shared dream brought to life.',
    careerDescription: 'Pisces excels in careers that allow for creative expression, healing, or spiritual service. They make exceptional musicians, visual artists, therapists, nurses, photographers, and spiritual counselors. Their intuitive understanding of human suffering makes them naturally gifted healers and counselors. Pisces needs a career that nourishes their soul — purely profit-driven work will leave them feeling empty. Many Pisceans find their greatest professional fulfillment through artistic or spiritual pursuits that allow them to share their rich inner world with others.',
    famousPeople: [
      { name: 'Rihanna', role: 'Singer & Entrepreneur' },
      { name: 'Albert Einstein', role: 'Theoretical Physicist' },
      { name: 'Steve Jobs', role: 'Apple Co-Founder' },
      { name: 'Michelangelo', role: 'Renaissance Artist' },
    ],
  },
};
