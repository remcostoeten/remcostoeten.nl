import { AlertTriangle, CircleCheck, CircleX, Wrench } from 'lucide-react'
import { ColorList } from './color-list'
import { ConvertOptions } from './convert-options'
import { SvgPreview } from './svg-preview'
import { DEFAULT_SETTINGS } from '../types/svg-converter'
import type { ConversionSettings, SvgItem } from '../types/svg-converter'

type Props = {
	item?: SvgItem
	selectedCount: number
	onRename: (value: string) => void
	onFilename: (value: string) => void
	onChange: (patch: Partial<ConversionSettings>) => void
	onApplySelected: () => void
	onApplyAll: () => void
}

export function SvgDetail({
	item,
	selectedCount,
	onRename,
	onFilename,
	onChange,
	onApplySelected,
	onApplyAll
}: Props) {
	if (!item)
		return (
			<div className="grid min-h-[680px] place-items-center border border-dashed p-8 text-center text-xs text-muted-foreground">
				Paste or drop one or more SVGs to inspect them here.
			</div>
		)
	return (
		<div>
			<div className="mb-3 flex items-center gap-2 border-b pb-3">
				{item.state === 'invalid' ? (
					<CircleX aria-hidden className="size-4 text-red-500" />
				) : item.state === 'warning' ? (
					<AlertTriangle aria-hidden className="size-4" />
				) : (
					<CircleCheck aria-hidden className="size-4" />
				)}
				<div>
					<p className="text-sm font-medium">{item.component}</p>
					<p className="font-mono text-[10px] text-muted-foreground">
						ID {item.id} · source {item.source.start}–
						{item.source.end}
					</p>
				</div>
			</div>
			{item.errors.length || item.warnings.length ? (
				<div className="mb-3 space-y-1 border-l-2 pl-3 text-[11px]">
					{item.errors.map(error => (
						<p key={error} className="text-red-500">
							{error}
						</p>
					))}
					{item.warnings.map(warning => (
						<p key={warning} className="text-muted-foreground">
							{warning}
						</p>
					))}
					{item.state === 'invalid' ? (
						<p className="text-red-500">
							This SVG was excluded from export because it is
							invalid.
						</p>
					) : null}
				</div>
			) : null}
			{item.notices.length ? (
				<div className="mb-3 space-y-1 border-l-2 border-emerald-500/50 bg-muted/20 py-1.5 pl-3 pr-2 text-[11px] text-muted-foreground">
					{item.notices.map(notice => (
						<p key={notice} className="flex items-start gap-1.5">
							<Wrench
								aria-hidden
								className="mt-0.5 size-3 shrink-0 text-emerald-500"
							/>
							{notice}
						</p>
					))}
				</div>
			) : null}
			{item.state !== 'invalid' ? (
				<>
					<SvgPreview item={item} />
					<ColorList
						item={item}
						onPrimary={color => onChange({ primaryColor: color })}
					/>
				</>
			) : null}
			<ConvertOptions
				item={item}
				selectedCount={selectedCount}
				onRename={onRename}
				onFilename={onFilename}
				onChange={onChange}
				onApplySelected={onApplySelected}
				onApplyAll={onApplyAll}
				onReset={() =>
					onChange({
						...DEFAULT_SETTINGS,
						primaryColor: item.colors[0]?.value
					})
				}
			/>
		</div>
	)
}
