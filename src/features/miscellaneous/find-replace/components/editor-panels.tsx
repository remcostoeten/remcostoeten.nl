'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import {
	ArrowLeftRight,
	ClipboardPaste,
	Copy,
	Download,
	Eraser,
	Printer,
	Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { ACCEPT_ATTRIBUTE, HIGHLIGHT_CHAR_LIMIT } from '../constants'
import { readTextFile, useFileDrop } from '../hooks/use-file-drop'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'
import { downloadText, printText } from '../utils/export'

const EDITOR_TEXT_CLASSES =
	'w-full h-full resize-none border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

function PanelAction({
	label,
	onClick,
	disabled,
	children
}: {
	label: string
	onClick: () => void
	disabled?: boolean
	children: ReactNode
}) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
			aria-label={label}
			title={label}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</Button>
	)
}

function countLines(text: string): number {
	if (text === '') return 0
	let lines = 1
	for (let index = 0; index < text.length; index += 1) {
		if (text.charCodeAt(index) === 10) lines += 1
	}
	return lines
}

async function copyToClipboard(text: string, subject: string) {
	try {
		await navigator.clipboard.writeText(text)
		toast.success(`${subject} copied to clipboard`)
	} catch {
		toast.error('Clipboard access was denied')
	}
}

type Props = {
	store: TFindReplaceStore
}

