import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/data/blog-posts';

/* ----------------------------------------------------------------
   Static params — pre-render all blog posts at build time
   ---------------------------------------------------------------- */

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

/* ----------------------------------------------------------------
   Dynamic metadata per post
   ---------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Stellara'],
    },
  };
}

/* ----------------------------------------------------------------
   Page component
   ---------------------------------------------------------------- */

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Post not found</h1>
          <Link href="/blog" className="text-celestial-300 hover:underline">
            Back to blog
          </Link>
        </div>
      </main>
    );
  }

  /* Article structured data for AEO */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Stellara',
      url: 'https://stellara.co',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stellara',
      url: 'https://stellara.co',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://stellara.co/blog/${post.slug}`,
    },
  };

  return (
    <main className="relative min-h-screen pb-24 pt-16 sm:pt-24">
      {/* Article schema for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-dust-500">
          <Link href="/" className="hover:text-celestial-300">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-celestial-300">Blog</Link>
          <span>/</span>
          <span className="text-dust-400">{post.title.length > 40 ? post.title.slice(0, 40) + '...' : post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-dust-500">
            <span className="rounded-full bg-celestial-700/10 px-2.5 py-0.5 text-celestial-300">
              {post.category}
            </span>
            <span>{post.readTime} read</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-dust-400">
            {post.excerpt}
          </p>
        </header>

        {/* Body */}
        <div className="space-y-6">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-dust-300">
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-celestial-500/10 bg-gradient-to-r from-space-900/80 via-celestial-900/20 to-space-900/80 p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-foreground">
            Ready to explore your chart?
          </p>
          <p className="mb-5 text-sm text-dust-400">
            Generate your free birth chart and discover your Big Three in seconds.
          </p>
          <Link
            href="/birth-chart"
            className="btn-glow inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
          >
            Get Your Free Birth Chart
          </Link>
        </div>

        {/* Nav */}
        <div className="mt-10 border-t border-celestial-500/10 pt-8">
          <Link
            href="/blog"
            className="text-sm text-dust-400 transition-colors hover:text-celestial-300"
          >
            &larr; Back to all articles
          </Link>
        </div>
      </article>
    </main>
  );
}
