import { ActivityContributionGraph } from './contribution-graph'
import { Section } from '../../ui/section'
import { Heading } from '../../ui/heading'
import { ActivityFeed } from './activity-feed'
import { ProjectHoverWrapper } from './hover-wrappers'
import { CurrentYear } from '@/components/ui/current-year'
import Link from 'next/link'

export function ActivitySection() {
	return (
		<Section noPadding contentPadding={true} className="mb-0">
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
			<div className="space-y-4 pt-3">
				<p className="px-4 md:px-5 text-sm text-muted-foreground/80 leading-relaxed font-mono tracking-tight">
					Besides my professional work, I also build a lot of open
					source. Primarily I've been working on{' '}
					<Link href="https://skriuw.vercel.app" target="_blank">
						<ProjectHoverWrapper
							repository="remcostoeten/skriuw"
							isPrivate={false}
						>
							<span className="text-foreground/80 underline decoration-dotted underline-offset-4">
								Skriuw
							</span>
						</ProjectHoverWrapper>
					</Link>
					, a Notion-like desktop application, and{' '}
					<Link href="https://doradb.vercel.app" target="_blank">
						<ProjectHoverWrapper
							repository="remcostoeten/doradb"
							isPrivate={false}
						>
							<span className="text-foreground/80 underline decoration-dotted underline-offset-4">
								DoraDB
							</span>
						</ProjectHoverWrapper>
					</Link>{' '}
					— both currently in beta.
				</p>

				<div>
					<ActivityContributionGraph showLegend={true} />
				</div>

				<ActivityFeed activityCount={5} rotationInterval={6000} />
			</div>
		</Section>
	)
}
