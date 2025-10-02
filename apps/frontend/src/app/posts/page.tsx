import Link from "next/link";
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog/filesystem-utils";
import { BlogPostsClient } from "./blog-posts-client";
import { BreadcrumbNavigation } from "@/components/blog/breadcrumb-navigation";
import { BreadcrumbItem } from "@/lib/blog/breadcrumb-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Your Portfolio",
    description: "Thoughts on frontend development, design, and building better web experiences.",
  };
}

export default async function PostsPage() {
  const allPosts = getAllBlogPosts();

  // Generate breadcrumbs for blog listing page
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/posts', current: true },
  ];

  return (
    <>
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