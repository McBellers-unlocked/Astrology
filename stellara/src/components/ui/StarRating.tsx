import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  /** Rating value between 0 and 5 (supports decimals for partial fill) */
  rating: number;
  /** Accessible label describing what the rating represents */
  label?: string;
  /** Star color – defaults to stardust gold */
  color?: 'gold' | 'purple' | 'pink';
  /** Number of stars to show (defaults to 5) */
  maxStars?: number;
  /** Size of each star in pixels */
  starSize?: number;
  /** Show the numeric rating next to the stars */
  showValue?: boolean;
  className?: string;
}

const colorMap: Record<NonNullable<StarRatingProps['color']>, { fill: string; stroke: string; empty: string }> = {
  gold: {
    fill: '#FBBF24',
    stroke: '#f59e0b',
    empty: 'rgba(251, 191, 36, 0.2)',
  },
  purple: {
    fill: '#8b5cf6',
    stroke: '#7C3AED',
    empty: 'rgba(124, 58, 237, 0.2)',
  },
  pink: {
    fill: '#f472b6',
    stroke: '#EC4899',
    empty: 'rgba(236, 72, 153, 0.2)',
  },
};

export default function StarRating({
  rating,
  label,
  color = 'gold',
  maxStars = 5,
  starSize = 18,
  showValue = false,
  className = '',
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(rating, maxStars));
  const palette = colorMap[color];

  return (
    <div
      className={['inline-flex items-center gap-2', className].join(' ')}
      role="img"
      aria-label={label ? `${label}: ${clamped.toFixed(1)} out of ${maxStars}` : `${clamped.toFixed(1)} out of ${maxStars} stars`}
    >
      {label && (
        <span className="text-xs font-medium text-dust-400 mr-0.5">
          {label}
        </span>
      )}

      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, i) => {
          const fillPercent = Math.max(0, Math.min(1, clamped - i));
          return (
            <StarIcon
              key={i}
              size={starSize}
              fillPercent={fillPercent}
              palette={palette}
            />
          );
        })}
      </span>

      {showValue && (
        <span className="text-xs font-semibold text-dust-300 tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   Individual Star with partial fill via SVG clipPath
   ---------------------------------------------------------------- */

interface StarIconProps {
  size: number;
  fillPercent: number; // 0..1
  palette: { fill: string; stroke: string; empty: string };
}

function StarIcon({ size, fillPercent, palette }: StarIconProps) {
  const clipId = React.useId();

  // Fully empty
  if (fillPercent <= 0) {
    return (
      <Star
        size={size}
        strokeWidth={1.5}
        fill={palette.empty}
        stroke={palette.empty}
        className="shrink-0"
      />
    );
  }

  // Fully filled
  if (fillPercent >= 1) {
    return (
      <Star
        size={size}
        strokeWidth={1.5}
        fill={palette.fill}
        stroke={palette.stroke}
        className="shrink-0"
        style={{ filter: `drop-shadow(0 0 3px ${palette.fill}55)` }}
      />
    );
  }

  // Partial fill – use two overlapping stars with a clip mask
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={size * fillPercent} height={size} />
          </clipPath>
        </defs>
      </svg>

      {/* Empty background star */}
      <Star
        size={size}
        strokeWidth={1.5}
        fill={palette.empty}
        stroke={palette.empty}
        className="absolute inset-0"
      />

      {/* Filled foreground star clipped to percentage */}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPercent * 100}%` }}
      >
        <Star
          size={size}
          strokeWidth={1.5}
          fill={palette.fill}
          stroke={palette.stroke}
          style={{ filter: `drop-shadow(0 0 3px ${palette.fill}55)` }}
        />
      </span>
    </span>
  );
}
