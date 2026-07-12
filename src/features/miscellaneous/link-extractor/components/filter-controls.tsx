'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TLinkExtractorStore } from '../hooks/use-link-extractor-store'
import type { TKeywordMode, TLinkFilter, TSortMode } from '../types'
import { Segmented, ToggleChip } from './segmented'

const KEYWORD_MODES: readonly {
	value: TKeywordMode
	label: string
	hint: string
}[] = [
	{
		value: 'remove',
		label: 'Delete matching',
		hint: 'Drop every line that contains the term'
	},
	{
		value: 'keep',
		label: 'Keep matching',
		hint: 'Keep only the lines that contain the term'
	}
]

const LINK_FILTERS: readonly {
	value: TLinkFilter
	label: string
	hint: string
}[] = [
	{ value: 'all', label: 'Everything', hint: 'Do not filter on links' },
	{
		value: 'links-only',
		label: 'Links only',
		hint: 'Delete every line without a link'
	},
	{
		value: 'no-links',
		label: 'No links',
		hint: 'Delete every line that contains a link'
	}
]

const SORT_MODES: readonly { value: TSortMode; label: string; hint: string }[] =
	[
		{ value: 'none', label: 'Original', hint: 'Keep the original order' },
		{ value: 'az', label: 'A → Z', hint: 'Sort ascending' },
		{ value: 'za', label: 'Z → A', hint: 'Sort descending' },
		{ value: 'shortest', label: 'Shortest', hint: 'Shortest lines first' },
		{ value: 'longest', label: 'Longest', hint: 'Longest lines first' }
	]

type Props = {
	store: TLinkExtractorStore
}

export function FilterControls({ store }: Props) {
	const { options, setOption, toggleOption, resetOptions, result } = store

	return (
		<section
			aria-label="Filters"
			className="flex flex-col gap-2 border border-border/50 bg-card p-3"
		>
			<div className="flex flex-wrap items-center gap-2">
				<Input
					value={options.keyword}
					onChange={event => setOption('keyword', event.target.value)}
					placeholder="Word, letter or pattern…"
					aria-label="Filter term"
					spellCheck={false}
					autoComplete="off"
					className="h-7 w-full max-w-64 rounded-md text-xs"
				/>
				<Segmented
					label="What to do with matching lines"
					value={options.keywordMode}
					options={KEYWORD_MODES}
					onChange={value => setOption('keywordMode', value)}
				/>
				<ToggleChip
					pressed={options.caseSensitive}
					label="Aa"
					hint="Case sensitive"
					onToggle={() => toggleOption('caseSensitive')}
				/>
				<ToggleChip
					pressed={options.useRegex}
					label=".*"
					hint="Treat the term as a regular expression"
					onToggle={() => toggleOption('useRegex')}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Segmented
					label="Link filter"
					value={options.linkFilter}
					options={LINK_FILTERS}
					onChange={value => setOption('linkFilter', value)}
				/>
				<ToggleChip
					pressed={options.explodeLinks}
					label="One link per line"
					hint="Pull every link out of the text and put each on its own line"
					onToggle={() => toggleOption('explodeLinks')}
				/>
				<ToggleChip
					pressed={options.dedupe}
					label="Deduplicate"
					hint="Remove repeated lines"
					onToggle={() => toggleOption('dedupe')}
				/>
				<ToggleChip
					pressed={options.trimEmpty}
					label="Drop blanks"
					hint="Remove empty lines"
					onToggle={() => toggleOption('trimEmpty')}
				/>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-2">
				<Segmented
					label="Sort"
					value={options.sort}
					options={SORT_MODES}
					onChange={value => setOption('sort', value)}
				/>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
					onClick={resetOptions}
				>
					<RotateCcw aria-hidden className="size-3.5" />
					Reset filters
				</Button>
			</div>

			<p
				role={result.error === null ? undefined : 'alert'}
				className="min-h-4 text-xs text-destructive"
			>
				{result.error}
			</p>
		</section>
	)
}
