export interface BaseMetadata {
	title: string
	description: string
	keywords?: string[]
	openGraph?: {
		title?: string
		description?: string
		type?: string
		locale?: string
		siteName?: string
		images?: Array<{
			url: string
			width?: number
			height?: number
			alt?: string
		}>
	}
	twitter?: {
		card?: 'summary' | 'summary_large_image'
		title?: string
		description?: string
		images?: Array<{
			url: string
			width?: number
			height?: number
			alt?: string
		}>
	}
	robots?: {
		index?: boolean
		follow?: boolean
		googleBot?: {
			index?: boolean
			follow?: boolean
			'max-video-preview'?: number
			'max-image-preview'?: 'none' | 'standard' | 'large'
			'max-snippet'?: number
		}
	}
	alternates?: {
		canonical?: string
	}
}

export const createBaseMetadata = (config: {
	title: string
	description: string
	keywords?: string[]
	canonical?: string
	siteName?: string
}): BaseMetadata => {
	const {
		title,
		description,
		keywords,
		canonical,
		siteName = 'Blog'
	} = config

	return {
		title,
		description,
		keywords,
		openGraph: {
			title,
			description,
			type: 'website',
			locale: 'en_US',
			siteName,
			images: [
				{
					url: '/og',
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
			images: [
				{
					url: '/og',
					width: 1200,
					height: 630,
					alt: title
				}
			]
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large',
				'max-snippet': -1
			}
		},
		...(canonical && { alternates: { canonical } })
	}
}
