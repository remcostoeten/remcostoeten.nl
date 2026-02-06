import { Skeleton } from './skeleton'

interface TableSkeletonProps {
	rows?: number
	columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
	return (
		<div className="w-full space-y-3">
			{/* Header */}
			<div className="flex gap-4 pb-3 border-b border-border/50">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={`header-${i}`} className="h-4 flex-1" />
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div key={`row-${rowIndex}`} className="flex gap-4">
					{Array.from({ length: columns }).map((_, colIndex) => (
						<Skeleton
							key={`cell-${rowIndex}-${colIndex}`}
							className="h-4 flex-1"
						/>
					))}
				</div>
			))}
		</div>
	)
}
