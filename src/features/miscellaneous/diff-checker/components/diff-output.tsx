'use client'

import { Fragment, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Columns2, Rows3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import type { TDiffLine } from '../types'
import { diffLines, diffWords, summarizeDiff } from '../utils/diff'

const CONTEXT_LINES = 3
const COLLAPSE_THRESHOLD = 8

type TDiffRow =
	| {
			kind: 'line'
			left: TDiffLine | null
			right: TDiffLine | null
			hunk: number
	  }
	| { kind: 'collapsed'; count: number; groupIndex: number }

function buildRows(
	lines: TDiffLine[],
	expandedGroups: Set<number>
): { rows: TDiffRow[]; hunkCount: number } {
	const rows: TDiffRow[] = []
	let index = 0
	let groupIndex = 0
	let hunk = -1

	while (index < lines.length) {
		const line = lines[index]

		if (line.type === 'equal') {
			let end = index
			while (end < lines.length && lines[end].type === 'equal') end += 1
			const runLength = end - index
			const isFirst = index === 0
			const isLast = end === lines.length
			const leading = isFirst ? 0 : CONTEXT_LINES
			const trailing = isLast ? 0 : CONTEXT_LINES

			if (
				runLength > leading + trailing + COLLAPSE_THRESHOLD &&
				!expandedGroups.has(groupIndex)
			) {
				for (let i = index; i < index + leading; i += 1) {
					rows.push({
						kind: 'line',
						left: lines[i],
						right: lines[i],
						hunk
					})
				}
				rows.push({
					kind: 'collapsed',
					count: runLength - leading - trailing,
					groupIndex
				})
				for (let i = end - trailing; i < end; i += 1) {
					rows.push({
						kind: 'line',
						left: lines[i],
						right: lines[i],
						hunk
					})
				}
			} else {
				for (let i = index; i < end; i += 1) {
					rows.push({
						kind: 'line',
						left: lines[i],
						right: lines[i],
						hunk
					})
				}
			}
			groupIndex += 1
			index = end
			continue
		}

		hunk += 1
		const removed: TDiffLine[] = []
		const added: TDiffLine[] = []
		while (index < lines.length && lines[index].type === 'removed') {
			removed.push(lines[index])
			index += 1
		}
		while (index < lines.length && lines[index].type === 'added') {
			added.push(lines[index])
			index += 1
		}
		const rowCount = Math.max(removed.length, added.length)
		for (let i = 0; i < rowCount; i += 1) {
			rows.push({
				kind: 'line',
				left: removed[i] ?? null,
				right: added[i] ?? null,
				hunk
			})
		}
	}

	return { rows, hunkCount: hunk + 1 }
}

function WordDiffText({
	a,
	b,
	side
}: {
	a: string
	b: string
	side: 'removed' | 'added'
}) {
	const segments = useMemo(() => diffWords(a, b), [a, b])
	return (
		<>
			{segments
				.filter(
					segment => segment.type === 'equal' || segment.type === side
				)
				.map((segment, index) => (
					<span
						key={index}
						className={cn(
							segment.type === 'removed' &&
								'bg-destructive/25 rounded-[2px]',
							segment.type === 'added' &&
								'bg-brand-400/30 rounded-[2px]'
						)}
					>
						{segment.text}
					</span>
				))}
		</>
	)
}

function DiffCell({
	line,
	counterpart
}: {
	line: TDiffLine | null
	counterpart: TDiffLine | null
}) {
	if (line === null) {
		return <div aria-hidden className="h-full min-h-5 bg-muted/30" />
	}
	const paired =
		counterpart !== null &&
		line.type !== 'equal' &&
		counterpart.type !== 'equal'

	return (
		<div
			className={cn(
				'flex min-h-5 gap-2 px-2',
				line.type === 'removed' && 'bg-destructive/10',
				line.type === 'added' && 'bg-brand-400/10'
			)}
		>
			<span
				aria-hidden
				className="w-8 shrink-0 select-none text-right text-muted-foreground/60"
			>
				{line.aLine ?? line.bLine ?? ''}
			</span>
			<span
				aria-hidden
				className="w-3 shrink-0 select-none text-muted-foreground"
			>
				{line.type === 'removed'
					? '−'
					: line.type === 'added'
						? '+'
						: ''}
			</span>
			<span className="min-w-0 whitespace-pre-wrap break-words">
				<span className="sr-only">
					{line.type === 'removed'
						? 'Removed line: '
						: line.type === 'added'
							? 'Added line: '
							: ''}
				</span>
				{paired && line.type === 'removed' ? (
					<WordDiffText
						a={line.text}
						b={counterpart.text}
						side="removed"
					/>
				) : paired && line.type === 'added' ? (
					<WordDiffText
						a={counterpart.text}
						b={line.text}
						side="added"
					/>
				) : (
					line.text || ' '
				)}
			</span>
		</div>
	)
}

type Props = {
	leftText: string
	rightText: string
	leftLabel: string
	rightLabel: string
}

export function DiffOutput({
	leftText,
	rightText,
	leftLabel,
	rightLabel
}: Props) {
	const [inline, setInline] = useState(false)
	const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
	const [activeHunk, setActiveHunk] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)

	const lines = useMemo(
		() => diffLines(leftText, rightText),
		[leftText, rightText]
	)
	const summary = useMemo(() => summarizeDiff(lines), [lines])
	const { rows, hunkCount } = useMemo(
		() => buildRows(lines, expandedGroups),
		[lines, expandedGroups]
	)

	function jumpToHunk(target: number) {
		if (hunkCount === 0) return
		const clamped = ((target % hunkCount) + hunkCount) % hunkCount
		setActiveHunk(clamped)
		const element = containerRef.current?.querySelector(
			`[data-hunk-start="${clamped}"]`
		)
		element?.scrollIntoView({ block: 'center' })
	}

	const seenHunks = new Set<number>()

	return (
		<div className="flex flex-col gap-3 border border-border/50 bg-card p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p aria-live="polite" className="text-xs text-muted-foreground">
					Comparing <strong>{leftLabel}</strong> with{' '}
					<strong>{rightLabel}</strong>: {summary.added} added,{' '}
					{summary.removed} removed line
					{summary.added + summary.removed === 1 ? '' : 's'} across{' '}
					{hunkCount} change{hunkCount === 1 ? '' : 's'}.
				</p>

				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						aria-label="Previous change"
						title="Previous change"
						disabled={hunkCount === 0}
						onClick={() => jumpToHunk(activeHunk - 1)}
					>
						<ChevronUp aria-hidden className="size-3.5" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						aria-label="Next change"
						title="Next change"
						disabled={hunkCount === 0}
						onClick={() => jumpToHunk(activeHunk + 1)}
					>
						<ChevronDown aria-hidden className="size-3.5" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 gap-1.5 px-2 text-xs"
						aria-pressed={!inline}
						onClick={() => setInline(value => !value)}
						title={
							inline
								? 'Switch to side-by-side view'
								: 'Switch to inline view'
						}
					>
						{inline ? (
							<Columns2 aria-hidden className="size-3.5" />
						) : (
							<Rows3 aria-hidden className="size-3.5" />
						)}
						{inline ? 'Side by side' : 'Inline'}
					</Button>
				</div>
			</div>

			<div
				ref={containerRef}
				className="max-h-[32rem] overflow-auto border border-border/50 bg-background/50 font-mono text-xs leading-relaxed"
				tabIndex={0}
				role="region"
				aria-label="Diff content"
			>
				{summary.added + summary.removed === 0 ? (
					<p className="px-3 py-8 text-center text-muted-foreground">
						Both versions are identical.
					</p>
				) : (
					rows.map((row, index) => {
						if (row.kind === 'collapsed') {
							return (
								<button
									key={`collapsed-${row.groupIndex}`}
									type="button"
									onClick={() =>
										setExpandedGroups(groups => {
											const next = new Set(groups)
											next.add(row.groupIndex)
											return next
										})
									}
									className="block w-full border-y border-border/30 bg-muted/40 px-3 py-1 text-center text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
								>
									Expand {row.count} unchanged lines
								</button>
							)
						}

						const isHunkStart =
							row.hunk >= 0 && !seenHunks.has(row.hunk)
						if (isHunkStart) seenHunks.add(row.hunk)
						const hunkAttribute = isHunkStart
							? { 'data-hunk-start': row.hunk }
							: {}

						if (inline) {
							return (
								<Fragment key={index}>
									{row.left && (
										<div {...hunkAttribute}>
											<DiffCell
												line={row.left}
												counterpart={
													row.left.type === 'equal'
														? null
														: row.right
												}
											/>
										</div>
									)}
									{row.right &&
										row.right.type !== 'equal' && (
											<DiffCell
												line={row.right}
												counterpart={row.left}
											/>
										)}
								</Fragment>
							)
						}

						return (
							<div
								key={index}
								className="grid grid-cols-2 divide-x divide-border/30"
								{...hunkAttribute}
							>
								<DiffCell
									line={row.left}
									counterpart={
										row.left?.type === 'equal'
											? null
											: row.right
									}
								/>
								<DiffCell
									line={
										row.right?.type === 'equal'
											? row.left
											: row.right
									}
									counterpart={
										row.right?.type === 'equal'
											? null
											: row.left
									}
								/>
							</div>
						)
					})
				)}
			</div>
		</div>
	)
}
