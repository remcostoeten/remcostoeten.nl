import type { ComponentType } from 'react'
import { getDeveloperPackage } from '@/features/packages/data'
import { PackageStructuredData, packageMetadata } from './package-seo'

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
			</article>
		)
	}

	return { metadata: packageMetadata(pkg), Page }
}
