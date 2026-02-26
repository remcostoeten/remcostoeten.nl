import { getAllBlogPosts } from '@/utils/utils'
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

	const filePosts = getAllBlogPosts()




	// Fetch data from DB including draft status
	const dbPosts = await db
		.select({
			slug: blogPosts.slug,
			views: blogPosts.totalViews,
			uniqueViews: blogPosts.uniqueViews,
			isDraft: blogPosts.isDraft
		})
		.from(blogPosts)

	const dbMap = new Map(
		dbPosts.map(p => [
			p.slug,
			{
				views: p.views,
				uniqueViews: p.uniqueViews,
				isDraft: p.isDraft
			}
		])
	)

	// Merge DB status into posts and filter
	const processedPosts = filePosts
		.map(post => {
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
		.filter(post => {
			if (userIsAdmin) return true
			return !post.metadata.draft
		})

	const sortedBlogs = processedPosts.sort((a, b) => {
		if (userIsAdmin) {
			if (a.metadata.draft && !b.metadata.draft) return -1
			if (!a.metadata.draft && b.metadata.draft) return 1
		}

		if (
			new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
		) {
			return -1
		}
		return 1
	})

	return (
		<Section
			title="Recent Posts"
			headerAction={<PostCountHeader count={sortedBlogs.length} />}
		>
			<div className="px-4 md:px-5">
				<p className="text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
			I don't expect anyone to read this nor care. I dump thoughts and wrapups because I enjoy writing and it helps me understand things better. A retro you could say. 		</p>
				<BlogPostsClient posts={sortedBlogs} />
			</div>
		</Section>
	)
}
