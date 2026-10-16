import type { Metadata } from 'next'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { baseUrl } from '@/core/config/site'
import type { DeveloperPackage, NpmPackage } from '@/features/packages/data'

export function packageMetadata(pkg: DeveloperPackage): Metadata {
	const title =
		pkg.seoTitle ?? `${pkg.name}: ${pkg.tagline.replace(/\.$/, '')}`
	const description = pkg.seoDescription ?? pkg.description
	return {
		title,
		description,
		keywords: pkg.npmUrl
			? [
					pkg.packageName,
					...pkg.keywords,
					'open source npm package',
					'Remco Stoeten'
				]
			: [...pkg.keywords, 'shadcn registry', 'Remco Stoeten'],
		alternates: { canonical: `${baseUrl}/packages/${pkg.slug}` },
		openGraph: {
			title,
			description,
			url: `${baseUrl}/packages/${pkg.slug}`,
			type: 'website',
			images: [
				{
					url: `/og?title=${encodeURIComponent(pkg.name)}`,
					width: 1200,
					height: 630,
					alt: `${pkg.name} by Remco Stoeten`
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [`/og?title=${encodeURIComponent(pkg.name)}`]
		}
	}
}

type StructuredDataProps = {
	pkg: DeveloperPackage
	npmData?: NpmPackage | null
}

export function PackageStructuredData({ pkg, npmData }: StructuredDataProps) {
	const pageUrl = `${baseUrl}/packages/${pkg.slug}`
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'SoftwareApplication',
				'@id': `${pageUrl}#software`,
				name: pkg.name,
				description: npmData?.description ?? pkg.description,
				applicationCategory: 'DeveloperApplication',
				operatingSystem: 'Web',
				softwareVersion: npmData?.version,
				license: npmData?.license,
				url: pageUrl,
				downloadUrl: pkg.npmUrl ?? pkg.registryUrl,
				author: {
					'@type': 'Person',
					name: 'Remco Stoeten',
					url: baseUrl
				},
				keywords: pkg.keywords.join(', '),
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
				}
			}
		]
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
				}}
			/>
			<BreadcrumbStructuredData
				items={[
					{ name: 'Packages', url: '/packages' },
					{ name: pkg.name, url: `/packages/${pkg.slug}` }
				]}
			/>
		</>
	)
}
