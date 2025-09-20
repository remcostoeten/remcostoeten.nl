export type TBlogCategory = 'development' | 'design' | 'best-practices';

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

export type TBlogAnalytics = {
  id: string;
  slug: string;
  totalViews: number;
  uniqueViews: number;
  recentViews: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TCreateBlogMetadataData = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: TBlogCategory;
  status?: 'published' | 'draft';
  author?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

export type TUpdateBlogMetadataData = Partial<TCreateBlogMetadataData>;

export type TBlogMetadataFilters = {
  category?: TBlogCategory;
  status?: 'published' | 'draft';
  tags?: string[];
  limit?: number;
  offset?: number;
};

export type TBlogMetadataWithAnalytics = TBlogMetadata & {
  analytics?: TBlogAnalytics;
};
