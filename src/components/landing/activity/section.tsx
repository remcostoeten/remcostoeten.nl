import { ActivityContributionGraph } from './contribution-graph'
import { Section } from '../../ui/section'
import { Heading } from '../../ui/heading'
import { ActivityFeed, ActivityFeedSkeleton } from './activity-feed'
import { ProjectHoverWrapper } from './hover-wrappers'
import { CurrentYear } from '@/components/ui/current-year'
import { getActivityData } from '@/features/activity/server'
import type { ActivityData } from '@/features/activity/types'
import Link from 'next/link'
import type { ReactNode } from 'react'

const emptyActivity: ActivityData = {
	contributions: [],
	totalContributions: 0,
	recentActivity: [],
	spotifyTracks: [],
	fetchedAt: 0
}

type LayoutProps = {
	graph: ReactNode
	feed: ReactNode
	loading?: boolean
}

function ActivitySectionLayout({ graph, feed, loading = false }: LayoutProps) {
	return (
		<Section noPadding contentPadding={true} className="-mb-6">
			<Heading
				title="Activity & Contributions"
				noMargin
				bgDirection="diagonal"
				colorPattern="dark"
				animateStripes
				headerAction={
					<CurrentYear className="text-xs text-muted-foreground/60 inline-flex items-baseline" />
				}
			/>
			<div className="space-y-5 pt-4" aria-busy={loading || undefined}>
				<p className="px-4 text-sm leading-relaxed text-muted-foreground md:px-5">
					Besides my professional work, I also build a lot of open
					source. Primarily I've been working on{' '}
					<Link
						href="https://skriuw.vercel.app"
						target="_blank"
						className="group rounded-sm transition-colors focus-visible:outline-none focus-visible:bg-muted"
					>
						<ProjectHoverWrapper
							repository="remcostoeten/skriuw"
							isPrivate={false}
						>
							<span className="text-foreground/80 underline decoration-dotted underline-offset-4 transition-colors group-focus-visible:text-foreground">
								Skriuw
							</span>
						</ProjectHoverWrapper>
					</Link>
					, a Notion-like desktop application, and{' '}
					<Link
						href="https://doradb.com/app"
						target="_blank"
						className="group rounded-sm transition-colors focus-visible:outline-none focus-visible:bg-muted"
					>
						<ProjectHoverWrapper
							repository="remcostoeten/doradb"
							isPrivate={false}
						>
							<span className="text-foreground/80 underline decoration-dotted underline-offset-4 transition-colors group-focus-visible:text-foreground">
								DoraDB
							</span>
						</ProjectHoverWrapper>
					</Link>
					, both currently in beta.
				</p>

				<a
					href="#activity-feed"
					className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus-visible:outline-none focus-visible:bg-muted"
				>
					Skip activity calendar
				</a>

				<div className="px-4 md:px-5">{graph}</div>

				<div id="activity-feed" tabIndex={-1} className="outline-none">
					{feed}
				</div>
			</div>
		</Section>
	)
}

export async function ActivitySection() {
	const data = await getActivityData()

	return (
		<ActivitySectionLayout
			graph={<ActivityContributionGraph data={data} showLegend={true} />}
			feed={
				<ActivityFeed
					data={data}
					activityCount={5}
					rotationInterval={6000}
				/>
			}
		/>
	)
}

export function ActivitySectionSkeleton() {
	return (
		<ActivitySectionLayout
			loading
			graph={
				<ActivityContributionGraph
					data={emptyActivity}
					showLegend={true}
					loading
				/>
			}
			feed={<ActivityFeedSkeleton />}
		/>
	)
}
