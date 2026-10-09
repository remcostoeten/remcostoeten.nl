'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { ChevronDown, List } from 'lucide-react'

interface Heading {
	id: string
	text: string
	level: number
}

export function TableOfContents() {
	const [headings, setHeadings] = useState<Heading[]>([])
	const [activeId, setActiveId] = useState<string>('')
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		const timer = setTimeout(() => {
			const article = document.querySelector('article')
			if (!article) return

			const headingElements = Array.from(
				article.querySelectorAll('h2, h3, h4, h5, h6')
			) as HTMLElement[]

			const extractedHeadings: Heading[] = headingElements
				.filter(element => element.id)
				.map(element => ({
					id: element.id || '',
					text: element.textContent || '',
					level: parseInt(element.tagName[1])
				}))

			setHeadings(extractedHeadings)

			const observer = new IntersectionObserver(
				entries => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							setActiveId(entry.target.id)
						}
					})
				},
				{ rootMargin: '-50% 0px -50% 0px' }
			)

			headingElements.forEach(element => {
				if (element.id) {
					observer.observe(element)
				}
			})

			return () => {
				headingElements.forEach(element => {
					observer.unobserve(element)
				})
			}
		}, 100)

		return () => clearTimeout(timer)
	}, [])

	if (!mounted || headings.length === 0) {
		return null
	}

	const MobileToC = () => (
		<details className="group mb-8 rounded-md border border-border/60 2xl:hidden">
			<summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
				<span className="inline-flex items-center gap-2">
					<List className="h-3.5 w-3.5" />
					On this page
				</span>
				<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
			</summary>
			<ul className="space-y-0.5 border-t border-border/60 px-2 py-2">
				{headings.map(heading => (
					<li
						key={heading.id}
						style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
					>
						<Link
							href={`#${heading.id}`}
							className={`block rounded-sm px-2 py-1.5 text-sm transition-colors ${
								activeId === heading.id
									? 'text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							{heading.text}
						</Link>
					</li>
				))}
			</ul>
		</details>
	)

	const DesktopToC = () =>
		createPortal(
			<div className="fixed inset-0 z-50 pointer-events-none">
				<div className="max-w-2xl mx-auto h-full relative">
					<aside className="hidden 2xl:block absolute left-full top-32 ml-16 w-64 max-h-[calc(100vh-180px)] overflow-y-auto pointer-events-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
						<div className="sticky top-0">
							<h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-5 pb-2 border-b border-neutral-200 dark:border-neutral-800">
								On this page
							</h2>
							<ul className="space-y-1">
								{headings.map(heading => (
									<li
										key={heading.id}
										className="relative"
										style={{
											paddingLeft: `${(heading.level - 2) * 14}px`
										}}
									>
										{heading.level > 2 && (
											<span
												className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"
												style={{
													left: `${(heading.level - 2) * 14 - 8}px`
												}}
											/>
										)}
										<Link
											href={`#${heading.id}`}
											className={`block py-1.5 px-2.5 text-[13px] rounded-md transition-all duration-200 leading-snug ${
												activeId === heading.id
													? 'text-neutral-900 dark:text-neutral-100 font-medium bg-neutral-100 dark:bg-neutral-800/60 shadow-sm'
													: 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
											}`}
										>
											{heading.text}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</aside>
				</div>
			</div>,
			document.body
		)

	return (
		<>
			<MobileToC />
			<DesktopToC />
		</>
	)
}
