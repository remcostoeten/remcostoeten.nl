'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, Clock, Calendar } from 'lucide-react';
import { formatBlogDateShort } from '@/lib/blog/date-utils';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  category: string;
  readTime: number;
}

interface BlogAnalytics {
  totalViews: number;
  uniqueViews: number;
}

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogPostCard({ post, index = 0 }: BlogPostCardProps) {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001/api';
        const response = await fetch(`${API_BASE}/blog/analytics/${post.slug}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAnalytics({
              totalViews: data.data.totalViews,
              uniqueViews: data.data.uniqueViews
            });
          }
        }
      } catch (error) {
        // Silently fail - analytics are not critical
      }
    };

    fetchAnalytics();
  }, [post.slug]);

  return (
    <motion.div
      className="group border border-border rounded-xl p-6 sm:p-8 hover:bg-muted/30 hover:border-accent/50 transition-all duration-200 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/posts/${post.slug}`} className="h-full flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
          <p className="text-muted-foreground mb-6 line-clamp-3 text-base sm:text-lg leading-relaxed">
            {post.excerpt}
          </p>
        </div>
        
        <div className="mt-auto space-y-4">
          {/* Meta information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{post.readTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{formatBlogDateShort(post.publishedAt)}</span>
              </div>
            </div>
            {analytics && analytics.totalViews > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{analytics.totalViews.toLocaleString()} views</span>
              </div>
            )}
          </div>
          
          {/* Tags and Category */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <span className="px-3 py-2 bg-accent/10 text-accent text-sm rounded-lg border border-accent/20 font-medium">
              {post.category}
            </span>
            {/* Show 1 tag on mobile, 2 on desktop */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {post.tags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg sm:inline font-medium"
                >
                  {tag}
                </span>
              ))}
              {post.tags.slice(1, 2).map((tag) => (
                <span
                  key={tag}
                  className="hidden sm:inline px-3 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
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
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}