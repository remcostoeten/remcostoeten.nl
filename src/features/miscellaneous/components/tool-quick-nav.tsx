import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import {
	TOOL_CATEGORY_LABELS,
	getToolsGroupedByCategory
} from '../constants/tools'

type Props = {
	currentSlug: string
}

export function ToolQuickNav({ currentSlug }: Props) {
	const groups = getToolsGroupedByCategory()

	return (
		<nav
			aria-label="Switch tool"
			className="flex flex-col gap-2 border-y border-border/50 py-3"
		>
			{groups.map(group => (
				<div
					key={group.category}
					className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
				>
					<span className="w-12 shrink-0 text-xs text-muted-foreground">
						{TOOL_CATEGORY_LABELS[group.category]}
					</span>
					{group.tools.map(tool => {
						const isCurrent = tool.slug === currentSlug
						const Icon = tool.icon

						return (
							<Link
								key={tool.slug}
								href={`/tools/${tool.slug}`}
								aria-current={isCurrent ? 'page' : undefined}
								className={cn(
									'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
									isCurrent
										? 'border-foreground/50 bg-foreground/10 text-foreground'
										: 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
								)}
							>
								<Icon aria-hidden className="size-3.5" />
								{tool.name}
							</Link>
						)
					})}
				</div>
			))}
		</nav>
	)
}
