'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MessageSquare, Mail, ExternalLink, ChevronDown } from 'lucide-react'

type ActivityComment = {
    id: string
    slug: string
    content: string
    createdAt: string
    userName: string | null
    userImage: string | null
}

type ActivitySubmission = {
    id: string
    name: string
    email: string
    message: string
    createdAt: string | Date
}

type ActivityItem = {
    type: 'comment' | 'contact'
    id: string
    title: string
    preview: string
    timestamp: Date
    meta: string
    href?: string
}

function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityFeed({
    comments,
    submissions
}: {
    comments: ActivityComment[]
    submissions: ActivitySubmission[]
}) {
    const [showAll, setShowAll] = useState(false)

    const activityItems = useMemo(() => {
        const items: ActivityItem[] = []

        comments.forEach(c => {
            items.push({
                type: 'comment',
                id: `comment-${c.id}`,
                title: c.userName || 'Anonymous',
                preview: c.content,
                timestamp: new Date(c.createdAt),
                meta: c.slug,
                href: `/blog/${c.slug}`
            })
        })

        submissions.forEach(s => {
            items.push({
                type: 'contact',
                id: `contact-${s.id}`,
                title: s.name,
                preview: s.message,
                timestamp: new Date(s.createdAt),
                meta: s.email
            })
        })

        items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        return items
    }, [comments, submissions])

    const visibleItems = showAll ? activityItems : activityItems.slice(0, 8)

    return (
        <div className="admin-glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-tight">Recent Activity</h3>
                {activityItems.length > 8 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showAll ? 'Show less' : 'View All'}
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {visibleItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                )}
                {visibleItems.map(item => (
                    <div key={item.id} className="flex gap-3 group">
                        <div className="mt-1.5 shrink-0">
                            <span
                                className={`block w-2 h-2 rounded-full ${item.type === 'comment'
                                        ? 'bg-blue-400'
                                        : 'bg-emerald-400'
                                    }`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-sm font-medium truncate">
                                    {item.title}
                                    <span className="font-normal text-muted-foreground">
                                        {item.type === 'comment'
                                            ? ' commented on '
                                            : ' sent a message via '}
                                    </span>
                                    {item.type === 'comment' ? (
                                        <Link
                                            href={item.href!}
                                            target="_blank"
                                            className="font-medium text-[hsl(var(--brand-400))] hover:underline"
                                        >
                                            {item.meta}
                                            <ExternalLink className="w-3 h-3 inline ml-0.5 -mt-0.5" />
                                        </Link>
                                    ) : (
                                        <span className="font-medium">Contact Form</span>
                                    )}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.preview}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                {formatRelativeTime(item.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {activityItems.length > 8 && !showAll && (
                <button
                    onClick={() => setShowAll(true)}
                    className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                    Show more <ChevronDown className="w-3 h-3" />
                </button>
            )}
        </div>
    )
}
