'use client'

import { memo } from 'react'

export const ProjectRowSkeleton = memo(function ProjectRowSkeleton() {
	return (
		<div className="flex flex-col border-b border-border">
			<div className="flex items-center justify-between bg-card px-2 sm:px-3 py-2 animate-pulse">
				<div className="flex h-5 min-w-0 flex-1 items-center gap-2 sm:gap-3">
					<div className="h-3 w-20 bg-muted rounded" />
					<div className="hidden md:block h-3 w-40 bg-muted/60 rounded" />
				</div>
				<div className="ml-3 flex h-9 shrink-0 items-center gap-1 sm:gap-3">
					<div className="hidden md:block h-3 w-12 bg-muted/40 rounded" />
					<div className="flex items-center gap-1">
						<div className="h-4 w-4 bg-muted/40 rounded" />
						<div className="h-4 w-4 bg-muted/40 rounded" />
					</div>
				</div>
			</div>
		</div>
	)
})
