import { getAdminMetrics } from '@/actions/admin'
import { getAllBlogPosts } from '@/utils/utils'
import { BlogList } from '@/components/admin/blogs/blog-list'
import { UserMetrics } from '@/components/admin/metrics/user-metrics'
import { ContactOverview } from '@/components/admin/contact/contact-overview'
import { getAllCommentsAdmin } from '@/actions/comments'
import { AdminComments } from '@/components/admin/comments/admin-comments'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
	LayoutDashboard,
	FileText,
	Mail,
	BarChart3,
	Eye,
	Users,
	MessageSquare,
	TrendingUp
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function QuickStat({
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
		<Card>
			<CardContent className="p-4 flex items-center gap-4">
				<div className="p-3 rounded-xl bg-primary/10">
					<Icon className="w-5 h-5 text-primary" />
				</div>
				<div className="flex-1">
					<p className="text-sm text-muted-foreground">{label}</p>
					<div className="flex items-baseline gap-2">
						<span className="text-2xl font-bold">
							{value.toLocaleString()}
						</span>
						{trend && (
							<span className="text-xs text-green-600 flex items-center gap-0.5">
								<TrendingUp className="w-3 h-3" />
								{trend}
							</span>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default async function AdminPage() {
	const metrics = await getAdminMetrics()
	const allPosts = getAllBlogPosts()
	const { comments, recentCount } = await getAllCommentsAdmin()

	const statsMap = new Map(metrics.postStats.map(s => [s.slug, s]))

	const postsWithStats = allPosts.map(post => {
		const stats = statsMap.get(post.slug)
		// Prioritize DB draft status if available, fallback to file metadata
		const isDraft = stats?.isDraft ?? post.metadata.draft ?? false
		
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
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<QuickStat
					icon={Eye}
					label="Total Views"
					value={metrics.totalViews}
				/>
				<QuickStat
					icon={Users}
					label="Unique Visitors"
					value={metrics.uniqueVisitors}
				/>
				<QuickStat
					icon={MessageSquare}
					label="Comments"
					value={comments.length}
					trend={recentCount > 0 ? `+${recentCount} new` : undefined}
				/>
				<QuickStat
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

			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
					<TabsTrigger value="overview" className="gap-2" aria-label="Dashboard Overview">
						<LayoutDashboard className="w-4 h-4 hidden md:block" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="blogs" className="gap-2" aria-label="Manage Blogs">
						<FileText className="w-4 h-4 hidden md:block" />
						Blogs
					</TabsTrigger>
					<TabsTrigger value="contact" className="gap-2" aria-label="Contact Messages">
						<Mail className="w-4 h-4 hidden md:block" />
						Contact
					</TabsTrigger>
					<TabsTrigger value="analytics" className="gap-2" aria-label="Site Analytics">
						<BarChart3 className="w-4 h-4 hidden md:block" />
						Analytics
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-6">
							<BlogList posts={postsWithStats} />
						</div>
						<div className="space-y-6">
							<ContactOverview
								data={{
									submissions: metrics.contactStats,
									interactions: metrics.interactions,
									abandonments: metrics.abandonments
								}}
							/>
							<AdminComments
								comments={comments.map(comment => ({
									...comment,
									createdAt: comment.createdAt.toISOString()
								}))}
								recentCount={recentCount}
							/>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="blogs" className="mt-6">
					<BlogList posts={postsWithStats} />
				</TabsContent>

				<TabsContent value="contact" className="mt-6">
					<div className="max-w-2xl">
						<ContactOverview
							data={{
								submissions: metrics.contactStats,
								interactions: metrics.interactions,
								abandonments: metrics.abandonments
							}}
						/>
					</div>
				</TabsContent>

				<TabsContent value="analytics" className="mt-6">
					<div className="grid gap-6 lg:grid-cols-2">
						<UserMetrics data={metrics} />
						<AdminComments
							comments={comments.map(comment => ({
								...comment,
								createdAt: comment.createdAt.toISOString()
							}))}
							recentCount={recentCount}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
