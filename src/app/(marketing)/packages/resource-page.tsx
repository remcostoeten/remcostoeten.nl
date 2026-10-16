import type { ComponentType } from 'react'
import { getDeveloperPackage } from '@/features/packages/data'
import { PackageStructuredData, packageMetadata } from './package-seo'
import { PackageApiList, PackageWhy } from './package-sections'

/**
 * @name resourcePage
 * @description Builds a static package route for a resource showcase. The
 * showcase needs no data, so the page renders without a Suspense fallback and
 * there is no loading state to shift from.
 *
 * @example
 * const { metadata, Page } = resourcePage('empty-states', EmptyStatesShowcase)
 * export { metadata }
 * export default Page
 */
export function resourcePage(
	slug: string,
	Showcase: ComponentType,
	className?: string
) {
	const found = getDeveloperPackage(slug)
	if (!found) throw new Error(`No developer package with slug "${slug}"`)
	const pkg = found

	function Page() {
		return (
			<article className={className}>
				<PackageStructuredData pkg={pkg} />
				<Showcase />
				<PackageWhy pkg={pkg} />
				<section
					aria-labelledby="api-heading"
					className="border-b border-border/60 px-4 py-7 md:px-5"
				>
					<h2
						id="api-heading"
						className="text-lg font-semibold tracking-tight"
					>
						API
					</h2>
					<PackageApiList pkg={pkg} />
				</section>
			</article>
		)
	}

	return { metadata: packageMetadata(pkg), Page }
}
