'use client';

import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  /** Optional loading message displayed beneath the spinner */
  text?: string;
  className?: string;
}

/* ----------------------------------------------------------------
   Size configuration
   ---------------------------------------------------------------- */

const sizeConfig: Record<LoaderSize, { wheel: number; fontSize: string; symbols: string }> = {
  sm: { wheel: 40, fontSize: 'text-xs', symbols: 'text-[8px]' },
  md: { wheel: 64, fontSize: 'text-sm', symbols: 'text-xs' },
  lg: { wheel: 96, fontSize: 'text-base', symbols: 'text-sm' },
};

/* ----------------------------------------------------------------
   The 12 zodiac unicode symbols arranged in a wheel
   ---------------------------------------------------------------- */

const zodiacRing = [
  '\u2648', // Aries
  '\u2649', // Taurus
  '\u264A', // Gemini
  '\u264B', // Cancer
  '\u264C', // Leo
  '\u264D', // Virgo
  '\u264E', // Libra
  '\u264F', // Scorpio
  '\u2650', // Sagittarius
  '\u2651', // Capricorn
  '\u2652', // Aquarius
  '\u2653', // Pisces
];

export default function Loader({
  size = 'md',
  text,
  className = '',
}: LoaderProps) {
  const config = sizeConfig[size];
  const half = config.wheel / 2;
  const symbolRadius = half - (size === 'sm' ? 6 : size === 'lg' ? 14 : 10);

  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-3',
        className,
      ].join(' ')}
      role="status"
      aria-label={text || 'Loading'}
    >
      {/* Outer spinning zodiac wheel */}
      <div
        className="relative"
        style={{ width: config.wheel, height: config.wheel }}
      >
        {/* Rotating ring with conic gradient border */}
        <div
          className="absolute inset-0 rounded-full animate-[zodiac-spin_8s_linear_infinite]"
          style={{
            background: `conic-gradient(from 0deg, #7C3AED, #EC4899, #FBBF24, #10B981, #7C3AED)`,
            mask: `radial-gradient(circle, transparent ${half - 3}px, black ${half - 3}px, black ${half}px, transparent ${half}px)`,
            WebkitMask: `radial-gradient(circle, transparent ${half - 3}px, black ${half - 3}px, black ${half}px, transparent ${half}px)`,
          }}
        />

        {/* Zodiac symbols around the ring */}
        <div
          className="absolute inset-0 animate-[zodiac-spin_12s_linear_infinite]"
          style={{ animationDirection: 'reverse' }}
        >
          {zodiacRing.map((symbol, i) => {
            const angle = (i * 360) / 12 - 90; // start from top
            const rad = (angle * Math.PI) / 180;
            const x = half + symbolRadius * Math.cos(rad);
            const y = half + symbolRadius * Math.sin(rad);

            return (
              <span
                key={i}
                className={[
                  'absolute text-celestial-200/60 leading-none',
                  config.symbols,
                ].join(' ')}
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-hidden="true"
              >
                {symbol}
              </span>
            );
          })}
        </div>

        {/* Center pulsing star */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={[
              'text-stardust-400 animate-[pulse-ring_2s_ease-in-out_infinite]',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base',
            ].join(' ')}
            aria-hidden="true"
          >
            {'\u2726'}
          </span>
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <p
          className={[
            'text-dust-400 font-medium animate-pulse',
            config.fontSize,
          ].join(' ')}
        >
          {text}
        </p>
      )}
    </div>
  );
}
