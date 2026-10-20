import type { DeveloperPackage } from '@/features/packages/data'

type PackageApiListProps = {
	pkg: DeveloperPackage
}

export function PackageApiList({ pkg }: PackageApiListProps) {
	return (
		<dl className="mt-5 divide-y divide-border border-y border-border">
			{pkg.api.map(item => (
				<div
					key={item.name}
					className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-5"
				>
					<dt className="font-mono text-xs text-foreground">
						{item.name}
					</dt>
					<dd className="text-sm leading-relaxed text-muted-foreground">
						{item.description}
					</dd>
				</div>
			))}
		</dl>
	)
}
