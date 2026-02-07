'use client'

export function SkeletonDemo() {
	return (
		<div className="p-6 space-y-3">
			<div className="animate-pulse bg-muted/50 h-4 w-3/4 rounded" />
			<div className="animate-pulse bg-muted/50 h-3 w-1/2 rounded" />
			<div className="flex gap-2 mt-4">
				<div className="animate-pulse bg-muted/50 h-6 w-16 rounded" />
				<div className="animate-pulse bg-muted/50 h-6 w-12 rounded" />
			</div>
		</div>
	)
}
