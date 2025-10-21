'use client';

import { useEffect, useState } from 'react';
import { Eye, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { API } from '@/config/api.config';

interface BlogAnalytics {
  id: string;
  slug: string;
  totalViews: number;
  uniqueViews: number;
  lastViewedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogAnalyticsProps {
  slug: string;
  className?: string;
}

export function BlogAnalytics({ slug, className = '' }: BlogAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(API.blog.analytics(slug));

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
        } else {
          setError(data.error || 'Failed to load analytics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return null; // Silently fail for better UX
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span>{analytics.totalViews.toLocaleString()} views</span>
      </div>
      
      {analytics.uniqueViews !== analytics.totalViews && (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{analytics.uniqueViews.toLocaleString()} unique</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        <span>Last viewed {formatDate(analytics.lastViewedAt)}</span>
      </div>
    </motion.div>
  );
}