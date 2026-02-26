'use client'

import { useState, useMemo, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
        <div className="flex items-center gap-2">
            <Switch
                checked={!isDraft}
                onCheckedChange={handleToggleDraft}
                disabled={isPending}
                className="scale-75 data-[state=checked]:bg-emerald-500"
            />
            {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : (
                <span className={`text-xs ${isDraft ? 'text-amber-400/80' : 'text-emerald-400/80'}`}>
                    {isDraft ? 'Draft' : 'Live'}
                </span>
            )}
        </div>
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
    return (
        <button
            onClick={() => onSort(field)}
            className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors ${isActive
                    ? 'text-[hsl(var(--brand-400))]'
                    : 'text-muted-foreground hover:text-foreground'
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
                <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
        </button>
    )
}

export function BlogTable({ posts }: { posts: BlogPost[] }) {
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
                    comparison = a.metadata.title.localeCompare(b.metadata.title)
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
    const draftCount = posts.filter(p => p.metadata.draft).length

    return (
        <div className="admin-glass-card">
            <div className="p-4 border-b border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <h3 className="text-sm font-semibold tracking-tight">
                                Blog Posts
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {publishedCount} published · {draftCount} drafts · {totalViews.toLocaleString()} views
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search posts..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 h-8 w-full sm:w-[200px] bg-background/50 border-border/40 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/20">
                            <th className="text-left px-4 py-3 w-24">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>
                            </th>
                            <th className="text-left px-4 py-3">
                                <SortableHeader field="title" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                                    Title
                                </SortableHeader>
                            </th>
                            <th className="text-left px-4 py-3 hidden md:table-cell">
                                <SortableHeader field="date" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                                    Date
                                </SortableHeader>
                            </th>
                            <th className="text-left px-4 py-3 hidden lg:table-cell">
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Read Time</span>
                            </th>
                            <th className="text-right px-4 py-3">
                                <SortableHeader field="views" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                                    Views
                                </SortableHeader>
                            </th>
                            <th className="text-right px-4 py-3 w-12" />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedPosts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    {search ? `No posts matching "${search}"` : 'No posts yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedPosts.map(post => {
                                const isNew =
                                    new Date(post.metadata.publishedAt) >
                                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                return (
                                    <tr
                                        key={post.slug}
                                        className="admin-table-row border-b border-border/10 last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <StatusCell post={post} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium truncate max-w-[300px]">
                                                    {post.metadata.title}
                                                </span>
                                                {isNew && !(post.metadata.draft) && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] border-emerald-500/30 text-emerald-400 px-1.5 py-0"
                                                    >
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.metadata.readTime || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="text-sm font-semibold tabular-nums">
                                                {post.totalViews.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {post.uniqueViews.toLocaleString()} unique
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-1.5 rounded-sm hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100 inline-flex"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
