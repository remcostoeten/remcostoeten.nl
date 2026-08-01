import { Archive, Clipboard, Download, Package } from 'lucide-react'
import type { ExportScope, SvgItem } from '../types/svg-converter'

type Props = {
	items: SvgItem[]
	scope: ExportScope
	registry: boolean
	onScope: (scope: ExportScope) => void
	onRegistry: (enabled: boolean) => void
	onCopyCombined: () => void
	onCopyRegistry: () => void
	onDownloadCombined: () => void
	onDownloadIndividuals: () => void
	onDownloadPackage: () => void
}

export function ExportMenu({
	items,
	scope,
	registry,
	onScope,
	onRegistry,
	onCopyCombined,
	onCopyRegistry,
	onDownloadCombined,
	onDownloadIndividuals,
	onDownloadPackage
}: Props) {
	const valid = items.filter(item => item.state !== 'invalid')
	const invalid = items.length - valid.length
	const warningCount = valid.reduce(
		(count, item) => count + item.warnings.length,
		0
	)
	const duplicates = valid.filter(item =>
		item.warnings.includes(
			'A duplicate component name was resolved automatically.'
		)
	)
	return (
		<section
			aria-labelledby="export-title"
			className="border-t border-border/60 pt-3"
		>
			<div className="mb-2 flex items-center justify-between">
				<h2
					id="export-title"
					className="text-xs font-semibold uppercase tracking-wider"
				>
					Export
				</h2>
				<select
					aria-label="Export scope"
					value={scope}
					onChange={event =>
						onScope(event.target.value as ExportScope)
					}
					className="h-8 border bg-background px-2 text-[11px]"
				>
					<option value="selected">Selected SVGs</option>
					<option value="all">All valid SVGs</option>
				</select>
			</div>
			<div className="mb-3 border bg-muted/20 p-2 text-[11px] text-muted-foreground">
				<p>
					{valid.length} icons included · {invalid} invalid excluded ·{' '}
					{warningCount} warnings remain
				</p>
				<p>
					Output: individual TSX, combined icons.tsx, or modular
					icons/ package.
				</p>
				{duplicates.length ? (
					<p>
						Normalized duplicates:{' '}
						{duplicates.map(item => item.component).join(', ')}
					</p>
				) : null}
			</div>
			<label className="mb-3 flex items-start gap-2 text-[11px]">
				<input
					type="checkbox"
					checked={registry}
					onChange={event => onRegistry(event.target.checked)}
				/>
				<span>
					Generate dynamic icon registry{' '}
					<span className="block text-muted-foreground">
						Disabled by default. Importing the registry may include
						every icon in a client bundle; named imports are
						recommended.
					</span>
				</span>
			</label>
			<div className="grid grid-cols-2 gap-1.5 text-[11px]">
				<Action
					icon={<Clipboard aria-hidden className="size-3" />}
					label="Copy icons.tsx"
					onClick={onCopyCombined}
					disabled={!valid.length}
				/>
				<Action
					icon={<Download aria-hidden className="size-3" />}
					label="Download icons.tsx"
					onClick={onDownloadCombined}
					disabled={!valid.length}
				/>
				<Action
					icon={<Archive aria-hidden className="size-3" />}
					label="Download TSX ZIP"
					onClick={onDownloadIndividuals}
					disabled={!valid.length}
				/>
				<Action
					icon={<Package aria-hidden className="size-3" />}
					label="Download icon package"
					onClick={onDownloadPackage}
					disabled={!valid.length}
				/>
				{registry ? (
					<Action
						icon={<Clipboard aria-hidden className="size-3" />}
						label="Copy registry"
						onClick={onCopyRegistry}
						disabled={!valid.length}
					/>
				) : null}
			</div>
		</section>
	)
}

function Action({
	icon,
	label,
	onClick,
	disabled
}: {
	icon: React.ReactNode
	label: string
	onClick: () => void
	disabled: boolean
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="flex items-center justify-center gap-1.5 border px-2 py-2 hover:bg-muted disabled:opacity-40"
		>
			{icon}
			{label}
		</button>
	)
}
