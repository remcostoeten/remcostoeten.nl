'use client'

import { memo } from 'react'

type Props = {
	compact?: boolean
}

export const ProjectPreviewSkeleton = memo(function ProjectPreviewSkeleton({
	compact = false
}: Props) {
	return (
		<div
			className="relative overflow-hidden border-t border-border bg-background/60"
			role="status"
			aria-label="Loading project preview"
		>
			<div className="pointer-events-none absolute inset-0 motion-safe:animate-pulse bg-muted/5" />
			<div className="relative flex h-8 items-center gap-2 border-b border-border bg-card/70 px-3">
				<div className="h-2 w-2 rounded-full bg-muted/50" />
				<div className="h-2 w-16 rounded-sm bg-muted/50" />
				<div className="ml-auto h-2 w-12 rounded-sm bg-muted/30" />
			</div>
			<div className="relative flex min-h-[150px] sm:min-h-[200px]">
				<div className="hidden w-24 shrink-0 border-r border-border p-3 sm:block">
					<div className="mb-5 h-2 w-12 rounded-sm bg-muted/45" />
					<div className="space-y-3">
						<div className="h-2 w-full rounded-sm bg-muted/30" />
						<div className="h-2 w-4/5 rounded-sm bg-muted/25" />
						<div className="h-2 w-full rounded-sm bg-muted/30" />
						<div className="h-2 w-3/5 rounded-sm bg-muted/25" />
					</div>
				</div>
				<div className="min-w-0 flex-1 p-4 sm:p-5">
					<div className="mb-5 flex items-center justify-between gap-4">
						<div className="h-3 w-28 rounded-sm bg-muted/55" />
						<div className="h-5 w-14 rounded-sm bg-muted/25" />
					</div>
					<div className="grid grid-cols-2 gap-2 sm:gap-3">
						{Array.from({ length: compact ? 2 : 4 }).map(
							(_, index) => (
								<div
									key={index}
									className="h-12 rounded-sm border border-border bg-muted/10 sm:h-14"
								>
									<div className="m-2 h-2 w-1/2 rounded-sm bg-muted/35" />
									<div className="mx-2 mt-2 h-2 w-3/4 rounded-sm bg-muted/20" />
								</div>
							)
						)}
					</div>
					<div className="mt-4 space-y-2">
						<div className="h-2 w-full rounded-sm bg-muted/25" />
						<div className="h-2 w-4/5 rounded-sm bg-muted/20" />
					</div>
				</div>
			</div>
		</div>
	)
})
