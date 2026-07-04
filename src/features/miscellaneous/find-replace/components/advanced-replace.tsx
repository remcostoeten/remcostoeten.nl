'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TFindReplaceStore } from '../hooks/use-find-replace-store'
import type { TReplaceMode } from '../utils/search'

type TAdvancedMode = 'nth' | 'after' | 'fromLast' | 'allExcept'

const MODE_LABELS: Record<TAdvancedMode, string> = {
	nth: 'Replace match #',
	after: 'Replace matches after #',
	fromLast: 'Replace match # from the end',
	allExcept: 'Replace all except containing'
}

type Props = {
	store: TFindReplaceStore
}

export function AdvancedReplace({ store }: Props) {
	const [mode, setMode] = useState<TAdvancedMode>('nth')
	const [number, setNumber] = useState('1')
	const [exclude, setExclude] = useState('')

	function run() {
		if (store.workspace.search === '') {
			toast.error('Enter a find pattern first')
			return
		}

		let replaceMode: TReplaceMode
		let label: string
		if (mode === 'allExcept') {
			if (exclude.trim() === '') {
				toast.error('Enter text to exclude')
				return
			}
			replaceMode = { allExcept: exclude }
			label = `Replace all except containing "${exclude}"`
		} else {
			const parsed = Number.parseInt(number, 10)
			if (!Number.isFinite(parsed) || parsed < 1) {
				toast.error('Enter a position of 1 or more')
				return
			}
			const zeroBased = parsed - 1
			if (mode === 'nth') {
				replaceMode = { nth: zeroBased }
				label = `Replace match #${parsed}`
			} else if (mode === 'after') {
				replaceMode = { after: zeroBased }
				label = `Replace matches after #${parsed}`
			} else {
				replaceMode = { fromLast: zeroBased }
				label = `Replace match #${parsed} from the end`
			}
		}

		const result = store.replaceAdvanced(replaceMode, label)
		if (!result.ok) {
			toast.error(result.error)
			return
		}
		toast.success(
			result.count > 0
				? `Replaced ${result.count} occurrence${result.count === 1 ? '' : 's'}`
				: 'Nothing matched'
		)
	}

	return (
		<div
			role="group"
			aria-label="Advanced replace"
			className="flex flex-wrap items-center gap-2 border border-border/50 bg-card p-2"
		>
			<label htmlFor="advanced-mode" className="sr-only">
				Advanced replace mode
			</label>
			<select
				id="advanced-mode"
				value={mode}
				onChange={event => setMode(event.target.value as TAdvancedMode)}
				className="h-8 rounded-sm border border-border/50 bg-background px-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				{(Object.keys(MODE_LABELS) as TAdvancedMode[]).map(key => (
					<option key={key} value={key}>
						{MODE_LABELS[key]}
					</option>
				))}
			</select>

			{mode === 'allExcept' ? (
				<>
					<label htmlFor="advanced-exclude" className="sr-only">
						Text to exclude
					</label>
					<Input
						id="advanced-exclude"
						value={exclude}
						onChange={event => setExclude(event.target.value)}
						placeholder="Skip matches containing…"
						className="h-8 w-48 font-mono text-xs !border-border/50"
					/>
				</>
			) : (
				<>
					<label htmlFor="advanced-number" className="sr-only">
						Match position (1-based)
					</label>
					<Input
						id="advanced-number"
						type="number"
						min={1}
						value={number}
						onChange={event => setNumber(event.target.value)}
						className="h-8 w-16 font-mono text-xs !border-border/50"
					/>
				</>
			)}

			<Button
				variant="outline"
				size="sm"
				className="h-8 !border-border/50"
				onClick={run}
			>
				Apply
			</Button>
		</div>
	)
}
