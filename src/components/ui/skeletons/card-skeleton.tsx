import { Skeleton } from './skeleton'

export function CardSkeleton() {
    return (
        <div className="rounded-none border border-border/50 p-6 space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
        </div>
    )
}
