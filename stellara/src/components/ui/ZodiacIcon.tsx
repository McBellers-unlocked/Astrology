import React from 'react';
import type { ZodiacSign, Element } from '@/types/astrology';

interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Show a subtle glow matching the element color */
  glow?: boolean;
}

/* ----------------------------------------------------------------
   Zodiac Unicode Symbols
   ---------------------------------------------------------------- */

const zodiacSymbols: Record<ZodiacSign, string> = {
  aries: '\u2648',
  taurus: '\u2649',
  gemini: '\u264A',
  cancer: '\u264B',
  leo: '\u264C',
  virgo: '\u264D',
  libra: '\u264E',
  scorpio: '\u264F',
  sagittarius: '\u2650',
  capricorn: '\u2651',
  aquarius: '\u2652',
  pisces: '\u2653',
};

/* ----------------------------------------------------------------
   Sign -> Element mapping
   ---------------------------------------------------------------- */

const signElement: Record<ZodiacSign, Element> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

/* ----------------------------------------------------------------
   Element color classes (text + optional glow shadow)
   ---------------------------------------------------------------- */

const elementTextColor: Record<Element, string> = {
  fire: 'text-red-400',
  earth: 'text-emerald-400',
  air: 'text-indigo-400',
  water: 'text-blue-400',
};

const elementGlowShadow: Record<Element, string> = {
  fire: 'drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]',
  earth: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]',
  air: 'drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]',
  water: 'drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]',
};

/* ----------------------------------------------------------------
   Size classes
   ---------------------------------------------------------------- */

const sizeClasses: Record<NonNullable<ZodiacIconProps['size']>, string> = {
  sm: 'text-base w-6 h-6',
  md: 'text-xl w-8 h-8',
  lg: 'text-3xl w-12 h-12',
  xl: 'text-5xl w-16 h-16',
};

/* ----------------------------------------------------------------
   Component
   ---------------------------------------------------------------- */

export default function ZodiacIcon({
  sign,
  size = 'md',
  className = '',
  glow = false,
}: ZodiacIconProps) {
  const element = signElement[sign];
  const symbol = zodiacSymbols[sign];

  return (
    <span
      role="img"
      aria-label={`${sign} zodiac symbol`}
      className={[
        'inline-flex items-center justify-center leading-none select-none',
        sizeClasses[size],
        elementTextColor[element],
        glow && elementGlowShadow[element],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {symbol}
    </span>
  );
}

/* ----------------------------------------------------------------
   Helpers exported for use in other components
   ---------------------------------------------------------------- */

export { zodiacSymbols, signElement, elementTextColor };
