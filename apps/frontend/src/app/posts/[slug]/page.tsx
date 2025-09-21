import { notFound } from 'next/navigation';
import { PageLayout } from "@/components/layout/PageLayout";
import { Metadata } from "next";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog/filesystem-utils";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/mdx-components';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { BlogPostClient } from './BlogPostClient';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';
import { BlogAnalytics } from '@/components/blog/blog-analytics';
import { ViewCounter } from '@/components/blog/ViewCounter';

interface PostPageProps {
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

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.seo?.title || `${post.title} | Your Portfolio`,
    description: post.seo?.description || post.excerpt,
    keywords: post.seo?.keywords || post.tags,
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt,
    },
  };
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Get the content from the MDX file
  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');

  const filePath = path.join(process.cwd(), 'content/blog', `${params.slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContent);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/posts"
        className="inline-flex items-center gap-2 text-accent hover:underline text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readTime} min read</span>
          </div>
          <ViewCounter 
            slug={params.slug} 
            autoIncrement={true}
            className="flex items-center gap-1 text-sm text-muted-foreground"
          />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
        
        <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded border border-accent/20">
            {post.category}
          </span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </div>
  );
}