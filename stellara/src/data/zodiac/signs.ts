import type {
  ZodiacSign,
  ZodiacSignInfo,
  Element,
  Modality,
} from '@/types/astrology';

export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacSignInfo> = {
  aries: {
    sign: 'aries',
    name: 'Aries',
    symbol: '♈',
    unicode: '\u2648',
    element: 'fire',
    modality: 'cardinal',
    polarity: 'positive',
    rulingPlanet: 'mars',
    dateRange: { start: '03-21', end: '04-19' },
    traits: ['courageous', 'determined', 'confident', 'enthusiastic', 'pioneering'],
    strengths: ['natural leader', 'fearless in adversity', 'energetic and dynamic', 'honest and direct'],
    weaknesses: ['impatient with slow progress', 'can be impulsive', 'prone to short temper'],
    color: '#FF4136',
    luckyNumbers: [1, 9, 17],
    description:
      'Aries is the first sign of the zodiac, and those born under this sign are natural trailblazers. Fueled by the fire element and ruled by Mars, Aries individuals charge through life with unmatched courage and determination, always seeking new challenges to conquer and new territories to explore.',
    longDescription:
      'Aries, the Ram, heralds the beginning of the zodiac and the dawn of spring, carrying within its spirit the raw energy of new beginnings. Those born under this cardinal fire sign possess an innate drive to lead, to initiate, and to forge paths where none existed before. Ruled by Mars, the planet of action and desire, Aries individuals are warriors of the heart, approaching life with a boldness that inspires those around them.\n\nThe Aries soul burns with an unquenchable flame of passion and ambition. These individuals are at their best when they are pioneering new endeavors, championing causes they believe in, and pushing past limitations that would stop others in their tracks. Their directness is a gift — they speak truth with a clarity that cuts through confusion and their honesty, while sometimes startling, is always genuine and well-intentioned.\n\nIn matters of the heart, Aries loves with a fierce and protective devotion. They are the champions of their loved ones, always ready to defend and uplift those they care about. While their impulsive nature can sometimes lead them to leap before they look, it is this very quality that allows them to seize opportunities that others might miss. The universe rewards the brave, and no sign embodies bravery quite like Aries.',
  },

  taurus: {
    sign: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    unicode: '\u2649',
    element: 'earth',
    modality: 'fixed',
    polarity: 'negative',
    rulingPlanet: 'venus',
    dateRange: { start: '04-20', end: '05-20' },
    traits: ['reliable', 'patient', 'practical', 'devoted', 'sensual'],
    strengths: ['steadfast and dependable', 'deeply loyal', 'appreciates beauty and comfort', 'strong work ethic'],
    weaknesses: ['stubborn when challenged', 'resistant to change', 'can be possessive'],
    color: '#2ECC40',
    luckyNumbers: [2, 6, 15],
    description:
      'Taurus is the grounded anchor of the zodiac, embodying the fertile power of spring in full bloom. Ruled by Venus, the planet of love and beauty, Taurus individuals possess a deep appreciation for the sensory pleasures of life and build their world on a foundation of stability, loyalty, and enduring devotion.',
    longDescription:
      'Taurus, the Bull, stands as the zodiac\'s great stabilizer, rooted in the rich and nourishing earth element. Born during the height of spring, those under this sign carry within them the patient, generative power of nature itself. Venus, their ruling planet, bestows upon them an exquisite sensitivity to beauty, harmony, and the simple yet profound pleasures that make life truly worth living.\n\nThe Taurus soul seeks to create lasting foundations — in love, in work, and in the material world. These are the builders of the zodiac, the ones who take raw potential and, through patient dedication, transform it into something tangible and enduring. Their reliability is legendary; when a Taurus gives their word, it becomes as solid and unmovable as the earth beneath your feet. They are the friend who shows up, the partner who stays, and the colleague who delivers.\n\nBeneath their calm and composed exterior lies a deeply sensual and romantic heart. Taurus individuals experience the world through their senses — the taste of a lovingly prepared meal, the scent of blooming flowers, the warmth of an embrace. They remind us all to slow down, to savor, and to recognize that true abundance is not found in rushing forward but in deeply appreciating what is already here. In a world that often moves too fast, Taurus offers the sacred gift of presence.',
  },

  gemini: {
    sign: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    unicode: '\u264A',
    element: 'air',
    modality: 'mutable',
    polarity: 'positive',
    rulingPlanet: 'mercury',
    dateRange: { start: '05-21', end: '06-20' },
    traits: ['adaptable', 'curious', 'communicative', 'witty', 'versatile'],
    strengths: ['brilliant communicator', 'endlessly curious', 'quick-witted and clever', 'socially adept'],
    weaknesses: ['can be indecisive', 'tendency toward restlessness', 'may spread themselves too thin'],
    color: '#FFDC00',
    luckyNumbers: [3, 5, 14],
    description:
      'Gemini is the sparkling intellectual of the zodiac, forever dancing between ideas, conversations, and connections. Ruled by Mercury, the messenger planet, Gemini individuals possess a quicksilver mind that delights in learning, sharing, and weaving together the diverse threads of human experience.',
    longDescription:
      'Gemini, the Twins, embodies the beautiful duality of the human mind — the capacity to hold multiple perspectives, to see both sides of every story, and to find connections between seemingly unrelated ideas. As a mutable air sign ruled by Mercury, Gemini is the zodiac\'s great communicator, the bridge-builder between worlds, and the eternal student of life\'s endless curriculum.\n\nThe Gemini spirit thrives on intellectual stimulation and variety. These individuals possess minds that move with lightning speed, making connections and synthesizing information in ways that can leave others breathless. They are natural storytellers, teachers, and conversationalists, gifted with the rare ability to make complex ideas accessible and engaging. Their curiosity knows no bounds — every person they meet is a new book to read, every experience a new chapter to explore.\n\nFar from the superficiality sometimes attributed to them, Gemini\'s versatility is actually a profound spiritual gift. By moving fluidly between different perspectives and experiences, they serve as mirrors for those around them, reflecting back truths that might otherwise remain hidden. In relationships, a Gemini brings freshness, humor, and an ever-evolving depth that ensures life together is never dull. They teach us that growth comes not from rigid certainty but from remaining open, curious, and willing to see the world with new eyes each day.',
  },

  cancer: {
    sign: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    unicode: '\u264B',
    element: 'water',
    modality: 'cardinal',
    polarity: 'negative',
    rulingPlanet: 'moon',
    dateRange: { start: '06-21', end: '07-22' },
    traits: ['nurturing', 'intuitive', 'protective', 'empathetic', 'tenacious'],
    strengths: ['deeply empathetic and caring', 'powerful intuition', 'fiercely protective of loved ones', 'emotionally resilient'],
    weaknesses: ['tendency to retreat into shell', 'can be overly sensitive', 'prone to moodiness'],
    color: '#B2BEB5',
    luckyNumbers: [2, 7, 11],
    description:
      'Cancer is the nurturing heart of the zodiac, cradling the emotional depths of the human experience with tenderness and strength. Ruled by the Moon, Cancer individuals are guided by powerful intuition and deep empathy, creating sanctuaries of love and safety wherever they go.',
    longDescription:
      'Cancer, the Crab, carries within its shell the vast and luminous ocean of human emotion. As the zodiac\'s cardinal water sign, ruled by the ever-changing Moon, Cancer possesses an emotional intelligence that borders on the psychic. These individuals feel the world deeply — not just their own experiences, but the joys and sorrows of everyone around them. This profound sensitivity is not a weakness; it is their greatest superpower.\n\nThe Cancer soul is the great nurturer, the one who transforms any space into a home and any gathering into a family. They possess an almost magical ability to sense what others need, often before those others know it themselves. Their love is not the flashy, dramatic kind — it is the warm meal waiting after a hard day, the remembered anniversary, the gentle hand on the shoulder when words fall short. It is love in its most sustaining and essential form.\n\nBeneath Cancer\'s soft exterior lies a tenacity that rivals any sign in the zodiac. Like the ocean tides governed by their ruling Moon, Cancer individuals possess an inexorable strength that cannot be stopped, only redirected. They will move mountains for those they love, endure hardships with quiet grace, and emerge from life\'s deepest waters carrying pearls of wisdom. Cancer reminds us that vulnerability and strength are not opposites — they are partners in the dance of a life fully lived.',
  },

  leo: {
    sign: 'leo',
    name: 'Leo',
    symbol: '♌',
    unicode: '\u264C',
    element: 'fire',
    modality: 'fixed',
    polarity: 'positive',
    rulingPlanet: 'sun',
    dateRange: { start: '07-23', end: '08-22' },
    traits: ['generous', 'creative', 'passionate', 'warm-hearted', 'charismatic'],
    strengths: ['natural magnetism and warmth', 'boundlessly generous', 'creative visionary', 'loyal and devoted'],
    weaknesses: ['can be prideful', 'needs external validation', 'tendency toward dramatic reactions'],
    color: '#FF851B',
    luckyNumbers: [1, 4, 19],
    description:
      'Leo is the radiant sovereign of the zodiac, shining with the golden light of the Sun itself. Born to inspire and uplift, Leo individuals possess an innate magnetism that draws others into their warm and generous orbit, illuminating every room they enter with creative passion and heartfelt joy.',
    longDescription:
      'Leo, the Lion, reigns over the zodiac with the benevolent grace of the Sun, their ruling celestial body. As a fixed fire sign, Leo burns with a steady, enduring flame — not the flash of a match but the sustained warmth of a hearth around which others naturally gather. These individuals are born with a light inside them that cannot be dimmed, a creative spark that seeks expression in everything they do, from grand artistic endeavors to the simple act of brightening someone\'s day.\n\nThe Leo heart is perhaps the most generous in all the zodiac. When a Leo loves, they love completely, wrapping those fortunate enough to be in their circle with a warmth that feels like standing in a beam of sunlight. They are the champions of their friends, the pillars of their families, and the inspirers of their communities. Their confidence is contagious — in their presence, others find permission to shine as well, for Leo\'s deepest desire is not to stand alone in the spotlight but to help everyone find their own.\n\nLeo\'s creative spirit is a channel for divine expression. Whether through art, leadership, performance, or simply the way they live their lives, Leo individuals are here to remind the world of its own magnificence. Their courage is not the absence of fear but the decision that love, joy, and self-expression are worth any risk. In the great cosmic drama, Leo plays the role of the heart — reminding us all that life is meant to be lived boldly, loved deeply, and celebrated with unbridled joy.',
  },

  virgo: {
    sign: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    unicode: '\u264D',
    element: 'earth',
    modality: 'mutable',
    polarity: 'negative',
    rulingPlanet: 'mercury',
    dateRange: { start: '08-23', end: '09-22' },
    traits: ['analytical', 'meticulous', 'helpful', 'practical', 'observant'],
    strengths: ['exceptional attention to detail', 'deeply service-oriented', 'analytical brilliance', 'quietly reliable'],
    weaknesses: ['tendency toward self-criticism', 'can be overly perfectionistic', 'prone to worry and anxiety'],
    color: '#3D9970',
    luckyNumbers: [5, 14, 23],
    description:
      'Virgo is the devoted healer of the zodiac, weaving together the threads of order and compassion with meticulous care. Ruled by Mercury and grounded in the earth element, Virgo individuals possess a rare combination of analytical brilliance and genuine desire to serve, making the world a better and more beautiful place through their quiet dedication.',
    longDescription:
      'Virgo, the Maiden, walks through the world with eyes that see what others miss — the small details, the hidden patterns, the quiet needs that go unspoken. As a mutable earth sign guided by Mercury, Virgo combines the groundedness of earth with the mental acuity of the messenger planet, creating individuals who can both envision perfection and do the patient, painstaking work required to manifest it in the physical world.\n\nThe Virgo soul is driven by a sacred calling to serve and to heal. This is not the servitude born of obligation but the service that flows from a deep understanding that we are all connected, and that by improving one small corner of the world, we improve it all. Virgo\'s attention to detail is actually a form of love — noticing what others need, remembering what matters, and showing up with exactly the right help at exactly the right time. Their practical wisdom is a balm in a chaotic world.\n\nBeneath Virgo\'s composed and modest exterior lies a rich inner world of deep feeling and profound spiritual awareness. They are the alchemists of the zodiac, transforming the raw materials of daily life into something meaningful and purposeful. While they may struggle with self-criticism, this same quality drives them toward continuous growth and improvement. Virgo teaches us that the divine is found not only in grand gestures but in the careful, loving attention we bring to the ordinary moments of our lives.',
  },

  libra: {
    sign: 'libra',
    name: 'Libra',
    symbol: '♎',
    unicode: '\u264E',
    element: 'air',
    modality: 'cardinal',
    polarity: 'positive',
    rulingPlanet: 'venus',
    dateRange: { start: '09-23', end: '10-22' },
    traits: ['diplomatic', 'graceful', 'fair-minded', 'romantic', 'harmonious'],
    strengths: ['natural peacemaker', 'exquisite sense of beauty', 'fair and just', 'genuinely partnership-oriented'],
    weaknesses: ['can be indecisive', 'tendency to avoid confrontation', 'may lose themselves in others'],
    color: '#FF69B4',
    luckyNumbers: [6, 15, 24],
    description:
      'Libra is the graceful harmonizer of the zodiac, holding the sacred scales that seek balance in all things. Ruled by Venus and carried by the air element, Libra individuals are the natural diplomats, artists, and lovers of the zodiac, forever seeking to create beauty, fairness, and meaningful connection in the world around them.',
    longDescription:
      'Libra, the Scales, stands at the midpoint of the zodiac, embodying the eternal quest for balance, harmony, and justice. As a cardinal air sign blessed by Venus, Libra possesses an aesthetic sensitivity that goes far beyond surface beauty — they perceive the underlying harmony of the universe and feel called to bring that harmony into every aspect of human experience, from relationships to art to the structures of society itself.\n\nThe Libra soul finds its deepest fulfillment in partnership and connection. These individuals understand, perhaps more profoundly than any other sign, that we are not meant to walk through life alone. Their gift for diplomacy is rooted not in people-pleasing but in a genuine ability to see and honor multiple perspectives. When Libra mediates, they are channeling a higher wisdom that recognizes the validity in every viewpoint and seeks the synthesis that honors all.\n\nLibra\'s relationship with beauty is itself a spiritual practice. They understand that beauty is not mere decoration but a reflection of cosmic order — that when things are truly balanced and harmonious, beauty naturally emerges. In their pursuit of aesthetic perfection, Libra individuals are actually seeking truth. They remind us that kindness is a form of strength, that grace under pressure is a form of courage, and that the most revolutionary act in a divided world is to build bridges of understanding and love.',
  },

  scorpio: {
    sign: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    unicode: '\u264F',
    element: 'water',
    modality: 'fixed',
    polarity: 'negative',
    rulingPlanet: 'pluto',
    dateRange: { start: '10-23', end: '11-21' },
    traits: ['intense', 'perceptive', 'transformative', 'magnetic', 'determined'],
    strengths: ['penetrating insight', 'unwavering loyalty', 'extraordinary willpower', 'capacity for deep transformation'],
    weaknesses: ['can be secretive', 'tendency toward jealousy', 'difficulty letting go of grudges'],
    color: '#85144b',
    luckyNumbers: [8, 11, 18],
    description:
      'Scorpio is the powerful alchemist of the zodiac, diving fearlessly into the deepest waters of human experience. Ruled by Pluto, the planet of transformation, Scorpio individuals possess an intensity and depth that enables them to see beyond surfaces, uncover hidden truths, and emerge from life\'s most challenging passages reborn and more powerful than before.',
    longDescription:
      'Scorpio, the Scorpion, dwells in the zodiac\'s deepest waters, where light and shadow dance in eternal interplay. As a fixed water sign governed by Pluto, the planet of death and rebirth, Scorpio carries within its soul the profound understanding that true power comes not from avoiding the darkness but from moving through it with courage and emerging transformed. These individuals are the psychic surgeons of the zodiac, capable of seeing beneath every mask and beyond every illusion.\n\nThe Scorpio heart loves with an intensity that can be both breathtaking and overwhelming. When Scorpio commits — to a person, a cause, or a vision — they do so with their entire being, holding nothing back. Their loyalty is absolute and unwavering; once you have earned a Scorpio\'s trust, you have an ally who will walk through fire for you. Their emotional depth creates bonds that transcend the ordinary, forging connections that feel fated, karmic, and profoundly soul-stirring.\n\nScorpio\'s greatest gift is the power of transformation. These individuals understand the sacred cycle of death and rebirth that governs all of nature, and they embody it in their own lives, continuously shedding old skins and rising renewed. They are the phoenix of the zodiac, proving again and again that what appears to be an ending is actually a doorway to a more authentic and powerful existence. Scorpio teaches us that our deepest wounds contain our greatest gifts, and that true strength is forged in the crucible of our most challenging experiences.',
  },

  sagittarius: {
    sign: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    unicode: '\u2650',
    element: 'fire',
    modality: 'mutable',
    polarity: 'positive',
    rulingPlanet: 'jupiter',
    dateRange: { start: '11-22', end: '12-21' },
    traits: ['adventurous', 'optimistic', 'philosophical', 'generous', 'free-spirited'],
    strengths: ['boundless optimism', 'love of wisdom and truth', 'adventurous spirit', 'infectious enthusiasm'],
    weaknesses: ['can be tactlessly blunt', 'tendency to overcommit', 'impatient with details'],
    color: '#7FDBFF',
    luckyNumbers: [3, 9, 21],
    description:
      'Sagittarius is the joyful explorer of the zodiac, aiming their arrow toward the highest truths and farthest horizons. Ruled by Jupiter, the planet of expansion and abundance, Sagittarius individuals are the eternal optimists and seekers, forever questing for meaning, adventure, and the wisdom that lies beyond the next horizon.',
    longDescription:
      'Sagittarius, the Archer, gazes toward the stars with an arrow drawn, ready to launch into the great unknown with unbridled enthusiasm and faith. As a mutable fire sign blessed by Jupiter, the most benevolent planet in the solar system, Sagittarius embodies the human spirit\'s highest aspirations — the yearning to understand life\'s grand meaning, to experience the full breadth of what existence has to offer, and to share the wisdom gathered along the way.\n\nThe Sagittarius soul is a natural philosopher and teacher, one who seeks truth not in dusty libraries alone but in the lived experience of diverse cultures, landscapes, and perspectives. Their optimism is not naive but earned — it springs from a deep faith that the universe is fundamentally benevolent and that every experience, even the difficult ones, carries within it a gift of growth and understanding. When a Sagittarius shares their enthusiasm, it is like a torch being passed, igniting possibility in everyone they touch.\n\nIn love and friendship, Sagittarius brings laughter, adventure, and a refreshing honesty that keeps relationships vibrant and growing. They need partners who understand their deep need for freedom — not freedom from commitment, but freedom within it, the space to continue growing, exploring, and expanding. Sagittarius reminds us that life is a magnificent journey, not a destination, and that the meaning we seek is found not at the end of the road but in every step along the way.',
  },

  capricorn: {
    sign: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    unicode: '\u2651',
    element: 'earth',
    modality: 'cardinal',
    polarity: 'negative',
    rulingPlanet: 'saturn',
    dateRange: { start: '12-22', end: '01-19' },
    traits: ['ambitious', 'disciplined', 'responsible', 'wise', 'patient'],
    strengths: ['unmatched determination', 'natural authority and wisdom', 'deeply responsible', 'strategic long-term thinker'],
    weaknesses: ['can be overly rigid', 'tendency to overwork', 'may suppress emotions'],
    color: '#654321',
    luckyNumbers: [4, 8, 22],
    description:
      'Capricorn is the wise mountain climber of the zodiac, ascending toward their highest aspirations with unwavering determination and timeless patience. Ruled by Saturn, the planet of structure and mastery, Capricorn individuals build their lives with the careful craftsmanship of master architects, creating legacies that endure.',
    longDescription:
      'Capricorn, the Sea-Goat, embodies the ancient wisdom that all worthy achievements require patience, discipline, and the willingness to play the long game. As a cardinal earth sign governed by Saturn, the great taskmaster of the zodiac, Capricorn understands that the most meaningful structures — whether in career, relationships, or personal character — are built not in a day but over a lifetime of steady, purposeful effort. Their ambition is not mere hunger for status; it is a deep soul-calling to manifest their highest potential in the material world.\n\nThe Capricorn heart, often hidden behind a composed and serious exterior, is one of the most tender and devoted in the zodiac. These individuals love with a depth and constancy that weathers every storm. They show their affection not through grand declarations but through steadfast presence, reliable action, and the quiet sacrifices they make for those they hold dear. A Capricorn\'s word is their sacred bond, and their commitment, once given, is as enduring as the mountains they symbolically climb.\n\nCapricorn\'s relationship with time is perhaps their most profound spiritual gift. They understand that Saturn\'s lessons — patience, perseverance, and the acceptance of limitation as a pathway to mastery — are not punishments but initiations. With each challenge overcome and each responsibility shouldered, Capricorn grows stronger, wiser, and more compassionate. They remind us that true authority is earned through integrity, that lasting success is built on solid foundations, and that the sweetest victories are those achieved through honest and persistent effort.',
  },

  aquarius: {
    sign: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    unicode: '\u2652',
    element: 'air',
    modality: 'fixed',
    polarity: 'positive',
    rulingPlanet: 'uranus',
    dateRange: { start: '01-20', end: '02-18' },
    traits: ['innovative', 'humanitarian', 'independent', 'visionary', 'progressive'],
    strengths: ['brilliant original thinker', 'deeply humanitarian', 'fiercely independent', 'visionary and ahead of their time'],
    weaknesses: ['can seem emotionally detached', 'tendency toward stubbornness', 'may feel alienated from others'],
    color: '#0074D9',
    luckyNumbers: [4, 7, 11],
    description:
      'Aquarius is the visionary revolutionary of the zodiac, dreaming of a better world and possessing the intellectual brilliance to help create it. Ruled by Uranus, the planet of innovation and awakening, Aquarius individuals are the forward-thinking humanitarians whose unconventional ideas light the way toward humanity\'s highest potential.',
    longDescription:
      'Aquarius, the Water Bearer, pours forth the waters of knowledge, innovation, and humanitarian vision upon a world in constant need of awakening. As a fixed air sign electrified by Uranus, the planet of revolution and higher consciousness, Aquarius operates on a frequency that is often ahead of its time. These individuals see possibilities where others see impossibilities, and their brilliant, unconventional minds are capable of making conceptual leaps that reshape our understanding of what is possible.\n\nThe Aquarius soul is driven by a profound love for humanity as a whole. While they may sometimes struggle with the intimacy of one-on-one connections, their capacity for caring about the collective welfare is unparalleled. They are the social architects, the activists, the inventors, and the dreamers who work tirelessly to build a more just, equitable, and enlightened world. Their independence is not aloofness but the necessary space required for truly original thought.\n\nIn relationships, Aquarius brings intellectual stimulation, unwavering respect for individuality, and a love that liberates rather than constrains. They need partners who appreciate their uniqueness and share their vision of a world where every person is free to be authentically themselves. Aquarius reminds us that the most powerful force for change is an idea whose time has come, and that each of us has the power — and the responsibility — to contribute our unique gifts to the evolution of human consciousness.',
  },

  pisces: {
    sign: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    unicode: '\u2653',
    element: 'water',
    modality: 'mutable',
    polarity: 'negative',
    rulingPlanet: 'neptune',
    dateRange: { start: '02-19', end: '03-20' },
    traits: ['compassionate', 'imaginative', 'intuitive', 'gentle', 'mystical'],
    strengths: ['boundless compassion', 'extraordinary imagination', 'deep spiritual awareness', 'profound emotional wisdom'],
    weaknesses: ['can be overly escapist', 'tendency to absorb others\' emotions', 'may struggle with boundaries'],
    color: '#B10DC9',
    luckyNumbers: [3, 7, 12],
    description:
      'Pisces is the mystical dreamer of the zodiac, swimming in the boundless ocean of collective consciousness where imagination and intuition merge into profound spiritual wisdom. Ruled by Neptune, Pisces individuals possess a compassion and creative vision that transcends the ordinary, touching the very essence of what it means to be human.',
    longDescription:
      'Pisces, the Fish, swims in the deepest and most mysterious waters of the zodiac, where the boundary between the self and the cosmos dissolves into luminous unity. As the final sign — a mutable water sign guided by Neptune, the planet of dreams, spirituality, and transcendence — Pisces carries within its soul the accumulated wisdom and compassion of every sign that came before. These individuals are the mystics, the artists, the healers, and the dreamers who remind us that there is far more to reality than what meets the eye.\n\nThe Pisces heart is an ocean of compassion so vast that it can hold the sorrows and joys of the entire world. These individuals feel the interconnectedness of all beings not as an abstract concept but as a lived, daily experience. Their empathy is so profound that they often absorb the emotions of those around them, a gift that can be both beautiful and overwhelming. When a Pisces creates — whether through music, art, writing, or simply the way they move through the world — they channel something beyond the personal, tapping into a universal well of beauty and meaning.\n\nPisces\' spiritual nature is not an escape from the world but a deeper engagement with it. They understand that behind the veil of everyday reality lies a realm of infinite possibility, and their imagination is the bridge between these worlds. In love, Pisces offers a devotion that is selfless and all-encompassing, a love that sees and accepts the totality of another person, shadows and all. Pisces teaches us that the highest wisdom is compassion, that the deepest strength is gentleness, and that in surrendering to the flow of life, we find our truest power and purpose.',
  },
};

