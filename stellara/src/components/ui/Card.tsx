import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  as?: React.ElementType;
}

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  header,
  footer,
  as: Component = 'div',
}: CardProps) {
  const baseClass = hover ? 'glass-card-hover' : 'glass-card';

  const classes = [
    baseClass,
    glow && 'shadow-glow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes}>
      {header && (
        <div className="px-6 py-4 border-b border-celestial-400/10">
          {header}
        </div>
      )}

      <div className="relative z-[1] px-6 py-5">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-celestial-400/10">
          {footer}
        </div>
      )}
    </Component>
  );
}

/* ----------------------------------------------------------------
   Sub-components for composable card layouts
   ---------------------------------------------------------------- */

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardSectionProps) {
  return (
    <h3
      className={[
        'font-heading text-lg font-semibold text-foreground tracking-tight',
        className,
      ].join(' ')}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardSectionProps) {
  return (
    <p className={['text-sm text-dust-400 leading-relaxed', className].join(' ')}>
      {children}
    </p>
  );
}
