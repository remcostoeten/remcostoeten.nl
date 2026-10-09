export function FeaturedCardSkeleton() {
	return (
		<div className="flex h-full animate-pulse flex-col bg-card">
			<div className="aspect-[16/10] bg-muted/30" />
			<div className="-mt-3 flex flex-1 flex-col gap-3 px-4 pb-4 md:px-5">
				<div className="space-y-1">
					<div className="flex h-6 items-center">
						<div className="h-3.5 w-24 bg-muted" />
					</div>
				</div>
				<div className="space-y-1.5">
					<div className="h-2.5 w-full rounded bg-muted/60" />
					<div className="h-2.5 w-3/4 rounded bg-muted/60" />
				</div>
				<div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
					<div className="h-2.5 w-20 rounded bg-muted/40" />
					<div className="flex -space-x-1.5">
						<div className="size-6 rounded-full bg-muted/40" />
						<div className="size-6 rounded-full bg-muted/40" />
						<div className="size-6 rounded-full bg-muted/40" />
					</div>
				</div>
			</div>
		</div>
	)
}
