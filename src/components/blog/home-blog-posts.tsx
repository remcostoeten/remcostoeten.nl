import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getVisibleBlogPosts } from '@/features/blog'
import { getDateParts, readMinutes } from '@/features/blog/lib/format'
import { Section } from '../ui/section'

function HomePostCountHeader({ count }: { count: number }) {
	return (
		<span className="text-xs text-muted-foreground/60 inline-flex items-baseline gap-1">
			{count}
			<span>posts</span>
		</span>
	)
}

export async function HomeBlogPosts() {
	const posts = await getVisibleBlogPosts(false)
	const previewPosts = posts.slice(0, 3)

	return (
		<Section
			animatedStripes
			title="Posts"
			headerAction={<HomePostCountHeader count={posts.length} />}
			noHeaderMargin
		>
			<div className="px-4 pt-4 md:px-5">
				<div className="border-b border-border/40 pb-4">
					<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
						Build notes, postmortems, and technical writeups worth
						keeping around after the tab would normally be closed.
					</p>
				</div>

				<div className="border-b border-border/40 pt-2">
					{previewPosts.map(post => {
						const dateParts = getDateParts(
							post.metadata.publishedAt
						)
						const readTimeMinutes = readMinutes(
							post.metadata.readTime || ''
						)

						const allTags = [
							...(post.metadata.topic
								? [post.metadata.topic]
								: []),
							...(post.metadata.tags || [])
						].filter(
							(tag, index, arr) => arr.indexOf(tag) === index
						)

						return (
							<Link
								key={post.slug}
								href={`/blog/${post.slug}`}
								className="group -mx-4 flex items-start justify-between gap-4 border-b border-border/40 px-4 py-5 transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary last:border-b-0 md:-mx-5 md:px-5"
							>
								<div className="min-w-0 flex-1">
									<div className="flex flex-col gap-2 min-w-0">
										<div className="flex items-start gap-2 min-w-0">
											<div className="min-w-0 flex-1">
												<span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
													{post.metadata.title}
												</span>
												{post.metadata.summary && (
													<p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground/85">
														{post.metadata.summary}
													</p>
												)}
											</div>
										</div>

										<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground/50">
											<span className="font-mono tabular-nums whitespace-nowrap">
												{dateParts.day}{' '}
												{dateParts.month.slice(0, 3)}{' '}
												{dateParts.year}
											</span>

											{readTimeMinutes > 0 && (
												<>
													<span className="text-muted-foreground/20">
														·
													</span>
													<span className="whitespace-nowrap">
														{readTimeMinutes} min
														read
													</span>
												</>
											)}

											{allTags.length > 0 && (
												<div className="flex flex-wrap gap-1.5 sm:ml-1">
													{allTags
														.slice(0, 3)
														.map(tag => (
															<span
																key={tag}
																className="border border-border/50 bg-secondary/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-foreground/80"
															>
																{tag}
															</span>
														))}
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="pt-1">
									<ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground/30 transition-transform transition-colors duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:text-foreground motion-reduce:transform-none" />
								</div>
							</Link>
						)
					})}
				</div>

				<div>
					<Link
						href="/blog"
						className="flex w-full items-center justify-center py-4 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
					>
						View all ({posts.length})
					</Link>
				</div>
			</div>
		</Section>
	)
}
