import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CategoryOverview } from '../category-overview';
import { generateCategoryData } from '@/lib/blog/category-utils';
import { TBlogPost } from '@/lib/blog/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock animation configs
vi.mock('@/modules/shared', () => ({
  ANIMATION_CONFIGS: {
    staggered: () => ({}),
  },
}));

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

describe('CategoryOverview Integration', () => {
  it('integrates with blog post data correctly', () => {
    const categories = generateCategoryData(mockPosts);
    const mockOnClick = vi.fn();
    
    render(
      <CategoryOverview 
        categories={categories} 
        onCategoryClick={mockOnClick}
      />
    );
    
    // Should display all categories with posts
    expect(screen.getByText('All Posts')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Best Practices')).toBeInTheDocument();
    
    // Should display correct post counts
    expect(screen.getByText('3')).toBeInTheDocument(); // All posts
    expect(screen.getAllByText('1')).toHaveLength(3); // Individual categories each have 1 post
  });

  it('handles category selection for navigation', () => {
    const categories = generateCategoryData(mockPosts);
    const mockOnClick = vi.fn();
    
    render(
      <CategoryOverview 
        categories={categories} 
        onCategoryClick={mockOnClick}
      />
    );
    
    // Click on Development category
    fireEvent.click(screen.getByText('Development'));
    
    expect(mockOnClick).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'development',
        name: 'Development',
        postCount: 1,
      })
    );
  });

  it('works with empty blog posts', () => {
    const categories = generateCategoryData([]);
    
    render(<CategoryOverview categories={categories} />);
    
    // Should only show "All Posts" with 0 count
    expect(screen.getByText('All Posts')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('adapts to different screen sizes', () => {
    const categories = generateCategoryData(mockPosts);
    
    const { container } = render(<CategoryOverview categories={categories} />);
    
    const gridContainer = container.firstChild as HTMLElement;
    
    // Should have responsive grid classes
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-3');
    expect(gridContainer).toHaveClass('xl:grid-cols-4');
  });
});