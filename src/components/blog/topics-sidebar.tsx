import Link from 'next/link'
import { Hash } from 'lucide-react'
import { getVisibleTopics } from '@/lib/blog/visibility'

export async function TopicsSidebar() {
	const topics = await getVisibleTopics()

	return (
		<aside className="hidden lg:block fixed -right-52 w-48 z-40 top-1.5">
			<div>
				<h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">
					Topics
				</h2>
				<ul className="space-y-1">
					{topics.map(topic => (
						<li key={topic.slug}>
							<Link
								href={`/blog/topics/${topic.slug}`}
								className="group flex items-center justify-between py-1.5 text-sm text-neutral-400 hover:text-lime-400 transition-colors"
							>
								<span className="flex items-center gap-2">
									<Hash className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
									<span className="truncate">{topic.name}</span>
								</span>
								<span className="text-xs text-neutral-600 tabular-nums">
									{topic.count}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</aside>
	)
}
