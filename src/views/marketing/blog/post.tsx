import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
	calculateReadTime,
	getAdjacentBlogPosts,
	getResolvedBlogPostBySlug
} from '@/features/blog'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/blog/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog/post-view'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReactionBar } from '@/components/blog/reaction-bar'
import { CommentSection } from '@/components/blog/comment-section'
import {
	BlogPostStructuredData,
	BreadcrumbStructuredData
} from '@/components/seo/structured-data'

export async function getBlogPostStaticParams() {
	const { getBlogPosts } = await import('@/features/blog')
	let posts = getBlogPosts()

	return posts
		.filter(post => post && post.slug)
		.map(post => ({
			slug: post.slug.split('/')
		}))
}

type BlogPostViewProps = {
	params: Promise<{ slug: string | string[] }>
	includeDrafts?: boolean
	linkBasePath?: string
	showStructuredData?: boolean
}

export function BlogPostView(props: BlogPostViewProps) {
	return (
		<Suspense fallback={<BlogPostFallback />}>
			<BlogPostContent {...props} />
		</Suspense>
	)
}

function BlogPostFallback() {
	return (
		<section
			className="space-y-10"
			aria-busy="true"
			aria-label="Loading post"
		>
			<div className="space-y-4">
				<div className="h-3 w-12 animate-pulse rounded-sm bg-muted/60" />
				<div className="h-8 w-3/4 animate-pulse rounded-sm bg-muted" />
				<div className="h-4 w-full animate-pulse rounded-sm bg-muted/60" />
				<div className="h-3 w-48 animate-pulse rounded-sm bg-muted/50" />
			</div>
			<div className="h-px w-full bg-border/60" />
			<div className="space-y-3">
				<div className="h-4 w-full animate-pulse rounded-sm bg-muted/50" />
				<div className="h-4 w-11/12 animate-pulse rounded-sm bg-muted/50" />
				<div className="h-4 w-4/5 animate-pulse rounded-sm bg-muted/40" />
				<div className="h-40 w-full animate-pulse rounded-sm bg-muted/30" />
			</div>
		</section>
	)
}

async function BlogPostContent({
	params,
	includeDrafts = false,
	linkBasePath = '/blog',
	showStructuredData = true
}: BlogPostViewProps) {
	const userIsAdmin = includeDrafts
	const resolvedParams = await params
	let slug = Array.isArray(resolvedParams.slug)
		? resolvedParams.slug.join('/')
		: resolvedParams.slug

	if (!slug) {
		notFound()
	}

	const post = await getResolvedBlogPostBySlug(slug, userIsAdmin)

	if (!post) {
		notFound()
	}

	const { prevPost, nextPost } = await getAdjacentBlogPosts(slug, userIsAdmin)

	return (
		<>
			{showStructuredData && (
				<>
					<BlogPostStructuredData
						title={post.metadata.title}
						description={post.metadata.summary}
						publishedAt={post.metadata.publishedAt}
						updatedAt={post.metadata.updatedAt}
						author={post.metadata.author || 'Remco Stoeten'}
						image={post.metadata.image}
						url={`${baseUrl}/blog/${post.slug}`}
						keywords={post.metadata.tags || []}
					/>
					<BreadcrumbStructuredData
						items={[
							{ name: 'Home', url: '/' },
							{ name: 'Blog', url: '/blog' },
							{
								name: post.metadata.title,
								url: `/blog/${post.slug}`
							}
						]}
					/>
				</>
			)}
			<TableOfContents />

			<section className="px-1 sm:px-2">
				<BlogPostClient
					publishedAt={post.metadata.publishedAt}
					topic={post.metadata.topic}
					tags={post.metadata.tags}
					title={post.metadata.title}
					summary={post.metadata.summary}
					readTime={calculateReadTime(post.content)}
					slug={post.slug}
					uniqueViews={post.uniqueViews}
					totalViews={post.views}
				/>

				<hr className="my-10 border-border/60" />

				<article className="prose prose-quoteless prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-foreground prose-a:underline prose-a:decoration-border prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-img:rounded-md prose-code:before:content-none prose-code:after:content-none">
					<CustomMDX source={post.content} />
				</article>

				<ReactionBar slug={post.slug} />
				<CommentSection slug={post.slug} />

				<PostNavigation
					prevPost={prevPost}
					nextPost={nextPost}
					basePath={linkBasePath}
				/>
			</section>
		</>
	)
}
