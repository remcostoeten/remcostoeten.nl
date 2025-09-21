import { 
  generateBlogPostBreadcrumbs,
  generateCategoryBreadcrumbs,
  generateTagBreadcrumbs,
  formatCategoryName,
  formatSegmentName 
} from '../breadcrumb-utils';

describe('Breadcrumb Utils', () => {
  describe('generateBlogPostBreadcrumbs', () => {
    it('should generate correct breadcrumbs for blog post', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Getting Started with React',
        'getting-started-react',
        'development'
      );

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(breadcrumbs[1]).toEqual({ label: 'Blog', href: '/posts' });
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Development', 
        href: '/posts?category=development' 
      });
      expect(breadcrumbs[3]).toEqual({ 
        label: 'Getting Started with React', 
        href: '/posts/getting-started-react',
        current: true 
      });
    });

    it('should handle posts without category', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'My Post',
        'my-post'
      );

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'My Post', 
        href: '/posts/my-post',
        current: true 
      });
    });
  });

  describe('generateCategoryBreadcrumbs', () => {
    it('should generate correct breadcrumbs for category', () => {
      const breadcrumbs = generateCategoryBreadcrumbs('development');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Development', 
        href: '/posts?category=development',
        current: true 
      });
    });
  });

  describe('generateTagBreadcrumbs', () => {
    it('should generate correct breadcrumbs for tag', () => {
      const breadcrumbs = generateTagBreadcrumbs('react');

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Tag: react', 
        href: '/tags/react',
        current: true 
      });
    });
  });

  describe('formatCategoryName', () => {
    it('should format category names correctly', () => {
      expect(formatCategoryName('development')).toBe('Development');
      expect(formatCategoryName('best-practices')).toBe('Best Practices');
      expect(formatCategoryName('web-development')).toBe('Web Development');
    });
  });

  describe('formatSegmentName', () => {
    it('should format URL segments correctly', () => {
      expect(formatSegmentName('posts')).toBe('Blog');
      expect(formatSegmentName('tags')).toBe('Tags');
      expect(formatSegmentName('my-awesome-post')).toBe('My Awesome Post');
    });
  });
});