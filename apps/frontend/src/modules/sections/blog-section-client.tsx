'use client';

import Link from "next/link";
import { BookOpen, Eye, Clock, Calendar, ArrowUpRight, Sparkles } from "lucide-react";
import { useMultipleViewCounts } from "@/hooks/use-multiple-view-counts";
import { Suspense, useMemo } from "react";

type TBlogPost = {
  slug: string;
  title: string;
  publishedAt: string;
  readTime: number;
};

type TBlogSectionClientProps = {
  posts: TBlogPost[];
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MetaItem({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 opacity-60" />
      <span>{children}</span>
    </div>
  );
}

function ViewCount({ slug }: { slug: string }) {
  const { getFormattedViewCount, loading } = useMultipleViewCounts([slug]);
  return <span>{loading ? '...' : getFormattedViewCount(slug)}</span>;
}

export function BlogSectionClient({ posts }: TBlogSectionClientProps) {
  return (
    <section className="py-12 border-t border-border/30" aria-labelledby="blog-heading">
      <header className="mb-8">
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span id="blog-heading" className="text-xs font-medium uppercase tracking-wider">
            Writing
          </span>
        </div>
      </header>

      <div className="space-y-6 mb-8">
        {posts.map((post, index) => {
          const formattedDate = useMemo(() => formatDate(post.publishedAt), [post.publishedAt]);

          return (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className={`group relative block ${index < posts.length - 1 ? 'after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border/50 after:to-transparent' : ''}`}
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
                        <MetaItem icon={Calendar}>
                          <time dateTime={post.publishedAt}>{formattedDate}</time>
                        </MetaItem>

                        <span className="text-muted-foreground/30">·</span>

                        <MetaItem icon={Clock}>{post.readTime} min</MetaItem>

                        <span className="text-muted-foreground/30">·</span>

                        <MetaItem icon={Eye}>
                          <Suspense fallback={<span>...</span>}>
                            <ViewCount slug={post.slug} />
                          </Suspense>
                        </MetaItem>
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

              {/* divider now handled by the Link pseudo-element */}
            </Link>
          );
        })}
      </div>

      <footer className="flex items-center justify-between pt-4">
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
      </footer>
    </section>
  );
}
