import { TOCItem } from './toc-utils';
import { BreadcrumbItem } from './breadcrumb-utils';

type TBlogCategorySingle = 'all' | 'development' | 'design' | 'best-practices';
export type TBlogCategory = TBlogCategorySingle | TBlogCategorySingle[];

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

// Enhanced types for blog enhancements
export type TEnhancedBlogPost = TBlogPost & {
  headings?: TOCItem[];
  breadcrumbs?: BreadcrumbItem[];
  relatedTags?: TagData[];
  categoryData?: CategoryData;
};

export type TagData = {
  name: string;
  slug: string;
  postCount: number;
  color?: string;
  description?: string;
  relatedTags?: string[];
};

export type CategoryData = {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  postCount: number;
  subcategories?: CategoryData[];
};

// TOC-related types
export type TOCContextValue = {
  activeId: string | null;
  items: TOCItem[];
  scrollToHeading: (id: string) => void;
};

export type TableOfContentsProps = {
  content?: string;
  headings?: TOCItem[];
  className?: string;
  maxDepth?: number;
};

// Breadcrumb-related types
export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
};
