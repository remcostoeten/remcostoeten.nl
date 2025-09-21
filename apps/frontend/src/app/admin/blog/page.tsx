'use client';

import React, { useState, useEffect } from 'react';

declare module 'react' {
  interface ReactElement {
    children?: React.ReactNode;
  }
}
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ANIMATION_CONFIGS } from '@/modules/shared';
import { fetchBlogMetadata, incrementBlogView } from '@/lib/blog/api';

type TBlogMetadataWithAnalytics = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: string;
  status: 'published' | 'draft';
  author?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
  analytics?: {
    id: string;
    slug: string;
    totalViews: number;
    uniqueViews: number;
    recentViews: number;
    lastViewedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<TBlogMetadataWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogMetadata();
      setPosts(data);
    } catch (err) {
      setError('Failed to load blog posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-secondary rounded w-2/3"></div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-6 bg-card animate-pulse">
                <div className="h-6 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-secondary rounded w-16"></div>
                  <div className="h-6 bg-secondary rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <motion.div {...ANIMATION_CONFIGS.fadeInUp}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Blog Admin</h1>
              <p className="text-muted-foreground">
                Manage your blog posts and view analytics
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        </motion.div>

        {error && (
          <motion.div {...ANIMATION_CONFIGS.fadeInUp}>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              {...ANIMATION_CONFIGS.staggered(index * 0.1)}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Published: {formatDate(post.publishedAt)}</span>
                        <span>•</span>
                        <span>{post.readTime} min read</span>
                        <span>•</span>
                        <span>Category: {post.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {post.analytics && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {post.analytics.totalViews}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {post.analytics.uniqueViews}
                        </div>
                        <div className="text-sm text-muted-foreground">Unique Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {post.analytics.recentViews}
                        </div>
                        <div className="text-sm text-muted-foreground">Recent Views</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Slug: <code className="bg-secondary px-2 py-1 rounded text-xs">{post.slug}</code>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          View Post
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <motion.div {...ANIMATION_CONFIGS.fadeInUp}>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">No blog posts found</p>
                <p className="text-sm text-muted-foreground">
                  Create MDX files in the content/blog directory and sync them with the backend.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}
