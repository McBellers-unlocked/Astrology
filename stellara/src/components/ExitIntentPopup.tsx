'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';

interface ExitIntentPopupProps {
  /** If true, suppress the popup (e.g., chart already generated) */
  suppress?: boolean;
}

export default function ExitIntentPopup({ suppress = false }: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);

  const showPopup = useCallback(() => {
    if (suppress) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('stellara_exit_shown')) return;

    sessionStorage.setItem('stellara_exit_shown', '1');
    setVisible(true);
  }, [suppress]);

  useEffect(() => {
    if (suppress) return;

    // Desktop: mouse leaves viewport (moving toward browser chrome / close button)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [suppress, showPopup]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-space-900/80 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />

      {/* Modal */}
      <div className="relative glass-card p-8 sm:p-10 max-w-md w-full animate-in text-center">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 text-dust-500 hover:text-dust-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-stardust-400" />
            <span className="text-sm text-stardust-400 font-semibold">30 seconds away</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3 leading-tight">
            Wait &mdash; You&apos;re About to Miss Yourself
          </h2>
          <p className="text-dust-300 text-sm leading-relaxed">
            You&apos;re 30 seconds away from understanding why you think,
            love, and react the way you do. Most people never get this clarity
            about themselves.
          </p>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            // Scroll to form and focus first input
            const form = document.querySelector('form');
            if (form) {
              form.scrollIntoView({ behavior: 'smooth' });
              const firstInput = form.querySelector('input, select') as HTMLElement;
              if (firstInput) setTimeout(() => firstInput.focus(), 400);
            }
          }}
          className="btn-glow w-full py-3.5 text-base"
        >
          <Sparkles className="w-5 h-5" />
          Show Me Who I Am
        </button>

        <p className="text-xs text-dust-500 mt-3">
          Free &middot; No signup required &middot; Takes 30 seconds
        </p>
      </div>
    </div>
  );
}
