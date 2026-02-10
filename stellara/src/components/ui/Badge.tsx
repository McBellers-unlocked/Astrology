import React from 'react';

type BadgeVariant =
  | 'default'
  | 'premium'
  | 'element-fire'
  | 'element-earth'
  | 'element-air'
  | 'element-water';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: [
    'bg-celestial-400/15 text-celestial-200 border-celestial-400/25',
  ].join(' '),
  premium: [
    'bg-gradient-to-r from-stardust-600/20 via-stardust-400/25 to-stardust-300/20',
    'text-stardust-100 border-stardust-400/30',
    'shadow-[0_0_12px_rgba(251,191,36,0.1)]',
  ].join(' '),
  'element-fire': [
    'bg-red-500/15 text-red-300 border-red-500/25',
  ].join(' '),
  'element-earth': [
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  ].join(' '),
  'element-air': [
    'bg-indigo-400/15 text-indigo-300 border-indigo-400/25',
  ].join(' '),
  'element-water': [
    'bg-blue-500/15 text-blue-300 border-blue-500/25',
  ].join(' '),
};

const elementIcons: Partial<Record<BadgeVariant, string>> = {
  'element-fire': '\u{1F525}',    // fire emoji alternative: use unicode flame
  'element-earth': '\u{1F33F}',
  'element-air': '\u{1F4A8}',
  'element-water': '\u{1F4A7}',
};

// Using simple unicode symbols instead of emojis for a cleaner look
const elementSymbols: Partial<Record<BadgeVariant, string>> = {
  'element-fire': '\u2BC5',   // down-pointing triangle (fire)
  'element-earth': '\u2BC6',  // up-pointing triangle (earth)
  'element-air': '\u2641',    // earth symbol (air – astrological)
  'element-water': '\u224B',  // triple tilde (water)
  premium: '\u2605',          // filled star
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const symbol = elementSymbols[variant];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-0.5 rounded-full',
        'text-xs font-semibold tracking-wide',
        'border',
        'whitespace-nowrap select-none',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {symbol && (
        <span className="text-[0.65rem] leading-none" aria-hidden="true">
          {symbol}
        </span>
      )}
      {children}
    </span>
  );
}
