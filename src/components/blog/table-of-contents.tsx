'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, List } from 'lucide-react'

interface Heading {
	id: string
	text: string
	level: number
}

export function TableOfContents() {
	const [headings, setHeadings] = useState<Heading[]>([])
	const [activeId, setActiveId] = useState<string>('')
	const [mounted, setMounted] = useState(false)
	const [isMobileOpen, setIsMobileOpen] = useState(false)

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
		<div className="2xl:hidden mb-8">
			<button
				onClick={() => setIsMobileOpen(!isMobileOpen)}
				className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
				aria-expanded={isMobileOpen}
			>
				<span className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
					<List className="w-4 h-4" />
					Table of Contents
					<span className="text-neutral-400 dark:text-neutral-500 font-normal">
						({headings.length})
					</span>
				</span>
				{isMobileOpen ? (
					<ChevronUp className="w-4 h-4 text-neutral-500" />
				) : (
					<ChevronDown className="w-4 h-4 text-neutral-500" />
				)}
			</button>

			{isMobileOpen && (
				<div className="mt-2 p-4 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg">
					<ul className="space-y-1">
						{headings.map(heading => (
							<li
								key={heading.id}
								className="relative"
								style={{
									paddingLeft: `${(heading.level - 2) * 16}px`
								}}
							>
								{heading.level > 2 && (
									<span
										className="absolute left-[calc((var(--level)-2)*16px-8px)] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"
										style={
											{
												'--level': heading.level
											} as React.CSSProperties
										}
									/>
								)}
								<Link
									href={`#${heading.id}`}
									onClick={() => setIsMobileOpen(false)}
									className={`block py-2 px-3 text-sm rounded-md transition-all duration-200 ${
										activeId === heading.id
											? 'text-neutral-900 dark:text-neutral-100 font-medium bg-neutral-100 dark:bg-neutral-800/60'
											: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
									}`}
								>
									{heading.text}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
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
