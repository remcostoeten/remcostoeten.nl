import { Skeleton } from './skeleton'

interface FormSkeletonProps {
    fields?: number
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
    return (
        <div className="space-y-6">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
        </div>
    )
}
