'use client'

import { memo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { TToolDefinition } from '../types'
import { ToolCategoryBadge } from './tool-category-badge'

type Props = {
	tool: TToolDefinition
}

function ToolCardImpl({ tool }: Props) {
	const Icon = tool.icon

	return (
		<Link
			href={`/tools/${tool.slug}`}
			aria-labelledby={`tool-${tool.slug}-name`}
			className="group ai-trigger relative flex h-full flex-col gap-3 rounded-none border border-border/50 bg-card p-4 transition-colors hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/60">
					<Icon aria-hidden className="size-4 text-muted-foreground" />
				</div>
			</div>

			<div className="min-w-0 grow">
				<h3
					id={`tool-${tool.slug}-name`}
					className="text-sm font-medium text-foreground"
				>
					{tool.name}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{tool.description}
				</p>
			</div>

			<div className="flex items-center justify-between gap-2">
				<ToolCategoryBadge category={tool.category} />
				<span className="inline-flex h-7 items-center gap-1 px-2 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
					Launch
					<ArrowRight aria-hidden className="size-3" />
				</span>
			</div>
		</Link>
	)
}

export const ToolCard = memo(ToolCardImpl)
