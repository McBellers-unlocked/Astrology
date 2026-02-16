// Core Astrology Types for Stellara

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Planet =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'north_node' | 'south_node' | 'chiron';

export type HouseSystem = 'placidus' | 'koch' | 'whole_sign' | 'equal' | 'campanus' | 'regiomontanus';

export type AspectType =
  | 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  | 'quincunx' | 'semi_sextile' | 'semi_square' | 'sesquiquadrate' | 'quintile';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export type Polarity = 'positive' | 'negative';

export interface ZodiacSignInfo {
  sign: ZodiacSign;
  name: string;
  symbol: string;
  unicode: string;
  element: Element;
  modality: Modality;
  polarity: Polarity;
  rulingPlanet: Planet;
  dateRange: { start: string; end: string };
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  color: string;
  luckyNumbers: number[];
  description: string;
  longDescription: string;
}

export interface PlanetPosition {
  planet: Planet;
  sign: ZodiacSign;
  degree: number;
  minute: number;
  retrograde: boolean;
  house: number;
  exactDegree: number; // 0-360
}

export interface HouseCusp {
  house: number;
  sign: ZodiacSign;
  degree: number;
  minute: number;
}

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  orb: number;
  applying: boolean;
  exactDegree: number;
}

export interface BirthChartData {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: { sign: ZodiacSign; degree: number };
  midheaven: { sign: ZodiacSign; degree: number };
  elementBalance: Record<Element, number>;
  modalityBalance: Record<Modality, number>;
}

export interface BirthChartInput {
  birthDate: string; // ISO date
  birthTime: string; // HH:mm
  latitude: number;
  longitude: number;
  location: string;
  timezone: string;
  houseSystem?: HouseSystem;
}

export interface SynastryData {
  person1: BirthChartData;
  person2: BirthChartData;
  interAspects: Aspect[];
  compositeChart: BirthChartData;
  compatibilityScore: number;
  strengths: string[];
  challenges: string[];
  overallSummary: string;
}

export interface DailyHoroscope {
  sign: ZodiacSign;
  date: string;
  type: 'sun' | 'moon' | 'rising';
  content: string;
  mood: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility: ZodiacSign;
  rating: {
    overall: number;
    love: number;
    career: number;
    wellness: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthChart?: BirthChartInput;
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  risingSign?: ZodiacSign;
  isPremium: boolean;
  subscriptionTier: 'free' | 'stellar' | 'cosmic';
  createdAt: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}
