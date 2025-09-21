import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  BreadcrumbNavigation, 
  useBlogPostBreadcrumbs,
  useCategoryBreadcrumbs,
  useTagBreadcrumbs 
} from '../breadcrumb-navigation';
import { BreadcrumbItem } from '@/lib/blog/breadcrumb-utils';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  }
}));

describe('BreadcrumbNavigation', () => {
  const mockBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/posts' },
    { label: 'Development', href: '/posts?category=development' },
    { label: 'Getting Started with React', href: '/posts/getting-started-react', current: true },
  ];

  it('renders breadcrumb navigation correctly', () => {
    render(<BreadcrumbNavigation items={mockBreadcrumbs} />);
    
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Getting Started with React')).toBeInTheDocument();
  });

  it('renders links for non-current items', () => {
    render(<BreadcrumbNavigation items={mockBreadcrumbs} />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const blogLink = screen.getByRole('link', { name: 'Blog' });
    const categoryLink = screen.getByRole('link', { name: 'Development' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(blogLink).toHaveAttribute('href', '/posts');
    expect(categoryLink).toHaveAttribute('href', '/posts?category=development');
  });

  it('renders current item as text without link', () => {
    render(<BreadcrumbNavigation items={mockBreadcrumbs} />);
    
    const currentItem = screen.getByText('Getting Started with React');
    expect(currentItem).not.toHaveAttribute('href');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  it('includes structured data when enabled', () => {
    const { container } = render(
      <BreadcrumbNavigation items={mockBreadcrumbs} includeStructuredData={true} />
    );
    
    const structuredDataScript = container.querySelector('script[type="application/ld+json"]');
    expect(structuredDataScript).toBeInTheDocument();
    
    const structuredData = JSON.parse(structuredDataScript?.textContent || '{}');
    expect(structuredData['@type']).toBe('BreadcrumbList');
    expect(structuredData.itemListElement).toHaveLength(4);
  });

  it('excludes structured data when disabled', () => {
    const { container } = render(
      <BreadcrumbNavigation items={mockBreadcrumbs} includeStructuredData={false} />
    );
    
    const structuredDataScript = container.querySelector('script[type="application/ld+json"]');
    expect(structuredDataScript).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BreadcrumbNavigation items={mockBreadcrumbs} className="custom-class" />
    );
    
    const breadcrumbNav = container.querySelector('nav');
    expect(breadcrumbNav).toHaveClass('custom-class');
  });

  it('handles empty breadcrumbs array', () => {
    render(<BreadcrumbNavigation items={[]} />);
    
    const navigation = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(navigation).toBeInTheDocument();
    
    const list = navigation.querySelector('ol');
    expect(list?.children).toHaveLength(0);
  });

  it('renders custom separator when provided', () => {
    const customSeparator = <span data-testid="custom-separator">→</span>;
    render(
      <BreadcrumbNavigation 
        items={mockBreadcrumbs} 
        separator={customSeparator} 
      />
    );
    
    const separators = screen.getAllByTestId('custom-separator');
    expect(separators).toHaveLength(3); // One less than the number of items
  });
});

// Test the hooks with a test component
function TestHookComponent({ 
  hookType, 
  ...props 
}: { 
  hookType: 'blogPost' | 'category' | 'tag';
  [key: string]: any;
}) {
  let breadcrumbs: BreadcrumbItem[] = [];
  
  if (hookType === 'blogPost') {
    breadcrumbs = useBlogPostBreadcrumbs(props.title, props.slug, props.category);
  } else if (hookType === 'category') {
    breadcrumbs = useCategoryBreadcrumbs(props.category);
  } else if (hookType === 'tag') {
    breadcrumbs = useTagBreadcrumbs(props.tag);
  }
  
  return (
    <div data-testid="breadcrumbs">
      {JSON.stringify(breadcrumbs)}
    </div>
  );
}

describe('Breadcrumb Hooks', () => {
  describe('useBlogPostBreadcrumbs', () => {
    it('generates correct breadcrumbs for blog post with category', () => {
      render(
        <TestHookComponent 
          hookType="blogPost"
          title="Getting Started with React"
          slug="getting-started-react"
          category="development"
        />
      );
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
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

    it('generates correct breadcrumbs for blog post without category', () => {
      render(
        <TestHookComponent 
          hookType="blogPost"
          title="My Post"
          slug="my-post"
        />
      );
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'My Post', 
        href: '/posts/my-post',
        current: true 
      });
    });

    it('skips category when category is "all"', () => {
      render(
        <TestHookComponent 
          hookType="blogPost"
          title="My Post"
          slug="my-post"
          category="all"
        />
      );
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs.some(b => b.label === 'All')).toBe(false);
    });
  });

  describe('useCategoryBreadcrumbs', () => {
    it('generates correct breadcrumbs for category', () => {
      render(<TestHookComponent hookType="category" category="development" />);
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Development', 
        href: '/posts?category=development',
        current: true 
      });
    });

    it('formats multi-word categories correctly', () => {
      render(<TestHookComponent hookType="category" category="best-practices" />);
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs[2].label).toBe('Best Practices');
    });
  });

  describe('useTagBreadcrumbs', () => {
    it('generates correct breadcrumbs for tag', () => {
      render(<TestHookComponent hookType="tag" tag="react" />);
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Tag: react', 
        href: '/tags/react',
        current: true 
      });
    });

    it('handles tags with special characters', () => {
      render(<TestHookComponent hookType="tag" tag="react & redux" />);
      
      const breadcrumbsElement = screen.getByTestId('breadcrumbs');
      const breadcrumbs = JSON.parse(breadcrumbsElement.textContent || '[]');
      
      expect(breadcrumbs[2]).toEqual({ 
        label: 'Tag: react & redux', 
        href: '/tags/react%20%26%20redux',
        current: true 
      });
    });
  });
});