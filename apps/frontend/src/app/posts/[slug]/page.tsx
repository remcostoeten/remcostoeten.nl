import { notFound } from 'next/navigation';
import { Metadata } from "next";
import { buildSeo } from "@/lib/seo";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog/filesystem-utils";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { mdxComponents } from '@/components/mdx/mdx-components-server';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { parseHeadingsFromMDX } from '@/lib/blog/toc-utils';
import { BreadcrumbNavigation } from '@/components/blog/breadcrumb-navigation';
import { generateBlogPostBreadcrumbs } from '@/lib/blog/breadcrumb-utils';
import { TOCLayoutRedesign } from '@/components/blog/toc-layout-redesign';
import { FixedFeedbackWidget } from "@/components/blog/fixed-feedback-widget";
import { ScrollProgressIndicator } from '@/components/blog/scroll-progress-indicator';
import { ZenModeToggle } from '@/components/blog/zen-mode-toggle';

// Force dynamic rendering to avoid React version conflicts during static generation
export const dynamic = 'force-dynamic'

type TPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: TPostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const canonicalUrl = `https://remcostoeten.nl/posts/${params.slug}`;

  return {
    title: post.seo?.title || `${post.title} | Remco Stoeten`,
    description: post.seo?.description || post.excerpt,
    keywords: post.seo?.keywords || post.tags,
    authors: [{ name: post.author || 'Remco Stoeten' }],
    creator: post.author || 'Remco Stoeten',
    publisher: 'Remco Stoeten',
    alternates: {
      canonical: canonicalUrl,
    },
    ...buildSeo({
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      url: canonicalUrl,
      image: post.seo?.image || post.ogImage || 'https://remcostoeten.nl/og-image.png',
    }),
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PostPage(props: TPostPageProps) {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');

  const filePath = path.join(process.cwd(), 'content/blog', `${params.slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContent);

  // Serialize MDX content to avoid React version conflicts
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [require('remark-gfm')],
      rehypePlugins: [require('rehype-highlight')],
    },
  });

  const headings = parseHeadingsFromMDX(content, 3);

  const breadcrumbs = generateBlogPostBreadcrumbs(
    post.title,
    params.slug,
    post.category
  );

  const relatedPosts = getAllBlogPosts()
    .filter((p) => p.slug !== params.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: 'https://remcostoeten.nl/og-image.png',
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author || 'Remco Stoeten',
      url: 'https://remcostoeten.nl',
    },
    publisher: {
      '@type': 'Person',
      name: 'Remco Stoeten',
      url: 'https://remcostoeten.nl',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://remcostoeten.nl/posts/${params.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: content?.split(/\s+/).length || 0,
    timeRequired: `PT${post.readTime}M`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://remcostoeten.nl' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://remcostoeten.nl/posts' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://remcostoeten.nl/posts/${params.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ScrollProgressIndicator />
      <ZenModeToggle enableAdvancedTransitions={true} />

      <div className="max-w-7xl mx-auto py-8 px-5 sm:px-6">
        <BreadcrumbNavigation items={breadcrumbs} className="mb-8 zen-mode:hidden" />

        <noscript>
          <Link
            href="/posts"
            className="inline-flex items-center text-accent hover:underline text-sm mb-8 zen-mode:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Link>
        </noscript>

        <TOCLayoutRedesign
          headings={headings}
          className="w-full zen-mode:hidden"
          contentClassName=""
        >
          <article
            itemScope
            itemType="https://schema.org/BlogPosting"
            className="font-noto"
          >
            <header itemProp="headline">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <div className="flex items-center mr-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  <time dateTime={post.publishedAt} className="flex items-center gap-0.5">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center mr-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="flex items-center gap-0.5">
                    {post.readTime} min read
                  </span>
                </div>
                </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>

              <div className="sr-only" itemProp="description">
                {post.excerpt}
              </div>

              <div className="flex flex-wrap">
                <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded border border-accent/20 mr-2 mb-2">
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="prose prose-invert max-w-none">
              <MDXRemote source={mdxSource} components={mdxComponents} />
            </div>
          </article>
        </TOCLayoutRedesign>

        {/* Zen Mode Article Content - Centered & Readable */}
        <div className="zen-mode:block hidden zen-content-centered">
          <article
            itemScope
            itemType="https://schema.org/BlogPosting"
            className="font-noto"
          >
            <header itemProp="headline" className="mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground/80 mb-8 pb-8 border-b border-border/30">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>

              {/* SEO excerpt - visually hidden but accessible to search engines */}
              <div className="sr-only" itemProp="description">
                {post.excerpt}
              </div>
            </header>

            <div className="prose prose-invert prose-lg max-w-none">
              <MDXRemote source={mdxSource} components={mdxComponents} />
            </div>
          </article>
        </div>


        {relatedPosts.length > 0 && (
          <div className="mt-20 border-t border-border pt-16 zen-mode:hidden">
            <h2 className="text-3xl font-bold mb-12 text-foreground">Related posts</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/posts/${rp.slug}`}
                  className="group block p-8 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded border border-accent/20">
                        {rp.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {rp.readTime} min
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-3 line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-grow mb-5">
                      {rp.excerpt}
                    </p>
                    <div className="mt-auto flex items-center text-sm text-accent group-hover:translate-x-1 transition-transform">
                      Read more
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <FixedFeedbackWidget slug={params.slug} />
    </>
  );
}
