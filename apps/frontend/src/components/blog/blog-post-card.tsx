'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Calendar, Eye } from "lucide-react";
import { formatBlogDateShort } from "@/lib/blog/date-utils";
import { getPrimaryCategory, getSecondaryCategoriesForDisplay } from "@/lib/utils/category-display";
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: string | string[];
  readTime: number;
}

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
  variant?: 'default' | 'featured' | 'hero';
  viewCount?: number;
  showViewCount?: boolean;
  showExcerpt?: boolean;
}

export function BlogPostCard({
  post,
  index = 0,
  variant = 'default',
  viewCount = 0,
  showViewCount = true,
  showExcerpt = true
}: BlogPostCardProps) {
  const postUrl = `/posts/${post.slug}`;

  const isFeatured = variant === 'featured';
  const isHero = variant === 'hero';

  return (
    <motion.div
      className={`group border border-border rounded-2xl hover:bg-muted/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 h-full flex flex-col bg-card/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${isHero
        ? 'p-6 sm:p-8 shadow-lg'
        : isFeatured
          ? 'p-8 lg:p-10'
          : 'p-6 sm:p-8'
        }`}
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      role="listitem"
    >
      <Link
        href={postUrl}
        className="h-full flex flex-col outline-none"
        aria-label={`Read ${post.title}`}>
        <div className="flex-1">
          <h3 className={`font-semibold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight ${isHero
            ? 'text-xl sm:text-2xl mb-4'
            : isFeatured
              ? 'text-2xl lg:text-3xl mb-4'
              : 'text-xl'
            }`}>
            {post.title}
          </h3>
          {showExcerpt && (
            <p className={`text-muted-foreground mb-6 leading-relaxed ${isHero
              ? 'text-base line-clamp-4 mb-6'
              : isFeatured
                ? 'text-lg line-clamp-4 mb-8'
                : 'text-base line-clamp-3'
              }`}>
              {post.excerpt}
            </p>
          )}
        </div>

        <div className={`mt-auto ${isHero ? 'space-y-5' : isFeatured ? 'space-y-6' : 'space-y-4'}`}>
          {/* Meta information */}
          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-muted-foreground ${isHero ? 'text-sm' : isFeatured ? 'text-base' : 'text-sm'
            }`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className={`${isHero ? 'w-4 h-4' : isFeatured ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span className="font-medium">{post.readTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={`${isHero ? 'w-4 h-4' : isFeatured ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span className="font-medium">{formatBlogDateShort(post.publishedAt)}</span>
              </div>
            </div>
            {showViewCount && viewCount > 0 && (
              <div className="flex items-center gap-2">
                <Eye className={`${isHero ? 'w-4 h-4' : isFeatured ? 'w-5 h-5' : 'w-4 h-4'}`} />
                <span className="font-medium">{viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className={`bg-accent/10 text-accent rounded-lg border border-accent/20 font-medium ${isFeatured
              ? 'px-4 py-3 text-base'
              : 'px-3 py-2 text-sm'
              }`}>
              {getPrimaryCategory(post.category)}
            </span>
            {/* Secondary categories */}
            {getSecondaryCategoriesForDisplay(post.category).map((category) => (
              <span
                key={category}
                className={`bg-accent/5 text-accent/80 rounded-lg border border-accent/10 font-medium ${isFeatured
                  ? 'px-4 py-3 text-base'
                  : 'px-3 py-2 text-sm'
                  }`}
              >
                {category}
              </span>
            ))}
            {/* Show more tags for featured posts */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {post.tags.slice(0, isFeatured ? 2 : 1).map((tag) => (
                <span
                  key={tag}
                  className={`bg-secondary text-secondary-foreground rounded-lg font-medium ${isFeatured
                    ? 'px-4 py-3 text-base'
                    : 'px-3 py-2 text-sm'
                    } sm:inline`}
                >
                  {tag}
                </span>
              ))}
              {!isFeatured && post.tags.slice(1, 2).map((tag) => (
                <span
                  key={tag}
                  className="hidden sm:inline px-3 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
              {isFeatured && post.tags.slice(2, 4).map((tag) => (
                <span
                  key={tag}
                  className="hidden lg:inline px-4 py-3 bg-secondary text-secondary-foreground text-base rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
              {/* Tags counter - different logic for featured vs regular */}
              {isFeatured ? (
                post.tags.length > 4 && (
                  <span className="px-4 py-3 bg-muted text-muted-foreground text-base rounded-lg font-medium">
                    <span className="lg:hidden">+{post.tags.length - 2}</span>
                    <span className="hidden lg:inline">+{post.tags.length - 4}</span>
                  </span>
                )
              ) : (
                <>
                  {post.tags.length > 2 && (
                    <span className="px-3 py-2 bg-muted text-muted-foreground text-sm rounded-lg font-medium">
                      <span className="sm:hidden">+{post.tags.length - 1}</span>
                      <span className="hidden sm:inline">+{post.tags.length - 2}</span>
                    </span>
                  )}
                  {post.tags.length === 2 && (
                    <span className="sm:hidden px-3 py-2 bg-muted text-muted-foreground text-sm rounded-lg font-medium">
                      +1
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}