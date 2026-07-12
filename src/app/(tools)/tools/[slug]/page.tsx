import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/core/metadata/base'
import {
	getAvailableTools,
	getToolBySlug
} from '@/features/miscellaneous/constants/tools'
import type { TToolSlug } from '@/features/miscellaneous/constants/tools'
import { ToolCategoryBadge } from '@/features/miscellaneous/components/tool-category-badge'
import { ToolQuickNav } from '@/features/miscellaneous/components/tool-quick-nav'
import { ToolRenderer } from '@/features/miscellaneous/components/tool-renderer'

export const prefetch = 'allow-runtime'

type Props = {
	params: Promise<{ slug: string }>
}

export function generateStaticParams() {
	return getAvailableTools().map(tool => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const tool = getToolBySlug(slug)
	if (!tool) return {}
	return createPageMetadata({
		title: tool.name,
		description: tool.description,
		canonical: `/tools/${tool.slug}`,
		keywords: tool.keywords
	})
}

export default async function Page({ params }: Props) {
	const { slug } = await params
	const tool = getToolBySlug(slug)
	if (!tool || tool.status !== 'available') notFound()

	return (
		<div className="px-4 md:px-5 flex flex-col gap-4">
			<header className="flex flex-col gap-2">
				<Link
					href="/tools"
					className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ArrowLeft aria-hidden className="size-3" />
					All tools
				</Link>
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-lg font-semibold text-foreground">
						{tool.name}
					</h1>
					<ToolCategoryBadge category={tool.category} />
				</div>
				<p className="text-sm text-muted-foreground max-w-prose">
					{tool.description}
				</p>
			</header>

			<ToolQuickNav currentSlug={tool.slug} />

			<ToolRenderer slug={tool.slug as TToolSlug} />
		</div>
	)
}
