import { Metadata } from 'next'

export interface BaseMetadataConfig {
	title: string
	description: string
	keywords?: string[]
	canonical?: string
	siteName?: string
	image?: string
	noIndex?: boolean
}

export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://remcostoeten.nl'

const defaultImage = `${baseUrl}/og`

export function createPageMetadata(config: BaseMetadataConfig): Metadata {
	const {
		title,
		description,
		keywords,
		canonical,
		siteName = 'Remco Stoeten',
		image = defaultImage,
		noIndex = false
	} = config

	const fullTitle = noIndex ? title : `${title} | ${siteName}`

	return {
		title: fullTitle,
		description,
		keywords,
		openGraph: {
			title: fullTitle,
			description,
			type: 'website',
			locale: 'en_US',
			siteName,
			url: canonical ? `${baseUrl}${canonical}` : undefined,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: title
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description,
			images: [image]
		},
		robots: {
			index: !noIndex,
			follow: !noIndex,
			googleBot: {
				index: !noIndex,
				follow: !noIndex,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1
			}
		},
		...(canonical && {
			alternates: {
				canonical: `${baseUrl}${canonical}`
			}
		})
	}
}

export function createArticleMetadata(config: {
	title: string
	description: string
	publishedAt: string
	updatedAt?: string
	author?: string
	image?: string
	canonical?: string
	keywords?: string[]
}): Metadata {
	const {
		title,
		description,
		publishedAt,
		updatedAt,
		author = 'Remco Stoeten',
		image: ogImage,
		canonical,
		keywords
	} = config

	const imageUrl = ogImage || `${baseUrl}/og?title=${encodeURIComponent(title)}`

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: 'article',
			publishedTime: publishedAt,
			modifiedTime: updatedAt,
			authors: [author],
			url: canonical ? `${baseUrl}${canonical}` : undefined,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: title
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [imageUrl]
		},
		alternates: {
			canonical: canonical ? `${baseUrl}${canonical}` : undefined
		}
	}
}

export function extendMetadata(
	base: Metadata,
	overrides: Partial<Metadata>
): Metadata {
	const result: Metadata = { ...base }
	
	if (base.openGraph || overrides.openGraph) {
		result.openGraph = {
			...(base.openGraph as object),
			...(overrides.openGraph as object)
		} as Metadata['openGraph']
	}
	
	if (base.twitter || overrides.twitter) {
		result.twitter = {
			...(base.twitter as object),
			...(overrides.twitter as object)
		} as Metadata['twitter']
	}
	
	if (base.robots || overrides.robots) {
		result.robots = {
			...(base.robots as object),
			...(overrides.robots as object)
		} as Metadata['robots']
	}
	
	if (base.alternates || overrides.alternates) {
		result.alternates = {
			...(base.alternates as object),
			...(overrides.alternates as object)
		} as Metadata['alternates']
	}
	
	return result
}
