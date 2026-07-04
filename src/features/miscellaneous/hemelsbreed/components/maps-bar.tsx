'use client'

import { useEffect, useRef, useState } from 'react'
import {
	Check,
	ChevronDown,
	FilePlus2,
	Map as MapIcon,
	Pencil,
	Save,
	SaveAll,
	Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/shared/lib/cn'
import type { TSavedMap } from '../types'

type Props = {
	maps: TSavedMap[]
	activeMapId: string | null
	dirty: boolean
	onSave: () => void
	onSaveAsNew: () => void
	onNew: () => void
	onOpen: (id: string) => void
	onRename: (id: string, name: string) => void
	onDelete: (id: string) => void
}

function formatWhen(timestamp: number): string {
	try {
		return new Date(timestamp).toLocaleString()
	} catch {
		return ''
	}
}

export function MapsBar({
	maps,
	activeMapId,
	dirty,
	onSave,
	onSaveAsNew,
	onNew,
	onOpen,
	onRename,
	onDelete
}: Props) {
	const [open, setOpen] = useState(false)
	const [renamingId, setRenamingId] = useState<string | null>(null)
	const [draftName, setDraftName] = useState('')
	const rootRef = useRef<HTMLDivElement>(null)

	const active = maps.find(map => map.id === activeMapId) ?? null

	useEffect(() => {
		if (!open) return
		function onClick(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
		}
		window.addEventListener('mousedown', onClick)
		return () => window.removeEventListener('mousedown', onClick)
	}, [open])

	function commitRename(id: string) {
		const trimmed = draftName.trim()
		if (trimmed) onRename(id, trimmed)
		setRenamingId(null)
	}

	return (
		<div ref={rootRef} className="relative flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-9 min-w-0 flex-1 justify-between gap-2"
				onClick={() => setOpen(value => !value)}
				aria-expanded={open}
				aria-haspopup="menu"
			>
				<span className="flex min-w-0 items-center gap-2">
					<MapIcon aria-hidden className="size-4 shrink-0" />
					<span className="truncate">
						{active ? active.name : 'Unsaved map'}
					</span>
					{dirty && (
						<span
							aria-label="Unsaved changes"
							className="size-1.5 shrink-0 rounded-full bg-amber-400"
						/>
					)}
				</span>
				<ChevronDown aria-hidden className="size-4 shrink-0 opacity-60" />
			</Button>

			<Button
				type="button"
				variant={dirty ? 'default' : 'outline'}
				size="sm"
				className="h-9 shrink-0 gap-1.5"
				onClick={onSave}
				title={active ? 'Save changes to this map' : 'Save as a new map'}
			>
				<Save aria-hidden className="size-4" />
				Save
			</Button>

			{open && (
				<div
					role="menu"
					className="absolute left-0 top-full z-[1000] mt-1 w-[min(20rem,80vw)] border border-border bg-popover p-1.5 shadow-lg"
				>
					<div className="flex gap-1.5 border-b border-border/60 p-1 pb-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 flex-1 justify-start gap-1.5 text-xs"
							onClick={() => {
								onNew()
								setOpen(false)
							}}
						>
							<FilePlus2 aria-hidden className="size-3.5" />
							New map
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 flex-1 justify-start gap-1.5 text-xs"
							onClick={() => {
								onSaveAsNew()
								setOpen(false)
							}}
						>
							<SaveAll aria-hidden className="size-3.5" />
							Save as new
						</Button>
					</div>

					{maps.length === 0 ? (
						<p className="px-2 py-4 text-center text-xs text-muted-foreground">
							No saved maps yet. Save the current circles to start a
							collection.
						</p>
					) : (
						<ul className="max-h-72 overflow-y-auto py-1" role="list">
							{maps.map(map => {
								const isActive = map.id === activeMapId
								const isRenaming = map.id === renamingId
								return (
									<li key={map.id}>
										<div
											className={cn(
												'group flex items-center gap-1 rounded-sm px-1.5 py-1',
												isActive && 'bg-accent/60'
											)}
										>
											{isRenaming ? (
												<Input
													autoFocus
													value={draftName}
													onChange={event =>
														setDraftName(
															event.target.value
														)
													}
													onKeyDown={event => {
														if (event.key === 'Enter')
															commitRename(map.id)
														if (event.key === 'Escape')
															setRenamingId(null)
													}}
													onBlur={() =>
														commitRename(map.id)
													}
													className="h-7 flex-1 px-1 text-sm"
													aria-label="Map name"
												/>
											) : (
												<button
													type="button"
													className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
													onClick={() => {
														onOpen(map.id)
														setOpen(false)
													}}
												>
													<Check
														aria-hidden
														className={cn(
															'size-3.5 shrink-0',
															isActive
																? 'opacity-100'
																: 'opacity-0'
														)}
													/>
													<span className="flex min-w-0 flex-col">
														<span className="truncate text-sm">
															{map.name}
														</span>
														<span className="truncate text-[11px] text-muted-foreground">
															{map.circles.length}{' '}
															{map.circles.length ===
															1
																? 'circle'
																: 'circles'}{' '}
															· {formatWhen(map.updatedAt)}
														</span>
													</span>
												</button>
											)}

											{!isRenaming && (
												<span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="size-7 text-muted-foreground hover:text-foreground"
														onClick={() => {
															setDraftName(map.name)
															setRenamingId(map.id)
														}}
														aria-label="Rename map"
													>
														<Pencil className="size-3.5" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="size-7 text-muted-foreground hover:text-destructive"
														onClick={() =>
															onDelete(map.id)
														}
														aria-label="Delete map"
													>
														<Trash2 className="size-3.5" />
													</Button>
												</span>
											)}
										</div>
									</li>
								)
							})}
						</ul>
					)}
				</div>
			)}
		</div>
	)
}
