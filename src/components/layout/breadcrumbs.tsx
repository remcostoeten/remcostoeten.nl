'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Fragment } from 'react'

interface BreadcrumbItem {
	label: string
	href: string
	isCurrentPage: boolean
}

interface BreadcrumbProps {
	params?: Record<string, string>
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
			isCurrentPage: isLast
		})
	})

	return breadcrumbs
}

export function Breadcrumbs({ params }: BreadcrumbProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const breadcrumbs = generateBreadcrumbs(pathname)

	const langParam = searchParams.get('lang')
	const linkParams = langParam ? `?lang=${langParam}` : ''

	if (pathname === '/' || breadcrumbs.length === 0) {
		return null
	}

	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			<ol className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50">
				<li>
					<Link
						href={buildHref('/', params)}
						className="hover:text-foreground transition-colors"
					>
						~
					</Link>
				</li>

				{breadcrumbs.map(crumb => (
					<Fragment key={crumb.href}>
						<li className="text-muted-foreground/30">/</li>
						<li>
							{crumb.isCurrentPage ? (
								<span
									className="text-foreground/70"
									aria-current="page"
								>
									{crumb.label.toLowerCase()}
								</span>
							) : (
								<Link
									href={`${crumb.href}${linkParams}`}
									className="hover:text-foreground transition-colors"
								>
									{crumb.label.toLowerCase()}
								</Link>
							)}
						</li>
					</Fragment>
				))}
			</ol>
		</nav>
	)
}
