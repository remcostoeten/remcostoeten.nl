'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Section } from '@/components/ui/section'
import { Sidebar } from './sidebar'
import type { ResourceConfig, ResourceEntry } from './types'

type Props<Entry extends ResourceEntry> = {
	config: ResourceConfig
	entries: readonly Entry[]
	renderIcon?: (entry: Entry) => ReactNode
	sidebarFooter?: ReactNode
	gridNav?: boolean
	children: (entry: Entry, notify: (message: string) => void) => ReactNode
}

const componentParam = 'component'

export function ResourceShowcase<Entry extends ResourceEntry>({
	config,
	entries,
	renderIcon,
	sidebarFooter,
	gridNav,
	children
}: Props<Entry>) {
	const [notice, setNotice] = useState('')
	const [selectedId, setSelectedId] = useState(config.defaultId)
	const entry =
		entries.find(item => item.id === selectedId) ??
		entries.find(item => item.id === config.defaultId) ??
		entries[0]

	useEffect(() => {
		function syncFromUrl() {
			const id = new URLSearchParams(window.location.search).get(
				componentParam
			)
			setSelectedId(
				entries.some(item => item.id === id) && id
					? id
					: config.defaultId
			)
		}
		syncFromUrl()
		window.addEventListener('popstate', syncFromUrl)
		return () => window.removeEventListener('popstate', syncFromUrl)
	}, [entries, config.defaultId])

	useEffect(() => {
		if (!notice) return
		const timeout = setTimeout(() => setNotice(''), 2600)
		return () => clearTimeout(timeout)
	}, [notice])

	function select(id: string) {
		const url = new URL(window.location.href)
		url.searchParams.set(componentParam, id)
		url.hash = 'component'
		window.history.pushState(null, '', url)
		setSelectedId(id)
		document.getElementById('component')?.scrollIntoView()
	}

	return (
		<div className="es-showcase text-foreground antialiased">
			<div className="space-y-3 px-4 pt-1 pb-6 sm:pt-2 sm:pb-8 md:px-5 md:pt-3">
				<PageHeader
					title={config.title}
					description={config.description}
				/>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground/70">
					<span>{config.stack}. MIT.</span>
					<a
						href="#implementation"
						className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
					>
						Get the code
					</a>
				</div>
			</div>
			<Section
				title="Components"
				headerAction={
					<span className="font-mono text-xs text-muted-foreground">
						{entries.length} {config.countLabel}
					</span>
				}
				noHeaderMargin
			>
				<div
					className={`grid max-[900px]:block ${
						gridNav
							? 'grid-cols-[340px_minmax(0,1fr)] max-[1100px]:grid-cols-[280px_minmax(0,1fr)]'
							: 'grid-cols-[228px_minmax(0,1fr)] max-[1100px]:grid-cols-[200px_minmax(0,1fr)]'
					}`}
				>
					<Sidebar
						config={config}
						entries={entries}
						selectedId={entry.id}
						onSelect={select}
						renderIcon={renderIcon}
						footer={sidebarFooter}
						grid={gridNav}
					/>
					<div className="w-full min-w-0" id="top">
						{children(entry, setNotice)}
					</div>
				</div>
			</Section>
			<output
				className="fixed bottom-4 left-1/2 z-50 max-w-[min(90vw,500px)] -translate-x-1/2 rounded-md border border-border bg-(--color-surface) px-4 py-3 text-xs/normal shadow-[0_10px_30px_rgb(0_0_0/0.14)] empty:hidden"
				aria-live="polite"
			>
				{notice}
			</output>
		</div>
	)
}
