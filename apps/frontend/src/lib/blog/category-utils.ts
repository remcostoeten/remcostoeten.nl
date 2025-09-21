import { TBlogPost, TBlogCategory, CategoryData } from './types';

/**
 * Category metadata with descriptions and colors
 */
const CATEGORY_METADATA: Record<TBlogCategory, Omit<CategoryData, 'postCount' | 'slug'>> = {
  'all': {
    name: 'All Posts',
    description: 'Browse all blog posts across all categories and topics.',
    color: 'blue',
  },
  'development': {
    name: 'Development',
    description: 'Technical articles about programming, frameworks, tools, and best practices in software development.',
    color: 'green',
  },
  'design': {
    name: 'Design',
    description: 'UI/UX design principles, visual design trends, and creating better user experiences.',
    color: 'purple',
  },
  'best-practices': {
    name: 'Best Practices',
    description: 'Industry standards, coding conventions, and proven methodologies for better software.',
    color: 'orange',
  },
};

/**
 * Generate category data with post counts from blog posts
 */
export function generateCategoryData(posts: TBlogPost[]): CategoryData[] {
  const categoryMap = new Map<TBlogCategory, number>();
  
  // Count posts per category
  posts.forEach(post => {
    const count = categoryMap.get(post.category) || 0;
    categoryMap.set(post.category, count + 1);
  });

  // Generate category data
  const categories: CategoryData[] = [];
  
  // Add 'all' category with total count
  categories.push({
    ...CATEGORY_METADATA['all'],
    slug: 'all',
    postCount: posts.length,
  });

  // Add other categories with their counts
  Object.entries(CATEGORY_METADATA).forEach(([slug, metadata]) => {
    if (slug !== 'all') {
      const postCount = categoryMap.get(slug as TBlogCategory) || 0;
      if (postCount > 0) { // Only include categories that have posts
        categories.push({
          ...metadata,
          slug,
          postCount,
        });
      }
    }
  });

  return categories;
}

/**
 * Get category data for a specific category
 */
export function getCategoryData(category: TBlogCategory, posts: TBlogPost[]): CategoryData {
  const categoryPosts = category === 'all' ? posts : posts.filter(post => post.category === category);
  
  return {
    ...CATEGORY_METADATA[category],
    slug: category,
    postCount: categoryPosts.length,
  };
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  return CATEGORY_METADATA[category as TBlogCategory]?.name || category;
}

/**
 * Get category description
 */
export function getCategoryDescription(category: string): string {
  return CATEGORY_METADATA[category as TBlogCategory]?.description || '';
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_METADATA[category as TBlogCategory]?.color || 'blue';
}