import type { ReactNode } from 'react'
import Link from 'next/link'
import { DrawArrow } from '@/components/ui/micro-glyphs'
import { BookGlyph, BoxGlyph, GithubGlyph } from '@/components/ui/link-glyphs'
import { Section } from '@/components/ui/section'
import {
	FeaturedCard,
	type FeaturedLink
} from '@/components/showcase/featured-card'
import { PackageSnippet } from '@/components/showcase/package-snippet'
import { AuthDrawerPreview } from './auth-drawer-preview'
import { SpoarPreview } from './spoar-preview'
import { PackageCard } from './package-card'
import {
	developerPackages,
	getNpmPackage,
	getWeeklyDownloads,
	type DeveloperPackage
} from '@/features/packages/data'
import type { Route } from 'next'

const featuredPreviews: Record<string, ReactNode> = {
	analytics: <SpoarPreview />,
	'auth-drawer': <AuthDrawerPreview />
}

const downloadFormat = new Intl.NumberFormat('en', { notation: 'compact' })

function getPackageLinks(pkg: DeveloperPackage) {
	const links: FeaturedLink[] = []
	if (pkg.docsUrl) {
		links.push({ label: 'Docs', href: pkg.docsUrl, icon: BookGlyph })
	}
	if (pkg.npmUrl) {
		links.push({ label: 'npm', href: pkg.npmUrl, icon: BoxGlyph })
	}
	if (pkg.sourceUrl) {
		links.push({ label: 'GitHub', href: pkg.sourceUrl, icon: GithubGlyph })
	}
	return links
}

export async function PackagesSection() {
	const [featured, ...rest] = developerPackages
	const [registryData, downloads] = await Promise.all([
		Promise.all(
			developerPackages.map(pkg =>
				pkg.npmUrl ? getNpmPackage(pkg.packageName) : null
			)
		),
		Promise.all(
			developerPackages.map(pkg =>
				pkg.npmUrl ? getWeeklyDownloads(pkg.packageName) : null
			)
		)
	])
	const featuredVersion = registryData[0]?.version
	const featuredDownloads = downloads[0]

	return (
		<Section
			title="Developer packages"
			noHeaderMargin
			contentPadding={false}
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
			<div className="border-b border-border/50">
				<div className="border-b border-border/60">
					<FeaturedCard
						title={featured.name}
						titleHref={`/packages/${featured.slug}` as Route}
						description={featured.description}
						status={
							featuredVersion ? `v${featuredVersion}` : undefined
						}
						tech={['React', 'TypeScript', 'Elysia']}
						mediaSide="right"
						seamless={featured.slug in featuredPreviews}
						meta={
							featuredDownloads != null && (
								<p className="font-mono text-[10px] tabular-nums text-muted-foreground">
									{downloadFormat.format(featuredDownloads)}{' '}
									downloads / week
								</p>
							)
						}
						links={getPackageLinks(featured)}
						media={
							featuredPreviews[featured.slug] ?? (
								<PackageSnippet
									label={featured.quickStartFile}
									install={featured.install}
									code={featured.quickStart}
								/>
							)
						}
					/>
				</div>
				{rest.map((pkg, index) => (
					<PackageCard
						key={pkg.slug}
						pkg={pkg}
						version={registryData[index + 1]?.version ?? null}
						downloads={downloads[index + 1] ?? null}
					/>
				))}
			</div>
		</Section>
	)
}
