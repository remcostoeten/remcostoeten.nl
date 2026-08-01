'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { Home } from 'lucide-react'

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
		if (segment === 'find-replace') label = 'Find & Replace'
		if (segment === 'gif-to-video') label = 'GIF to Video'
		if (segment === 'video-to-gif') label = 'Video to GIF'

		breadcrumbs.push({
			label,
			href: currentPath,
			isCurrentPage: isLast
		})
	})

	return breadcrumbs
}

function CrumbLinkWithLang({ href, label }: { href: string; label: string }) {
	const searchParams = useSearchParams()
	const langParam = searchParams.get('lang')
	const linkParams = langParam ? `?lang=${langParam}` : ''

	return (
		<Link
			href={`${href}${linkParams}` as Route}
			className="hover:text-foreground transition-colors"
		>
			{label}
		</Link>
	)
}

function CrumbLink({ href, label }: { href: string; label: string }) {
	return (
		<Suspense
			fallback={
				<Link
					href={href as Route}
					className="hover:text-foreground transition-colors"
				>
					{label}
				</Link>
			}
		>
			<CrumbLinkWithLang href={href} label={label} />
		</Suspense>
	)
}

function BreadcrumbsContent({ params }: BreadcrumbProps) {
	const pathname = usePathname()
	const breadcrumbs = generateBreadcrumbs(pathname)

	if (pathname === '/' || breadcrumbs.length === 0) {
		return null
	}

	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex items-center gap-1 text-xs font-mono text-muted-foreground/50">
				<li>
					<Link
						href={buildHref('/', params) as Route}
						className="hover:text-foreground transition-colors flex items-center"
						title="Home"
					>
						<Home className="w-3.5 h-3.5" />
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
								<CrumbLink
									href={crumb.href}
									label={crumb.label.toLowerCase()}
								/>
							)}
						</li>
					</Fragment>
				))}
			</ol>
		</nav>
	)
}

export function Breadcrumbs(props: BreadcrumbProps) {
	return <BreadcrumbsContent {...props} />
}
