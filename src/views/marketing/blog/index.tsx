import { BlogPosts } from '@/components/blog/posts'
import { TopicsSidebar } from '@/components/blog/topics-sidebar'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { PageHeader } from '@/components/ui/page-header'

export function BlogView() {
	return (
		<>
			<BreadcrumbStructuredData
				items={[
					{ name: 'Home', url: '/' },
					{ name: 'Blog', url: '/blog' }
				]}
			/>
			<TopicsSidebar />
			<section className="space-y-6 sm:space-y-8">
				<div className="pt-1 sm:pt-2 md:pt-4">
					<PageHeader title="My Blog" />
				</div>
				<BlogPosts />
			</section>
		</>
	)
}
