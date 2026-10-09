'use client'

import { useState, useMemo, useTransition } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import {
	ArrowDown,
	ArrowUp,
	ChevronLeft,
	ChevronRight,
	Clock,
	ExternalLink,
	Loader2,
	Search
} from 'lucide-react'
import { toggleBlogDraft } from '@/server/actions/admin'

type BlogPost = {
	slug: string
	metadata: {
		title: string
		publishedAt: string
		draft?: boolean
		readTime?: string
	}
	totalViews: number
	uniqueViews: number
}

type SortField = 'title' | 'date' | 'views'
type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'published' | 'drafts'

const PAGE_SIZE = 8

const filters: Array<{ id: StatusFilter; label: string }> = [
	{ id: 'all', label: 'All posts' },
	{ id: 'published', label: 'Published' },
	{ id: 'drafts', label: 'Drafts' }
]

function getPostHref(post: BlogPost) {
	return post.metadata.draft
		? `/admin/blog/${post.slug}`
		: `/blog/${post.slug}`
}

function StatusCell({ post }: { post: BlogPost }) {
	const [isDraft, setIsDraft] = useState(post.metadata.draft ?? false)
	const [isPending, startTransition] = useTransition()

	function handleToggleDraft() {
		startTransition(async () => {
			try {
				const result = await toggleBlogDraft(post.slug)
				if (result.success) {
					setIsDraft(result.draft)
				}
			} catch (error) {
				console.error('Failed to toggle draft:', error)
			}
		})
	}

	return (
		<button
			type="button"
			onClick={handleToggleDraft}
			disabled={isPending}
			className="admin-pill transition-opacity hover:opacity-80 disabled:opacity-60"
			data-tone={isDraft ? undefined : 'success'}
			title={isDraft ? 'Publish this post' : 'Move back to drafts'}
		>
			{isPending && <Loader2 className="size-3 animate-spin" />}
			{isDraft ? 'Draft' : 'Published'}
		</button>
	)
}

