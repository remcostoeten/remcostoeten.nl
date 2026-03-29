import { Metadata } from 'next'
import { getResolvedBlogPostBySlug } from '@/lib/blog'
import { createArticleMetadata, extendMetadata, baseUrl } from '@/core/metadata/base'
import { BlogPostView } from './view'
import { checkAdminStatus } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
	const { getBlogPosts } = await import('@/lib/blog')
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
}): Promise<Metadata> {
	const isAdminUser = await checkAdminStatus()
	const resolvedParams = await params
	let slug = Array.isArray(resolvedParams.slug)
		? resolvedParams.slug.join('/')
		: resolvedParams.slug

	if (!slug) {
		return {}
	}

	let post = await getResolvedBlogPostBySlug(slug)
	if (!post) {
		return {}
	}

	if (post.metadata.draft && !isAdminUser) {
		return {}
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
		updatedAt,
		canonicalUrl
	} = post.metadata

	const base = createArticleMetadata({
		title,
		description,
		publishedAt: publishedTime,
		updatedAt,
		image,
		canonical: canonicalUrl || `/blog/${post.slug}`,
		keywords: post.metadata.tags
	})

	return extendMetadata(base, {
		openGraph: {
			...base.openGraph,
			url: `${baseUrl}/blog/${post.slug}`
		}
	})
}

export default function Page(props: { params: Promise<{ slug: string | string[] }> }) {
	return <BlogPostView params={props.params} />
}
