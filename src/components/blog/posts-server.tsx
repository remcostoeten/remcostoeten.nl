import { getVisibleBlogPosts } from '@/lib/blog'
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
