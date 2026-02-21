'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, EyeOff } from 'lucide-react'

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

function MinimalPostRow({ post }: Props) {
	const dateParts = getDateParts(post.metadata.publishedAt)
	const viewCount = post.uniqueViews || 0

	return (
		<li className="group py-3 first:pt-0 last:pb-0">
			<Link
				href={`/blog/${post.slug}`}
				className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 justify-between group-hover:bg-muted/50 -mx-4 px-4 py-2 rounded-md transition-colors"
			>
				<div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 min-w-0 flex-1">
					<span className="shrink-0 font-mono text-xs text-muted-foreground w-24 tabular-nums">
						{dateParts.year}-{dateParts.month}-{dateParts.day}
					</span>
					
					<div className="min-w-0 flex-1">
						<h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
							{post.metadata.title}
							{post.metadata.draft && (
								<span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
									DRAFT
								</span>
							)}
						</h3>
						{(post.metadata.summary) && (
							<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
								{post.metadata.summary}
							</p>
						)}
					</div>
				</div>

				<div className="shrink-0 flex items-center gap-4 text-xs text-muted-foreground font-mono">
					<span className="hidden sm:inline-block">
						{readMinutes(post.metadata.readTime || '')}m read
					</span>
					{viewCount > 0 && (
						<span className="hidden sm:inline-block tabular-nums w-12 text-right">
							{viewCount.toLocaleString()}
						</span>
					)}
					<ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
				</div>
			</Link>
		</li>
	)
}



type BlogPostsProps = {
	posts: BlogPost[]
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
				<div className="mb-4 flex items-center gap-2 px-2 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
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

			<ul className="flex flex-col m-0 p-0 list-none" role="list">
				{displayedBlogs.map((post, index) => (
					<MinimalPostRow key={post.slug} post={post} index={index} />
				))}
			</ul>

			{filteredPosts.length === 0 && (
				<div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
					<p className="text-sm">
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
				<div className="mt-8 flex justify-end">
					<button
						onClick={() => setShowAll(!showAll)}
						className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
					>
						{showAll ? 'Show less posts' : 'View all posts'}
						<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
					</button>
				</div>
			)}
		</div>
	)
}
