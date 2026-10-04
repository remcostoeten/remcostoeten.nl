'use client'

import { useState, type ReactNode } from 'react'
import {
	EmptyState,
	type EmptyStatePointer
} from '@/components/empty-state/empty-state'
import {
	CalendarIllustration,
	InboxIllustration,
	OfflineIllustration,
	RecordIllustration,
	SearchIllustration,
	UploadIllustration
} from '@/components/empty-state/illustrations'

type DemoState = {
	id: string
	label: string
	title: string
	description: string
	action: string
	illustration: ReactNode
}

const states: readonly DemoState[] = [
	{
		id: 'records',
		label: 'Records',
		title: 'Your record space is empty',
		description:
			'Connect a source or upload a CSV to add your first records.',
		action: 'Connect source',
		illustration: <RecordIllustration />
	},
	{
		id: 'search',
		label: 'Search',
		title: 'No results found',
		description: 'Try a different search term or clear the filters.',
		action: 'Clear filters',
		illustration: <SearchIllustration />
	},
	{
		id: 'inbox',
		label: 'Inbox',
		title: "You're all caught up",
		description: 'New notifications will land here.',
		action: 'Open settings',
		illustration: <InboxIllustration />
	},
	{
		id: 'uploads',
		label: 'Uploads',
		title: 'No files uploaded',
		description: 'Drop files here or browse to upload.',
		action: 'Browse files',
		illustration: <UploadIllustration />
	},
	{
		id: 'offline',
		label: 'Offline',
		title: "You're offline",
		description:
			"Check your connection. Changes sync when you're back online.",
		action: 'Try again',
		illustration: <OfflineIllustration />
	},
	{
		id: 'calendar',
		label: 'Calendar',
		title: 'Nothing scheduled',
		description: 'Events you create or accept appear on your calendar.',
		action: 'New event',
		illustration: <CalendarIllustration />
	}
]

const pointerOptions: readonly {
	value: EmptyStatePointer | 'off'
	label: string
}[] = [
	{ value: 'tilt', label: 'Tilt' },
	{ value: 'parallax', label: 'Parallax' },
	{ value: 'off', label: 'Off' }
]

const colors = {
	background: 'hsl(var(--background))',
	foreground: 'hsl(var(--foreground))',
	muted: 'hsl(var(--muted-foreground))',
	border: 'hsl(var(--border))',
	surface: 'hsl(var(--background))'
}

const pill =
	'rounded-sm px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm'

export function EmptyStatesDemo() {
	const [stateId, setStateId] = useState(states[0].id)
	const [pointer, setPointer] = useState<EmptyStatePointer | 'off'>('tilt')
	const [loop, setLoop] = useState(true)
	const state = states.find(item => item.id === stateId) ?? states[0]

	return (
		<div className="border border-border bg-muted/20 p-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
				Live demo
			</p>
			<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
				Pick a state and move the mouse over the preview.
			</p>

			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
				<div
					className="flex flex-wrap gap-0.5 rounded-md bg-muted/60 p-0.5"
					aria-label="Empty state"
				>
					{states.map(item => (
						<button
							key={item.id}
							type="button"
							className={pill}
							aria-pressed={item.id === state.id}
							onClick={() => setStateId(item.id)}
						>
							{item.label}
						</button>
					))}
				</div>
				<div
					className="flex gap-0.5 rounded-md bg-muted/60 p-0.5"
					aria-label="Pointer motion"
				>
					{pointerOptions.map(option => (
						<button
							key={option.value}
							type="button"
							className={pill}
							aria-pressed={option.value === pointer}
							onClick={() => setPointer(option.value)}
						>
							{option.label}
						</button>
					))}
				</div>
				<button
					type="button"
					className={pill}
					aria-pressed={loop}
					onClick={() => setLoop(!loop)}
				>
					Loop
				</button>
			</div>

			<div className="mt-4 overflow-hidden rounded-md border border-border bg-background">
				<EmptyState
					key={state.id}
					title={state.title}
					description={state.description}
					illustration={state.illustration}
					animated="rise"
					loop={loop}
					pointer={pointer === 'off' ? false : pointer}
					colors={colors}
					headingLevel="h3"
					actions={[{ id: 'primary', label: state.action }]}
				/>
			</div>
		</div>
	)
}
