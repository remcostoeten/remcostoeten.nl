import { getAllBlogPosts } from './posts'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'
import { getTopicBySlug, slugifyTopic } from './posts'
import type { BlogTopicSummary, ResolvedBlogPost } from './types'

export async function getResolvedBlogPosts() {
	const filePosts = getAllBlogPosts()
	const dbPosts = await db
		.select({
			slug: blogPosts.slug,
			views: blogPosts.totalViews,
			uniqueViews: blogPosts.uniqueViews,
			isDraft: blogPosts.isDraft
		})
		.from(blogPosts)

	const dbMap = new Map(
		dbPosts.map(post => [
			post.slug,
			{
				views: post.views,
				uniqueViews: post.uniqueViews,
				isDraft: post.isDraft
			}
		])
	)

	return filePosts.map(post => {
		const dbData = dbMap.get(post.slug)
		const isDraft = dbData?.isDraft || post.metadata.draft || false

		return {
			...post,
			metadata: {
				...post.metadata,
				draft: isDraft
			},
			views: dbData?.views || 0,
			uniqueViews: dbData?.uniqueViews || 0
		}
	}) satisfies ResolvedBlogPost[]
}

export function sortBlogPosts(posts: ResolvedBlogPost[]) {
	return [...posts].sort((a, b) => {
		if (a.metadata.draft && !b.metadata.draft) return -1
		if (!a.metadata.draft && b.metadata.draft) return 1

		return new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
			? -1
			: 1
	})
}

export async function getVisibleBlogPosts(includeDrafts = false) {
	const posts = await getResolvedBlogPosts()

	const visiblePosts = includeDrafts
		? posts
		: posts.filter(post => !post.metadata.draft)

	return sortBlogPosts(visiblePosts)
}

export async function getResolvedBlogPostBySlug(slug: string) {
	const posts = await getResolvedBlogPosts()
	return posts.find(post => post.slug === slug) || null
}

export async function getTopicArchive(
	topic: string,
	includeDrafts = false
): Promise<{ topic: string; posts: ResolvedBlogPost[] } | null> {
	const canonicalTopic = getTopicBySlug(topic)
	if (!canonicalTopic) return null

	const posts = (await getVisibleBlogPosts(includeDrafts)).filter(
		post => slugifyTopic(post.metadata.topic || '') === slugifyTopic(canonicalTopic)
	)

	if (posts.length === 0) return null

	return {
		topic: canonicalTopic,
		posts
	}
}

export async function getAdjacentBlogPosts(
	slug: string,
	includeDrafts = false
): Promise<{ prevPost: ResolvedBlogPost | null; nextPost: ResolvedBlogPost | null }> {
	const posts = await getVisibleBlogPosts(includeDrafts)
	const currentIndex = posts.findIndex(post => post.slug === slug)

	if (currentIndex === -1) {
		return {
			prevPost: null,
			nextPost: null
		}
	}

	return {
		prevPost:
			currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
		nextPost: currentIndex > 0 ? posts[currentIndex - 1] : null
	}
}

export async function getVisibleTopics(includeDrafts = false) {
	const posts = await getVisibleBlogPosts(includeDrafts)
	const topicCounts = new Map<string, number>()

	posts.forEach(post => {
		const topic = post.metadata.topic
		if (!topic) return
		topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
	})

	return Array.from(topicCounts.entries())
		.map(([name, count]) => ({
			name,
			slug: name.toLowerCase(),
			count
		}))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) as BlogTopicSummary[]
}
