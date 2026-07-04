'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Eraser } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '../hooks/use-local-storage'
import { DiffOutput } from './components/diff-output'
import { TextPanel } from './components/text-panel'
import { readDiffHandoff } from './utils/handoff'

export default function DiffCheckerTool() {
	const [left, setLeft, leftHydrated] = useLocalStorage(
		'misc-tools:diff-checker:left',
		''
	)
	const [right, setRight, rightHydrated] = useLocalStorage(
		'misc-tools:diff-checker:right',
		''
	)
	const [labels, setLabels] = useState({ left: 'Original', right: 'Changed' })
	const consumedHandoff = useRef(false)

	useEffect(() => {
		if (consumedHandoff.current) return
		if (!leftHydrated || !rightHydrated) return
		consumedHandoff.current = true
		const handoff = readDiffHandoff()
		if (!handoff) return
		setLeft(handoff.left)
		setRight(handoff.right)
		setLabels({ left: handoff.leftLabel, right: handoff.rightLabel })
		toast.success('Loaded comparison from Find & Replace')
	}, [leftHydrated, rightHydrated, setLeft, setRight])

	if (!leftHydrated || !rightHydrated) {
		return (
			<div
				role="status"
				aria-label="Loading diff checker"
				className="flex flex-col gap-3"
			>
				<div className="h-8 w-64 animate-pulse bg-muted/60" />
				<div className="h-80 animate-pulse bg-muted/60" />
				<div className="h-96 animate-pulse bg-muted/60" />
			</div>
		)
	}

	function swap() {
		setLeft(right)
		setRight(left)
		setLabels(current => ({ left: current.right, right: current.left }))
		toast.success('Sides swapped')
	}

	function clearAll() {
		if (left === '' && right === '') return
		if (!window.confirm('Clear both sides?')) return
		setLeft('')
		setRight('')
		toast.success('Cleared')
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center justify-end gap-1">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					onClick={swap}
				>
					<ArrowLeftRight aria-hidden className="size-3.5" />
					Swap sides
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
					onClick={clearAll}
				>
					<Eraser aria-hidden className="size-3.5" />
					Clear
				</Button>
			</div>

			<div className="grid grid-cols-1 divide-y divide-border/50 border border-border/50 bg-card md:grid-cols-2 md:divide-x md:divide-y-0">
				<TextPanel
					label={labels.left}
					value={left}
					onChange={setLeft}
				/>
				<TextPanel
					label={labels.right}
					value={right}
					onChange={setRight}
				/>
			</div>

			<DiffOutput
				leftText={left}
				rightText={right}
				leftLabel={labels.left}
				rightLabel={labels.right}
			/>
		</div>
	)
}
