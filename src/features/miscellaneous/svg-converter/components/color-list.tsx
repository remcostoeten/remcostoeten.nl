import type { SvgItem } from '../types/svg-converter'

export function ColorList({
	item,
	onPrimary
}: {
	item: SvgItem
	onPrimary: (color: string) => void
}) {
	return (
		<div className="border-t border-border/60 py-3">
			<h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider">
				Detected colors
			</h3>
			{item.colors.length ? (
				<div className="flex flex-wrap gap-1.5">
					{item.colors.map(color => (
						<button
							key={color.normalized}
							type="button"
							title={color.locations.join(', ')}
							aria-pressed={
								item.settings.primaryColor === color.value
							}
							onClick={() => onPrimary(color.value)}
							className="flex items-center gap-1.5 border px-2 py-1 text-[11px] aria-pressed:ring-2 aria-pressed:ring-ring"
						>
							<span
								className="size-3 border"
								style={{ backgroundColor: color.value }}
							/>
							<span className="font-mono">{color.value}</span>
							<span className="text-muted-foreground">
								×{color.count}
							</span>
						</button>
					))}
				</div>
			) : (
				<p className="text-[11px] text-muted-foreground">
					No explicit visible colors detected.
				</p>
			)}
		</div>
	)
}
