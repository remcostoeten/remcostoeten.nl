import { TBlogPost, TBlogCategory } from './types';
import { API } from '@/config/api.config';

export type TBlogMetadata = {
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
};

export async function fetchBlogMetadata(): Promise<TBlogMetadata[]> {
  try {
    const response = await fetch(API.blog.metadata(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error('Failed to fetch blog metadata');
  } catch (error) {
    console.warn('Blog metadata API not available, using fallback mode:', error);
    // Return empty array if backend is not available
    return [];
  }
}

export async function fetchBlogMetadataBySlug(slug: string): Promise<TBlogMetadata | null> {
  try {
    const response = await fetch(API.blog.metadataBySlug(slug), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.warn('Blog metadata API not available for slug fetch:', error);
    return null;
  }
}

// Convert API data to frontend format
export function convertToBlogPost(metadata: TBlogMetadata, content: string): TBlogPost {
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
  };
}
