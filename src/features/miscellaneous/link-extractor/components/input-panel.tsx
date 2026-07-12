'use client'

import { ClipboardPaste, Eraser } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { TLinkExtractorStore } from '../hooks/use-link-extractor-store'

type Props = {
	store: TLinkExtractorStore
}

export function InputPanel({ store }: Props) {
	const { input, setInput, clearInput, result } = store

	async function pasteFromClipboard() {
		try {
			const text = await navigator.clipboard.readText()
			setInput(text)
			toast.success('Pasted from clipboard')
		} catch (error) {
			console.warn('Clipboard read failed', error)
			toast.error('Clipboard access was denied')
		}
	}

	return (
		<section
			aria-label="Input"
			className="flex min-w-0 flex-col border border-border/50 bg-card"
		>
			<header className="flex h-9 items-center justify-between gap-2 border-b border-border/50 px-2">
				<p className="text-xs text-muted-foreground tabular-nums">
					{result.inputLines} line{result.inputLines === 1 ? '' : 's'}{' '}
					· {input.length} char{input.length === 1 ? '' : 's'}
				</p>
				<div className="flex items-center gap-0.5">
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
				aria-label="Text to extract from"
				placeholder="Paste text, HTML, markdown or a wall of links…"
				className="h-[26rem] w-full resize-none border-0 bg-transparent p-2 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
			/>

			<footer className="flex h-9 items-center border-t border-border/50 px-2 text-xs text-muted-foreground">
				Everything runs in your browser — nothing is uploaded.
			</footer>
		</section>
	)
}
