'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
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

function useLangParam() {
	const [linkParams, setLinkParams] = useState('')

	useEffect(() => {
		const lang = new URLSearchParams(window.location.search).get('lang')
		if (lang) setLinkParams(`?lang=${lang}`)
	}, [])

	return linkParams
}

export function Breadcrumbs({ params }: BreadcrumbProps) {
	const pathname = usePathname()
	const breadcrumbs = generateBreadcrumbs(pathname)
	const linkParams = useLangParam()

	if (pathname === '/' || breadcrumbs.length === 0) {
		return null
	}

	return (
		<nav aria-label="Breadcrumb">
			<ol className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
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
								<Link
									href={`${crumb.href}${linkParams}` as Route}
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
