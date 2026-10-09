import Link from 'next/link'
import { ArrowUpRight, Eye, Mail, MessageSquare, Users } from 'lucide-react'
import { getAdminMetrics } from '@/server/queries/admin'
import { getAllBlogPosts } from '@/features/blog'
import { getAllCommentsAdmin } from '@/server/queries/blog/comments'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BlogTable } from '@/components/admin/blogs/blog-table'
import { ContactOverview } from '@/components/admin/contact/contact-overview'
import { ActivityFeed } from '@/components/admin/activity/activity-feed'
import {
	CountryTraffic,
	VisitorLog
} from '@/components/admin/metrics/user-metrics'

function MetricCell({
	icon: Icon,
	label,
	value,
	hint
}: {
	icon: typeof Eye
	label: string
	value: number
	hint: string
}) {
	return (
		<div className="flex flex-col gap-3 bg-card p-5">
			<div className="flex items-center justify-between text-[13px] text-muted-foreground">
				<span>{label}</span>
				<Icon className="size-4" />
			</div>
			<span className="admin-metric-value">{value.toLocaleString()}</span>
			<span className="text-[11px] text-muted-foreground">{hint}</span>
		</div>
	)
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`
}

export default async function AdminPage() {
	const metrics = await getAdminMetrics()
	const allPosts = getAllBlogPosts()
	const { comments, recentCount } = await getAllCommentsAdmin()

	const statsMap = new Map(metrics.postStats.map(s => [s.slug, s]))

	const postsWithStats = allPosts.map(post => {
		const stats = statsMap.get(post.slug)
		const isDraft =
			(post.metadata.draft ?? false) || (stats?.isDraft ?? false)

		return {
			...post,
			metadata: {
				...post.metadata,
				draft: isDraft
			},
			totalViews: stats?.totalViews || 0,
			uniqueViews: stats?.uniqueViews || 0
		}
	})

	const recentSubmissionsCount = metrics.contactStats.filter(
		s => new Date(s.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
	).length

	return (
		<div className="space-y-8">
			<AdminPageHeader
				title="Overview"
				description="Welcome back, Remco. Here's what's happening with your site."
				actions={
					<Link
						href="/blog"
						className="admin-btn"
						data-variant="primary"
					>
						View posts
						<ArrowUpRight className="size-4" />
					</Link>
				}
			/>

			<div className="admin-panel grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
				<MetricCell
					icon={Eye}
					label="Total views"
					value={metrics.totalViews}
					hint={`+${pluralize(metrics.viewsToday, 'view')} today`}
				/>
				<MetricCell
					icon={Users}
					label="Unique visitors"
					value={metrics.uniqueVisitors}
					hint={`Across ${pluralize(metrics.countryCount, 'country', 'countries')}`}
				/>
				<MetricCell
					icon={MessageSquare}
					label="Comments"
					value={comments.length}
					hint={
						recentCount > 0
							? `+${recentCount} in the last 24h`
							: 'On your published posts'
					}
				/>
				<MetricCell
					icon={Mail}
					label="Messages"
					value={metrics.contactStats.length}
					hint={
						recentSubmissionsCount > 0
							? pluralize(recentSubmissionsCount, 'new message')
							: 'No new messages'
					}
				/>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<div id="blogs" className="min-w-0 scroll-mt-20">
					<BlogTable posts={postsWithStats} />
				</div>

				<aside className="space-y-6">
					<ActivityFeed
						comments={comments.map(comment => ({
							...comment,
							createdAt: comment.createdAt.toISOString()
						}))}
						submissions={metrics.contactStats}
					/>
					<div id="analytics" className="scroll-mt-20">
						<CountryTraffic
							viewsByCountry={metrics.viewsByCountry}
							totalViews={metrics.totalViews}
						/>
					</div>
				</aside>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div id="messages" className="scroll-mt-20">
					<ContactOverview
						data={{
							submissions: metrics.contactStats,
							interactions: metrics.interactions,
							abandonments: metrics.abandonments
						}}
					/>
				</div>
				<VisitorLog recentViews={metrics.recentViews} />
			</div>
		</div>
	)
}
