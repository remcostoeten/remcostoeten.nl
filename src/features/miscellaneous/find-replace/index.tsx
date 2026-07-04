'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
	FileClock,
	FileDiff,
	Keyboard,
	Redo2,
	RotateCcw,
	Undo2,
	Wand2
} from 'lucide-react'
import { toast } from 'sonner'
import { useShortcutMap } from '@remcostoeten/use-shortcut/react'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible'
import { writeDiffHandoff } from '../diff-checker/utils/handoff'
import { AdvancedReplace } from './components/advanced-replace'
import { EditorPanels } from './components/editor-panels'
import { FindControls } from './components/find-controls'
import { SnapshotSidebar } from './components/snapshot-sidebar'
import { TextTransforms } from './components/text-transforms'
import { WorkspaceBar } from './components/workspace-bar'
import { useFindReplaceStore } from './hooks/use-find-replace-store'
import { useGlobalPaste } from './hooks/use-global-paste'

const SHORTCUTS: { keys: string; action: string }[] = [
	{ keys: 'Ctrl+F', action: 'Focus the find field' },
	{ keys: 'Ctrl+H', action: 'Focus the replace field' },
	{ keys: 'Ctrl+Shift+H', action: 'Replace all' },
	{ keys: 'F3 / Shift+F3', action: 'Next / previous match' },
	{ keys: 'Ctrl+Shift+S', action: 'Create a snapshot' },
	{ keys: 'Ctrl+Z / Ctrl+Y', action: 'Undo / redo (outside text fields)' },
	{ keys: 'Ctrl+V', action: 'Paste into the editor from anywhere' },
	{ keys: 'Ctrl+C', action: 'Copy everything when the output has focus' }
]

