import { Skeleton } from './skeleton'

interface ListSkeletonProps {
	items?: number
}

export function ListSkeleton({ items = 5 }: ListSkeletonProps) {
	return (
		<div className="space-y-3">
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	)
}
