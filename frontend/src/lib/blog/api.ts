import { TBlogPost, TBlogCategory } from './types';
import { BLOG_CONFIG } from './config';

const API_BASE = BLOG_CONFIG.API_BASE;

export type TBlogMetadataWithAnalytics = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: TBlogCategory;
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

export async function fetchBlogMetadata(): Promise<TBlogMetadataWithAnalytics[]> {
  try {
    const response = await fetch(`${API_BASE}/blog/metadata`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error('Failed to fetch blog metadata');
  } catch (error) {
    console.warn('Backend not available, using fallback mode:', error);
    // Return empty array if backend is not available
    return [];
  }
}

export async function fetchBlogMetadataBySlug(slug: string): Promise<TBlogMetadataWithAnalytics | null> {
  try {
    const response = await fetch(`${API_BASE}/blog/metadata/${slug}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Backend not available for slug fetch:', error);
    return null;
  }
}

export async function incrementBlogView(slug: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/blog/analytics/${slug}/view`, {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Backend not available for view tracking:', error);
    // Silently fail if backend is not available
  }
}

// Convert API data to frontend format
export function convertToBlogPost(metadata: TBlogMetadataWithAnalytics, content: string): TBlogPost {
  return {
    title: metadata.title,
    excerpt: metadata.excerpt,
    publishedAt: metadata.publishedAt,
    readTime: metadata.readTime,
    tags: metadata.tags,
    category: metadata.category,
    slug: metadata.slug,
    status: metadata.status,
    author: metadata.author,
    seo: metadata.seo,
    content,
    views: metadata.analytics ? {
      total: metadata.analytics.totalViews,
      unique: metadata.analytics.uniqueViews,
      recent: metadata.analytics.recentViews,
    } : undefined,
  };
}
