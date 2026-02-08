type ProjectShowcaseSkeletonProps = {
	visibleRowCount?: number
	featuredCount?: number
}

function FeaturedCardSkeleton({ withPreview = false }: { withPreview?: boolean }) {
	return (
		<div className="bg-card">
			<div className="flex items-start justify-between gap-2 sm:gap-4 p-2 sm:p-3 animate-pulse">
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

			{withPreview && (
				<div className="relative h-[180px] sm:h-[240px] w-full overflow-hidden border-t border-border bg-black/50">
					<div className="absolute inset-0 animate-pulse bg-muted/20" />
				</div>
			)}
		</div>
	)
}

export function ProjectShowcaseSkeleton({
	visibleRowCount = 6,
	featuredCount = 2
}: ProjectShowcaseSkeletonProps) {
	return (
		<section
			className="w-full max-w-3xl px-3 sm:px-0"
			aria-busy="true"
			aria-label="Loading project showcase"
		>
			<div className="flex flex-col border-l border-r border-t border-border">
				{Array.from({ length: featuredCount }).map((_, i) => (
					<div key={i} className="border-b border-border">
						<FeaturedCardSkeleton withPreview={i === 0} />
					</div>
				))}
			</div>

			<div className="relative border-l border-r border-border">
				<div
					className="flex flex-col bg-card overflow-hidden"
					style={{ maxHeight: `${visibleRowCount * 40}px` }}
				>
					{Array.from({ length: visibleRowCount }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between bg-card px-2 sm:px-3 py-2 border-b border-border animate-pulse"
						>
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
					))}
				</div>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-background to-transparent" />
			</div>

			<div className="border-l border-r border-border">
				<div className="flex w-full px-2 py-2 text-xs text-muted-foreground sm:px-3">
					<div className="h-3 w-20 bg-muted/40 rounded animate-pulse" />
				</div>
			</div>
		</section>
	)
}
