import Link from 'next/link'
import { ArrowUpRight, Box } from 'lucide-react'
import type { DeveloperPackage } from '@/features/packages/data'
import type { Route } from 'next'

type Props = {
	pkg: DeveloperPackage
	version: string | null
}

export function PackageCard({ pkg, version }: Props) {
	const [manager, action, ...packageParts] = pkg.install.split(' ')
	const packageName = packageParts.join(' ')

	return (
		<article className="group relative border-b border-border/60 last:border-b-0">
			<Link
				href={`/packages/${pkg.slug}` as Route}
				prefetch
				className="block px-4 py-5 md:px-5 transition-colors duration-150 ease-out hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring active:bg-muted/50"
			>
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
						<Box
							className="size-3.5 text-muted-foreground"
							aria-hidden="true"
						/>
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-3">
							<h3 className="font-mono text-sm font-medium tracking-tight text-foreground">
								{pkg.name}
							</h3>
							<div className="flex h-5 shrink-0 items-center gap-2">
								{version && (
									<span
										className="font-mono text-[10px] tabular-nums text-muted-foreground"
										aria-label={`Latest version ${version}`}
									>
										v{version}
									</span>
								)}
								<ArrowUpRight
									className="size-3.5 text-muted-foreground transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</div>
						</div>
						<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
							{pkg.tagline}
						</p>
						<code className="mt-3 block truncate rounded-sm border border-border/50 bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
							<span className="select-none text-muted-foreground/50">
								${' '}
							</span>
							<span className="text-[hsl(var(--sh-keyword))]">
								{manager}
							</span>{' '}
							<span className="text-[hsl(var(--sh-keyword))]">
								{action}
							</span>{' '}
							<span className="text-[hsl(var(--sh-function))]">
								{packageName}
							</span>
						</code>
					</div>
				</div>
			</Link>
		</article>
	)
}
