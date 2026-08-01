import { baseUrl } from '@/core/config/site'

function serializeStructuredData(value: object) {
	return JSON.stringify(value).replace(/</g, '\\u003c')
}

type BlogPostStructuredDataProps = {
	title: string
	description: string
	publishedAt: string
	updatedAt?: string
	author: string
	image?: string
	url: string
	keywords?: string[]
}

export function BlogPostStructuredData({
	title,
	description,
	publishedAt,
	updatedAt,
	author,
	image,
	url,
	keywords = []
}: BlogPostStructuredDataProps) {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: title,
		description: description,
		image: image || `${baseUrl}/og?title=${encodeURIComponent(title)}`,
		author: {
			'@type': 'Person',
			'@id': `${baseUrl}/#person`,
			name: author,
			url: baseUrl
		},
		publisher: {
			'@type': 'Person',
			'@id': `${baseUrl}/#person`,
			name: 'Remco Stoeten',
			logo: {
				'@type': 'ImageObject',
				url: `${baseUrl}/favicon.svg`
			}
		},
		datePublished: publishedAt,
		dateModified: updatedAt || publishedAt,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url
		},
		keywords: [
			'frontend development',
			'React',
			'TypeScript',
			'Next.js',
			...keywords
		]
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}

type ToolStructuredDataProps = {
	name: string
	description: string
	slug: string
	category: string
	keywords: readonly string[]
	updatedAt: string
	featureList?: readonly string[]
}

export function ToolStructuredData({
	name,
	description,
	slug,
	category,
	keywords,
	updatedAt,
	featureList = []
}: ToolStructuredDataProps) {
	const url = `${baseUrl}/tools/${slug}`
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		'@id': `${url}/#application`,
		name,
		description,
		url,
		applicationCategory:
			category === 'media'
				? 'MultimediaApplication'
				: 'DeveloperApplication',
		applicationSubCategory: category,
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript and a modern web browser.',
		isAccessibleForFree: true,
		offers: {
			'@type': 'Offer',
			price: 0,
			priceCurrency: 'EUR'
		},
		creator: { '@id': PERSON_ID },
		dateModified: updatedAt,
		keywords,
		featureList
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}

type FaqStructuredDataProps = {
	items: readonly { question: string; answer: string }[]
}

export function FaqStructuredData({ items }: FaqStructuredDataProps) {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}

export const PERSON_ID = `${baseUrl}/#person`
export const WEBSITE_ID = `${baseUrl}/#website`

export function WebsiteStructuredData() {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: 'Remco Stoeten - Frontend Engineer',
		alternateName: ['Remco Stoeten', 'remcostoeten', 'remcostoeten.nl'],
		url: baseUrl,
		inLanguage: 'en',
		publisher: { '@id': PERSON_ID },
		about: { '@id': PERSON_ID },
		potentialAction: {
			'@type': 'SearchAction',
			target: `${baseUrl}/blog?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}

export function PersonStructuredData() {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': PERSON_ID,
		name: 'Remco Stoeten',
		alternateName: 'remcostoeten',
		url: baseUrl,
		mainEntityOfPage: baseUrl,
		image: `${baseUrl}/og`,
		sameAs: [
			'https://github.com/remcostoeten',
			'https://www.linkedin.com/in/remco-stoeten/',
			'https://x.com/remcostoeten'
		],
		jobTitle: 'Frontend Engineer',
		worksFor: {
			'@type': 'Organization',
			name: 'Brainstud'
		},
		knowsAbout: [
			'Frontend Development',
			'React',
			'Next.js',
			'TypeScript',
			'Tailwind CSS',
			'Web Performance',
			'User Interface Design'
		],
		nationality: {
			'@type': 'Country',
			name: 'Netherlands'
		},
		description:
			'Dutch software engineer focused on front-end development with 10 years of experience across e-commerce, SaaS, government, and automotive projects.'
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}

type BreadcrumbItem = {
	name: string
	url: string
}

type BreadcrumbStructuredDataProps = {
	items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({
	items
}: BreadcrumbStructuredDataProps) {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url.startsWith('http')
				? item.url
				: `${baseUrl}${item.url}`
		}))
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: serializeStructuredData(structuredData)
			}}
		/>
	)
}
