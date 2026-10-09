'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Section } from '@/components/ui/section'
import { demoEntries } from './entries'
import { Playground } from './playground'
import { Sidebar } from './sidebar'

const componentParam = 'component'
const defaultId = 'records'

function findEntry(id: string | null) {
	return (
		demoEntries.find(entry => entry.id === id) ??
		demoEntries.find(entry => entry.id === defaultId) ??
		demoEntries[0]
	)
}

function readSelectedId() {
	return findEntry(
		new URLSearchParams(window.location.search).get(componentParam)
	).id
}

export function EmptyStatesShowcase() {
	const [notice, setNotice] = useState('')
	const [selectedId, setSelectedId] = useState(defaultId)
	const entry = findEntry(selectedId)

	useEffect(() => {
		function syncFromUrl() {
			setSelectedId(readSelectedId())
		}
		syncFromUrl()
		window.addEventListener('popstate', syncFromUrl)
		return () => window.removeEventListener('popstate', syncFromUrl)
	}, [])

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
					title="Empty states"
					description="Copyable React empty states. Preview, customize, and take the source."
				/>
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground/70">
					<span>TSX + Tailwind v4. MIT.</span>
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
						{demoEntries.length} states
					</span>
				}
				noHeaderMargin
			>
				<div className="grid grid-cols-[228px_minmax(0,1fr)] max-[1100px]:grid-cols-[200px_minmax(0,1fr)] max-[900px]:block">
					<Sidebar
						entries={demoEntries}
						selectedId={entry.id}
						onSelect={select}
					/>
					<div className="w-full min-w-0" id="top">
						<Playground
							key={entry.id}
							entry={entry}
							notify={setNotice}
						/>
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
