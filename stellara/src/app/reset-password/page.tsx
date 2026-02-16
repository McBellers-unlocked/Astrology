'use client';

import { useState, type FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Sparkles, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Invalid reset link</h1>
        <p className="text-sm text-dust-400 mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          Request a new link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-aurora-400" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Password updated</h1>
        <p className="text-sm text-dust-400 mb-6">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-dust-200">
          New password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dust-500" />
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-celestial-500/15 bg-space-800/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder-dust-500 transition-all focus:border-celestial-400/40 focus:outline-none focus:ring-2 focus:ring-celestial-500/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-dust-200">
          Confirm password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dust-500" />
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className="w-full rounded-xl border border-celestial-500/15 bg-space-800/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder-dust-500 transition-all focus:border-celestial-400/40 focus:outline-none focus:ring-2 focus:ring-celestial-500/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="btn-glow flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-celestial-300" />
            <span className="gradient-text text-2xl font-bold">Stellara</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Choose a new password</h1>
          <p className="mt-1 text-sm text-dust-400">
            Enter your new password below
          </p>
        </div>

        <Suspense fallback={
          <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-celestial-300" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
