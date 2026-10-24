'use client'

import { useState } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { AnimatedMailIcon } from '@/components/animated-icons/icons/mail'
import { EmptyState } from '@/components/home/empty-state/empty-state'
import { InboxIllustration } from '@/components/home/empty-state/illustrations'

type ContactStats = {
	submissions: ContactSubmission[]
	interactions: ContactTimelineEntry[]
	abandonments: ContactTimelineEntry[]
}

type ContactTimelineEntry = {
	id: string
}

type ContactSubmission = ContactTimelineEntry & {
	name: string
	email: string
	message: string
	createdAt: string | Date
	readAt: Date | null
}

const INITIAL_COUNT = 1

function StatCell({
	value,
	label,
	tone
}: {
	value: number
	label: string
	tone?: 'success'
}) {
	return (
		<div className="space-y-1.5">
			<span className="admin-metric-value block text-[24px]">
				{value}
			</span>
			<span className="flex items-center gap-1.5 admin-text-xs text-muted-foreground">
				{tone === 'success' && (
					<span className="size-1.5 rounded-full bg-[color:var(--admin-success)]" />
				)}
				{label}
			</span>
		</div>
	)
}

export function ContactOverview({ data }: { data: ContactStats }) {
	const [showAll, setShowAll] = useState(false)
	const visible = showAll
		? data.submissions.slice(0, 10)
		: data.submissions.slice(0, INITIAL_COUNT)

	return (
		<section className="admin-panel h-full">
			<div className="admin-panel-header items-center">
				<h2 className="admin-panel-title">Contact activity</h2>
				<AnimatedMailIcon className="size-4 text-muted-foreground" />
			</div>

			<div className="grid grid-cols-3 gap-4 px-5 pb-5">
				<StatCell
					value={data.submissions.length}
					label="Submitted"
					tone="success"
				/>
				<StatCell value={data.abandonments.length} label="Abandoned" />
				<StatCell
					value={data.interactions.length}
					label="Form clicks"
				/>
			</div>

			<div className="border-t border-border px-5 py-4">
				<div className="mb-3 flex items-center justify-between">
					<p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
						{showAll ? 'Latest messages' : 'Latest message'}
					</p>
					<div className="flex items-center gap-3">
						{data.submissions.length > INITIAL_COUNT && (
							<button
								type="button"
								onClick={() => setShowAll(!showAll)}
								className="admin-text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								{showAll ? 'Show less' : 'Show more'}
							</button>
						)}
						<Link
							href="/admin/messages"
							className="admin-text-xs text-foreground transition-colors hover:text-muted-foreground"
						>
							Open inbox
						</Link>
					</div>
				</div>

				{data.submissions.length === 0 && (
					<EmptyState
						title="No messages yet"
						description="Contact form submissions appear here."
						illustration={<InboxIllustration />}
						headingLevel="h3"
					/>
				)}

				<div className="space-y-2">
					{visible.map(sub => {
						const createdAt = new Date(sub.createdAt)
						const isNew = sub.readAt === null
						return (
							<Link
								key={sub.id}
								href={`/admin/messages?id=${sub.id}` as Route}
								className="block rounded-md border border-border bg-background p-4 transition-colors hover:bg-secondary/40"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex min-w-0 items-center gap-2">
										<p className="truncate admin-text-sm font-medium">
											{sub.name}
										</p>
										{isNew && (
											<span
												className="admin-pill h-5"
												data-tone="success"
											>
												New
											</span>
										)}
									</div>
									<time
										dateTime={createdAt.toISOString()}
										className="shrink-0 admin-text-xs text-muted-foreground"
									>
										{createdAt.toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</time>
								</div>
								<p className="mt-0.5 truncate admin-text-xs text-muted-foreground">
									{sub.email}
								</p>
								<p className="mt-2 line-clamp-3 admin-text-xs leading-relaxed text-foreground/80">
									{sub.message}
								</p>
							</Link>
						)
					})}
				</div>
			</div>
		</section>
	)
}
