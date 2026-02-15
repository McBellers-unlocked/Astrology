'use client';

import Link from 'next/link';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface PremiumGateProps {
  /** Content shown to premium users */
  children: React.ReactNode;
  /** Minimum tier required: 'stellar' grants access to stellar + cosmic, 'cosmic' grants cosmic only */
  requiredTier?: 'stellar' | 'cosmic';
  /** Preview text shown to non-premium users */
  previewText?: string;
  /** Feature name for the CTA */
  featureName?: string;
}

/**
 * Wraps premium content. Shows children to subscribed users,
 * blur overlay + upgrade CTA to everyone else.
 */
export default function PremiumGate({
  children,
  requiredTier = 'stellar',
  previewText,
  featureName = 'this feature',
}: PremiumGateProps) {
  const { user, isPremium } = useAuth();

  const hasAccess =
    isPremium &&
    user !== null &&
    (requiredTier === 'stellar'
      ? user.subscriptionTier === 'stellar' || user.subscriptionTier === 'cosmic'
      : user.subscriptionTier === 'cosmic');

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Preview content (blurred) */}
      {previewText && (
        <p className="mb-4 text-sm leading-relaxed text-dust-300">{previewText}</p>
      )}
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent via-space-900/70 to-space-900 pb-6">
          <div className="text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 animate-pulse text-dust-500" />
            <p className="mb-4 text-sm text-dust-300">
              {user
                ? `Unlock ${featureName} with Stellara Premium`
                : `Sign up free to access ${featureName}`}
            </p>
            <Link
              href={user ? '/pricing' : '/signup'}
              className="btn-glow inline-flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              {user ? (
                <>
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Free Account
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
