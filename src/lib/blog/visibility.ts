import { getAllBlogPosts } from './posts'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'

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
	})
}

export async function getVisibleBlogPosts(includeDrafts = false) {
	const posts = await getResolvedBlogPosts()

	return includeDrafts ? posts : posts.filter(post => !post.metadata.draft)
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
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
