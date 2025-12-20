import { Skeleton } from './skeleton'

export function ActivitySkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        {i < 4 && <div className="w-px h-full bg-border/50 mt-2" />}
                    </div>
                    <div className="flex-1 pb-6 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    )
}
