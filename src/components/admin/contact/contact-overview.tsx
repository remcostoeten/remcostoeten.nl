'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

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
}

const DAY_MS = 24 * 60 * 60 * 1000
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
			<span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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
				<Mail className="size-4 text-muted-foreground" />
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
					{data.submissions.length > INITIAL_COUNT && (
						<button
							type="button"
							onClick={() => setShowAll(!showAll)}
							className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
						>
							{showAll ? 'Show less' : 'Show more'}
						</button>
					)}
				</div>

				{data.submissions.length === 0 && (
					<p className="py-6 text-center text-[13px] text-muted-foreground">
						No messages yet
					</p>
				)}

				<div className="space-y-2">
					{visible.map(sub => {
						const createdAt = new Date(sub.createdAt)
						const isNew = Date.now() - createdAt.getTime() < DAY_MS
						return (
							<article
								key={sub.id}
								className="rounded-md border border-border bg-background p-4"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex min-w-0 items-center gap-2">
										<p className="truncate text-[13px] font-medium">
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
										className="shrink-0 text-[11px] text-muted-foreground"
									>
										{createdAt.toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</time>
								</div>
								<a
									href={`mailto:${sub.email}`}
									className="mt-0.5 block truncate text-[11px] text-muted-foreground hover:text-foreground"
								>
									{sub.email}
								</a>
								<p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-foreground/80">
									{sub.message}
								</p>
							</article>
						)
					})}
				</div>
			</div>
		</section>
	)
}
