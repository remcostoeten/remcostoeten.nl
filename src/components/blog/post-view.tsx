'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { trackBlogView } from '@/server/actions/blog/analytics'
import { getDateParts, readMinutes } from '@/features/blog/lib/format'
import { slugifyTopic } from '@/features/blog/lib/topic-slug'

type BlogPost = {
	metadata: {
		title: string
		publishedAt: string
		summary: string
		tags?: string[]
	}
	slug: string
}

type Props = {
	publishedAt: string
	topic?: string
	tags?: string[]
	title: string
	summary: string
	readTime: string
	slug: string
	uniqueViews?: number
	totalViews?: number
}

function formatViews(count: number) {
	return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(count)
}

export function BlogPostClient({
	publishedAt,
	topic,
	tags,
	title,
	summary,
	readTime,
	slug,
	uniqueViews = 0,
	totalViews = 0
}: Props) {
	const router = useRouter()
	const dateParts = getDateParts(publishedAt)
	const readTimeMinutes = readMinutes(readTime)
	const visibleTags = (tags || []).filter(
		tag => tag.toLowerCase() !== topic?.toLowerCase()
	)

	useEffect(() => {
		if (slug) {
			trackBlogView(slug)
		}
	}, [slug])

	return (
		<header className="space-y-5">
			<button
				onClick={() => router.back()}
				className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
				back
			</button>

			<div className="space-y-3">
				{topic && (
					<Link
						href={`/blog/topics/${slugifyTopic(topic)}`}
						className="inline-block font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
					>
						{topic}
					</Link>
				)}
				<h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
					{title}
				</h1>
				{summary && (
					<p className="text-pretty text-base leading-relaxed text-muted-foreground">
						{summary}
					</p>
				)}
			</div>

			<div className="space-y-1.5 font-mono text-xs text-muted-foreground/70">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<time dateTime={publishedAt} className="tabular-nums">
						{dateParts.day} {dateParts.month} {dateParts.year}
					</time>
					<span aria-hidden="true">·</span>
					<span>{readTimeMinutes} min read</span>
					{uniqueViews > 0 && (
						<>
							<span aria-hidden="true">·</span>
							<span
								className="tabular-nums"
								title={`${totalViews} total views`}
							>
								{formatViews(uniqueViews)} views
							</span>
						</>
					)}
				</div>
				{visibleTags.length > 0 && (
					<div className="flex flex-wrap gap-x-2 gap-y-1">
						{visibleTags.map(tag => (
							<span key={tag}>#{tag.toLowerCase()}</span>
						))}
					</div>
				)}
			</div>
		</header>
	)
}

type PostNavigationProps = {
	prevPost: BlogPost | null
	nextPost: BlogPost | null
	basePath?: string
}

export function PostNavigation({
	prevPost,
	nextPost,
	basePath = '/blog'
}: PostNavigationProps) {
	if (!prevPost && !nextPost) return null

	return (
		<nav
			aria-label="Adjacent posts"
			className="mt-16 grid grid-cols-1 gap-3 border-t border-border/60 pt-8 sm:grid-cols-2"
		>
			{prevPost ? (
				<Link
					href={`${basePath}/${prevPost.slug}` as Route}
					prefetch
					className="group flex flex-col gap-1.5 rounded-md border border-border/60 p-4 transition-colors hover:border-border hover:bg-muted/40"
				>
					<span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
						<ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
						Previous
					</span>
					<span className="line-clamp-2 text-sm font-medium text-foreground">
						{prevPost.metadata.title}
					</span>
				</Link>
			) : (
				<div />
			)}

			{nextPost ? (
				<Link
					href={`${basePath}/${nextPost.slug}` as Route}
					prefetch
					className="group flex flex-col gap-1.5 rounded-md border border-border/60 p-4 text-right transition-colors hover:border-border hover:bg-muted/40"
				>
					<span className="inline-flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
						Next
						<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
					</span>
					<span className="line-clamp-2 text-sm font-medium text-foreground">
						{nextPost.metadata.title}
					</span>
				</Link>
			) : (
				<div />
			)}
		</nav>
	)
}
