'use client';

import Link from "next/link";
import { BookOpen, Eye, Clock, Calendar } from "lucide-react";
import { useMultipleViewCounts } from "@/hooks/use-multiple-view-counts";

interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  readTime: number;
}

interface BlogSectionClientProps {
  posts: BlogPost[];
}

export function BlogSectionClient({ posts }: BlogSectionClientProps) {
  const slugs = posts.map(post => post.slug);
  const { getFormattedViewCount, loading: viewCountsLoading } = useMultipleViewCounts(slugs);

  return (
    <div className="py-6 border-t border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-medium text-foreground">Latest Thoughts</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group bg-card border border-border/50 rounded-lg p-5 hover:border-accent/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] block"
          >
            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors text-base mb-3 leading-snug">
              {post.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime} min read</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {viewCountsLoading ? '...' : getFormattedViewCount(post.slug)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium group transition-all duration-200 text-sm border border-accent/20 hover:border-accent/40 px-4 py-2 rounded-lg hover:bg-accent/5"
        >
          <span>View all posts</span>
          <span className="transition-transform group-hover:translate-x-1 duration-200">↗</span>
        </Link>
      </div>
    </div>
  );
}
