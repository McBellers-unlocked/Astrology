/**
 * Sign data for social media posts.
 * Mirrors the frontend zodiac-data but standalone for the API.
 */

export interface SignData {
  slug: string;
  name: string;
  symbol: string;
  dates: string;
  element: string;
}

export const SIGNS: SignData[] = [
  { slug: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { slug: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  { slug: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  { slug: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { slug: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { slug: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { slug: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { slug: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
];

export const HOROSCOPE_TEASERS: Record<string, string> = {
  aries: "A bold opportunity arrives today that rewards your courage. The planets are pushing you toward a decision you've been avoiding — trust your instincts and take the leap. Your confidence is magnetic right now.",
  taurus: "Financial or material shifts are in play today. Something you've been patiently nurturing is ready to bear fruit. Stay grounded and let your persistence speak for itself — the universe is matching your energy.",
  gemini: "Communication takes centre stage today. A conversation or message could open a door you didn't know existed. Your mind is razor-sharp — use it to connect, not to overthink.",
  cancer: "Your emotional intelligence is your superpower today. A situation at home or in a close relationship needs your nurturing touch. Trust the feelings that surface — they're guiding you somewhere important.",
  leo: "The spotlight turns toward you naturally today. Creative energy is high and others are drawn to your warmth. Don't dim your light for anyone — this is your moment to shine unapologetically.",
  virgo: "The details you've been tracking are about to click into a bigger picture. Your analytical mind sees what others miss today. A health or wellness insight could be particularly powerful right now.",
  libra: "Harmony and justice are themes today. A relationship dynamic shifts in your favour as you find the perfect balance between giving and receiving. Beauty and art call to your soul.",
  scorpio: "Deep transformation continues beneath the surface. Something hidden comes to light today — and it's exactly the truth you needed. Your intuition is operating at peak frequency right now.",
  sagittarius: "Expansion and adventure call to you today. Whether through travel, learning, or a philosophical breakthrough, your world is getting bigger. Follow the excitement — it leads somewhere meaningful.",
  capricorn: "Your ambition meets perfect timing today. A career or long-term goal gets a cosmic boost. The discipline you've maintained is about to pay dividends — keep climbing.",
  aquarius: "Innovation and originality set you apart today. A creative solution to an old problem arrives unexpectedly. Your unique perspective is exactly what the world needs right now.",
  pisces: "Your imagination and intuition merge into something powerful today. Creative and spiritual insights flow freely. Pay attention to dreams and synchronicities — the universe is sending signals.",
};

export const HOROSCOPE_RATINGS: Record<string, { overall: number; love: number; career: number; wellness: number }> = {
  aries: { overall: 4, love: 3, career: 5, wellness: 4 },
  taurus: { overall: 4, love: 4, career: 4, wellness: 3 },
  gemini: { overall: 3, love: 4, career: 3, wellness: 4 },
  cancer: { overall: 4, love: 5, career: 3, wellness: 4 },
  leo: { overall: 5, love: 4, career: 5, wellness: 3 },
  virgo: { overall: 3, love: 3, career: 4, wellness: 5 },
  libra: { overall: 4, love: 5, career: 3, wellness: 4 },
  scorpio: { overall: 4, love: 4, career: 4, wellness: 3 },
  sagittarius: { overall: 5, love: 3, career: 4, wellness: 4 },
  capricorn: { overall: 4, love: 3, career: 5, wellness: 3 },
  aquarius: { overall: 3, love: 3, career: 4, wellness: 4 },
  pisces: { overall: 4, love: 5, career: 3, wellness: 5 },
};

export interface FullHoroscope {
  paragraphs: string[];
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
  moonReading: string[];
  risingReading: string[];
}

/** Generate deterministic daily horoscope data per sign */
export function getFullHoroscope(slug: string): FullHoroscope {
  const seed = new Date().getDate();
  const luckyNumbers: Record<string, number[]> = {
    aries: [7, 14, 21, 3, 9, 27, 33, 41, 5, 18, 22, 36, 44, 8, 15, 29, 37, 11, 24, 38, 46, 2, 16, 30, 42, 6, 19, 28, 35, 48],
    taurus: [2, 11, 20, 6, 14, 25, 31, 40, 4, 17, 23, 34, 43, 9, 16, 28, 36, 12, 21, 39, 47, 3, 15, 26, 38, 7, 18, 29, 33, 45],
    gemini: [5, 14, 23, 3, 11, 27, 33, 42, 7, 16, 21, 35, 44, 9, 18, 26, 38, 4, 13, 30, 41, 8, 19, 24, 37, 2, 15, 28, 36, 46],
    cancer: [3, 12, 21, 7, 15, 24, 30, 41, 5, 18, 22, 33, 42, 8, 17, 25, 37, 2, 14, 28, 39, 6, 16, 23, 35, 9, 19, 27, 34, 44],
    leo: [1, 10, 19, 5, 13, 22, 28, 37, 4, 16, 21, 31, 40, 7, 14, 26, 33, 3, 11, 24, 36, 8, 17, 23, 30, 6, 15, 25, 32, 42],
    virgo: [4, 13, 22, 6, 14, 23, 29, 38, 3, 15, 20, 32, 41, 7, 16, 24, 35, 2, 12, 26, 37, 5, 18, 21, 33, 8, 17, 27, 34, 43],
    libra: [6, 15, 24, 2, 11, 25, 31, 39, 4, 17, 22, 34, 43, 8, 14, 27, 36, 3, 13, 28, 40, 7, 16, 23, 32, 5, 19, 26, 35, 45],
    scorpio: [8, 17, 26, 4, 13, 21, 30, 38, 2, 16, 23, 33, 42, 6, 15, 25, 34, 3, 11, 27, 39, 7, 18, 22, 31, 5, 14, 28, 36, 44],
    sagittarius: [9, 18, 27, 3, 12, 24, 33, 41, 5, 15, 21, 30, 40, 7, 16, 26, 35, 2, 14, 23, 38, 6, 17, 25, 34, 8, 13, 29, 37, 46],
    capricorn: [10, 19, 28, 4, 15, 22, 31, 40, 3, 16, 24, 33, 42, 8, 17, 25, 36, 5, 13, 27, 38, 7, 14, 23, 32, 2, 18, 26, 35, 44],
    aquarius: [11, 20, 29, 7, 14, 23, 32, 41, 4, 16, 22, 31, 43, 5, 18, 24, 37, 3, 15, 26, 39, 8, 13, 27, 34, 6, 17, 25, 36, 45],
    pisces: [12, 21, 30, 3, 15, 24, 33, 42, 7, 18, 23, 34, 44, 5, 16, 27, 38, 4, 14, 25, 40, 6, 19, 22, 35, 8, 17, 28, 37, 46],
  };

  const compatMap: Record<string, string[]> = {
    aries: ['Leo', 'Sagittarius', 'Libra', 'Gemini'],
    taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    gemini: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    leo: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    virgo: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    libra: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    scorpio: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    aquarius: ['Gemini', 'Libra', 'Sagittarius', 'Aries'],
    pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
  };

  const nums = luckyNumbers[slug] ?? luckyNumbers.aries;
  const compats = compatMap[slug] ?? compatMap.aries;

  return {
    paragraphs: [HOROSCOPE_TEASERS[slug]],
    luckyNumber: nums[seed % nums.length],
    luckyColor: ['Crimson Red', 'Royal Blue', 'Emerald Green', 'Gold', 'Violet', 'Silver'][seed % 6],
    compatibility: compats[seed % compats.length],
    moonReading: [],
    risingReading: [],
  };
}