/** Ordered array of zodiac signs from Aries to Pisces */
export const ZODIAC_ORDER: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

/** The four classical elements */
export const ELEMENTS: Element[] = ['fire', 'earth', 'air', 'water'];

/** The three modalities */
export const MODALITIES: Modality[] = ['cardinal', 'fixed', 'mutable'];

/**
 * Get the zodiac sign for a given date (month and day).
 * Returns the sun sign based on traditional tropical zodiac date ranges.
 */
export function getSignByDate(month: number, day: number): ZodiacSign {
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  for (const sign of ZODIAC_ORDER) {
    const { start, end } = ZODIAC_SIGNS[sign].dateRange;

    // Handle Capricorn which spans year boundary (12-22 to 01-19)
    if (start > end) {
      if (dateStr >= start || dateStr <= end) {
        return sign;
      }
    } else {
      if (dateStr >= start && dateStr <= end) {
        return sign;
      }
    }
  }

  // Fallback (should not reach here with valid dates)
  return 'capricorn';
}

/**
 * Get the element of a zodiac sign.
 */
export function getElement(sign: ZodiacSign): Element {
  return ZODIAC_SIGNS[sign].element;
}

/**
 * Get compatible signs for a given zodiac sign.
 * Compatibility is determined by element harmony:
 * - Same element signs are highly compatible
 * - Complementary elements are compatible (fire-air, earth-water)
 * - The sign opposite on the zodiac wheel adds magnetic attraction
 */
export function getCompatibleSigns(sign: ZodiacSign): ZodiacSign[] {
  const element = ZODIAC_SIGNS[sign].element;

  const complementaryElement: Record<Element, Element> = {
    fire: 'air',
    air: 'fire',
    earth: 'water',
    water: 'earth',
  };

  const compatible: ZodiacSign[] = [];

  for (const candidate of ZODIAC_ORDER) {
    if (candidate === sign) continue;

    const candidateElement = ZODIAC_SIGNS[candidate].element;

    if (candidateElement === element || candidateElement === complementaryElement[element]) {
      compatible.push(candidate);
    }
  }

  // Include the opposite sign for magnetic attraction if not already included
  const signIndex = ZODIAC_ORDER.indexOf(sign);
  const oppositeIndex = (signIndex + 6) % 12;
  const oppositSign = ZODIAC_ORDER[oppositeIndex];

  if (!compatible.includes(oppositSign)) {
    compatible.push(oppositSign);
  }

  return compatible;
}
