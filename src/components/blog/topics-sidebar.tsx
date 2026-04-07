import Link from 'next/link'
import { ArrowUpRight, Hash } from 'lucide-react'
import { getVisibleTopics } from '@/features/blog/lib/visibility'
import { Section } from '../ui/section'

export async function TopicsSidebar() {
	const topics = await getVisibleTopics()

	return (
		<Section title="Browse by Topic" noHeaderMargin>
			<div className="px-4 pt-4 md:px-5">
				<div className="border-b border-border/40 pb-4">
					<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
						Grouped paths through the archive when you want fewer
						rabbit holes and more signal.
					</p>
				</div>

				<ul className="divide-y divide-border/40" role="list">
					{topics.map(topic => (
						<li key={topic.slug}>
							<Link
								href={`/blog/topics/${topic.slug}`}
								className="group -mx-4 flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/10 md:-mx-5 md:px-5"
							>
								<div className="min-w-0 flex items-center gap-3">
									<span className="flex size-8 shrink-0 items-center justify-center border border-border/50 bg-secondary/30 text-muted-foreground/70 transition-colors group-hover:text-foreground">
										<Hash className="size-3.5" />
									</span>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-foreground">
											{topic.name}
										</p>
										<p className="text-xs text-muted-foreground/60">
											{topic.count}{' '}
											{topic.count === 1
												? 'post'
												: 'posts'}
										</p>
									</div>
								</div>

								<ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-transform transition-colors group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
							</Link>
						</li>
					))}
				</ul>
			</div>
		</Section>
	)
}
