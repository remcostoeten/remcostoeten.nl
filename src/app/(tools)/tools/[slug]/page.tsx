import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cacheLife } from 'next/cache'
import type { Metadata } from 'next'
import { createPageMetadata } from '@/core/metadata/base'
import { baseUrl } from '@/core/config/site'
import {
	BreadcrumbStructuredData,
	ToolStructuredData
} from '@/components/seo/structured-data'
import {
	getAvailableTools,
	getToolBySlug
} from '@/features/miscellaneous/constants/tools'
import { getToolSeoContent } from '@/features/miscellaneous/constants/tool-seo'
import type { TToolSlug } from '@/features/miscellaneous/constants/tools'
import { ToolCategoryBadge } from '@/features/miscellaneous/components/tool-category-badge'
import { ToolQuickNav } from '@/features/miscellaneous/components/tool-quick-nav'
import { ToolRenderer } from '@/features/miscellaneous/components/tool-renderer'
import { ToolSeoContent } from '@/features/miscellaneous/components/tool-seo-content'

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
	const seo = getToolSeoContent(slug)
	return createPageMetadata({
		title: seo?.metaTitle ?? tool.name,
		description: seo?.metaDescription ?? tool.description,
		canonical: `/tools/${tool.slug}`,
		keywords: tool.keywords,
		image: `${baseUrl}/tools/${tool.slug}/og`
	})
}

async function ToolPage({ params }: Props) {
	'use cache'
	cacheLife('max')
	const { slug } = await params
	const tool = getToolBySlug(slug)
	if (!tool || tool.status !== 'available') notFound()
	const seo = getToolSeoContent(slug)

	return (
		<div className="px-4 md:px-5 flex flex-col gap-4">
			<ToolStructuredData
				name={tool.name}
				description={seo?.metaDescription ?? tool.description}
				slug={tool.slug}
				category={tool.category}
				keywords={tool.keywords}
				updatedAt={tool.updatedAt}
				featureList={seo?.highlights}
			/>
			<BreadcrumbStructuredData
				items={[
					{ name: 'Home', url: '/' },
					{ name: 'Tools', url: '/tools' },
					{ name: tool.name, url: `/tools/${tool.slug}` }
				]}
			/>
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

			{seo ? <ToolSeoContent name={tool.name} content={seo} /> : null}
		</div>
	)
}

export default ToolPage
