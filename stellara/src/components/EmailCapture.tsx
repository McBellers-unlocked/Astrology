'use client';

import { useState, type FormEvent } from 'react';
import { Mail, Sparkles, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface EmailCaptureProps {
  /** Heading displayed above the input */
  heading?: string;
  /** Subheading / description text */
  subheading?: string;
  /** CTA button text */
  ctaText?: string;
  /** Visual variant */
  variant?: 'inline' | 'card' | 'banner';
  /** Source tag for tracking which placement captured the email */
  source?: string;
}

export default function EmailCapture({
  heading = 'Get your daily horoscope by email',
  subheading = 'Join 100,000+ stargazers who start their day with cosmic guidance.',
  ctaText = 'Subscribe Free',
  variant = 'card',
  source = 'unknown',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      // Send to API (Resend integration)
      await api.post('/email/subscribe', { email, source });

      // Track event in GA4 if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
        gtag('event', 'email_signup', {
          event_category: 'engagement',
          event_label: source,
          value: 1,
        });
      }

      setStatus('success');
      setEmail('');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={wrapperClass(variant)}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aurora-500/20">
            <Check className="h-6 w-6 text-aurora-400" />
          </div>
          <p className="text-lg font-semibold text-foreground">You&apos;re in!</p>
          <p className="text-sm text-dust-400">
            Check your inbox for a welcome message from the cosmos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass(variant)}>
      {variant !== 'inline' && (
        <div className="mb-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Mail className="h-5 w-5 text-celestial-300" />
            <Sparkles className="h-4 w-4 text-stardust-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground sm:text-xl">{heading}</h3>
          <p className="mt-1.5 text-sm text-dust-400">{subheading}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dust-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-celestial-500/15 bg-space-800/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder-dust-500 transition-all focus:border-celestial-400/40 focus:outline-none focus:ring-2 focus:ring-celestial-500/20"
            aria-label="Email address"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-glow whitespace-nowrap px-6 py-3 text-sm font-medium disabled:opacity-60"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </span>
          ) : (
            ctaText
          )}
        </button>
      </form>

      {status === 'error' && (
        <p className="mt-2 text-center text-xs text-red-400">{errorMessage}</p>
      )}

      <p className="mt-3 text-center text-xs text-dust-600">
        No spam, ever. Unsubscribe in one click.
      </p>
    </div>
  );
}

function wrapperClass(variant: 'inline' | 'card' | 'banner'): string {
  const base = 'w-full';
  switch (variant) {
    case 'card':
      return `${base} glass-card rounded-2xl p-6 sm:p-8`;
    case 'banner':
      return `${base} rounded-2xl border border-celestial-500/10 bg-gradient-to-r from-space-900/80 via-celestial-900/20 to-space-900/80 p-6 sm:p-8`;
    case 'inline':
      return `${base}`;
  }
}
