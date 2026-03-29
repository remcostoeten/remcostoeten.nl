import Link from 'next/link'
import { Hash } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { getVisibleTopics } from '@/lib/blog'

export async function TopicsView() {
	const topics = await getVisibleTopics()

	return (
		<section className="space-y-6 sm:space-y-8">
			<PageHeader
				title="Topics"
				description="Browse writing by topic and jump straight into posts."
				className="pt-1 sm:pt-2 md:pt-4"
			/>

			<ul
				className="m-0 mt-4 flex list-none flex-col border-t border-border/40 p-0"
				role="list"
			>
				{topics.map((topic, index) => (
					<li key={topic.slug} className="block p-0 m-0">
						<Link
							href={`/blog/topics/${topic.slug}`}
							className="group relative flex items-center justify-between gap-3 border-b border-border/40 px-1 py-4 transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex items-center gap-3 min-w-0">
								<span className="flex size-7 items-center justify-center bg-secondary/40 text-muted-foreground transition-colors group-hover:text-primary">
									<Hash className="size-3.5" />
								</span>
								<span className="font-medium text-foreground transition-colors group-hover:text-primary truncate">
									{topic.name}
								</span>
							</div>

							<span className="text-xs sm:text-sm text-muted-foreground/70 tabular-nums whitespace-nowrap">
								{topic.count}{' '}
								{topic.count === 1 ? 'post' : 'posts'}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
