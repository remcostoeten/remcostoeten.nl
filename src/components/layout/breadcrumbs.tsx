'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage: boolean
}

interface BreadcrumbProps {
  params?: Record<string, string>
  showRootIcon?: boolean
  rootLabel?: string
}

function buildHref(path: string, params?: Record<string, string>) {
  if (!params) return path
  const query = new URLSearchParams(params).toString()
  return query.length > 0 ? `${path}?${query}` : path
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return []

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  segments.forEach(function build(segment, index) {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    let label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, function upper(character) {
        return character.toUpperCase()
      })

    if (segment === 'blog') label = 'Blog'
    if (segment === 'categories') label = 'Categories'
    if (segment === 'topics') label = 'Topics'

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: isLast,
    })
  })

  return breadcrumbs
}

export function Breadcrumbs({ params, showRootIcon = true, rootLabel }: BreadcrumbProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const breadcrumbs = generateBreadcrumbs(pathname)
  
  // Preserve language parameter in breadcrumb links
  const langParam = searchParams.get('lang')
  const linkParams = langParam ? `?lang=${langParam}` : ''
  
  if (pathname === '/' || breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link
            href={buildHref('/', params)}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {showRootIcon ? (
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
            ) : null}
            <span>{rootLabel ?? 'Home'}</span>
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
                  href={`${crumb.href}${linkParams}`}
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
