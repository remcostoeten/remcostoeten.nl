'use client'

import { useState, useMemo, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
	Eye,
	Clock,
	Calendar,
	ExternalLink,
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	FileText,
	TrendingUp,
	Loader2
} from 'lucide-react'
import { toggleBlogDraft } from '@/actions/admin'

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

function BlogCard({ post }: { post: BlogPost }) {
	const [isDraft, setIsDraft] = useState(post.metadata.draft ?? false)
	const [isPending, startTransition] = useTransition()

	const isNew =
		new Date(post.metadata.publishedAt) >
		new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

	function handleToggleDraft() {
	function handleToggleDraft() {
		startTransition(async () => {
			try {
				const result = await toggleBlogDraft(post.slug)
				setIsDraft(result.draft)
			} catch (error) {
				console.error('Failed to toggle draft:', error)
				// Consider adding user-visible error feedback (e.g., toast notification)
			}
		})
	}
	}

	return (
		<Card className="group hover:border-primary/30 transition-colors">
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<button
								onClick={handleToggleDraft}
								disabled={isPending}
								title={isDraft ? 'Click to publish' : 'Click to unpublish'}
							>
								<Badge
									variant={isDraft ? 'secondary' : 'default'}
									className={`text-[10px] cursor-pointer transition-opacity ${isPending ? 'opacity-50' : 'hover:opacity-80'}`}
								>
									{isPending ? (
										<Loader2 className="w-3 h-3 animate-spin mr-1" />
									) : null}
									{isDraft ? 'Draft' : 'Published'}
								</Badge>
							</button>
							{isNew && !isDraft && (
								<Badge
									variant="outline"
									className="text-[10px] border-green-500 text-green-600"
								>
									New
								</Badge>
							)}
						</div>
						<h3
							className="font-medium text-sm truncate"
							title={post.metadata.title}
						>
							{post.metadata.title}
						</h3>
						<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								<Calendar className="w-3 h-3" />
								{new Date(
									post.metadata.publishedAt
								).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric'
								})}
							</span>
							<span className="flex items-center gap-1">
								<Clock className="w-3 h-3" />
								{post.metadata.readTime || 'N/A'}
							</span>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<div className="text-right">
							<div className="flex items-center gap-1 text-sm font-semibold">
								<Eye className="w-3 h-3 text-muted-foreground" />
								{post.totalViews}
							</div>
							<div className="text-[10px] text-muted-foreground">
								{post.uniqueViews} unique
							</div>
						</div>
						<Link
							href={`/blog/${post.slug}`}
							target="_blank"
							className="p-1.5 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
						>
							<ExternalLink className="w-3.5 h-3.5" />
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

function SortButton({
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
	return (
		<button
			onClick={() => onSort(field)}
			className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
				isActive
					? 'bg-primary/10 text-primary'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted'
			}`}
		>
			{children}
			{isActive ? (
				direction === 'asc' ? (
					<ArrowUp className="w-3 h-3" />
				) : (
					<ArrowDown className="w-3 h-3" />
				)
			) : (
				<ArrowUpDown className="w-3 h-3 opacity-50" />
			)}
		</button>
	)
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
	const [search, setSearch] = useState('')
	const [sortField, setSortField] = useState<SortField>('views')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

	const handleSort = (field: SortField) => {
		if (field === sortField) {
			setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortField(field)
			setSortDirection('desc')
		}
	}

	const filteredAndSortedPosts = useMemo(() => {
		let result = [...posts]

		if (search) {
			const searchLower = search.toLowerCase()
			result = result.filter(
				post =>
					post.metadata.title.toLowerCase().includes(searchLower) ||
					post.slug.toLowerCase().includes(searchLower)
			)
		}

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
	}, [posts, search, sortField, sortDirection])

	const totalViews = posts.reduce((sum, p) => sum + p.totalViews, 0)
	const publishedCount = posts.filter(p => !p.metadata.draft).length

	return (
		<Card>
			<CardHeader className="pb-4">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<FileText className="w-5 h-5 text-muted-foreground" />
						<div>
							<CardTitle className="text-lg">
								Blog Posts
							</CardTitle>
							<p className="text-xs text-muted-foreground mt-0.5">
								{publishedCount} published ·{' '}
								{totalViews.toLocaleString()} total views
							</p>
						</div>
					</div>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search posts..."
							value={search}
							onChange={e => setSearch(e.target.value)}
							className="pl-9 h-9 w-full md:w-[200px]"
						/>
					</div>
				</div>
				<div className="flex items-center gap-2 mt-3">
					<span className="text-xs text-muted-foreground">Sort:</span>
					<SortButton
						field="views"
						currentField={sortField}
						direction={sortDirection}
						onSort={handleSort}
					>
						<TrendingUp className="w-3 h-3" /> Views
					</SortButton>
					<SortButton
						field="date"
						currentField={sortField}
						direction={sortDirection}
						onSort={handleSort}
					>
						<Calendar className="w-3 h-3" /> Date
					</SortButton>
					<SortButton
						field="title"
						currentField={sortField}
						direction={sortDirection}
						onSort={handleSort}
					>
						<FileText className="w-3 h-3" /> Title
					</SortButton>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{filteredAndSortedPosts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						{search
							? `No posts matching "${search}"`
							: 'No posts yet'}
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{filteredAndSortedPosts.map(post => (
							<BlogCard key={post.slug} post={post} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
