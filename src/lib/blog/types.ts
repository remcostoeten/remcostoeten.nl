export const BLOG_TOPICS = ['Engineering', 'Guides', 'Personal'] as const

export type BlogTopic = (typeof BLOG_TOPICS)[number]

export type BlogPostMetadata = {
	title: string
	publishedAt: string
	summary: string
	image?: string
	tags?: string[]
	topic?: BlogTopic
	readTime?: string
	draft?: boolean
	slug?: string
	updatedAt?: string
	canonicalUrl?: string
	author?: string
}

export type BlogPost = {
	slug: string
	content: string
	metadata: BlogPostMetadata
}
