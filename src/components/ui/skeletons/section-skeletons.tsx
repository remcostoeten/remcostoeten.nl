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
    return (
        <div className="py-12 md:py-16 lg:py-24">
            {/* Heading */}
            <div className="flex items-center justify-between mb-8 px-4 md:px-5">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-32" />
            </div>

            <div className="space-y-8">
                {/* Text */}
                <div className="px-4 md:px-5 space-y-2">
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Graph Placeholder */}
                <div className="px-4 md:px-5">
                    <Skeleton className="h-[180px] w-full rounded-md" />
                </div>

                {/* Feed */}
                <div className="px-4 md:px-5">
                    <ActivitySkeleton />
                </div>
            </div>
        </div>
    )
}
