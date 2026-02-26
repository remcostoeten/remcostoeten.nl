import { getAdminMetrics } from '@/actions/admin'
import { getAllBlogPosts } from '@/utils/utils'
import { BlogTable } from '@/components/admin/blogs/blog-table'
import { UserMetrics } from '@/components/admin/metrics/user-metrics'
import { ContactOverview } from '@/components/admin/contact/contact-overview'
import { getAllCommentsAdmin } from '@/actions/comments'
import { ActivityFeed } from '@/components/admin/activity/activity-feed'
import {
	Eye,
	Users,
	MessageSquare,
	Mail,
	TrendingUp
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function GlassStatCard({
	icon: Icon,
	label,
	value,
	trend
}: {
	icon: typeof Eye
	label: string
	value: number
	trend?: string
}) {
	return (
		<div className="admin-glass-card p-4 flex items-center gap-4 group">
			<div className="p-2.5 bg-[hsl(var(--brand-500)/0.1)] border border-[hsl(var(--brand-400)/0.15)] transition-colors group-hover:border-[hsl(var(--brand-400)/0.3)]">
				<Icon className="w-4 h-4 text-[hsl(var(--brand-400))]" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-xs text-muted-foreground">{label}</p>
				<div className="flex items-baseline gap-2 mt-0.5">
					<span className="text-2xl font-bold tracking-tight">
						{value.toLocaleString()}
					</span>
					{trend && (
						<span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
							<TrendingUp className="w-3 h-3" />
							{trend}
						</span>
					)}
				</div>
			</div>
		</div>
	)
}

export default async function AdminPage() {
	const metrics = await getAdminMetrics()
	const allPosts = getAllBlogPosts()
	const { comments, recentCount } = await getAllCommentsAdmin()

	const statsMap = new Map(metrics.postStats.map(s => [s.slug, s]))

	const postsWithStats = allPosts.map(post => {
		const stats = statsMap.get(post.slug)
		const isDraft = (post.metadata.draft ?? false) || (stats?.isDraft ?? false)

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
		<div className="space-y-6">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<GlassStatCard
					icon={Eye}
					label="Total Views"
					value={metrics.totalViews}
				/>
				<GlassStatCard
					icon={Users}
					label="Unique Visitors"
					value={metrics.uniqueVisitors}
				/>
				<GlassStatCard
					icon={MessageSquare}
					label="Comments"
					value={comments.length}
					trend={recentCount > 0 ? `+${recentCount} new` : undefined}
				/>
				<GlassStatCard
					icon={Mail}
					label="Messages"
					value={metrics.contactStats.length}
					trend={
						recentSubmissionsCount > 0
							? `+${recentSubmissionsCount} new`
							: undefined
					}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_340px]">
				<div className="space-y-6" id="blogs">
					<BlogTable posts={postsWithStats} />

					<div id="messages">
						<ContactOverview
							data={{
								submissions: metrics.contactStats,
								interactions: metrics.interactions,
								abandonments: metrics.abandonments
							}}
						/>
					</div>

					<div id="analytics">
						<UserMetrics data={metrics} />
					</div>
				</div>

				<aside className="space-y-4">
					<ActivityFeed
						comments={comments.map(comment => ({
							...comment,
							createdAt: comment.createdAt.toISOString()
						}))}
						submissions={metrics.contactStats}
					/>
				</aside>
			</div>
		</div>
	)
}
