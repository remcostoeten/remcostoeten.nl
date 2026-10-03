import { Skeleton } from '@/components/ui/skeletons/skeleton'

export function RepoCardSkeleton() {
	return (
		<div
			aria-hidden="true"
			className="not-prose my-8 border border-border/60 bg-muted/20 p-4"
		>
			<div className="flex items-center gap-3">
				<Skeleton className="h-8 w-8 rounded-full" />
				<Skeleton className="h-4 w-40" />
			</div>
			<Skeleton className="mt-4 h-3 w-3/4" />
			<div className="mt-4 flex gap-4">
				<Skeleton className="h-3 w-12" />
				<Skeleton className="h-3 w-12" />
				<Skeleton className="h-3 w-20" />
			</div>
		</div>
	)
}
