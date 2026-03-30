import { BlogPostView } from '@/views/marketing/blog/post'

export default function AdminBlogPreviewPage(props: {
	params: Promise<{ slug: string | string[] }>
}) {
	return (
		<BlogPostView
			params={props.params}
			includeDrafts
			linkBasePath="/admin/blog"
			showStructuredData={false}
		/>
	)
}
