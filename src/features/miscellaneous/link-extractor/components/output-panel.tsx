'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { useCopyToClipboard } from '../../hooks/use-copy-to-clipboard'
import { INITIAL_VISIBLE_LINES, VISIBLE_LINES_STEP } from '../constants'
import type { TLinkExtractorStore } from '../hooks/use-link-extractor-store'
import type { TLine } from '../types'
import { toHref } from '../utils/links'
import { OpenLinks } from './open-links'

function downloadText(text: string) {
	const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = 'extracted.txt'
	anchor.click()
	URL.revokeObjectURL(url)
}

type TRowProps = {
	line: TLine
	visited: boolean
	onOpen: (url: string) => void
}

function Row({ line, visited, onOpen }: TRowProps) {
	const url = line.url
	if (url === null) {
		return (
			<span className="whitespace-pre-wrap break-words">{line.text}</span>
		)
	}

	const at = line.text.indexOf(url)
	const before = line.text.slice(0, at)
	const after = line.text.slice(at + url.length)

	return (
		<span className="whitespace-pre-wrap break-words">
			{before}
			<a
				href={toHref(url)}
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => onOpen(url)}
				className={cn(
					'underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
					visited
						? 'text-muted-foreground decoration-border'
						: 'text-foreground decoration-border hover:text-accent-foreground'
				)}
			>
				{url}
			</a>
			{after}
		</span>
	)
}

type Props = {
	store: TLinkExtractorStore
}

export function OutputPanel({ store }: Props) {
	const { result, outputText, urls, openedUrls, markOpened, pending } = store
	const { copy, copiedKey } = useCopyToClipboard()
	const [visible, setVisible] = useState(INITIAL_VISIBLE_LINES)

	useEffect(() => {
		setVisible(INITIAL_VISIBLE_LINES)
	}, [result.lines])

	const shown = result.lines.slice(0, visible)
	const hidden = result.lines.length - shown.length

	return (
		<section
			aria-label="Output"
			className="flex min-w-0 flex-col border border-border/50 bg-card"
		>
			<header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-2 py-1.5">
				<p className="text-xs text-muted-foreground tabular-nums">
					{result.lines.length} line
					{result.lines.length === 1 ? '' : 's'} · {urls.length} link
					{urls.length === 1 ? '' : 's'} · {openedUrls.size} visited
				</p>
				<div className="flex items-center gap-0.5">
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
						aria-label="Copy output"
						title="Copy output"
						disabled={outputText === ''}
						onClick={() =>
							copy(outputText, 'output', 'Output copied')
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
						aria-label="Download output as a text file"
						title="Download output"
						disabled={outputText === ''}
						onClick={() => {
							downloadText(outputText)
							toast.success('Downloaded extracted.txt')
						}}
					>
						<Download aria-hidden className="size-3.5" />
					</Button>
				</div>
			</header>

			<div className="border-b border-border/50 px-2 py-1.5">
				<OpenLinks store={store} />
			</div>

			<ol
				className={cn(
					'h-[26rem] overflow-auto p-2 font-mono text-sm leading-relaxed transition-opacity',
					pending && 'opacity-60'
				)}
			>
				{shown.map((line, index) => (
					<li
						key={line.key}
						className="flex gap-3 px-1 hover:bg-muted/40"
					>
						<span
							aria-hidden
							className="w-10 shrink-0 select-none text-right text-xs leading-relaxed text-muted-foreground/60 tabular-nums"
						>
							{index + 1}
						</span>
						<Row
							line={line}
							visited={
								line.url !== null && openedUrls.has(line.url)
							}
							onOpen={url => markOpened([url])}
						/>
					</li>
				))}

				{result.lines.length === 0 && (
					<li className="px-1 text-sm text-muted-foreground">
						Nothing to show yet — paste some text on the left.
					</li>
				)}
			</ol>

			<footer className="flex h-9 items-center justify-between gap-2 border-t border-border/50 px-2 text-xs text-muted-foreground">
				<span className="tabular-nums">
					{hidden > 0
						? `Showing ${shown.length} of ${result.lines.length}`
						: 'All lines shown'}
				</span>
				{hidden > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
						onClick={() =>
							setVisible(count => count + VISIBLE_LINES_STEP)
						}
					>
						Show {Math.min(hidden, VISIBLE_LINES_STEP)} more
					</Button>
				)}
			</footer>
		</section>
	)
}
