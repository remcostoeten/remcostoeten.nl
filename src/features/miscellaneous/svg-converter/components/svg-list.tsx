import { useDeferredValue, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Search, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { SvgItem, SvgState } from '../types/svg-converter'

type Filter = 'all' | SvgState
type Props = {
	items: SvgItem[]
	selected: Set<string>
	focusedId?: string
	onSelected: (selected: Set<string>) => void
	onFocus: (id: string) => void
	onRemove: (ids: Iterable<string>) => void
	onReorder: (id: string, direction: -1 | 1) => void
}
const ROW_HEIGHT = 78

export function SvgList({
	items,
	selected,
	focusedId,
	onSelected,
	onFocus,
	onRemove,
	onReorder
}: Props) {
	const [query, setQuery] = useState('')
	const [filter, setFilter] = useState<Filter>('all')
	const [scrollTop, setScrollTop] = useState(0)
	const deferredQuery = useDeferredValue(query.trim().toLowerCase())
	const counts = useMemo(
		() => ({
			valid: items.filter(item => item.state === 'valid').length,
			warning: items.filter(item => item.state === 'warning').length,
			invalid: items.filter(item => item.state === 'invalid').length
		}),
		[items]
	)
	const filtered = useMemo(
		() =>
			items.filter(
				item =>
					(filter === 'all' || item.state === filter) &&
					(!deferredQuery ||
						`${item.name} ${item.component} ${item.filename}`
							.toLowerCase()
							.includes(deferredQuery))
			),
		[items, filter, deferredQuery]
	)
	const virtual = filtered.length > 100
	const start = virtual
		? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 4)
		: 0
	const end = virtual
		? Math.min(filtered.length, start + 16)
		: filtered.length
	const visible = filtered.slice(start, end)
	const allValidSelected =
		items.some(item => item.state !== 'invalid') &&
		items
			.filter(item => item.state !== 'invalid')
			.every(item => selected.has(item.id))

	function selectAllValid() {
		onSelected(
			allValidSelected
				? new Set()
				: new Set(
						items
							.filter(item => item.state !== 'invalid')
							.map(item => item.id)
					)
		)
	}

	return (
		<section
			aria-labelledby="collection-title"
			className="pt-3"
			onKeyDown={event => {
				if (
					(event.metaKey || event.ctrlKey) &&
					event.key.toLowerCase() === 'a' &&
					!['INPUT', 'TEXTAREA'].includes(
						(event.target as HTMLElement).tagName
					)
				) {
					event.preventDefault()
					selectAllValid()
				}
				if (
					event.key === 'Delete' &&
					!['INPUT', 'TEXTAREA'].includes(
						(event.target as HTMLElement).tagName
					)
				)
					onRemove(selected)
			}}
		>
			<div className="mb-2 flex items-end justify-between gap-2">
				<div>
					<h2
						id="collection-title"
						className="text-xs font-semibold uppercase tracking-wider"
					>
						Collection
					</h2>
					<p className="text-[11px] text-muted-foreground">
						{counts.valid} valid · {counts.warning} warning ·{' '}
						{counts.invalid} invalid
					</p>
				</div>
				<button
					type="button"
					className="p-2 text-muted-foreground hover:text-foreground focus-visible:ring-2"
					aria-label="Remove selected SVGs"
					disabled={!selected.size}
					onClick={() => onRemove(selected)}
				>
					<Trash2 aria-hidden className="size-3.5" />
				</button>
			</div>
			<div className="relative mb-2">
				<Search
					aria-hidden
					className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
				/>
				<input
					aria-label="Search SVG collection"
					type="search"
					value={query}
					onChange={event => setQuery(event.target.value)}
					placeholder="Search icons…"
					className="h-9 w-full border bg-background pl-8 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</div>
			<div className="mb-2 flex flex-wrap items-center gap-1 text-[11px]">
				<label className="mr-auto flex items-center gap-1.5">
					<input
						type="checkbox"
						checked={allValidSelected}
						onChange={selectAllValid}
					/>{' '}
					Select all valid
				</label>
				{(['all', 'valid', 'warning', 'invalid'] as const).map(
					value => (
						<button
							key={value}
							type="button"
							aria-pressed={filter === value}
							onClick={() => setFilter(value)}
							className={cn(
								'border px-2 py-1 capitalize',
								filter === value &&
									'bg-foreground text-background'
							)}
						>
							{value}
						</button>
					)
				)}
			</div>
			<div
				tabIndex={0}
				aria-label="SVG collection"
				className="max-h-[560px] overflow-y-auto border outline-none focus-visible:ring-2 focus-visible:ring-ring"
				onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
			>
				{filtered.length ? (
					<div
						style={
							virtual
								? {
										height: filtered.length * ROW_HEIGHT,
										position: 'relative'
									}
								: undefined
						}
					>
						<div
							style={
								virtual
									? {
											transform: `translateY(${start * ROW_HEIGHT}px)`
										}
									: undefined
							}
						>
							{visible.map(item => (
								<CollectionRow
									key={item.id}
									item={item}
									selected={selected.has(item.id)}
									focused={focusedId === item.id}
									onSelect={() => {
										const next = new Set(selected)
										if (next.has(item.id))
											next.delete(item.id)
										else next.add(item.id)
										onSelected(next)
									}}
									onFocus={() => onFocus(item.id)}
									onRemove={() => onRemove([item.id])}
									onReorder={onReorder}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="px-4 py-12 text-center text-xs text-muted-foreground">
						No SVGs match this view.
					</div>
				)}
			</div>
			{virtual ? (
				<p className="mt-1 text-[10px] text-muted-foreground">
					Virtualized view · {filtered.length} entries
				</p>
			) : null}
		</section>
	)
}

function CollectionRow({
	item,
	selected,
	focused,
	onSelect,
	onFocus,
	onRemove,
	onReorder
}: {
	item: SvgItem
	selected: boolean
	focused: boolean
	onSelect: () => void
	onFocus: () => void
	onRemove: () => void
	onReorder: (id: string, direction: -1 | 1) => void
}) {
	return (
		<div
			className={cn(
				'flex h-[78px] items-center gap-2 border-b px-2 last:border-b-0',
				focused && 'bg-muted/70'
			)}
		>
			<input
				aria-label={`Select ${item.component}`}
				type="checkbox"
				checked={selected}
				onChange={onSelect}
			/>
			<button
				type="button"
				onClick={onFocus}
				className="min-w-0 grow text-left outline-none focus-visible:ring-2"
			>
				<span className="block truncate text-xs font-medium">
					{item.component}
				</span>
				<span className="block truncate font-mono text-[10px] text-muted-foreground">
					#{item.index} · {item.filename}
				</span>
				<span
					className={cn(
						'mt-1 inline-block text-[10px] uppercase tracking-wide',
						item.state === 'invalid'
							? 'text-red-500'
							: item.state === 'warning'
								? 'text-amber-500'
								: 'text-emerald-500'
					)}
				>
					{item.state}
					{item.state === 'valid' && item.notices.length
						? ' · auto-fixed'
						: ''}
				</span>
			</button>
			<div className="flex flex-col">
				<button
					type="button"
					aria-label={`Move ${item.component} up`}
					onClick={() => onReorder(item.id, -1)}
				>
					<ArrowUp aria-hidden className="size-3" />
				</button>
				<button
					type="button"
					aria-label={`Move ${item.component} down`}
					onClick={() => onReorder(item.id, 1)}
				>
					<ArrowDown aria-hidden className="size-3" />
				</button>
			</div>
			<button
				type="button"
				aria-label={`Remove ${item.component}`}
				onClick={onRemove}
			>
				<Trash2 aria-hidden className="size-3 text-muted-foreground" />
			</button>
		</div>
	)
}
