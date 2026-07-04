'use client'

import { useMemo, useRef, useState } from 'react'
import { Search, Star, Wrench } from 'lucide-react'
import { useShortcutMap } from '@remcostoeten/use-shortcut/react'
import { Input } from '@/components/ui/input'
import { Section } from '@/components/ui/section'
import { TOOLS } from '../constants/tools'
import type { TToolDefinition } from '../types'
import { ToolCard } from './tool-card'

function matchesQuery(tool: TToolDefinition, query: string): boolean {
	if (!query) return true
	const haystack = [tool.name, tool.description, ...tool.keywords]
		.join(' ')
		.toLowerCase()
	return query
		.toLowerCase()
		.split(/\s+/)
		.every(term => haystack.includes(term))
}

function ToolGrid({ tools }: { tools: TToolDefinition[] }) {
	return (
		<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
			{tools.map(tool => (
				<li key={tool.slug}>
					<ToolCard tool={tool} />
				</li>
			))}
		</ul>
	)
}

export function ToolsHub() {
	const [query, setQuery] = useState('')
	const searchRef = useRef<HTMLInputElement>(null)

	useShortcutMap({
		focusSearch: {
			keys: '/',
			handler: () => searchRef.current?.focus(),
			options: { description: 'Focus tool search' }
		}
	})

	const tools = useMemo(
		() => TOOLS.filter(tool => matchesQuery(tool, query)),
		[query]
	)

	return (
		<div className="flex flex-col gap-6">
			<Section title="Miscellaneous Tools">
				<div className="px-4 md:px-5 pt-4 flex flex-col gap-4">
					<div>
						<h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
							<Wrench
								aria-hidden
								className="size-4 text-muted-foreground"
							/>
							Miscellaneous Tools
						</h1>
						<p className="mt-1 text-sm text-muted-foreground max-w-prose">
							A growing collection of small, browser-based
							utilities. Everything runs entirely client-side —
							nothing you type or upload ever leaves your machine.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						<div className="relative">
							<Search
								aria-hidden
								className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							/>
							<label htmlFor="tool-search" className="sr-only">
								Search tools
							</label>
							<Input
								id="tool-search"
								ref={searchRef}
								type="search"
								placeholder="Search tools… (press / to focus)"
								value={query}
								onChange={event => setQuery(event.target.value)}
								className="pl-9 focus-visible:ring-1 focus-visible:ring-border/40 focus-visible:ring-offset-0 focus-visible:border-border"
							/>
						</div>

						<p
							aria-live="polite"
							className="text-xs text-muted-foreground"
						>
							{tools.length === TOOLS.length
								? `${TOOLS.length} tools`
								: `${tools.length} of ${TOOLS.length} tools match`}
						</p>
					</div>
				</div>
			</Section>

			<Section title="Tools">
				<div className="px-4 md:px-5 pt-2">
					{tools.length > 0 ? (
						<ToolGrid tools={tools} />
					) : (
						<div className="flex flex-col items-center gap-2 border border-dashed border-border/50 py-10 text-center">
							<Star
								aria-hidden
								className="size-5 text-muted-foreground"
							/>
							<p className="text-sm text-muted-foreground">
								No tools match your search.
							</p>
							<button
								type="button"
								onClick={() => setQuery('')}
								className="text-sm text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								Clear search
							</button>
						</div>
					)}
				</div>
			</Section>
		</div>
	)
}
