'use client'

import {
	ArrowUpRight,
	Code2,
	Package,
	Palette,
	Terminal,
	Sparkles
} from 'lucide-react'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type PlaygroundItem = {
	title: string
	description: string
	href: string
	icon: typeof Code2
	tags: string[]
}

const playgroundItems: PlaygroundItem[] = [
	{
		title: 'Code Snippets',
		description: 'Reusable code patterns and utilities',
		href: '/playground?filter=snippets',
		icon: Code2,
		tags: ['TypeScript', 'React', 'Utils']
	},
	{
		title: 'UI Experiments',
		description: 'Interface trials and component explorations',
		href: '/playground?filter=ui',
		icon: Palette,
		tags: ['Components', 'Animations']
	},
	{
		title: 'Package Builds',
		description: 'NPM packages and library prototypes',
		href: '/playground?filter=packages',
		icon: Package,
		tags: ['NPM', 'Libraries']
	},
	{
		title: 'CLI Tools',
		description: 'Command line utilities and scripts',
		href: '/playground?filter=cli',
		icon: Terminal,
		tags: ['Node', 'Shell']
	}
]

function PlaygroundItemCard({ item }: { item: PlaygroundItem }) {
	const Icon = item.icon

	return (
		<Link
			href={item.href}
			className={cn(
				'group flex items-center gap-4 px-4 py-4',
				'border-b border-border/40 last:border-b-0',
				'hover:bg-muted/10 transition-colors'
			)}
		>
			<div
				className={cn(
					'flex items-center justify-center w-8 h-8 shrink-0',
					'border border-border/50 bg-muted/30',
					'group-hover:border-primary/40 group-hover:bg-primary/5',
					'transition-colors'
				)}
			>
				<Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary/80 transition-colors" />
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium text-foreground group-hover:text-primary/90 transition-colors">
						{item.title}
					</h3>
					<ArrowUpRight className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
				</div>
				<p className="text-xs text-muted-foreground/60">
					{item.description}
				</p>
			</div>

			<div className="hidden sm:flex gap-2">
				{item.tags.map(tag => (
					<span
						key={tag}
						className="text-[10px] font-mono text-muted-foreground/40"
					>
						{tag}
					</span>
				))}
			</div>
		</Link>
	)
}

export function Playground() {
	return (
		<Section
			title="Playground"
			noHeaderMargin
			headerAction={
				<Link
					href="/playground"
					className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
				>
					<Sparkles className="w-3 h-3" />
					View all
				</Link>
			}
		>
			<p className="px-4 py-3 text-sm text-muted-foreground/70 leading-relaxed font-mono tracking-tight border-b border-border/40">
				A collection of experiments, utilities, and tools I've
				built—some practical, some just for fun.
			</p>
			<div>
				{playgroundItems.map(item => (
					<PlaygroundItemCard key={item.title} item={item} />
				))}
			</div>
		</Section>
	)
}
