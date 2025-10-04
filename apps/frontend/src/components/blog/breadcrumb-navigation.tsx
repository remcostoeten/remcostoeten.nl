'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  BreadcrumbItem as BreadcrumbItemType,
  generateBreadcrumbStructuredData 
} from '@/lib/blog/breadcrumb-utils';
import { cn } from '@/lib/utils';

export interface BreadcrumbNavigationProps {
  items: BreadcrumbItemType[];
  separator?: React.ReactNode;
  className?: string;
  includeStructuredData?: boolean;
}

/**
 * Blog-specific breadcrumb navigation component with accessibility and SEO features
 */
export function BreadcrumbNavigation({
  items,
  separator,
  className,
  includeStructuredData = true,
}: BreadcrumbNavigationProps) {
  // Generate structured data for SEO
  const structuredData = React.useMemo(() => {
    if (!includeStructuredData) return null;
    return generateBreadcrumbStructuredData(items);
  }, [items, includeStructuredData]);

  return (
    <>
      {/* Structured data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={`${item.href}-${index}`}>
              <BreadcrumbItem>
                {item.current ? (
                  <BreadcrumbPage className="text-foreground font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={item.href}
                      className="hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {/* Add separator between items (except after the last item) */}
              {index < items.length - 1 && (
                <BreadcrumbSeparator>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

/**
 * Hook to generate breadcrumbs for blog posts
 */
export function useBlogPostBreadcrumbs(
  postTitle: string,
  postSlug: string,
  category?: string
): BreadcrumbItemType[] {
  return React.useMemo(() => {
    const breadcrumbs: BreadcrumbItemType[] = [
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Blog',
        href: '/posts',
      },
    ];

    // Add category if provided and not 'all'
    if (category && category !== 'all') {
      breadcrumbs.push({
        label: category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        href: `/posts?category=${category}`,
      });
    }

    // Add current post
    breadcrumbs.push({
      label: postTitle,
      href: `/posts/${postSlug}`,
      current: true,
    });

    return breadcrumbs;
  }, [postTitle, postSlug, category]);
}

/**
 * Hook to generate breadcrumbs for category pages
 */
export function useCategoryBreadcrumbs(category: string): BreadcrumbItemType[] {
  return React.useMemo(() => [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Blog',
      href: '/posts',
    },
    {
      label: category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      href: `/posts?category=${category}`,
      current: true,
    },
  ], [category]);
}

/**
 * Hook to generate breadcrumbs for tag pages
 */
export function useTagBreadcrumbs(tag: string): BreadcrumbItemType[] {
  return React.useMemo(() => [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Blog',
      href: '/posts',
    },
    {
      label: `Tag: ${tag}`,
      href: `/tags/${encodeURIComponent(tag)}`,
      current: true,
    },
  ], [tag]);
}