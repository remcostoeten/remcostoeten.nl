import React from 'react';
import { render, screen } from '@testing-library/react';
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
];

describe('CategoryOverview Responsive Behavior', () => {
  describe('Grid Layout Responsiveness', () => {
    it('applies responsive grid classes', () => {
      const { container } = render(<CategoryOverview categories={mockCategories} />);
      
      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
      expect(gridContainer).toHaveClass('xl:grid-cols-4');
    });

    it('maintains proper spacing between grid items', () => {
      const { container } = render(<CategoryOverview categories={mockCategories} />);
      
      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveClass('gap-6');
    });
  });

  describe('List Layout Responsiveness', () => {
    it('applies proper spacing in list layout', () => {
      const { container } = render(
        <CategoryOverview categories={mockCategories} layout="list" />
      );
      
      const listContainer = container.firstChild as HTMLElement;
      expect(listContainer).toHaveClass('space-y-3');
    });
  });

  describe('Accessibility', () => {
    it('maintains proper focus indicators', () => {
      render(<CategoryOverview categories={mockCategories} />);
      
      const categoryElements = screen.getAllByRole('button');
      categoryElements.forEach(element => {
        expect(element).toHaveClass('focus-within:ring-2');
        expect(element).toHaveAttribute('tabIndex', '0');
      });
    });
  });
});