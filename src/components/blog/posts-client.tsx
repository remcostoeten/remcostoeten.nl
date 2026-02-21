'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, EyeOff } from 'lucide-react'

import { getDateParts, readMinutes } from '@/lib/blog-format'
import { useBlogFilter } from '@/hooks/use-blog-filter'

export function PostCountHeader({ count }: { count: number }) {
	return (
		<span className="text-muted-foreground/60 inline-flex items-baseline gap-1">
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
		categories?: string[]
		tags?: string[]
		topics?: string[]
		readTime?: string
		draft?: boolean
	}
	slug: string
	views?: number
	uniqueViews?: number
}

type Props = {
	post: BlogPost
	index: number
}

function BlogCard({ post }: Props) {
	const dateParts = getDateParts(post.metadata.publishedAt)
	const readTimeMinutes = readMinutes(post.metadata.readTime || '')

	const allTags = [
		...(post.metadata.categories || []),
		...(post.metadata.tags || []),
		...(post.metadata.topics || [])
	]

	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group flex items-center justify-between gap-2 sm:gap-4 bg-card px-2 sm:px-3 py-2.5 border-b border-border transition-colors hover:bg-muted/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
		>
			<div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
						{post.metadata.draft && (
							<span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold px-1 py-px bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
								Draft
							</span>
						)}
						<span className="text-xs font-medium text-foreground group-hover:text-foreground truncate">
							{post.metadata.title}
						</span>
						<span className="hidden md:inline text-xs text-muted-foreground truncate max-w-[280px] lg:max-w-none">
							{post.metadata.summary && (
								<>— {post.metadata.summary.length > 60
									? `${post.metadata.summary.slice(0, 60)}...`
									: post.metadata.summary}</>
							)}
						</span>
					</div>

					<div className="flex items-center gap-2 mt-1 sm:mt-0.5">
						<span className="text-[10px] text-muted-foreground/40 font-mono tabular-nums whitespace-nowrap">
							{dateParts.day} {dateParts.month.slice(0, 3)} {dateParts.year}
						</span>

						{readTimeMinutes > 0 && (
							<>
								<span className="text-muted-foreground/20">·</span>
								<span className="text-[10px] text-muted-foreground/40 whitespace-nowrap">
									{readTimeMinutes} min
								</span>
							</>
						)}

						{typeof post.uniqueViews === 'number' && post.uniqueViews > 0 && (
							<>
								<span className="text-muted-foreground/20">·</span>
								<span
									className="text-[10px] text-muted-foreground/40 whitespace-nowrap"
									title={`${post.views} total views`}
								>
									{post.uniqueViews} views
								</span>
							</>
						)}

						{allTags.length > 0 && (
							<div className="hidden sm:flex gap-1 ml-1">
								{allTags.slice(0, 3).map(tag => (
									<span
										key={tag}
										className="bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground whitespace-nowrap shrink-0"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<ArrowUpRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
		</Link>
	)
}

type BlogPostsProps = {
	posts: BlogPost[]
}

function BlogCardSkeleton() {
	return (
		<div className="flex items-center justify-between gap-4 px-2 sm:px-3 py-2.5 border-b border-border">
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

export function BlogPostsClient({ posts }: BlogPostsProps) {
	const [showAll, setShowAll] = useState(false)
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
				<div className="mb-0 flex items-center gap-2 px-2 py-2 bg-amber-500/10 border border-amber-500/20 border-b-0 text-amber-400 text-xs font-mono">
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

			<div className="border-l border-r border-t border-border">
				{displayedBlogs.map((post, index) => (
					<BlogCard key={post.slug} post={post} index={index} />
				))}
			</div>

			{filteredPosts.length === 0 && (
				<div className="py-8 text-center text-muted-foreground border border-border">
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
				<div className="border-l border-r border-b border-border">
					<button
						onClick={() => setShowAll(!showAll)}
						className="flex w-full px-2 py-2 text-xs text-muted-foreground transition-all duration-300 hover:text-foreground sm:px-3"
					>
						{showAll ? 'Show less' : `View all (${filteredPosts.length})`}
					</button>
				</div>
			)}
		</div>
	)
}

export { BlogCardSkeleton }
