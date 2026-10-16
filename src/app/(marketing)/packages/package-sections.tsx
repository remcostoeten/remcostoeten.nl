import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { DeveloperPackage } from '@/features/packages/data'

type PackageWhyProps = {
	pkg: DeveloperPackage
	hideLabel?: boolean
	children?: ReactNode
}

export function PackageWhy({
	pkg,
	hideLabel = false,
	children
}: PackageWhyProps) {
	return (
		<section
			id="why"
			aria-labelledby="why-heading"
			className="border-b border-border/60 px-4 py-7 md:px-5"
		>
			{!hideLabel && (
				<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
					What it replaces
				</p>
			)}
			<h2
				id="why-heading"
				className={`${hideLabel ? '' : 'mt-2 '}text-lg font-semibold tracking-tight`}
			>
				{pkg.whyHeading}
			</h2>
			<p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
				{pkg.whenToUse}
			</p>
			<ul
				className="mt-5 space-y-3"
				aria-label={`${pkg.name} highlights`}
			>
				{pkg.highlights.map(highlight => (
					<li
						key={highlight}
						className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
					>
						<Check
							className="mt-0.5 size-3.5 shrink-0 text-brand-400"
							aria-hidden="true"
						/>
						{highlight}
					</li>
				))}
			</ul>
			{children}
		</section>
	)
}

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
