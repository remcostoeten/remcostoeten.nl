export type BlogPostMetadata = {
	title: string
	publishedAt: string
	summary: string
	image?: string
	tags?: string[]
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
