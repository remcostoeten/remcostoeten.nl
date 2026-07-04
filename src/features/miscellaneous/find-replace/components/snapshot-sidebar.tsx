'use client'

import { useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
	Camera,
	Copy,
	Download,
	FileClock,
	FileDiff,
	Import,
	Pencil,
	Pin,
	RotateCcw,
	Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'
import type { TSnapshot } from '../types'
import {
	downloadFile,
	downloadText,
	exportWorkspaces,
	parseImportedWorkspaces,
	snapshotsToCsv,
	snapshotToMarkdown
} from '../utils/export'

type TSortOrder = 'newest' | 'oldest' | 'label'

function formatTime(timestamp: number): string {
	return new Date(timestamp).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
}

async function copyText(text: string, subject: string) {
	try {
		await navigator.clipboard.writeText(text)
		toast.success(`${subject} copied`)
	} catch {
		toast.error('Clipboard access was denied')
	}
}

function SnapshotItem({
	snapshot,
	store,
	onCompare
}: {
	snapshot: TSnapshot
	store: TFindReplaceStore
	onCompare: (snapshotId: string) => void
}) {
	const [renaming, setRenaming] = useState(false)
	const [draftLabel, setDraftLabel] = useState(snapshot.label)

	function commitRename() {
		if (draftLabel.trim() !== '') {
			store.renameSnapshot(snapshot.id, draftLabel.trim())
		}
		setRenaming(false)
	}

	function handleRenameKeys(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') commitRename()
		if (event.key === 'Escape') setRenaming(false)
	}

	return (
		<li className="border border-border/50 bg-background/50 p-2.5">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					{renaming ? (
						<input
							autoFocus
							value={draftLabel}
							aria-label={`Rename snapshot ${snapshot.label}`}
							onChange={event =>
								setDraftLabel(event.target.value)
							}
							onBlur={commitRename}
							onKeyDown={handleRenameKeys}
							className="h-6 w-full rounded-sm border border-border bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					) : (
						<p className="truncate text-xs font-medium text-foreground">
							{snapshot.pinned && (
								<Pin
									aria-hidden
									className="mr-1 inline size-3 fill-current text-brand-400"
								/>
							)}
							{snapshot.label}
						</p>
					)}
					<p className="mt-0.5 text-[11px] text-muted-foreground">
						{formatTime(snapshot.createdAt)} ·{' '}
						{snapshot.replacementCount} change
						{snapshot.replacementCount === 1 ? '' : 's'}
						{snapshot.search !== '' && (
							<>
								{' · '}
								<code className="font-mono">
									{snapshot.search.length > 24
										? `${snapshot.search.slice(0, 24)}…`
										: snapshot.search}
								</code>
							</>
						)}
					</p>
				</div>
			</div>

			<div
				role="group"
				aria-label={`Actions for snapshot ${snapshot.label}`}
				className="mt-2 flex flex-wrap items-center gap-0.5"
			>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label="Restore snapshot"
					title="Restore snapshot into the editor"
					onClick={() => {
						store.restoreSnapshot(snapshot.id)
						toast.success(`Restored "${snapshot.label}"`)
					}}
				>
					<RotateCcw aria-hidden className="size-3" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label="Compare snapshot with current output"
					title="Compare in Diff Checker"
					onClick={() => onCompare(snapshot.id)}
				>
					<FileDiff aria-hidden className="size-3" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label="Rename snapshot"
					title="Rename"
					onClick={() => {
						setDraftLabel(snapshot.label)
						setRenaming(true)
					}}
				>
					<Pencil aria-hidden className="size-3" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label="Duplicate snapshot"
					title="Duplicate"
					onClick={() => store.duplicateSnapshot(snapshot.id)}
				>
					<Copy aria-hidden className="size-3" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
					aria-label={
						snapshot.pinned ? 'Unpin snapshot' : 'Pin snapshot'
					}
					aria-pressed={snapshot.pinned}
					title={snapshot.pinned ? 'Unpin' : 'Pin'}
					onClick={() =>
						store.togglePinSnapshot(snapshot.id, !snapshot.pinned)
					}
				>
					<Pin
						aria-hidden
						className={cn(
							'size-3',
							snapshot.pinned && 'fill-current'
						)}
					/>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
					title="Copy the snapshot's original text"
					onClick={() =>
						void copyText(snapshot.input, 'Snapshot original')
					}
				>
					In
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
					title="Copy the snapshot's output text"
					onClick={() =>
						void copyText(snapshot.output, 'Snapshot output')
					}
				>
					Out
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
					title="Export snapshot as Markdown"
					onClick={() => {
						downloadText(
							`snapshot-${snapshot.id.slice(0, 8)}.md`,
							snapshotToMarkdown(snapshot)
						)
						toast.success('Snapshot exported')
					}}
				>
					MD
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
					aria-label="Delete snapshot"
					title="Delete"
					onClick={() => {
						store.deleteSnapshot(snapshot.id)
						toast.success('Snapshot deleted')
					}}
				>
					<Trash2 aria-hidden className="size-3" />
				</Button>
			</div>
		</li>
	)
}

type Props = {
	store: TFindReplaceStore
	onCompare: (snapshotId: string) => void
}

export function SnapshotSidebar({ store, onCompare }: Props) {
	const { workspace } = store
	const [query, setQuery] = useState('')
	const [sortOrder, setSortOrder] = useState<TSortOrder>('newest')
	const [pinnedOnly, setPinnedOnly] = useState(false)
	const importInputRef = useRef<HTMLInputElement>(null)

	const snapshots = useMemo(() => {
		const lowered = query.toLowerCase()
		const filtered = workspace.snapshots.filter(
			snapshot =>
				(!pinnedOnly || snapshot.pinned) &&
				(query === '' ||
					snapshot.label.toLowerCase().includes(lowered) ||
					snapshot.search.toLowerCase().includes(lowered))
		)
		const sorted = [...filtered].sort((a, b) => {
			if (a.pinned !== b.pinned)
				return Number(b.pinned) - Number(a.pinned)
			if (sortOrder === 'label') return a.label.localeCompare(b.label)
			return sortOrder === 'newest'
				? b.createdAt - a.createdAt
				: a.createdAt - b.createdAt
		})
		return sorted
	}, [workspace.snapshots, query, sortOrder, pinnedOnly])

	function handleImportFile(file: File) {
		void file.text().then(raw => {
			try {
				const imported = parseImportedWorkspaces(raw)
				if (imported.length === 0) {
					toast.error('No valid workspaces found in that file')
					return
				}
				store.importWorkspaces(imported)
				toast.success(
					`Imported ${imported.length} workspace${imported.length === 1 ? '' : 's'}`
				)
			} catch {
				toast.error('That file is not valid workspace JSON')
			}
		})
	}

	return (
		<aside
			aria-label="Snapshots and history"
			className="flex flex-col gap-3 border border-border/50 bg-card p-3"
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
					<FileClock aria-hidden className="size-3.5" />
					History & snapshots
				</h3>
				<Button
					variant="outline"
					size="sm"
					className="h-7 gap-1 px-2 text-xs"
					title="Create a snapshot of the current state (Ctrl+Shift+S)"
					onClick={() => {
						store.createSnapshot()
						toast.success('Snapshot created')
					}}
				>
					<Camera aria-hidden className="size-3" />
					Snapshot
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<label htmlFor="snapshot-search" className="sr-only">
					Search snapshots
				</label>
				<Input
					id="snapshot-search"
					type="search"
					placeholder="Search snapshots…"
					value={query}
					onChange={event => setQuery(event.target.value)}
					className="h-8 text-xs"
				/>
				<div className="flex items-center justify-between gap-2">
					<label
						htmlFor="snapshot-sort"
						className="text-[11px] text-muted-foreground"
					>
						Sort
					</label>
					<select
						id="snapshot-sort"
						value={sortOrder}
						onChange={event =>
							setSortOrder(event.target.value as TSortOrder)
						}
						className="h-7 grow rounded-sm border border-border/50 bg-background px-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
						<option value="label">By label</option>
					</select>
					<button
						type="button"
						aria-pressed={pinnedOnly}
						onClick={() => setPinnedOnly(value => !value)}
						className={cn(
							'flex h-7 items-center gap-1 rounded-sm border px-2 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
							pinnedOnly
								? 'border-border bg-accent text-accent-foreground'
								: 'border-border/50 text-muted-foreground hover:text-foreground'
						)}
					>
						<Pin aria-hidden className="size-3" />
						Pinned
					</button>
				</div>
			</div>

			{snapshots.length === 0 ? (
				<p className="border border-dashed border-border/50 px-3 py-6 text-center text-xs text-muted-foreground">
					{workspace.snapshots.length === 0
						? 'No snapshots yet. Replace all creates one automatically, or press Ctrl+Shift+S.'
						: 'No snapshots match your filter.'}
				</p>
			) : (
				<ul role="list" className="flex flex-col gap-2">
					{snapshots.map(snapshot => (
						<SnapshotItem
							key={snapshot.id}
							snapshot={snapshot}
							store={store}
							onCompare={onCompare}
						/>
					))}
				</ul>
			)}

			<div className="flex flex-wrap items-center gap-1 border-t border-border/50 pt-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
					title="Export snapshot metadata as CSV"
					disabled={workspace.snapshots.length === 0}
					onClick={() => {
						downloadFile(
							'snapshots.csv',
							snapshotsToCsv(workspace.snapshots),
							'text/csv;charset=utf-8'
						)
						toast.success('CSV exported')
					}}
				>
					<Download aria-hidden className="size-3" />
					CSV
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
					title="Export the active workspace as JSON"
					onClick={() => {
						exportWorkspaces([workspace])
						toast.success('Workspace exported')
					}}
				>
					<Download aria-hidden className="size-3" />
					Workspace
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
					title="Export all workspaces as JSON"
					onClick={() => {
						exportWorkspaces(store.workspaces)
						toast.success('All workspaces exported')
					}}
				>
					<Download aria-hidden className="size-3" />
					All
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
					title="Import workspaces from a JSON export"
					onClick={() => importInputRef.current?.click()}
				>
					<Import aria-hidden className="size-3" />
					Import
				</Button>
				<input
					ref={importInputRef}
					type="file"
					accept="application/json,.json"
					className="sr-only"
					aria-label="Import workspaces from JSON"
					onChange={event => {
						const file = event.target.files?.[0]
						if (file) handleImportFile(file)
						event.target.value = ''
					}}
				/>
			</div>
		</aside>
	)
}
