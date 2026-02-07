'use client'

import { memo } from 'react'

export const ProjectCardSkeleton = memo(function ProjectCardSkeleton() {
	return (
		<div className="bg-card animate-pulse">
			<div className="flex flex-col">
				<div className="flex items-start justify-between gap-2 sm:gap-4 p-2 sm:p-3">
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<div className="h-3 w-24 bg-muted rounded" />
							<div className="h-3 w-12 bg-muted/50 rounded" />
						</div>
						<div className="mt-2 space-y-1">
							<div className="h-2.5 w-full bg-muted/60 rounded" />
							<div className="h-2.5 w-3/4 bg-muted/60 rounded" />
						</div>
						<div className="mt-3 flex gap-1">
							<div className="h-4 w-12 bg-muted/40 rounded" />
							<div className="h-4 w-10 bg-muted/40 rounded" />
							<div className="h-4 w-14 bg-muted/40 rounded" />
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-1.5">
						<div className="h-5 w-5 bg-muted/40 rounded" />
						<div className="h-4 w-4 bg-muted/40 rounded" />
						<div className="h-4 w-4 bg-muted/40 rounded" />
					</div>
				</div>
			</div>
		</div>
	)
})
