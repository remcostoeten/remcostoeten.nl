import matter from 'gray-matter'
import { z } from 'zod'
import { BLOG_TOPICS, type BlogPostMetadata } from './types'

const rawFrontmatterSchema = z
	.object({
		title: z.string().trim().min(1),
		publishedAt: z.string().trim().min(1).optional(),
		date: z.string().trim().min(1).optional(),
		summary: z.string().trim().min(1).optional(),
		description: z.string().trim().min(1).optional(),
		image: z.string().trim().min(1).optional(),
		tags: z.array(z.string().trim().min(1)).optional(),
		readTime: z.string().trim().min(1).optional(),
		topic: z.enum(BLOG_TOPICS).optional(),
		draft: z.boolean().optional(),
		slug: z.string().trim().min(1).optional(),
		updatedAt: z.string().trim().min(1).optional(),
		canonicalUrl: z.string().trim().min(1).optional(),
		author: z.string().trim().min(1).optional()
	})
	.passthrough()

const normalizedFrontmatterSchema = z.object({
	title: z.string(),
	publishedAt: z.string(),
	summary: z.string(),
	image: z.string().optional(),
	tags: z.array(z.string()).optional(),
	readTime: z.string().optional(),
	topic: z.enum(BLOG_TOPICS).optional(),
	draft: z.boolean().optional(),
	slug: z.string().optional(),
	updatedAt: z.string().optional(),
	canonicalUrl: z.string().optional(),
	author: z.string().optional()
})

export function parseFrontmatter(fileContent: string) {
	const { data, content } = matter(fileContent)
	const parsed = rawFrontmatterSchema.parse(data)
	const normalized = normalizedFrontmatterSchema.parse({
		...parsed,
		publishedAt: parsed.publishedAt ?? parsed.date,
		summary: parsed.summary ?? parsed.description
	})

	return { metadata: normalized as BlogPostMetadata, content: content.trim() }
}
