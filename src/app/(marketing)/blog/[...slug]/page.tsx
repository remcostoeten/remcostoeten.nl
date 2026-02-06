import { notFound } from 'next/navigation'

import { getBlogPosts, getAllBlogPosts, calculateReadTime } from '@/utils/utils'
import { baseUrl } from '@/app/sitemap'
import { CustomMDX } from '@/components/blog/mdx'
import { BlogPostClient, PostNavigation } from '@/components/blog/post-view'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReactionBar } from '@/components/blog/reaction-bar'
import { CommentSection } from '@/components/blog/comment-section'
import { checkAdminStatus } from '@/actions/auth'
import {
	BlogPostStructuredData,
	BreadcrumbStructuredData
} from '@/components/seo/structured-data'
import { db } from '@/server/db/connection'
import { blogPosts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

// Force dynamic rendering due to auth requirements
// Must be dynamic due to auth (cookies/headers) usage
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
	let posts = getBlogPosts()

	return posts
		.filter(post => post && post.slug)
		.map(post => ({
			slug: post.slug.split('/')
		}))
}

export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string | string[] }>
}) {
	const resolvedParams = await params
	let slug = Array.isArray(resolvedParams.slug)
		? resolvedParams.slug.join('/')
		: resolvedParams.slug

	if (!slug) {
		return {}
	}

	let post = getBlogPosts().find(post => post.slug === slug)
	if (!post) {
		return {}
	}

	let {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
		updatedAt,
		canonicalUrl
	} = post.metadata
	let ogImage = image
		? image
		: `${baseUrl}/og?title=${encodeURIComponent(title)}`

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'article',
			publishedTime,
			modifiedTime: updatedAt,
			url: `${baseUrl}/blog/${post.slug}`,
			images: [
				{
					url: ogImage
				}
			]
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImage]
		},
		alternates: {
			canonical: canonicalUrl || `${baseUrl}/blog/${post.slug}`
		}
	}
}

// No dynamic imports in this file - moved to client component

export default async function Blog({
	params
}: {
	params: Promise<{ slug: string | string[] }>
}) {
	const resolvedParams = await params
	let slug = Array.isArray(resolvedParams.slug)
		? resolvedParams.slug.join('/')
		: resolvedParams.slug

	if (!slug) {
		notFound()
	}

	// Get all posts including drafts for now
	// We'll filter client-side based on admin status
	const allPosts = getAllBlogPosts()
	const post = allPosts.find(p => p.slug === slug)

	if (!post) {
		notFound()
	}

	// Check if user is admin on the server side for initial render
	const isAdminUser = await checkAdminStatus()

	if (post.metadata.draft && !isAdminUser) {
		notFound()
	}

	// Fetch view counts
	const viewData = await db.query.blogPosts.findFirst({
		where: eq(blogPosts.slug, slug),
		columns: {
			uniqueViews: true,
			totalViews: true
		}
	})

	const currentIndex = allPosts.findIndex(p => p.slug === slug)
	const prevPost =
		currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
	const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

	return (
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
					{ name: post.metadata.title, url: `/blog/${post.slug}` }
				]}
			/>
			<TableOfContents />

			<section className="bg-pattern relative">
				<BlogPostClient
					publishedAt={post.metadata.publishedAt}
					tags={post.metadata.tags}
					title={post.metadata.title}
					summary={post.metadata.summary}
					readTime={calculateReadTime(post.content)}
					slug={post.slug}
					uniqueViews={viewData?.uniqueViews || 0}
					totalViews={viewData?.totalViews || 0}
				/>

				<div className="screen-border mb-12" />

				<article className="prose prose-quoteless prose-neutral dark:prose-invert max-w-3xl prose-code:before:content-none prose-code:after:content-none">
					<CustomMDX source={post.content} />
				</article>

				<div className="max-w-3xl">
					<ReactionBar slug={post.slug} />
					<CommentSection slug={post.slug} />
				</div>

				<PostNavigation prevPost={prevPost} nextPost={nextPost} />
			</section>
		</>
	)
}
