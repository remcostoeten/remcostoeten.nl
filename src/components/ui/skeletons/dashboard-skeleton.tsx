import { Skeleton } from './skeleton'

export function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="rounded-none border border-border/50 p-6 space-y-4"
					>
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-3 w-20" />
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="rounded-none border border-border/50 p-6 space-y-4">
					<Skeleton className="h-6 w-48" />
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								className="h-16 w-full rounded-md"
							/>
						))}
					</div>
				</div>

				<div className="rounded-none border border-border/50 p-6 space-y-4">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-64 w-full rounded-md" />
				</div>
			</div>
		</div>
	)
}
