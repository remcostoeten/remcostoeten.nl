'use client';

import Link from "next/link";
import { BookOpen, Eye, Clock, Calendar, ArrowUpRight, Sparkles } from "lucide-react";
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
    <section className="py-12 border-t border-border/30">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Writing</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Latest Thoughts</h2>
        <p className="text-sm text-muted-foreground mt-1">Exploring ideas through words</p>
      </div>

      <div className="space-y-6 mb-8">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group relative block"
          >
            <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <article className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <span className="text-4xl font-bold text-muted-foreground/20 leading-none mt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </time>
                      </div>
                      <span className="text-muted-foreground/30">·</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>{post.readTime} min</span>
                      </div>
                      <span className="text-muted-foreground/30">·</span>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 opacity-60" />
                        <span>
                          {viewCountsLoading ? '...' : getFormattedViewCount(post.slug)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-auto sm:ml-0">
                <div className="w-10 h-10 rounded-full bg-muted/50 group-hover:bg-accent/20 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
                </div>
              </div>
            </article>
            
            {index < posts.length - 1 && (
              <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href="/posts"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          <span className="relative">
            View all posts
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{posts.length} recent articles</span>
        </div>
      </div>
    </section>
  );
}
