import { getVisibleBlogPosts, getVisibleTopics } from '@/features/blog'
import { baseUrl } from '@/core/config/site'
import { MetadataRoute } from 'next'

export { baseUrl } from '@/core/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts = await getVisibleBlogPosts()
	const topics = await getVisibleTopics()

	const routes = [
		{
			url: '',
			changeFrequency: 'daily',
			priority: 1.0
		},
		{
			url: '/blog',
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: '/blog/topics',
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: '/about',
			changeFrequency: 'monthly',
			priority: 0.9
		},
		{
			url: '/privacy',
			changeFrequency: 'monthly',
			priority: 0.6
		},
		{
			url: '/terms',
			changeFrequency: 'monthly',
			priority: 0.6
		},
		{
			url: '/rss',
			changeFrequency: 'daily',
			priority: 0.4
		}
	] as const

	const blogs = posts.map(post => {
		const date = new Date(post.metadata.publishedAt)
		const isValidDate = !isNaN(date.getTime())

		return {
			url: `${baseUrl}/blog/${post.slug}`,
			lastModified: isValidDate ? date : new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.8
		}
	})

	const topicRoutes = topics.map(topic => ({
		url: `${baseUrl}/blog/topics/${topic.slug}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.7
	}))

	return [
		...routes.map(route => ({
			url: `${baseUrl}${route.url}`,
			lastModified: new Date(),
			changeFrequency: route.changeFrequency,
			priority: route.priority
		})),
		...blogs,
		...topicRoutes
	]
}
