'use client'

import {
	ArrowDownAZ,
	ArrowUpAZ,
	Copy,
	Eraser,
	Rows2,
	WrapText
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'
import {
	collapseBlankLines,
	dedupeLines,
	removeEmptyLines,
	sortLines,
	trimLines
} from '../utils/text-transforms'

type Props = {
	store: TFindReplaceStore
}

export function TextTransforms({ store }: Props) {
	const { workspace, commitInput } = store

	function apply(label: string, transform: (text: string) => string) {
		const result = transform(workspace.input)
		if (result === workspace.input) {
			toast.info('Nothing to change')
			return
		}
		commitInput(result)
		toast.success(label)
	}

	return (
		<div
			role="group"
			aria-label="Line transforms"
			className="flex flex-wrap items-center gap-1 border border-border/50 bg-card p-2"
		>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Sort lines A → Z"
				onClick={() =>
					apply('Sorted A → Z', text =>
						sortLines(text, 'asc', workspace.options.caseSensitive)
					)
				}
			>
				<ArrowDownAZ aria-hidden className="size-3.5" />
				Sort A–Z
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Sort lines Z → A"
				onClick={() =>
					apply('Sorted Z → A', text =>
						sortLines(text, 'desc', workspace.options.caseSensitive)
					)
				}
			>
				<ArrowUpAZ aria-hidden className="size-3.5" />
				Sort Z–A
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Remove empty lines"
				onClick={() => apply('Removed empty lines', removeEmptyLines)}
			>
				<Rows2 aria-hidden className="size-3.5" />
				Remove empty lines
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Collapse runs of blank lines into one"
				onClick={() =>
					apply('Collapsed blank lines', collapseBlankLines)
				}
			>
				<WrapText aria-hidden className="size-3.5" />
				Collapse blank lines
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Trim leading and trailing whitespace on every line"
				onClick={() => apply('Trimmed whitespace', trimLines)}
			>
				<Eraser aria-hidden className="size-3.5" />
				Trim whitespace
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
				title="Remove duplicate lines, keeping the first occurrence"
				onClick={() => apply('Removed duplicate lines', dedupeLines)}
			>
				<Copy aria-hidden className="size-3.5" />
				Dedupe lines
			</Button>
		</div>
	)
}
