import { 
  generateCategoryData, 
  getCategoryData, 
  formatCategoryName, 
  getCategoryDescription, 
  getCategoryColor 
} from '../category-utils';
import { TBlogPost, TBlogCategory } from '../types';

const mockPosts: TBlogPost[] = [
  {
    title: 'React Best Practices',
    excerpt: 'Learn the best practices for React development.',
    publishedAt: '2024-01-15',
    readTime: 5,
    tags: ['react', 'javascript'],
    category: 'development',
    slug: 'react-best-practices',
    status: 'published',
    content: 'Content here...',
  },
  {
    title: 'TypeScript Tips',
    excerpt: 'Advanced TypeScript techniques.',
    publishedAt: '2024-01-10',
    readTime: 8,
    tags: ['typescript', 'javascript'],
    category: 'development',
    slug: 'typescript-tips',
    status: 'published',
    content: 'Content here...',
  },
  {
    title: 'UI Design Principles',
    excerpt: 'Fundamental principles of good UI design.',
    publishedAt: '2024-01-05',
    readTime: 6,
    tags: ['ui', 'design'],
    category: 'design',
    slug: 'ui-design-principles',
    status: 'published',
    content: 'Content here...',
  },
  {
    title: 'Code Review Guidelines',
    excerpt: 'How to conduct effective code reviews.',
    publishedAt: '2024-01-01',
    readTime: 7,
    tags: ['code-review', 'team'],
    category: 'best-practices',
    slug: 'code-review-guidelines',
    status: 'published',
    content: 'Content here...',
  },
];

describe('Category Utils', () => {
  describe('generateCategoryData', () => {
    it('generates category data with correct post counts', () => {
      const categories = generateCategoryData(mockPosts);
      
      expect(categories).toHaveLength(4); // all + 3 categories with posts
      
      // Check 'all' category
      const allCategory = categories.find(cat => cat.slug === 'all');
      expect(allCategory).toBeDefined();
      expect(allCategory!.postCount).toBe(4);
      expect(allCategory!.name).toBe('All Posts');
      
      // Check development category
      const devCategory = categories.find(cat => cat.slug === 'development');
      expect(devCategory).toBeDefined();
      expect(devCategory!.postCount).toBe(2);
      expect(devCategory!.name).toBe('Development');
      
      // Check design category
      const designCategory = categories.find(cat => cat.slug === 'design');
      expect(designCategory).toBeDefined();
      expect(designCategory!.postCount).toBe(1);
      expect(designCategory!.name).toBe('Design');
      
      // Check best-practices category
      const bestPracticesCategory = categories.find(cat => cat.slug === 'best-practices');
      expect(bestPracticesCategory).toBeDefined();
      expect(bestPracticesCategory!.postCount).toBe(1);
      expect(bestPracticesCategory!.name).toBe('Best Practices');
    });

    it('excludes categories with no posts', () => {
      const postsWithoutDesign = mockPosts.filter(post => post.category !== 'design');
      const categories = generateCategoryData(postsWithoutDesign);
      
      const designCategory = categories.find(cat => cat.slug === 'design');
      expect(designCategory).toBeUndefined();
    });

    it('handles empty posts array', () => {
      const categories = generateCategoryData([]);
      
      expect(categories).toHaveLength(1); // Only 'all' category
      expect(categories[0].slug).toBe('all');
      expect(categories[0].postCount).toBe(0);
    });

    it('includes category descriptions and colors', () => {
      const categories = generateCategoryData(mockPosts);
      
      const devCategory = categories.find(cat => cat.slug === 'development');
      expect(devCategory!.description).toContain('Technical articles');
      expect(devCategory!.color).toBe('green');
    });
  });

  describe('getCategoryData', () => {
    it('returns correct data for specific category', () => {
      const categoryData = getCategoryData('development', mockPosts);
      
      expect(categoryData.slug).toBe('development');
      expect(categoryData.name).toBe('Development');
      expect(categoryData.postCount).toBe(2);
      expect(categoryData.description).toContain('Technical articles');
      expect(categoryData.color).toBe('green');
    });

    it('returns correct data for "all" category', () => {
      const categoryData = getCategoryData('all', mockPosts);
      
      expect(categoryData.slug).toBe('all');
      expect(categoryData.name).toBe('All Posts');
      expect(categoryData.postCount).toBe(4);
      expect(categoryData.description).toContain('Browse all blog posts');
      expect(categoryData.color).toBe('blue');
    });

    it('handles category with no posts', () => {
      const postsWithoutDesign = mockPosts.filter(post => post.category !== 'design');
      const categoryData = getCategoryData('design', postsWithoutDesign);
      
      expect(categoryData.postCount).toBe(0);
      expect(categoryData.name).toBe('Design');
    });
  });

  describe('formatCategoryName', () => {
    it('formats known category names correctly', () => {
      expect(formatCategoryName('development')).toBe('Development');
      expect(formatCategoryName('design')).toBe('Design');
      expect(formatCategoryName('best-practices')).toBe('Best Practices');
      expect(formatCategoryName('all')).toBe('All Posts');
    });

    it('returns original string for unknown categories', () => {
      expect(formatCategoryName('unknown-category')).toBe('unknown-category');
    });
  });

  describe('getCategoryDescription', () => {
    it('returns correct descriptions for known categories', () => {
      expect(getCategoryDescription('development')).toContain('Technical articles');
      expect(getCategoryDescription('design')).toContain('UI/UX design');
      expect(getCategoryDescription('best-practices')).toContain('Industry standards');
      expect(getCategoryDescription('all')).toContain('Browse all blog posts');
    });

    it('returns empty string for unknown categories', () => {
      expect(getCategoryDescription('unknown-category')).toBe('');
    });
  });

  describe('getCategoryColor', () => {
    it('returns correct colors for known categories', () => {
      expect(getCategoryColor('development')).toBe('green');
      expect(getCategoryColor('design')).toBe('purple');
      expect(getCategoryColor('best-practices')).toBe('orange');
      expect(getCategoryColor('all')).toBe('blue');
    });

    it('returns default color for unknown categories', () => {
      expect(getCategoryColor('unknown-category')).toBe('blue');
    });
  });

  describe('Edge Cases', () => {
    it('handles posts with undefined category', () => {
      const postsWithUndefinedCategory = [
        {
          ...mockPosts[0],
          category: undefined as any,
        },
      ];
      
      // Should not throw an error
      expect(() => generateCategoryData(postsWithUndefinedCategory)).not.toThrow();
    });

    it('handles posts with invalid category', () => {
      const postsWithInvalidCategory = [
        {
          ...mockPosts[0],
          category: 'invalid-category' as TBlogCategory,
        },
      ];
      
      const categories = generateCategoryData(postsWithInvalidCategory);
      
      // Should still include 'all' category
      expect(categories.find(cat => cat.slug === 'all')).toBeDefined();
    });
  });
});