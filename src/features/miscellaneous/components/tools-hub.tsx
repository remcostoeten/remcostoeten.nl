'use client'

import { useDeferredValue, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, Star, Clock } from 'lucide-react'
import { useShortcutMap } from '@remcostoeten/use-shortcut/react'
import { Input } from '@/components/ui/input'
import { Section } from '@/components/ui/section'
import { cn } from '@/shared/lib/cn'
import {
	getToolBySlug,
	getToolCountsByCategory,
	searchTools,
	TOOL_CATEGORIES,
	TOOL_CATEGORY_LABELS,
	TOOLS
} from '../constants/tools'
import { useRecentTools } from '../hooks/use-tool-usage'
import type { TToolCategory, TToolDefinition } from '../types'
import { ToolCard } from './tool-card'

type Props = {
	intro: ReactNode
}

function ToolGrid({ tools }: { tools: readonly TToolDefinition[] }) {
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

type TCategoryFilter = TToolCategory | 'all'

function CategoryFilters({
	active,
	onChange
}: {
	active: TCategoryFilter
	onChange: (category: TCategoryFilter) => void
}) {
	const counts = getToolCountsByCategory()
	const options: { value: TCategoryFilter; label: string; count: number }[] = [
		{ value: 'all', label: 'All', count: TOOLS.length },
		...TOOL_CATEGORIES.map(category => ({
			value: category,
			label: TOOL_CATEGORY_LABELS[category],
			count: counts[category]
		}))
	]

	return (
		<div role="group" aria-label="Filter tools by category" className="flex flex-wrap gap-2">
			{options.map(option => (
				<button
					key={option.value}
					type="button"
					aria-pressed={active === option.value}
					onClick={() => onChange(option.value)}
					className={cn(
						'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						active === option.value
							? 'border-foreground/50 bg-foreground/10 text-foreground'
							: 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
					)}
				>
					{option.label}
					<span className="text-muted-foreground">{option.count}</span>
				</button>
			))}
		</div>
	)
}

function RecentTools() {
	const { recent, hydrated } = useRecentTools()

	if (!hydrated || recent.length === 0) return null

	const tools = recent
		.map(slug => getToolBySlug(slug))
		.filter((tool): tool is TToolDefinition => Boolean(tool))

	if (tools.length === 0) return null

	return (
		<Section title="Recently Used">
			<div className="px-4 md:px-5 pt-2">
				<div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock aria-hidden className="size-3.5" />
					Continue where you left off
				</div>
				<ToolGrid tools={tools} />
			</div>
		</Section>
	)
}

export function ToolsHub({ intro }: Props) {
	const [query, setQuery] = useState('')
	const [category, setCategory] = useState<TCategoryFilter>('all')
	const deferredQuery = useDeferredValue(query)
	const searchRef = useRef<HTMLInputElement>(null)

	useShortcutMap({
		focusSearch: {
			keys: '/',
			handler: () => searchRef.current?.focus(),
			options: { description: 'Focus tool search' }
		}
	})

	const tools = useMemo(() => {
		const matches = searchTools(deferredQuery)
		return category === 'all'
			? matches
			: matches.filter(tool => tool.category === category)
	}, [deferredQuery, category])

	return (
		<div className="flex flex-col gap-6">
			<Section title="Miscellaneous Tools">
				<div className="px-4 md:px-5 pt-4 flex flex-col gap-4">
					{intro}

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

						<CategoryFilters active={category} onChange={setCategory} />

						<p
							aria-live="polite"
							className="h-4 text-xs text-muted-foreground"
						>
							{tools.length === TOOLS.length
								? `${TOOLS.length} tools`
								: `${tools.length} of ${TOOLS.length} tools match`}
						</p>
					</div>
				</div>
			</Section>

			<RecentTools />

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
