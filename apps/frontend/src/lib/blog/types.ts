export type TBlogCategory = 'all' | 'development' | 'design' | 'best-practices';

export type TBlogMetadata = {
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  category: TBlogCategory;
  slug: string;
  status: 'published' | 'draft';
  author?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

export type TBlogPost = TBlogMetadata & {
  content: string;
  views?: {
    total: number;
    unique: number;
    recent: number;
  };
};

export type TBlogPostWithContent = TBlogPost & {
  mdxSource: any;
};
