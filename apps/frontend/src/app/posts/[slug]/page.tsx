import { notFound } from 'next/navigation';
import { Metadata } from "next";
import { buildSeo } from "@/lib/seo";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog/filesystem-utils";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/mdx-components-server';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { ViewCounter } from '@/components/blog/ViewCounter';
import { parseHeadingsFromMDX } from '@/lib/blog/toc-utils';
import { BreadcrumbNavigation } from '@/components/blog/breadcrumb-navigation';
import { generateBlogPostBreadcrumbs } from '@/lib/blog/breadcrumb-utils';
import { TOCLayoutRedesign } from '@/components/blog/toc-layout-redesign';
import { FeedbackWidget } from '@/components/blog/feedback';

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
      <div className="max-w-7xl mx-auto py-8 px-4">
        <BreadcrumbNavigation items={breadcrumbs} className="mb-8" />

        <noscript>
          <Link
            href="/posts"
            className="inline-flex items-center text-accent hover:underline text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Link>
        </noscript>

        <TOCLayoutRedesign
          headings={headings}
          className="w-full max-w-6xl mx-auto"
          contentClassName="max-w-4xl"
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
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="flex items-center mr-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{post.readTime} min read</span>
                </div>
                <ViewCounter
                  slug={params.slug}
                  autoIncrement={true}
                  className="flex items-center text-sm text-muted-foreground"
                />
              </div>

              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>

              <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

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
              <MDXRemote source={content} components={mdxComponents} />
            </div>
          </article>
        </TOCLayoutRedesign>

        {/* Feedback Widget */}
        <FeedbackWidget slug={params.slug} />

        {relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-2xl font-semibold mb-4">Related posts</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((rp) => (
                <li key={rp.slug}>
                  <Link href={`/posts/${rp.slug}`} className="text-accent hover:underline">
                    {rp.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{rp.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
