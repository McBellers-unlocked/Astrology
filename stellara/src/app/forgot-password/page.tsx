'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Sparkles, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-md text-center">
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-aurora-400" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-sm text-dust-400 mb-6">
              If an account exists for <span className="text-foreground">{email}</span>, we&apos;ve sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-celestial-300 hover:text-celestial-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-celestial-300" />
            <span className="gradient-text text-2xl font-bold">Stellara</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-1 text-sm text-dust-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-dust-200">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dust-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-celestial-500/15 bg-space-800/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder-dust-500 transition-all focus:border-celestial-400/40 focus:outline-none focus:ring-2 focus:ring-celestial-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-glow flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <p className="text-center text-sm text-dust-400">
            Remember your password?{' '}
            <Link href="/login" className="text-celestial-300 hover:text-celestial-200 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
