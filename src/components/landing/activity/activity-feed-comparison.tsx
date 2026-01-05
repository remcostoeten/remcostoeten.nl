'use client';

import { ActivityFeed } from './activity-feed';

export function ActivityFeedComparison() {
    return (
        <div className="space-y-6">
            {/* Skeleton Version */}
            <div>
                <div className="text-xs font-mono text-muted-foreground/60 mb-2">SKELETON LOADING STATE</div>
                <div
                    role="progressbar"
                    aria-busy="true"
                    aria-label="Loading activity feed"
                    className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" aria-hidden="true" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-border/10" aria-hidden="true" />
                    <div className="absolute right-4 top-3 md:right-5 flex items-center gap-0.5 pointer-events-none" aria-hidden="true">
                        <div className="h-3 w-4 bg-muted/20 animate-pulse rounded-sm will-change-opacity" />
                        <div className="h-3 w-4 bg-muted/20 animate-pulse rounded-sm will-change-opacity" />
                    </div>
                    <div className="relative px-4 pt-3 pb-1 md:px-5" aria-hidden="true">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <div className="h-3.5 w-28 bg-muted/20 animate-pulse will-change-opacity" />
                                <div className="h-5 w-16 bg-muted/30 animate-pulse will-change-opacity" />
                                <div className="h-3.5 w-14 bg-muted/20 animate-pulse will-change-opacity" />
                                <div className="h-5 w-32 bg-muted/30 animate-pulse will-change-opacity" />
                                <div className="h-3 w-12 bg-muted/15 animate-pulse will-change-opacity" />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <div className="h-5 w-20 bg-muted/30 animate-pulse will-change-opacity" />
                                <div className="h-3.5 w-8 bg-muted/20 animate-pulse will-change-opacity" />
                                <div className="h-3.5 w-20 bg-muted/20 animate-pulse will-change-opacity" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom metric bar skeleton */}
                    <div className="h-6 flex items-center px-0 pb-1" aria-hidden="true">
                        <div className="w-full h-[1px] bg-muted/20 animate-pulse will-change-opacity" />
                    </div>
                </div>
            </div>

            {/* Real Component */}
            <div>
                <div className="text-xs font-mono text-muted-foreground/60 mb-2">ACTUAL COMPONENT (WITH DATA)</div>
                <ActivityFeed activityCount={5} rotationInterval={6000} />
            </div>
        </div>
    );
}
