import { createBaseMetadata } from './base'

export const topicsMetadata = createBaseMetadata({
	title: 'Topics - Blog Sections',
	description:
		'Browse blog posts by three high-level topics: Engineering, Guides, and Personal.',
	keywords: [
		'blog topics',
		'engineering',
		'guides',
		'personal writing',
		'software engineering'
	],
	canonical: '/blog/topics',
	siteName: 'Blog'
})