export function EditorPanels({ store }: Props) {
	const {
		workspace,
		matches,
		currentMatchIndex,
		displayedOutput,
		setInput,
		commitInput,
		swapPanels
	} = store

	const inputRef = useRef<HTMLTextAreaElement>(null)
	const overlayRef = useRef<HTMLDivElement>(null)
	const currentMarkRef = useRef<HTMLElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const splitRef = useRef<HTMLDivElement>(null)
	const [splitPercent, setSplitPercent] = useState(50)

	const highlightingEnabled =
		workspace.input.length <= HIGHLIGHT_CHAR_LIMIT && matches.length > 0

	const handleFileResult = useCallback(
		(result: Awaited<ReturnType<typeof readTextFile>>) => {
			if (!result.ok) {
				toast.error(result.error)
				return
			}
			commitInput(result.content)
			toast.success(`Loaded "${result.name}"`)
		},
		[commitInput]
	)

	const { dragging, dropProps } = useFileDrop(handleFileResult)

	const segments = useMemo(() => {
		if (!highlightingEnabled) return null
		const nodes: ReactNode[] = []
		let cursor = 0
		matches.forEach((match, index) => {
			if (match.start > cursor) {
				nodes.push(workspace.input.slice(cursor, match.start))
			}
			const isCurrent = index === currentMatchIndex
			nodes.push(
				<mark
					key={index}
					ref={isCurrent ? currentMarkRef : undefined}
					className={cn(
						'rounded-[2px] bg-brand-400/25 text-transparent',
						isCurrent &&
							'bg-brand-400/60 outline outline-1 outline-brand-400'
					)}
				>
					{workspace.input.slice(match.start, match.end) || '​'}
				</mark>
			)
			cursor = match.end
		})
		if (cursor < workspace.input.length) {
			nodes.push(workspace.input.slice(cursor))
		}
		return nodes
	}, [highlightingEnabled, workspace.input, matches, currentMatchIndex])

	useEffect(() => {
		const mark = currentMarkRef.current
		const textarea = inputRef.current
		if (!mark || !textarea) return
		const target =
			mark.offsetTop - textarea.clientHeight / 2 + mark.offsetHeight / 2
		textarea.scrollTop = Math.max(0, target)
		if (overlayRef.current) {
			overlayRef.current.scrollTop = textarea.scrollTop
		}
	}, [currentMatchIndex, segments])

	const syncOverlayScroll = useCallback(() => {
		if (!overlayRef.current || !inputRef.current) return
		overlayRef.current.scrollTop = inputRef.current.scrollTop
		overlayRef.current.scrollLeft = inputRef.current.scrollLeft
	}, [])

	async function pasteFromClipboard() {
		try {
			const text = await navigator.clipboard.readText()
			if (text === '') {
				toast.info('Clipboard is empty')
				return
			}
			commitInput(text)
			toast.success('Pasted from clipboard')
		} catch {
			toast.error('Clipboard access was denied')
		}
	}

	function handleOutputCopyShortcut(
		event: KeyboardEvent<HTMLTextAreaElement>
	) {
		if (!(event.key === 'c' && (event.ctrlKey || event.metaKey))) return
		const target = event.currentTarget
		if (target.selectionStart !== target.selectionEnd) return
		event.preventDefault()
		void copyToClipboard(displayedOutput, 'Output')
	}

	function startDividerDrag(event: PointerEvent<HTMLDivElement>) {
		event.preventDefault()
		const container = splitRef.current
		if (!container) return
		const rect = container.getBoundingClientRect()

		const handleMove = (moveEvent: globalThis.PointerEvent) => {
			const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100
			setSplitPercent(Math.min(80, Math.max(20, percent)))
		}
		const handleUp = () => {
			window.removeEventListener('pointermove', handleMove)
			window.removeEventListener('pointerup', handleUp)
		}
		window.addEventListener('pointermove', handleMove)
		window.addEventListener('pointerup', handleUp)
	}

	function handleDividerKeys(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			setSplitPercent(value => Math.max(20, value - 5))
		}
		if (event.key === 'ArrowRight') {
			event.preventDefault()
			setSplitPercent(value => Math.min(80, value + 5))
		}
		if (event.key === 'Home') {
			event.preventDefault()
			setSplitPercent(50)
		}
	}

	return (
		<div
			ref={splitRef}
			className="flex flex-col md:flex-row md:items-stretch border border-border/50 bg-card"
		>
			<section
				aria-label="Original input"
				className="relative flex min-w-0 flex-col"
				style={{ flexBasis: `${splitPercent}%` }}
				{...dropProps}
			>
				<header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
					<h3 className="text-xs font-medium text-muted-foreground">
						Input
					</h3>
					<div className="flex items-center gap-0.5">
						<PanelAction
							label="Paste from clipboard"
							onClick={() => void pasteFromClipboard()}
						>
							<ClipboardPaste aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Upload a text file"
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Copy input"
							disabled={workspace.input === ''}
							onClick={() =>
								void copyToClipboard(workspace.input, 'Input')
							}
						>
							<Copy aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Clear input"
							disabled={workspace.input === ''}
							onClick={() => {
								commitInput('')
								toast.success('Input cleared')
							}}
						>
							<Eraser aria-hidden className="size-3.5" />
						</PanelAction>
					</div>
				</header>

				<div className="relative h-72 md:h-96 grow">
					{highlightingEnabled && (
						<div
							ref={overlayRef}
							aria-hidden
							className="pointer-events-none absolute inset-0 overflow-hidden p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-transparent"
						>
							{segments}
							{'\n'}
						</div>
					)}
					<textarea
						ref={inputRef}
						value={workspace.input}
						onChange={event => setInput(event.target.value)}
						onScroll={syncOverlayScroll}
						aria-label="Original text"
						placeholder="Paste text here, press Ctrl+V anywhere on the page, drop a file, or use the paste button above…"
						spellCheck={false}
						className={cn(EDITOR_TEXT_CLASSES, 'absolute inset-0')}
					/>
					{dragging && (
						<div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-brand-400 bg-background/80">
							<p className="text-sm text-foreground">
								Drop file to load it
							</p>
						</div>
					)}
				</div>

				<footer className="flex items-center justify-between border-t border-border/50 px-3 py-1 text-xs tabular-nums text-muted-foreground">
					<span>
						{workspace.input.length.toLocaleString()} chars ·{' '}
						{countLines(workspace.input).toLocaleString()} lines
					</span>
					<span>
						{matches.length > 0 &&
							`${matches.length.toLocaleString()} match${matches.length === 1 ? '' : 'es'}`}
					</span>
				</footer>

				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPT_ATTRIBUTE}
					className="sr-only"
					aria-label="Upload a text file"
					onChange={event => {
						const file = event.target.files?.[0]
						if (file) void readTextFile(file).then(handleFileResult)
						event.target.value = ''
					}}
				/>
			</section>

			<div
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize editor panels"
				aria-valuenow={Math.round(splitPercent)}
				aria-valuemin={20}
				aria-valuemax={80}
				tabIndex={0}
				onPointerDown={startDividerDrag}
				onKeyDown={handleDividerKeys}
				className="hidden md:block w-1 shrink-0 cursor-col-resize bg-border/50 transition-colors hover:bg-brand-400/60 focus-visible:bg-brand-400 focus-visible:outline-none"
			/>

			<section
				aria-label="Output"
				className="flex min-w-0 flex-col border-t border-border/50 md:border-t-0"
				style={{ flexBasis: `${100 - splitPercent}%` }}
			>
				<header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
					<h3 className="text-xs font-medium text-muted-foreground">
						Output
						{store.previewCount !== null && (
							<span className="ml-2 font-normal">
								live preview · {store.previewCount} replacement
								{store.previewCount === 1 ? '' : 's'}
							</span>
						)}
					</h3>
					<div className="flex items-center gap-0.5">
						<PanelAction
							label="Copy output"
							disabled={displayedOutput === ''}
							onClick={() =>
								void copyToClipboard(displayedOutput, 'Output')
							}
						>
							<Copy aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Download output as .txt"
							disabled={displayedOutput === ''}
							onClick={() => {
								downloadText('output.txt', displayedOutput)
								toast.success('Download started')
							}}
						>
							<Download aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Print output"
							disabled={displayedOutput === ''}
							onClick={() => printText('Output', displayedOutput)}
						>
							<Printer aria-hidden className="size-3.5" />
						</PanelAction>
						<PanelAction
							label="Use output as new input (swap panels)"
							disabled={displayedOutput === ''}
							onClick={() => {
								swapPanels()
								toast.success('Panels swapped')
							}}
						>
							<ArrowLeftRight aria-hidden className="size-3.5" />
						</PanelAction>
					</div>
				</header>

				<div className="relative h-72 md:h-96 grow">
					<textarea
						readOnly
						value={displayedOutput}
						onKeyDown={handleOutputCopyShortcut}
						aria-label="Transformed output. Press Ctrl+C to copy everything."
						placeholder="The result appears here as you type a search…"
						spellCheck={false}
						className={cn(
							EDITOR_TEXT_CLASSES,
							'absolute inset-0 text-muted-foreground'
						)}
					/>
				</div>

				<footer className="flex items-center justify-between border-t border-border/50 px-3 py-1 text-xs tabular-nums text-muted-foreground">
					<span>
						{displayedOutput.length.toLocaleString()} chars ·{' '}
						{countLines(displayedOutput).toLocaleString()} lines
					</span>
				</footer>
			</section>
		</div>
	)
}
