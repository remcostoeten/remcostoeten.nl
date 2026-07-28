import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/ui/section'
import { PackageCard } from './package-card'
import { developerPackages, getNpmPackage } from '@/features/packages/data'
import type { Route } from 'next'

export async function PackagesSection() {
	const registryData = await Promise.all(
		developerPackages.map(pkg => getNpmPackage(pkg.packageName))
	)

	return (
		<Section
			title="Developer packages"
			noHeaderMargin
			contentPadding={false}
			headerAction={
				<Link
					href={'/packages' as Route}
					className="group flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					View all
					<ArrowRight
						className="size-3 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</Link>
			}
		>
			<div className="border-b border-border/50">
				<div className="px-4 py-4 md:px-5">
					<p className="max-w-xl font-mono text-xs leading-relaxed tracking-tight text-muted-foreground/80">
						Open-source React packages built to remove repeat work
						from product interfaces.
					</p>
				</div>
				{developerPackages.map((pkg, index) => (
					<PackageCard
						key={pkg.slug}
						pkg={pkg}
						version={registryData[index]?.version ?? null}
					/>
				))}
			</div>
		</Section>
	)
}
