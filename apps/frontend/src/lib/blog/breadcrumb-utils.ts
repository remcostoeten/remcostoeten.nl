/**
 * Breadcrumb utilities for generating navigation breadcrumbs
 */

export interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

/**
 * Generates breadcrumb items for a blog post
 */
export function generateBlogPostBreadcrumbs(postTitle: string, postSlug: string, category?: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      href: "/posts",
    },
  ]

  // Add category if provided
  if (category && category !== "all") {
    breadcrumbs.push({
      label: formatCategoryName(category),
      href: `/posts?category=${category}`,
    })
  }

  // Add current post
  breadcrumbs.push({
    label: postTitle,
    href: `/posts/${postSlug}`,
    current: true,
  })

  return breadcrumbs
}

/**
 * Generates breadcrumb items for a category page
 */
export function generateCategoryBreadcrumbs(category: string): BreadcrumbItem[] {
  return [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      href: "/posts",
    },
    {
      label: formatCategoryName(category),
      href: `/posts?category=${category}`,
      current: true,
    },
  ]
}

/**
 * Generates breadcrumb items for a tag page
 */
export function generateTagBreadcrumbs(tag: string): BreadcrumbItem[] {
  return [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Blog",
      href: "/posts",
    },
    {
      label: `Tag: ${tag}`,
      href: `/tags/${encodeURIComponent(tag)}`,
      current: true,
    },
  ]
}

/**
 * Generates breadcrumb items based on current route
 */
export function generateBreadcrumbsFromRoute(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Home",
      href: "/",
    },
  ]

  let currentPath = ""

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    const isLast = i === segments.length - 1

    breadcrumbs.push({
      label: formatSegmentName(segment),
      href: currentPath,
      current: isLast,
    })
  }

  return breadcrumbs
}

/**
 * Formats a category name for display
 */
export function formatCategoryName(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Formats a URL segment for display in breadcrumbs
 */
export function formatSegmentName(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    posts: "Blog",
    tags: "Tags",
    admin: "Admin",
    analytics: "Analytics",
  }

  if (specialCases[segment]) {
    return specialCases[segment]
  }

  // Default formatting: replace hyphens with spaces and capitalize
  return segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Generates structured data for breadcrumbs (Schema.org)
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href.startsWith("/")
        ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"}${item.href}`
        : item.href,
    })),
  }
}
