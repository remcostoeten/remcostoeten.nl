import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog/filesystem-utils";
import { BlogPostsClient } from "./blog-posts-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Your Portfolio",
    description: "Thoughts on frontend development, design, and building better web experiences.",
  };
}

export default async function PostsPage() {
  const allPosts = getAllBlogPosts();

  return (
    <PageLayout>
      <div className="py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">
        <div className="space-y-6 sm:space-y-8">
          <Link
            href="/"
            className="text-accent hover:underline text-sm mb-6 inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to home
          </Link>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Blog
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed">
              Thoughts on frontend development, design, and building better web experiences. 
              Explore articles by category, tags, or search for specific topics.
            </p>
          </div>
        </div>

        <BlogPostsClient allPosts={allPosts} />
      </div>
    </PageLayout>
  );
}