import { getVisibleBlogPosts } from '@/lib/blog/visibility'
import { isAdmin } from '@/utils/is-admin'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'

export async function BlogPosts({
	checkAdmin = true
}: {
	checkAdmin?: boolean
}) {
	const userIsAdmin = checkAdmin ? await isAdmin() : false
	const processedPosts = await getVisibleBlogPosts(userIsAdmin)

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
			noHeaderMargin
		>
			<div className="px-4 pt-4 md:px-5">
				<div className="-mx-4 border-b border-border/40 px-4 pb-4 md:-mx-5 md:px-5">
					<p className="max-w-2xl text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
						I don't expect anyone to read this nor care. I dump
						thoughts and wrapups because I enjoy writing and it
						helps me understand things better. A retro you could
						say.
					</p>
				</div>
				<BlogPostsClient posts={sortedBlogs} />
			</div>
		</Section>
	)
}
