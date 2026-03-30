import Link from 'next/link'
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
			<section className="space-y-6 sm:space-y-8">
				<div className="space-y-3 pt-1 sm:pt-2 md:pt-3 px-4 md:px-5">
					<PageHeader
						title="Blog"
						description="Writing on engineering, experiments, and the occasional overcooked opinion."
					/>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-muted-foreground/70">
						<span>Notes, breakdowns, and technical detours.</span>
						<Link
							href="/blog/topics"
							className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
						>
							Browse topics
						</Link>
					</div>
				</div>
				<BlogPosts />
				<TopicsSidebar />
			</section>
		</>
	)
}
