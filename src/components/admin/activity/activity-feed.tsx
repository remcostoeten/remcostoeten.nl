'use client'

import { useState, useMemo } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { ChevronDown, Mail, MessageSquare } from 'lucide-react'

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
	actor: string
	preview: string
	timestamp: Date
	slug?: string
}

const INITIAL_COUNT = 5
const DAY_MS = 24 * 60 * 60 * 1000

function formatRelativeTime(date: Date): string {
	const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
	const diffHours = Math.floor(diffMinutes / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffMinutes < 1) return 'just now'
	if (diffMinutes < 60) return `${diffMinutes} minutes ago`
	if (diffHours < 24) return `${diffHours} hours ago`
	if (diffDays < 7) return `${diffDays} days ago`
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
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
		const items: ActivityItem[] = [
			...comments.map(
				(c): ActivityItem => ({
					type: 'comment',
					id: `comment-${c.id}`,
					actor: c.userName || 'Anonymous',
					preview: c.content,
					timestamp: new Date(c.createdAt),
					slug: c.slug
				})
			),
			...submissions.map(
				(s): ActivityItem => ({
					type: 'contact',
					id: `contact-${s.id}`,
					actor: s.name,
					preview: s.message,
					timestamp: new Date(s.createdAt)
				})
			)
		]

		items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
		return items
	}, [comments, submissions])

	const visibleItems = showAll
		? activityItems
		: activityItems.slice(0, INITIAL_COUNT)

	return (
		<section className="admin-panel">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Recent activity</h2>
				<span className="admin-live-dot" aria-hidden="true" />
			</div>

			{visibleItems.length === 0 && (
				<p className="px-5 pb-6 text-center text-[13px] text-muted-foreground">
					No recent activity
				</p>
			)}

			<ul>
				{visibleItems.map(item => {
					const isNew = Date.now() - item.timestamp.getTime() < DAY_MS
					const Icon = item.type === 'comment' ? MessageSquare : Mail
					return (
						<li
							key={item.id}
							className="flex gap-3 border-t border-border/60 px-5 py-4"
						>
							<span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
								<Icon className="size-3.5" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="flex items-center gap-2 text-[13px] font-medium">
									{item.type === 'comment'
										? 'New comment'
										: 'New message'}
									{isNew && (
										<span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--admin-success)]">
											New
										</span>
									)}
								</p>
								<p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
									{item.actor}
									{item.type === 'comment' ? (
										<>
											{' commented on '}
											<Link
												href={
													`/blog/${item.slug}` as Route
												}
												target="_blank"
												className="text-foreground/80 underline-offset-2 hover:underline"
											>
												{item.slug}
											</Link>
										</>
									) : (
										' sent a message through your contact form.'
									)}
								</p>
								<p
									className="mt-1 line-clamp-1 text-[12px] text-muted-foreground/70"
									title={item.preview}
								>
									{item.preview}
								</p>
								<p className="mt-1.5 text-[11px] text-muted-foreground/60">
									{formatRelativeTime(item.timestamp)}
								</p>
							</div>
						</li>
					)
				})}
			</ul>

			{activityItems.length > INITIAL_COUNT && (
				<button
					type="button"
					onClick={() => setShowAll(!showAll)}
					className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
				>
					{showAll ? 'Show less' : 'View all activity'}
					<ChevronDown
						className={`size-3 transition-transform ${showAll ? 'rotate-180' : ''}`}
					/>
				</button>
			)}
		</section>
	)
}
