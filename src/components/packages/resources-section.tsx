import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Braces } from 'lucide-react'
import type { Route } from 'next'
import { Section } from '@/components/ui/section'
import { DrawArrow } from '@/components/ui/micro-glyphs'
import { developerPackages } from '@/features/packages/data'
import { EmptyStateTiles } from './empty-states/tiles'
import { demoEntries } from './empty-states/entries'
import { IconTicker } from './animated-icons/icon-ticker'
import { iconEntries } from './animated-icons/entries'

type ResourcePreview = {
	count: string
	render: (href: string) => ReactNode
}

const previews: Partial<Record<string, ResourcePreview>> = {
	'empty-states': {
		count: `${demoEntries.length} states`,
		render: href => <EmptyStateTiles href={href} />
	},
	'animated-icons': {
		count: `${iconEntries.length} icons`,
		render: href => <IconTicker href={href} />
	}
}

const resources = developerPackages.filter(
	pkg => pkg.registryUrl && !pkg.npmUrl && previews[pkg.slug]
)

export function ResourcesSection() {
	if (resources.length === 0) return null

	return (
		<Section
			title="UI resources"
			noHeaderMargin
			className="!mb-0"
			headerAction={
				<Link
					href={'/packages' as Route}
					className="group flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground rounded-sm focus-visible:outline-none focus-visible:bg-muted focus-visible:text-foreground"
				>
					View all
					<DrawArrow />
				</Link>
			}
		>
			{resources.map(resource => {
				const href = `/packages/${resource.slug}`
				const preview = previews[resource.slug]

				return (
					<article
						key={resource.slug}
						className="grid gap-5 border-t border-dashed border-border/70 bg-muted/15 p-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] md:p-5"
					>
						<div className="flex min-w-0 flex-col justify-between gap-6">
							<div className="space-y-3">
								<div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
									<span className="flex size-6 items-center justify-center border border-border/70 bg-background text-muted-foreground">
										<Braces
											className="size-3.5"
											aria-hidden="true"
										/>
									</span>
									<span>Copyable source</span>
									<span className="text-muted-foreground/60">
										{preview?.count}
									</span>
								</div>
								<Link
									href={href as Route}
									prefetch
									className="group block rounded-sm focus-visible:outline-none focus-visible:bg-muted"
								>
									<div className="flex items-center gap-2">
										<h3 className="text-base font-medium tracking-tight text-foreground">
											{resource.name}
										</h3>
										<ArrowUpRight
											className="size-3.5 text-muted-foreground transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
											aria-hidden="true"
										/>
									</div>
									<p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
										{resource.tagline}
									</p>
								</Link>
							</div>
							<code className="truncate font-mono text-[10px] text-muted-foreground/80">
								{resource.install}
							</code>
						</div>
						{preview?.render(href)}
					</article>
				)
			})}
		</Section>
	)
}
