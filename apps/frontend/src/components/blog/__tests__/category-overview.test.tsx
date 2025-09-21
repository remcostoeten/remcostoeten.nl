import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CategoryOverview } from '../category-overview';
import { CategoryData } from '@/lib/blog/types';

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

const mockCategories: CategoryData[] = [
  {
    name: 'Development',
    slug: 'development',
    description: 'Technical articles about programming and software development.',
    color: 'green',
    postCount: 15,
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design principles and visual design trends.',
    color: 'purple',
    postCount: 8,
  },
  {
    name: 'Best Practices',
    slug: 'best-practices',
    description: 'Industry standards and proven methodologies.',
    color: 'orange',
    postCount: 12,
  },
];

describe('CategoryOverview', () => {
  describe('Grid Layout', () => {
    it('renders categories in grid layout by default', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Best Practices')).toBeInTheDocument();
    });

    it('displays category descriptions', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      expect(screen.getByText('Technical articles about programming and software development.')).toBeInTheDocument();
      expect(screen.getByText('UI/UX design principles and visual design trends.')).toBeInTheDocument();
      expect(screen.getByText('Industry standards and proven methodologies.')).toBeInTheDocument();
    });

    it('shows post counts when enabled', () => {
      render(<CategoryOverview categories={mockCategories} showPostCount={true} />);
      
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      
      // Check for singular/plural post labels
      expect(screen.getAllByText('posts')).toHaveLength(3);
    });

    it('hides post counts when disabled', () => {
      render(<CategoryOverview categories={mockCategories} showPostCount={false} />);
      
      expect(screen.queryByText('15')).not.toBeInTheDocument();
      expect(screen.queryByText('posts')).not.toBeInTheDocument();
    });

    it('handles singular post count correctly', () => {
      const singlePostCategory: CategoryData[] = [
        {
          name: 'Single Post Category',
          slug: 'single',
          description: 'A category with only one post.',
          color: 'blue',
          postCount: 1,
        },
      ];

      render(<CategoryOverview categories={singlePostCategory} showPostCount={true} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('post')).toBeInTheDocument();
    });
  });

  describe('List Layout', () => {
    it('renders categories in list layout when specified', () => {
      render(<CategoryOverview categories={mockCategories} layout="list" />);
      
      // In list layout, categories should be in a different structure
      const container = screen.getByText('Development').closest('[role="button"]');
      expect(container).toHaveClass('group');
    });

    it('displays all category information in list layout', () => {
      render(<CategoryOverview categories={mockCategories} layout="list" />);
      
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Technical articles about programming and software development.')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onCategoryClick when category is clicked', () => {
      const mockOnClick = vi.fn();
      render(<CategoryOverview categories={mockCategories} onCategoryClick={mockOnClick} />);
      
      fireEvent.click(screen.getByText('Development'));
      
      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('handles keyboard navigation with Enter key', () => {
      const mockOnClick = vi.fn();
      render(<CategoryOverview categories={mockCategories} onCategoryClick={mockOnClick} />);
      
      const categoryElement = screen.getByText('Development').closest('[role="button"]');
      fireEvent.keyDown(categoryElement!, { key: 'Enter' });
      
      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('handles keyboard navigation with Space key', () => {
      const mockOnClick = vi.fn();
      render(<CategoryOverview categories={mockCategories} onCategoryClick={mockOnClick} />);
      
      const categoryElement = screen.getByText('Development').closest('[role="button"]');
      fireEvent.keyDown(categoryElement!, { key: ' ' });
      
      expect(mockOnClick).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('does not trigger click on other keys', () => {
      const mockOnClick = vi.fn();
      render(<CategoryOverview categories={mockCategories} onCategoryClick={mockOnClick} />);
      
      const categoryElement = screen.getByText('Development').closest('[role="button"]');
      fireEvent.keyDown(categoryElement!, { key: 'Tab' });
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      expect(screen.getByLabelText('View Development posts')).toBeInTheDocument();
      expect(screen.getByLabelText('View Design posts')).toBeInTheDocument();
      expect(screen.getByLabelText('View Best Practices posts')).toBeInTheDocument();
    });

    it('has proper role attributes', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      const categoryElements = screen.getAllByRole('button');
      expect(categoryElements).toHaveLength(3);
    });

    it('is keyboard focusable', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      const categoryElements = screen.getAllByRole('button');
      categoryElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <CategoryOverview categories={mockCategories} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles empty categories array', () => {
      render(<CategoryOverview categories={[]} />);
      
      // Should render without errors
      expect(screen.queryByText('Development')).not.toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies hover effects classes', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      const categoryElement = screen.getByText('Development').closest('[role="button"]');
      expect(categoryElement).toHaveClass('hover:shadow-xl');
      expect(categoryElement).toHaveClass('hover:-translate-y-2');
    });

    it('applies focus styles', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      const categoryElement = screen.getByText('Development').closest('[role="button"]');
      expect(categoryElement).toHaveClass('focus-within:ring-2');
      expect(categoryElement).toHaveClass('focus-within:ring-accent');
    });
  });
});