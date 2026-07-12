'use client'

import { useRouter } from 'next/navigation'
import { FileDiff, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { writeDiffHandoff } from '../../diff-checker/utils/handoff'
import {
	Segmented,
	ToggleChip
} from '../../link-extractor/components/segmented'
import type { TJsonToolStore } from '../hooks/use-json-tool-store'
import type { TIndent, TOutputMode } from '../types'

const MODES: readonly { value: TOutputMode; label: string; hint: string }[] = [
	{ value: 'formatted', label: 'Formatted', hint: 'Pretty-printed JSON' },
	{ value: 'minified', label: 'Minified', hint: 'JSON on a single line' },
	{
		value: 'typescript',
		label: 'TypeScript',
		hint: 'Infer a TypeScript type from the value'
	},
	{ value: 'yaml', label: 'YAML', hint: 'Render the value as YAML' },
	{
		value: 'csv',
		label: 'CSV',
		hint: 'Flatten an array of rows into CSV'
	}
]

const INDENTS: readonly { value: TIndent; label: string; hint: string }[] = [
	{ value: '2', label: '2', hint: 'Indent with two spaces' },
	{ value: '4', label: '4', hint: 'Indent with four spaces' },
	{ value: 'tab', label: 'Tab', hint: 'Indent with tabs' }
]

type Props = {
	store: TJsonToolStore
}

export function Toolbar({ store }: Props) {
	const { options, setOption, toggleSortKeys, applyToInput, output, error } =
		store
	const router = useRouter()

	function compareInDiffChecker() {
		if (!output.ok) {
			toast.error('Fix the JSON first')
			return
		}
		writeDiffHandoff({
			left: store.input,
			right: output.text,
			leftLabel: 'Input',
			rightLabel: `Output · ${options.mode}`
		})
		router.push('/tools/diff-checker')
	}

	return (
		<section
			aria-label="Output options"
			className="flex flex-wrap items-center gap-2 border border-border/50 bg-card p-3"
		>
			<Segmented
				label="Output format"
				value={options.mode}
				options={MODES}
				onChange={value => setOption('mode', value)}
			/>

			{options.mode === 'formatted' && (
				<Segmented
					label="Indentation"
					value={options.indent}
					options={INDENTS}
					onChange={value => setOption('indent', value)}
				/>
			)}

			{options.mode === 'typescript' && (
				<Input
					value={options.typeName}
					onChange={event =>
						setOption('typeName', event.target.value)
					}
					aria-label="Type name"
					spellCheck={false}
					autoComplete="off"
					className="h-7 w-32 rounded-md font-mono text-xs"
				/>
			)}

			<ToggleChip
				pressed={options.sortKeys}
				label="Sort keys"
				hint="Sort every object's keys alphabetically"
				onToggle={toggleSortKeys}
			/>

			<div className="ml-auto flex items-center gap-0.5">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					title="Rewrite the input with the current formatting"
					disabled={error !== null}
					onClick={applyToInput}
				>
					<Wand2 aria-hidden className="size-3.5" />
					Format input
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					title="Open the input and the output in the Diff Checker"
					onClick={compareInDiffChecker}
				>
					<FileDiff aria-hidden className="size-3.5" />
					Compare in Diff Checker
				</Button>
			</div>
		</section>
	)
}
