import { getAdminMetrics } from '@/actions/admin'
import { getAllBlogPosts } from '@/utils/utils'
import { BlogList } from '@/components/admin/blogs/blog-list'
import { UserMetrics } from '@/components/admin/metrics/user-metrics'
import { ContactOverview } from '@/components/admin/contact/contact-overview'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const metrics = await getAdminMetrics()
    const allPosts = getAllBlogPosts()

    const statsMap = new Map(metrics.postStats.map(s => [s.slug, s]))

    const postsWithStats = allPosts.map(post => {
        const stats = statsMap.get(post.slug)
        return {
            ...post,
            totalViews: stats?.totalViews || 0,
            uniqueViews: stats?.uniqueViews || 0
        }
    })

    // Better approach: Let's fetch the view counts for ALL posts in one go in getAdminMetrics
    // But for now, let's render the structure first.

    return (
        <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Blog Management (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    <BlogList posts={postsWithStats} />

                    <div className="grid gap-8 md:grid-cols-2">
                        <ContactOverview
                            data={{
                                submissions: metrics.contactStats,
                                interactions: metrics.interactions,
                                abandonments: metrics.abandonments
                            }}
                        />
                        {/* More admin widgets can go here */}
                    </div>
                </div>

                {/* Right Column: Analytics & Metrics (1/3 width) */}
                <div className="space-y-8">
                    <UserMetrics data={metrics} />
                </div>
            </div>
        </div>
    );
}

