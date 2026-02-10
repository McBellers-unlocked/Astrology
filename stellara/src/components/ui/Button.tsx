'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-glow text-white font-semibold',
  secondary: [
    'border border-celestial-400/30 text-celestial-200',
    'bg-transparent hover:bg-celestial-400/10 hover:border-celestial-400/50',
    'active:bg-celestial-400/15 transition-all duration-200 font-medium',
  ].join(' '),
  ghost: [
    'bg-transparent text-dust-300 hover:text-celestial-200',
    'hover:bg-white/5 active:bg-white/8',
    'transition-all duration-200 font-medium',
  ].join(' '),
  gold: [
    'bg-gradient-to-r from-stardust-600 via-stardust-400 to-stardust-300',
    'text-space-900 font-bold',
    'shadow-glow-gold hover:shadow-[0_0_28px_rgba(251,191,36,0.35),0_0_56px_rgba(251,191,36,0.15)]',
    'active:scale-[0.97] transition-all duration-200',
  ].join(' '),
};

const disabledClasses =
  'opacity-40 cursor-not-allowed pointer-events-none select-none';

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  href,
  type = 'button',
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    'inline-flex items-center justify-center font-heading whitespace-nowrap select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celestial-400/60',
    sizeClasses[size],
    variantClasses[variant],
    isDisabled ? disabledClasses : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </>
  );

  // Render as Next.js Link when href is provided
  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
      aria-disabled={isDisabled}
    >
      {content}
    </button>
  );
}
