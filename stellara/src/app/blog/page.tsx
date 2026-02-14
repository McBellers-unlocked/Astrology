import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/data/blog-posts';

export const metadata: Metadata = {
  title: 'Astrology Blog — Guides, Transits & Cosmic Insights',
  description:
    'Explore in-depth astrology articles on birth charts, zodiac compatibility, Mercury retrograde, Moon signs, and more. Written for beginners and enthusiasts alike.',
  keywords: [
    'astrology blog',
    'zodiac guide',
    'mercury retrograde',
    'birth chart guide',
    'moon sign',
    'rising sign',
    'zodiac compatibility',
  ],
  openGraph: {
    title: 'Stellara Blog — Astrology Guides & Cosmic Insights',
    description:
      'In-depth astrology articles covering birth charts, compatibility, transits, and zodiac signs.',
  },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full border border-celestial-400/20 bg-celestial-700/10 px-4 py-1.5 text-xs font-medium tracking-wider text-celestial-200">
            STELLARA BLOG
          </span>
          <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            <span className="gradient-text">Cosmic Insights</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-dust-400">
            Guides, transit forecasts, and deep dives into the astrology that shapes your life.
          </p>
        </div>

        {/* Post Grid */}
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card group block rounded-2xl p-6 transition-all hover:border-celestial-400/25 sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* Emoji hero */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-celestial-700/15 text-2xl">
                  {post.heroEmoji}
                </div>

                <div className="flex-1">
                  {/* Meta */}
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-dust-500">
                    <span className="rounded-full bg-celestial-700/10 px-2.5 py-0.5 text-celestial-300">
                      {post.category}
                    </span>
                    <span>{post.readTime} read</span>
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-celestial-200 sm:text-xl">
                    {post.title}
                  </h2>
                  <p className="line-clamp-2 text-sm leading-relaxed text-dust-400">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
