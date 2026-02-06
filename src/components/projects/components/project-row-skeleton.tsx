'use client'

import { memo } from 'react'

export const ProjectRowSkeleton = memo(function ProjectRowSkeleton() {
	return (
		<div className="flex items-center justify-between bg-card px-2 sm:px-3 py-2 border-b border-border animate-pulse">
			<div className="flex items-center gap-2 min-w-0">
				<div className="h-3 w-20 bg-muted rounded" />
				<div className="hidden md:block h-3 w-40 bg-muted/60 rounded" />
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<div className="hidden lg:block h-3 w-12 bg-muted/40 rounded" />
				<div className="flex gap-1">
					<div className="h-4 w-10 bg-muted/40 rounded" />
					<div className="h-4 w-12 bg-muted/40 rounded" />
				</div>
				<div className="flex items-center gap-1">
					<div className="h-4 w-4 bg-muted/40 rounded" />
					<div className="h-4 w-4 bg-muted/40 rounded" />
				</div>
			</div>
		</div>
	)
})
