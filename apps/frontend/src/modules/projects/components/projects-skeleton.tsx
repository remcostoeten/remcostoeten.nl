export function ProjectsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Category filter buttons skeleton */}
            <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-muted/50 animate-pulse"
                        >
                            <div className="w-16 h-4 bg-muted-foreground/20 rounded" />
                            <div className="w-6 h-4 bg-muted-foreground/20 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Header skeleton */}
            <div className="mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-6 bg-muted-foreground/20 rounded animate-pulse" />
                        <div className="w-8 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                    </div>
                    <div className="w-64 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
            </div>

            {/* Projects skeleton */}
            <div className="space-y-4">
                {/* First project skeleton - full width */}
                <div className="w-full">
                    <div className="relative p-4 bg-card border border-border rounded-lg animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-32 h-5 bg-muted-foreground/20 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-muted-foreground/20 rounded" />
                                    <div className="w-3/4 h-3 bg-muted-foreground/20 rounded" />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                    <div className="w-12 h-3 bg-muted-foreground/20 rounded" />
                                    <div className="w-8 h-3 bg-muted-foreground/20 rounded" />
                                    <div className="w-10 h-3 bg-muted-foreground/20 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remaining projects skeleton - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="relative p-4 bg-card border border-border rounded-lg animate-pulse"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-28 h-5 bg-muted-foreground/20 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-3 bg-muted-foreground/20 rounded" />
                                        <div className="w-2/3 h-3 bg-muted-foreground/20 rounded" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                        <div className="w-10 h-3 bg-muted-foreground/20 rounded" />
                                        <div className="w-6 h-3 bg-muted-foreground/20 rounded" />
                                        <div className="w-8 h-3 bg-muted-foreground/20 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show more button skeleton */}
                <div className="flex justify-center pt-4">
                    <div className="w-24 h-8 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
