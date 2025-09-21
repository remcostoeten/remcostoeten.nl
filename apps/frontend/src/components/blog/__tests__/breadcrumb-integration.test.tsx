import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BreadcrumbNavigation } from '../breadcrumb-navigation';
import { generateBlogPostBreadcrumbs } from '@/lib/blog/breadcrumb-utils';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  }
}));

describe('Breadcrumb Integration', () => {
  describe('Blog Post Page Integration', () => {
    it('renders breadcrumbs correctly for blog post with category', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Getting Started with React',
        'getting-started-react',
        'development'
      );

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      // Check that all breadcrumb items are rendered
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/posts');
      expect(screen.getByRole('link', { name: 'Development' })).toHaveAttribute(
        'href', 
        '/posts?category=development'
      );
      
      // Current page should not be a link
      const currentPage = screen.getByText('Getting Started with React');
      expect(currentPage).not.toHaveAttribute('href');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('renders breadcrumbs correctly for blog post without category', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'My Awesome Post',
        'my-awesome-post'
      );

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      // Should have Home -> Blog -> Post (no category)
      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
      expect(screen.getByText('My Awesome Post')).toBeInTheDocument();
      
      // Should not have any category link
      expect(screen.queryByText('Development')).not.toBeInTheDocument();
      expect(screen.queryByText('Design')).not.toBeInTheDocument();
    });

    it('includes structured data for SEO', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'SEO Best Practices',
        'seo-best-practices',
        'best-practices'
      );

      const { container } = render(
        <BreadcrumbNavigation items={breadcrumbs} includeStructuredData={true} />
      );

      const structuredDataScript = container.querySelector('script[type="application/ld+json"]');
      expect(structuredDataScript).toBeInTheDocument();

      const structuredData = JSON.parse(structuredDataScript?.textContent || '{}');
      expect(structuredData['@type']).toBe('BreadcrumbList');
      expect(structuredData.itemListElement).toHaveLength(4);
      
      // Check specific breadcrumb items
      expect(structuredData.itemListElement[0]).toMatchObject({
        '@type': 'ListItem',
        position: 1,
        name: 'Home'
      });
      
      expect(structuredData.itemListElement[3]).toMatchObject({
        '@type': 'ListItem',
        position: 4,
        name: 'SEO Best Practices'
      });
    });
  });

  describe('Blog Listing Page Integration', () => {
    it('renders breadcrumbs correctly for blog listing page', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/posts', current: true },
      ];

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      
      const currentPage = screen.getByText('Blog');
      expect(currentPage).not.toHaveAttribute('href');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Responsive Design Tips',
        'responsive-design-tips',
        'design'
      );

      const { container } = render(
        <BreadcrumbNavigation items={breadcrumbs} className="custom-responsive-class" />
      );

      const breadcrumbNav = container.querySelector('nav');
      expect(breadcrumbNav).toHaveClass('custom-responsive-class');
    });

    it('handles long breadcrumb labels gracefully', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'This is a Very Long Blog Post Title That Should Handle Responsive Design Gracefully',
        'very-long-blog-post-title',
        'development'
      );

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      const longTitle = screen.getByText(
        'This is a Very Long Blog Post Title That Should Handle Responsive Design Gracefully'
      );
      expect(longTitle).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and navigation structure', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Accessibility Guide',
        'accessibility-guide',
        'best-practices'
      );

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      const navigation = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(navigation).toBeInTheDocument();

      const list = navigation.querySelector('ol');
      expect(list).toBeInTheDocument();

      // Check that current page has proper aria-current
      const currentPage = screen.getByText('Accessibility Guide');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });

    it('provides proper link context for screen readers', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Screen Reader Testing',
        'screen-reader-testing',
        'accessibility'
      );

      render(<BreadcrumbNavigation items={breadcrumbs} />);

      // All links should be properly labeled
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const blogLink = screen.getByRole('link', { name: 'Blog' });
      const categoryLink = screen.getByRole('link', { name: 'Accessibility' });

      expect(homeLink).toBeInTheDocument();
      expect(blogLink).toBeInTheDocument();
      expect(categoryLink).toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy', () => {
    it('applies correct spacing classes', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Visual Design',
        'visual-design',
        'design'
      );

      const { container } = render(<BreadcrumbNavigation items={breadcrumbs} />);

      const breadcrumbNav = container.querySelector('nav');
      expect(breadcrumbNav).toHaveClass('mb-6');
    });

    it('handles custom separator correctly', () => {
      const breadcrumbs = generateBlogPostBreadcrumbs(
        'Custom Separator Test',
        'custom-separator-test',
        'development'
      );

      const customSeparator = <span data-testid="arrow-separator">→</span>;

      render(
        <BreadcrumbNavigation 
          items={breadcrumbs} 
          separator={customSeparator}
        />
      );

      const separators = screen.getAllByTestId('arrow-separator');
      expect(separators).toHaveLength(3); // One less than the number of items
    });
  });
});