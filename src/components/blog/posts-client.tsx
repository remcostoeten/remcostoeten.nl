'use client'

import Link from 'next/link'
import { useState } from 'react'
import { EyeOff, ArrowUpRight } from 'lucide-react'
import { getDateParts, readMinutes } from '@/features/blog/lib/format'
import { useBlogFilter } from '@/hooks/use-blog-filter'

export function PostCountHeader({ count }: { count: number }) {
	return (
		<span className="text-xs text-muted-foreground/60 inline-flex items-baseline gap-1">
			{count}
			<span>posts</span>
		</span>
	)
}

type BlogPost = {
	metadata: {
		title: string
		publishedAt: string
		summary: string
		topic?: string
		tags?: string[]
		readTime?: string
		draft?: boolean
	}
	slug: string
	views?: number
	uniqueViews?: number
}

type Props = {
	post: BlogPost
	isAdmin?: boolean
}

function getPostHref(post: BlogPost, isAdmin: boolean) {
	if (isAdmin && post.metadata.draft) {
		return `/admin/blog/${post.slug}`
	}

	return `/blog/${post.slug}`
}

function BlogCard({ post, isAdmin = false }: Props) {
	const dateParts = getDateParts(post.metadata.publishedAt)
	const readTimeMinutes = readMinutes(post.metadata.readTime || '')

	const allTags = [
		...(post.metadata.topic ? [post.metadata.topic] : []),
		...(post.metadata.tags || [])
	].filter((tag, index, arr) => arr.indexOf(tag) === index)

	return (
		<Link
			href={getPostHref(post, isAdmin)}
			className="group -mx-4 flex items-start justify-between gap-4 border-b border-border/40 px-4 py-5 transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary last:border-b-0 md:-mx-5 md:px-5"
		>
			<div className="min-w-0 flex-1">
				<div className="flex flex-col gap-2 min-w-0">
					<div className="flex items-start gap-2 min-w-0">
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 min-w-0">
								{post.metadata.draft && (
									<span className="mt-0.5 shrink-0 border border-amber-500/20 bg-amber-500/10 px-1 py-px text-[8px] font-bold uppercase tracking-wider text-amber-500">
										Draft
									</span>
								)}
								<span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
									{post.metadata.title}
								</span>
							</div>
							{post.metadata.summary && (
								<p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/85">
									{post.metadata.summary}
								</p>
							)}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground/50">
						<span className="font-mono tabular-nums whitespace-nowrap">
							{dateParts.day} {dateParts.month.slice(0, 3)}{' '}
							{dateParts.year}
						</span>

						{readTimeMinutes > 0 && (
							<>
								<span className="text-muted-foreground/20">
									·
								</span>
								<span className="whitespace-nowrap">
									{readTimeMinutes} min read
								</span>
							</>
						)}

						{typeof post.uniqueViews === 'number' &&
							post.uniqueViews > 0 && (
								<>
									<span className="text-muted-foreground/20">
										·
									</span>
									<span
										className="whitespace-nowrap"
										title={`${post.views} total views`}
									>
										{post.uniqueViews} views
									</span>
								</>
							)}

						{allTags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 sm:ml-1">
								{allTags.slice(0, 3).map(tag => (
									<span
										key={tag}
										className="border border-border/50 bg-secondary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-foreground/80"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="pt-1">
				<ArrowUpRight className="blog-card-icon h-3 w-3 shrink-0 text-muted-foreground/30 transition-transform transition-colors duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:text-foreground motion-reduce:transform-none" />
			</div>
		</Link>
	)
}

type BlogPostsProps = {
	posts: BlogPost[]
	isAdmin?: boolean
}

function BlogCardSkeleton() {
	return (
		<div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/40">
			<div className="flex-1 min-w-0 space-y-1.5">
				<div className="flex items-center gap-2">
					<div className="h-3.5 w-40 bg-muted/20 animate-pulse" />
					<div className="hidden md:block h-3.5 w-48 bg-muted/10 animate-pulse" />
				</div>
				<div className="flex items-center gap-2">
					<div className="h-3 w-20 bg-muted/15 animate-pulse" />
					<div className="h-3 w-12 bg-muted/15 animate-pulse" />
				</div>
			</div>
			<div className="h-3 w-3 bg-muted/10 animate-pulse" />
		</div>
	)
}

export function BlogPostsClient({
	posts,
	isAdmin = false
}: BlogPostsProps) {
	const [showAll, setShowAll] = useState(true)
	const { filter, setFilter } = useBlogFilter()

	const filteredPosts = posts.filter(post => {
		if (filter === 'all') return true
		if (filter === 'drafts') return post.metadata.draft === true
		if (filter === 'published') return !post.metadata.draft
		return true
	})

	const displayedBlogs = showAll ? filteredPosts : filteredPosts.slice(0, 3)
	const hasMorePosts = filteredPosts.length > 3

	return (
		<div>
			{filter !== 'all' && (
				<div className="mb-3 flex items-center gap-2 border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-mono text-amber-400">
					<EyeOff className="w-3 h-3" />
					<span>
						Filtering: showing{' '}
						{filter === 'drafts' ? 'drafts only' : 'published only'}
					</span>
					<button
						onClick={() => setFilter('all')}
						className="ml-auto px-2 py-0.5 hover:bg-amber-500/20 transition-colors"
					>
						Clear (:show all)
					</button>
				</div>
			)}

			<div className="border-b border-border/40">
				{displayedBlogs.map(post => (
					<BlogCard key={post.slug} post={post} isAdmin={isAdmin} />
				))}
			</div>

			{filteredPosts.length === 0 && (
				<div className="border border-border/40 py-8 text-center text-muted-foreground">
					<p className="text-xs">
						No posts match the current filter.
					</p>
					<button
						onClick={() => setFilter('all')}
						className="mt-2 text-xs text-amber-400 hover:underline"
					>
						:show all
					</button>
				</div>
			)}

			{hasMorePosts && (
				<div>
					<button
						onClick={() => setShowAll(!showAll)}
						className="flex w-full items-center justify-center py-4 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
					>
						{showAll
							? 'Show less'
							: `View all (${filteredPosts.length})`}
					</button>
				</div>
			)}
		</div>
	)
}

export { BlogCardSkeleton }
