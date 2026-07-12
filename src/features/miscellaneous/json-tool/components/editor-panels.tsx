'use client'

import {
	Check,
	ClipboardPaste,
	Copy,
	Download,
	Eraser,
	FlaskConical
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useCopyToClipboard } from '../../hooks/use-copy-to-clipboard'
import { SAMPLE_INPUT } from '../constants'
import type { TJsonToolStore } from '../hooks/use-json-tool-store'

const EXTENSIONS: Record<string, string> = {
	formatted: 'json',
	minified: 'json',
	typescript: 'ts',
	yaml: 'yaml',
	csv: 'csv'
}

function download(text: string, extension: string) {
	const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = `output.${extension}`
	anchor.click()
	URL.revokeObjectURL(url)
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type Props = {
	store: TJsonToolStore
}

export function EditorPanels({ store }: Props) {
	const {
		input,
		setInput,
		clearInput,
		error,
		stats,
		output,
		options,
		pending
	} = store
	const { copy, copiedKey } = useCopyToClipboard()

	async function pasteFromClipboard() {
		try {
			setInput(await navigator.clipboard.readText())
			toast.success('Pasted from clipboard')
		} catch (caught) {
			console.warn('Clipboard read failed', caught)
			toast.error('Clipboard access was denied')
		}
	}

	return (
		<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
			<section
				aria-label="JSON input"
				className="flex min-w-0 flex-col border border-border/50 bg-card"
			>
				<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
					<p
						className={cn(
							'truncate text-xs tabular-nums',
							error === null
								? 'text-muted-foreground'
								: 'text-destructive'
						)}
						role={error === null ? undefined : 'alert'}
					>
						{error === null
							? stats === null
								? 'Waiting for JSON'
								: `Valid · ${stats.nodes} nodes · depth ${stats.depth} · ${formatBytes(stats.bytes)}`
							: error.line === null
								? error.error
								: `Line ${error.line}, column ${error.column} · ${error.error}`}
					</p>
					<div className="flex shrink-0 items-center gap-0.5">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							aria-label="Load a sample"
							title="Load a sample"
							onClick={() => setInput(SAMPLE_INPUT)}
						>
							<FlaskConical aria-hidden className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							aria-label="Paste from clipboard"
							title="Paste from clipboard"
							onClick={pasteFromClipboard}
						>
							<ClipboardPaste aria-hidden className="size-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
							aria-label="Clear input"
							title="Clear input"
							disabled={input === ''}
							onClick={clearInput}
						>
							<Eraser aria-hidden className="size-3.5" />
						</Button>
					</div>
				</header>

				<textarea
					value={input}
					onChange={event => setInput(event.target.value)}
					spellCheck={false}
					autoComplete="off"
					aria-label="JSON to work on"
					placeholder="Paste JSON here…"
					className="h-[28rem] w-full resize-none border-0 bg-transparent p-2 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
				/>
			</section>

			<section
				aria-label="Output"
				className="flex min-w-0 flex-col border border-border/50 bg-card"
			>
				<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
					<p className="text-xs text-muted-foreground tabular-nums">
						{output.ok
							? `${output.text === '' ? 0 : output.text.split('\n').length} line${output.text.split('\n').length === 1 ? '' : 's'} · ${formatBytes(output.text.length)}`
							: 'No output'}
					</p>
					<div className="flex shrink-0 items-center gap-0.5">
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							aria-label="Copy output"
							title="Copy output"
							disabled={!output.ok || output.text === ''}
							onClick={() =>
								output.ok &&
								copy(output.text, 'output', 'Output copied')
							}
						>
							{copiedKey === 'output' ? (
								<Check aria-hidden className="size-3.5" />
							) : (
								<Copy aria-hidden className="size-3.5" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
							aria-label="Download output"
							title="Download output"
							disabled={!output.ok || output.text === ''}
							onClick={() => {
								if (!output.ok) return
								const extension =
									EXTENSIONS[options.mode] ?? 'txt'
								download(output.text, extension)
								toast.success(`Downloaded output.${extension}`)
							}}
						>
							<Download aria-hidden className="size-3.5" />
						</Button>
					</div>
				</header>

				<pre
					aria-live="polite"
					className={cn(
						'h-[28rem] overflow-auto p-2 font-mono text-sm leading-relaxed transition-opacity',
						pending && 'opacity-60',
						!output.ok && 'text-destructive'
					)}
				>
					{output.ok
						? output.text === ''
							? 'Paste JSON on the left to see the output here.'
							: output.text
						: output.error}
				</pre>
			</section>
		</div>
	)
}
