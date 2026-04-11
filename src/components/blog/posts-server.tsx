import { getVisibleBlogPosts } from '@/features/blog'
import { isAdmin } from '@/utils/is-admin'
import { BlogPostsClient, PostCountHeader } from './posts-client'
import { Section } from '../ui/section'

export async function BlogPosts({
	checkAdmin = true
}: {
	checkAdmin?: boolean
}) {
	const userIsAdmin = checkAdmin ? await isAdmin() : false
	const sortedBlogs = await getVisibleBlogPosts(userIsAdmin)

	return (
		<Section
			title="Posts"
			headerAction={<PostCountHeader count={sortedBlogs.length} />}
			noHeaderMargin
		>
			<div className="px-4 pt-4 md:px-5">
				<div className="border-b border-border/40 pb-4">
					<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
						Build notes, postmortems, and technical writeups worth
						keeping around after the tab would normally be closed.
					</p>
				</div>
				<div className="pt-2">
					<BlogPostsClient posts={sortedBlogs} isAdmin={userIsAdmin} />
				</div>
			</div>
		</Section>
	)
}
