import type { ConversionSettings, SvgItem } from '../types/svg-converter'

type Props = {
	item: SvgItem
	selectedCount: number
	onRename: (value: string) => void
	onFilename: (value: string) => void
	onChange: (patch: Partial<ConversionSettings>) => void
	onApplySelected: () => void
	onApplyAll: () => void
	onReset: () => void
}

export function ConvertOptions({
	item,
	selectedCount,
	onRename,
	onFilename,
	onChange,
	onApplySelected,
	onApplyAll,
	onReset
}: Props) {
	const settings = item.settings
	return (
		<section aria-labelledby="options-title" className="pt-3">
			<div className="mb-3 flex items-center justify-between">
				<h2
					id="options-title"
					className="text-xs font-semibold uppercase tracking-wider"
				>
					Conversion
				</h2>
				<button
					type="button"
					className="text-[11px] text-muted-foreground underline underline-offset-4"
					onClick={onReset}
				>
					Reset
				</button>
			</div>
			<div className="grid grid-cols-2 gap-2 text-xs">
				<label className="col-span-2">
					Icon / component name
					<input
						value={item.name}
						onChange={event => onRename(event.target.value)}
						className="mt-1 h-9 w-full border bg-background px-2 outline-none focus-visible:ring-2"
					/>
				</label>
				<label>
					Component
					<input
						readOnly
						value={item.component}
						className="mt-1 h-9 w-full border bg-muted/30 px-2 font-mono text-[11px]"
					/>
				</label>
				<label>
					Filename
					<input
						value={item.filename}
						onChange={event => onFilename(event.target.value)}
						className="mt-1 h-9 w-full border bg-background px-2 font-mono text-[11px] outline-none focus-visible:ring-2"
					/>
				</label>
				<label>
					Color mode
					<select
						value={settings.colorMode}
						onChange={event =>
							onChange({
								colorMode: event.target
									.value as ConversionSettings['colorMode']
							})
						}
						className="mt-1 h-9 w-full border bg-background px-2"
					>
						<option value="preserve">Preserve original</option>
						<option value="fill">Fill icon</option>
						<option value="stroke">Stroke icon</option>
					</select>
				</label>
				<label>
					Default size
					<input
						value={settings.defaultSize}
						onChange={event =>
							onChange({ defaultSize: event.target.value })
						}
						className="mt-1 h-9 w-full border bg-background px-2"
					/>
				</label>
			</div>
			<div className="mt-3 grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
				<Option
					label="Replace primary with currentColor"
					checked={settings.replacePrimary}
					onChange={checked => onChange({ replacePrimary: checked })}
				/>
				<Option
					label="Replace all black-like values"
					checked={settings.replaceBlack}
					onChange={checked => onChange({ replaceBlack: checked })}
				/>
				<Option
					label="Remove fixed width and height"
					checked={settings.removeDimensions}
					onChange={checked =>
						onChange({ removeDimensions: checked })
					}
				/>
				<Option
					label="Preserve aspect ratio"
					checked={settings.preserveAspectRatio}
					onChange={checked =>
						onChange({ preserveAspectRatio: checked })
					}
				/>
				<Option
					label="Preserve <title>"
					checked={settings.preserveTitle}
					onChange={checked => onChange({ preserveTitle: checked })}
				/>
				<Option
					label="Preserve <desc>"
					checked={settings.preserveDesc}
					onChange={checked => onChange({ preserveDesc: checked })}
				/>
				<Option
					label="Decorative by default"
					checked={settings.decorative}
					onChange={checked => onChange({ decorative: checked })}
				/>
				<Option
					label="Include accessible label prop"
					checked={settings.includeLabel}
					onChange={checked => onChange({ includeLabel: checked })}
				/>
				<Option
					label="Preserve SVG IDs"
					checked={settings.preserveIds}
					onChange={checked => onChange({ preserveIds: checked })}
				/>
				<Option
					label="Prefix SVG IDs"
					checked={settings.prefixIds}
					onChange={checked => onChange({ prefixIds: checked })}
				/>
				<Option
					label="Format output"
					checked={settings.format}
					onChange={checked => onChange({ format: checked })}
				/>
				<Option
					label="Optimize path precision"
					checked={settings.optimizePrecision}
					onChange={checked =>
						onChange({ optimizePrecision: checked })
					}
				/>
				<Option
					label="Preserve decimal precision"
					checked={settings.preserveDecimalPrecision}
					onChange={checked =>
						onChange({ preserveDecimalPrecision: checked })
					}
				/>
				<Option
					label="Remove unnecessary metadata"
					checked={settings.removeMetadata}
					onChange={checked => onChange({ removeMetadata: checked })}
				/>
			</div>
			{settings.optimizePrecision &&
			!settings.preserveDecimalPrecision ? (
				<label className="mt-2 block text-[11px]">
					Decimal places{' '}
					<input
						type="number"
						min="0"
						max="8"
						value={settings.precision}
						onChange={event =>
							onChange({ precision: Number(event.target.value) })
						}
						className="ml-2 h-7 w-16 border bg-background px-2"
					/>
				</label>
			) : null}
			<div className="mt-3 flex flex-wrap gap-1.5">
				<button
					type="button"
					disabled={!selectedCount}
					onClick={onApplySelected}
					className="border px-2 py-1.5 text-[11px] disabled:opacity-40"
				>
					Apply to selected ({selectedCount})
				</button>
				<button
					type="button"
					onClick={onApplyAll}
					className="border px-2 py-1.5 text-[11px]"
				>
					Apply to all
				</button>
			</div>
		</section>
	)
}

function Option({
	label,
	checked,
	onChange
}: {
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}) {
	return (
		<label className="flex items-center gap-2">
			<input
				type="checkbox"
				checked={checked}
				onChange={event => onChange(event.target.checked)}
			/>
			{label}
		</label>
	)
}
