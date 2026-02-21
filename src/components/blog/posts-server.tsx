import { getBlogPosts, getAllBlogPosts } from '@/utils/utils'
import { isAdmin } from '@/utils/is-admin'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'

export async function BlogPosts({
	checkAdmin = true
}: {
	checkAdmin?: boolean
}) {
	const userIsAdmin = checkAdmin ? await isAdmin() : false

	const allBlogs = userIsAdmin ? getAllBlogPosts() : getBlogPosts()

	const viewData = await db
		.select({
			slug: blogPosts.slug,
			views: blogPosts.totalViews,
			uniqueViews: blogPosts.uniqueViews
		})
		.from(blogPosts)

	const viewsMap = new Map(
		viewData.map(v => [v.slug, { total: v.views, unique: v.uniqueViews }])
	)

	const sortedBlogs = allBlogs
		.sort((a, b) => {
			if (userIsAdmin) {
				if (a.metadata.draft && !b.metadata.draft) return -1
				if (!a.metadata.draft && b.metadata.draft) return 1
			}

			if (
				new Date(a.metadata.publishedAt) >
				new Date(b.metadata.publishedAt)
			) {
				return -1
			}
			return 1
		})
		.map(post => ({
			...post,
			views: viewsMap.get(post.slug)?.total || 0,
			uniqueViews: viewsMap.get(post.slug)?.unique || 0
		}))

	return (
		<Section
			title="Recent Posts"
			headerAction={<PostCountHeader count={sortedBlogs.length} />}
		>
			<p className="text-sm px-4 text-muted-foreground/80 leading-relaxed font-mono tracking-tight pt-4 pb-2">
				Writings on frontend engineering, tooling rabbit holes, and the occasional mass over-engineering of simple ideas.
			</p>
			<BlogPostsClient posts={sortedBlogs} />
		</Section>
	)
}