function SortableHeader({
	field,
	currentField,
	direction,
	onSort,
	children
}: {
	field: SortField
	currentField: SortField
	direction: SortDirection
	onSort: (field: SortField) => void
	children: React.ReactNode
}) {
	const isActive = field === currentField
	const Icon = direction === 'asc' ? ArrowUp : ArrowDown
	return (
		<button
			type="button"
			onClick={() => onSort(field)}
			className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
				isActive ? 'text-foreground' : ''
			}`}
		>
			{children}
			{isActive && <Icon className="size-3" />}
		</button>
	)
}

export function BlogTable({ posts }: { posts: BlogPost[] }) {
	const [search, setSearch] = useState('')
	const [filter, setFilter] = useState<StatusFilter>('all')
	const [page, setPage] = useState(0)
	const [sortField, setSortField] = useState<SortField>('views')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

	function handleSort(field: SortField) {
		if (field === sortField) {
			setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortField(field)
			setSortDirection('desc')
		}
		setPage(0)
	}

	const filteredAndSortedPosts = useMemo(() => {
		const searchLower = search.toLowerCase()
		const result = posts.filter(post => {
			if (filter === 'published' && post.metadata.draft) return false
			if (filter === 'drafts' && !post.metadata.draft) return false
			if (!searchLower) return true
			return (
				post.metadata.title.toLowerCase().includes(searchLower) ||
				post.slug.toLowerCase().includes(searchLower)
			)
		})

		result.sort((a, b) => {
			let comparison = 0
			switch (sortField) {
				case 'title':
					comparison = a.metadata.title.localeCompare(
						b.metadata.title
					)
					break
				case 'date':
					comparison =
						new Date(a.metadata.publishedAt).getTime() -
						new Date(b.metadata.publishedAt).getTime()
					break
				case 'views':
					comparison = a.totalViews - b.totalViews
					break
			}
			return sortDirection === 'asc' ? comparison : -comparison
		})

		return result
	}, [posts, search, filter, sortField, sortDirection])

	const pageCount = Math.max(
		1,
		Math.ceil(filteredAndSortedPosts.length / PAGE_SIZE)
	)
	const currentPage = Math.min(page, pageCount - 1)
	const pageStart = currentPage * PAGE_SIZE
	const visiblePosts = filteredAndSortedPosts.slice(
		pageStart,
		pageStart + PAGE_SIZE
	)

	return (
		<section className="admin-panel">
			<div className="admin-panel-header pb-4">
				<div>
					<h2 className="admin-panel-title">
						Blog posts
						<span className="ml-2 text-[13px] font-normal text-muted-foreground">
							{posts.length}
						</span>
					</h2>
					<p className="mt-1 text-[12px] text-muted-foreground">
						Your ideas, published and in progress.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 px-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="admin-segment" role="tablist">
					{filters.map(item => (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={filter === item.id}
							data-active={filter === item.id}
							onClick={() => {
								setFilter(item.id)
								setPage(0)
							}}
							className="admin-segment-item"
						>
							{item.label}
						</button>
					))}
				</div>
				<label className="relative block">
					<span className="sr-only">Search posts</span>
					<Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
					<input
						type="search"
						placeholder="Search posts…"
						value={search}
						onChange={event => {
							setSearch(event.target.value)
							setPage(0)
						}}
						className="admin-field h-8 py-0 pl-8 sm:w-56"
					/>
				</label>
			</div>

			<div className="overflow-x-auto">
				<table className="admin-table">
					<thead>
						<tr>
							<th>
								<SortableHeader
									field="title"
									currentField={sortField}
									direction={sortDirection}
									onSort={handleSort}
								>
									Title
								</SortableHeader>
							</th>
							<th className="w-28">Status</th>
							<th className="hidden w-32 md:table-cell">
								<SortableHeader
									field="date"
									currentField={sortField}
									direction={sortDirection}
									onSort={handleSort}
								>
									Date
								</SortableHeader>
							</th>
							<th className="w-24 !text-right">
								<SortableHeader
									field="views"
									currentField={sortField}
									direction={sortDirection}
									onSort={handleSort}
								>
									Views
								</SortableHeader>
							</th>
							<th className="w-12" />
						</tr>
					</thead>
					<tbody>
						{visiblePosts.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="py-12 text-center text-muted-foreground"
								>
									{search
										? `No posts matching "${search}"`
										: 'No posts here yet'}
								</td>
							</tr>
						) : (
							visiblePosts.map(post => (
								<tr key={post.slug} className="group">
									<td>
										<p className="max-w-[380px] truncate text-[13px] font-medium">
											{post.metadata.title}
										</p>
										<p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
											<Clock className="size-3" />
											{post.metadata.readTime || 'N/A'}
										</p>
									</td>
									<td>
										<StatusCell post={post} />
									</td>
									<td className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
										{new Date(
											post.metadata.publishedAt
										).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										})}
									</td>
									<td
										className="text-right tabular-nums"
										title={`${post.uniqueViews.toLocaleString()} unique`}
									>
										{post.totalViews.toLocaleString()}
									</td>
									<td className="text-right">
										<Link
											href={getPostHref(post) as Route}
											target="_blank"
											aria-label={`Open ${post.metadata.title}`}
											className="admin-icon-btn size-7 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
										>
											<ExternalLink className="size-3.5" />
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
				<span>
					{filteredAndSortedPosts.length === 0
						? '0 posts'
						: `${pageStart + 1}–${pageStart + visiblePosts.length} of ${filteredAndSortedPosts.length} posts`}
				</span>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setPage(currentPage - 1)}
						disabled={currentPage === 0}
						className="admin-icon-btn size-7 disabled:pointer-events-none disabled:opacity-40"
						aria-label="Previous page"
					>
						<ChevronLeft className="size-3.5" />
					</button>
					<button
						type="button"
						onClick={() => setPage(currentPage + 1)}
						disabled={currentPage >= pageCount - 1}
						className="admin-icon-btn size-7 disabled:pointer-events-none disabled:opacity-40"
						aria-label="Next page"
					>
						<ChevronRight className="size-3.5" />
					</button>
				</div>
			</div>
		</section>
	)
}
