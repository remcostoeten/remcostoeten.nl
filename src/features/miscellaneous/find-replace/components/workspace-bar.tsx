'use client'

import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Copy, Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { MAX_WORKSPACES } from '../constants'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'

type Props = {
	store: TFindReplaceStore
}

export function WorkspaceBar({ store }: Props) {
	const {
		workspaces,
		workspace,
		createWorkspace,
		renameWorkspace,
		duplicateWorkspace,
		deleteWorkspace,
		switchWorkspace,
		togglePinWorkspace
	} = store

	const [renamingId, setRenamingId] = useState<string | null>(null)
	const [draftName, setDraftName] = useState('')

	const sorted = [...workspaces].sort(
		(a, b) => Number(b.pinned) - Number(a.pinned)
	)

	function startRename(id: string, currentName: string) {
		setRenamingId(id)
		setDraftName(currentName)
	}

	function commitRename() {
		if (renamingId && draftName.trim() !== '') {
			renameWorkspace(renamingId, draftName.trim())
		}
		setRenamingId(null)
	}

	function handleRenameKeys(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'Enter') commitRename()
		if (event.key === 'Escape') setRenamingId(null)
	}

	function removeWorkspace(id: string, name: string) {
		if (
			!window.confirm(
				`Delete workspace "${name}"? Its snapshots are removed too.`
			)
		) {
			return
		}
		deleteWorkspace(id)
		toast.success(`Deleted "${name}"`)
	}

	return (
		<nav
			aria-label="Workspaces"
			className="flex flex-wrap items-center gap-1.5"
		>
			<ul role="list" className="flex flex-wrap items-center gap-1.5">
				{sorted.map(item => {
					const active = item.id === workspace.id
					return (
						<li key={item.id} className="flex items-center">
							{renamingId === item.id ? (
								<input
									autoFocus
									value={draftName}
									aria-label={`Rename workspace ${item.name}`}
									onChange={event =>
										setDraftName(event.target.value)
									}
									onBlur={commitRename}
									onKeyDown={handleRenameKeys}
									className="h-7 w-32 rounded-sm border border-border bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								/>
							) : (
								<button
									type="button"
									aria-current={active ? 'true' : undefined}
									onClick={() => switchWorkspace(item.id)}
									onDoubleClick={() =>
										startRename(item.id, item.name)
									}
									title={
										active
											? `${item.name} (double-click to rename)`
											: `Switch to ${item.name}`
									}
									className={cn(
										'flex h-7 items-center gap-1 rounded-sm border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
										active
											? 'border-border bg-accent text-accent-foreground'
											: 'border-border/50 text-muted-foreground hover:text-foreground'
									)}
								>
									{item.pinned && (
										<Pin
											aria-hidden
											className="size-3 fill-current"
										/>
									)}
									<span className="max-w-32 truncate">
										{item.name}
									</span>
								</button>
							)}
						</li>
					)
				})}
			</ul>

			<div
				role="group"
				aria-label="Workspace actions"
				className="flex items-center gap-0.5"
			>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
					aria-label="New workspace"
					title="New workspace"
					disabled={workspaces.length >= MAX_WORKSPACES}
					onClick={createWorkspace}
				>
					<Plus aria-hidden className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
					aria-label={`Rename workspace ${workspace.name}`}
					title="Rename active workspace"
					onClick={() => startRename(workspace.id, workspace.name)}
				>
					<Pencil aria-hidden className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
					aria-label={`Duplicate workspace ${workspace.name}`}
					title="Duplicate active workspace"
					disabled={workspaces.length >= MAX_WORKSPACES}
					onClick={() => duplicateWorkspace(workspace.id)}
				>
					<Copy aria-hidden className="size-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
					aria-label={
						workspace.pinned
							? `Unpin workspace ${workspace.name}`
							: `Pin workspace ${workspace.name}`
					}
					aria-pressed={workspace.pinned}
					title={
						workspace.pinned ? 'Unpin workspace' : 'Pin workspace'
					}
					onClick={() => togglePinWorkspace(workspace.id)}
				>
					<Pin
						aria-hidden
						className={cn(
							'size-3.5',
							workspace.pinned && 'fill-current'
						)}
					/>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
					aria-label={`Delete workspace ${workspace.name}`}
					title="Delete active workspace"
					onClick={() =>
						removeWorkspace(workspace.id, workspace.name)
					}
				>
					<Trash2 aria-hidden className="size-3.5" />
				</Button>
			</div>
		</nav>
	)
}
