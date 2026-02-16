'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { trackEvent, trackMetaEvent } from '@/components/Analytics';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      trackEvent('sign_up', { method: 'email' });
      trackMetaEvent('CompleteRegistration');
      router.push('/birth-chart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-celestial-300" />
            <span className="gradient-text text-2xl font-bold">Stellara</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-dust-400">
            Free forever. Unlock your cosmic blueprint.
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
            <label htmlFor="name" className="text-sm font-medium text-dust-200">
              Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dust-500" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-celestial-500/15 bg-space-800/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder-dust-500 transition-all focus:border-celestial-400/40 focus:outline-none focus:ring-2 focus:ring-celestial-500/20"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-dust-200">
              Password
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

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex w-full items-center justify-center gap-2 py-3 text-sm font-medium disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-dust-500">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-dust-400">
          Already have an account?{' '}
          <Link href="/login" className="text-celestial-300 hover:text-celestial-200">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
