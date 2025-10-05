import Link from "next/link";
import { Metadata } from "next";
import { buildSeo } from "@/lib/seo";
import { getAllBlogPosts } from "@/lib/blog/filesystem-utils";
import { BlogPostsClient } from "./blog-posts-client";
import { BreadcrumbNavigation } from "@/components/blog/breadcrumb-navigation";
import { BreadcrumbItem } from "@/lib/blog/breadcrumb-utils";

// Force dynamic rendering to prevent SSR issues with client components
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Remco Stoeten",
    description: "Articles on frontend engineering, React, Next.js, TypeScript, and building scalable UX.",
    alternates: {
      canonical: "https://remcostoeten.nl/posts",
    },
    ...buildSeo({
      title: "Blog | Remco Stoeten",
      description: "Articles on frontend engineering, React, Next.js, TypeScript, and building scalable UX.",
      url: "https://remcostoeten.nl/posts",
    }),
  };
}

export default async function PostsPage() {
  const allPosts = getAllBlogPosts();

  // Generate breadcrumbs for blog listing page
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/posts', current: true },
  ];

  const siteUrl = 'https://remcostoeten.nl';

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Remco Stoeten Blog',
    url: `${siteUrl}/posts`,
    description: 'Articles on frontend engineering, React, Next.js, TypeScript, and scalable UX.',
    publisher: {
      '@type': 'Person',
      name: 'Remco Stoeten',
      url: siteUrl,
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/posts/${post.slug}`,
      name: post.title,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/posts`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Header section - stays in container */}
      <div className="space-y-10">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation
          items={breadcrumbs}
          className="mb-6"
        />

        {/* Fallback "Back to home" link for users without JavaScript */}
        <noscript>
          <Link
            href="/"
            className="text-accent hover:underline text-sm mb-6 inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to home
          </Link>
        </noscript>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Blog
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Thoughts on frontend development, design, and building better web experiences.
            Explore articles by category, tags, or search for specific topics.
          </p>
        </div>
      </div>

      {/* Break out of container for the blog content */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mt-12">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <BlogPostsClient allPosts={allPosts} />
          </div>
        </div>
      </div>
    </>
  );
}