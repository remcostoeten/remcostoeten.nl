'use client';

import Link from "next/link";
import { BookOpen, ArrowRight, Eye } from "lucide-react";
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
      <div className="flex items-center gap-3 mb-3">
        <BookOpen className="w-4 h-4 text-accent" />
        <h2 className="text-heading font-medium text-foreground">Latest Thoughts</h2>
      </div>
      
      <div className="space-y-2 mb-4">
        {posts.map((post) => (
          <div 
            key={post.slug} 
            className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-all duration-200"
          >
            <Link 
              href={`/posts/${post.slug}`}
              className="text-xs text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 duration-200 inline-flex items-center gap-2"
            >
              <span className="transition-transform group-hover:translate-x-1">→</span>
              {post.title}
            </Link>
            <div className="text-xs text-muted-foreground/70 flex items-center gap-2 group-hover:text-muted-foreground transition-colors">
              <span>{post.readTime} min read</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>
                  {viewCountsLoading ? '...' : getFormattedViewCount(post.slug)}
                </span>
              </div>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div>
        <Link 
          href="/posts"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium group"
        >
          <span>View all posts</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
