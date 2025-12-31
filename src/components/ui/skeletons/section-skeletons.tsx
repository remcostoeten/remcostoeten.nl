import { Skeleton } from './skeleton'
import { ActivitySkeleton } from './activity-skeleton'

export function TechStackSkeleton() {
    return (
        <div className="relative grid grid-cols-2 border-x md:grid-cols-4">
            <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="relative flex min-h-[120px] flex-col justify-between border-r border-b p-6">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-sm opacity-50" />
                </div>
            ))}
            <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b" />
        </div>
    )
}

export function ActivitySectionSkeleton() {
    // Must match the structure of Section -> noPadding={true} contentPadding={true}
    // Mirrors: Heading, paragraph, ContributionGraph, ActivityFeed
    // CRITICAL: min-height must match actual content to prevent CLS
    return (
        <section className="relative" style={{ minHeight: '380px' }}>
            <div className="full-width-header">
                <div className="header-content-container flex items-center justify-between header-content-container--with-padding">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>

            <div className="space-y-4 pt-3">
                {/* Paragraph */}
                <div className="px-4 md:px-5">
                    <Skeleton className="h-4 w-full max-w-xl" />
                </div>

                {/* Contribution Graph - min-height prevents shift when actual graph loads */}
                <div className="px-4 md:px-5" style={{ minHeight: '90px' }}>
                    <div className="h-[85px] w-full bg-muted/5 rounded" />
                </div>

                {/* Activity Feed - 5 items with fixed container height */}
                <div className="px-4 md:px-5" style={{ minHeight: '120px' }}>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