export default function FindReplaceTool() {
	const store = useFindReplaceStore()
	const router = useRouter()
	const findInputRef = useRef<HTMLInputElement>(null)
	const replaceInputRef = useRef<HTMLInputElement>(null)
	const [showSnapshots, setShowSnapshots] = useState(false)

	useGlobalPaste(
		useCallback(
			(text: string) => {
				store.commitInput(text)
				toast.success('Pasted into the editor')
			},
			[store.commitInput]
		)
	)

	const runReplaceAll = useCallback(() => {
		const result = store.replaceAll()
		if (!result.ok) {
			toast.error(result.error)
			return
		}
		toast.success(
			`Replaced ${result.count} occurrence${result.count === 1 ? '' : 's'}`
		)
	}, [store.replaceAll])

	const takeSnapshot = useCallback(() => {
		store.createSnapshot()
		toast.success('Snapshot created')
	}, [store.createSnapshot])

	useShortcutMap(
		{
			focusFind: {
				keys: 'mod+f',
				handler: () => findInputRef.current?.focus(),
				options: { description: 'Focus find field' }
			},
			focusReplace: {
				keys: 'mod+h',
				handler: () => replaceInputRef.current?.focus(),
				options: { description: 'Focus replace field' }
			},
			replaceAll: {
				keys: 'mod+shift+h',
				handler: runReplaceAll,
				options: { description: 'Replace all occurrences' }
			},
			snapshot: {
				keys: 'mod+shift+s',
				handler: takeSnapshot,
				options: { description: 'Create snapshot' }
			},
			nextMatch: {
				keys: 'f3',
				handler: store.nextMatch,
				options: { description: 'Go to next match' }
			},
			previousMatch: {
				keys: 'shift+f3',
				handler: store.previousMatch,
				options: { description: 'Go to previous match' }
			}
		},
		{ ignoreInputs: false }
	)

	useShortcutMap({
		undo: {
			keys: 'mod+z',
			handler: store.undo,
			options: { description: 'Undo last transformation' }
		},
		redo: {
			keys: 'mod+y',
			handler: store.redo,
			options: { description: 'Redo transformation' }
		}
	})

	const compareSnapshot = useCallback(
		(snapshotId: string) => {
			const snapshot = store.workspace.snapshots.find(
				item => item.id === snapshotId
			)
			if (!snapshot) return
			writeDiffHandoff({
				left: store.displayedOutput,
				right: snapshot.output,
				leftLabel: 'Current output',
				rightLabel: snapshot.label
			})
			router.push('/tools/diff-checker')
		},
		[store.workspace.snapshots, store.displayedOutput, router]
	)

	const compareInDiffChecker = useCallback(() => {
		writeDiffHandoff({
			left: store.workspace.input,
			right: store.displayedOutput,
			leftLabel: 'Input',
			rightLabel: 'Output'
		})
		router.push('/tools/diff-checker')
	}, [store.workspace.input, store.displayedOutput, router])

	function resetWorkspace() {
		if (
			!window.confirm(
				'Reset this workspace? Input, output, search and options are cleared. Snapshots are kept.'
			)
		) {
			return
		}
		store.commitInput('')
		store.setOutput('')
		store.setSearch('')
		store.setReplace('')
		toast.success('Workspace reset')
	}

	if (!store.hydrated) {
		return (
			<div
				role="status"
				aria-label="Loading find and replace"
				className="flex flex-col gap-3"
			>
				<div className="h-8 w-64 animate-pulse bg-muted/60" />
				<div className="h-28 animate-pulse bg-muted/60" />
				<div className="h-96 animate-pulse bg-muted/60" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<WorkspaceBar store={store} />
				<div
					role="group"
					aria-label="Editing actions"
					className="flex items-center gap-0.5"
				>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
						aria-label="Undo (Ctrl+Z)"
						title="Undo (Ctrl+Z)"
						disabled={!store.canUndo}
						onClick={store.undo}
					>
						<Undo2 aria-hidden className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
						aria-label="Redo (Ctrl+Y)"
						title="Redo (Ctrl+Y)"
						disabled={!store.canRedo}
						onClick={store.redo}
					>
						<Redo2 aria-hidden className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
						aria-label="Reset workspace"
						title="Reset workspace"
						onClick={resetWorkspace}
					>
						<RotateCcw aria-hidden className="size-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
						title="Open input and output in the Diff Checker tool"
						onClick={compareInDiffChecker}
					>
						<FileDiff aria-hidden className="size-3.5" />
						Compare in Diff Checker
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
						aria-pressed={showSnapshots}
						title="Toggle history & snapshots"
						onClick={() => setShowSnapshots(value => !value)}
					>
						<FileClock aria-hidden className="size-3.5" />
						History
					</Button>
				</div>
			</div>

			<div
				className={
					showSnapshots
						? 'grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]'
						: 'grid grid-cols-1 gap-3'
				}
			>
				<div className="min-w-0 flex flex-col gap-3">
					<FindControls
						ref={findInputRef}
						store={store}
						replaceInputRef={replaceInputRef}
					/>
					<EditorPanels store={store} />
				</div>

				{showSnapshots && (
					<SnapshotSidebar
						store={store}
						onCompare={compareSnapshot}
					/>
				)}
			</div>

			<Collapsible>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					>
						<Wand2 aria-hidden className="size-3.5" />
						More text tools
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="mt-2 flex flex-col gap-2">
						<TextTransforms store={store} />
						<AdvancedReplace store={store} />
					</div>
				</CollapsibleContent>
			</Collapsible>

			<Collapsible>
				<CollapsibleTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					>
						<Keyboard aria-hidden className="size-3.5" />
						Keyboard shortcuts
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 border border-border/50 bg-card p-3 text-xs sm:grid-cols-2">
						{SHORTCUTS.map(shortcut => (
							<div
								key={shortcut.keys}
								className="flex items-baseline justify-between gap-3"
							>
								<dt className="text-muted-foreground">
									{shortcut.action}
								</dt>
								<dd>
									<kbd className="rounded-sm border border-border/50 bg-muted/60 px-1.5 py-0.5 font-mono text-[11px]">
										{shortcut.keys}
									</kbd>
								</dd>
							</div>
						))}
					</dl>
				</CollapsibleContent>
			</Collapsible>
		</div>
	)
}
