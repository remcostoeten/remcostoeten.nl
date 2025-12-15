'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) return []
  
  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1
    
    let label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    
    if (segment === 'blog') label = 'Blog'
    if (segment === 'categories') label = 'Categories'
    if (segment === 'topics') label = 'Topics'
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: isLast
    })
  })
  
  return breadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)
  
  if (pathname === '/' || breadcrumbs.length === 0) {
    return null
  }
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-6"
    >
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <li className="flex items-center">
          <Link 
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <li className="flex items-center text-muted-foreground/50">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="flex items-center">
              {crumb.isCurrentPage ? (
                <span 
                  className="text-foreground font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate max-w-[200px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
