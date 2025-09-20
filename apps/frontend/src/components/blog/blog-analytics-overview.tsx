'use client';

import { useEffect, useState } from 'react';
import { Eye, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogMetadataWithAnalytics {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  tags: string[];
  analytics?: {
    id: string;
    slug: string;
    totalViews: number;
    uniqueViews: number;
    lastViewedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface BlogAnalyticsOverviewProps {
  className?: string;
}

export function BlogAnalyticsOverview({ className = '' }: BlogAnalyticsOverviewProps) {
  const [blogs, setBlogs] = useState<BlogMetadataWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogAnalytics = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001/api';
        const response = await fetch(`${API_BASE}/blog/metadata`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog analytics');
        }
        
        const data = await response.json();
        if (data.success) {
          setBlogs(data.data);
        } else {
          setError(data.message || 'Failed to load blog analytics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedBlogs = blogs.sort((a, b) => {
    const aViews = a.analytics?.totalViews || 0;
    const bViews = b.analytics?.totalViews || 0;
    return bViews - aViews;
  });

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 mb-3">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">Failed to load blog analytics: {error}</p>
      </div>
    );
  }

  const totalViews = blogs.reduce((sum, blog) => sum + (blog.analytics?.totalViews || 0), 0);
  const totalUniqueViews = blogs.reduce((sum, blog) => sum + (blog.analytics?.uniqueViews || 0), 0);
  const blogsWithViews = blogs.filter(blog => blog.analytics && blog.analytics.totalViews > 0);

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Blog Analytics Overview</h2>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{totalViews.toLocaleString()} total views</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{totalUniqueViews.toLocaleString()} unique views</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{blogsWithViews.length} posts with views</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedBlogs.map((blog, index) => (
          <motion.div
            key={blog.slug}
            className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Link 
                  href={`/posts/${blog.slug}`}
                  className="text-lg font-semibold text-foreground hover:text-accent transition-colors inline-flex items-center gap-2"
                >
                  {blog.title}
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{blog.analytics?.totalViews?.toLocaleString() || 0} views</span>
                </div>
                
                {blog.analytics && blog.analytics.uniqueViews !== blog.analytics.totalViews && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{blog.analytics.uniqueViews.toLocaleString()} unique</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Published {formatDate(blog.publishedAt)}</span>
                </div>
                
                {blog.analytics?.lastViewedAt && (
                  <div className="text-xs text-muted-foreground">
                    Last viewed {formatDate(blog.analytics.lastViewedAt)}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded border border-accent/20">
                  {blog.category}
                </span>
                {blog.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {blog.tags.length > 2 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                    +{blog.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No blog posts found.</p>
        </div>
      )}
    </div>
  );
}