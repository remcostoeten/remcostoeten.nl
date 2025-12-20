import { Skeleton } from './skeleton'
import { motion } from 'framer-motion'

interface GraphSkeletonProps {
    className?: string
}

export function GraphSkeleton({ className = '' }: GraphSkeletonProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {/* Month labels row - matches actual layout */}
            <div className="flex text-[10px] text-muted-foreground mb-1 ml-7">
                {Array.from({ length: 53 }).map((_, weekIndex) => {
                    // Show month label approximately every 4-5 weeks to match actual calendar
                    const showLabel = weekIndex % 4 === 0 && weekIndex / 4 < 12;
                    return (
                        <div key={weekIndex} className="w-[13px] shrink-0">
                            {showLabel && (
                                <Skeleton className="h-3 w-6 rounded" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Calendar grid */}
            <div className="flex gap-0">
                {/* Day labels */}
                <div className="flex flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground w-7">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[10px] flex items-center justify-end pr-1"></div>
                    ))}
                </div>

                {/* Grid squares - 53 weeks for full year */}
                <div className="flex gap-[3px]">
                    {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                            {Array.from({ length: 7 }).map((_, dayIndex) => (
                                <motion.div
                                    key={dayIndex}
                                    className="w-[10px] h-[10px] bg-muted/20 rounded-sm"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: Math.random() * 0.8,
                                        duration: 0.2,
                                        ease: [0.25, 0.46, 0.45, 0.94]
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <div className="flex gap-[2px]">
                        {[0, 1, 2, 3, 4].map(level => (
                            <Skeleton key={level} className="w-[10px] h-[10px] rounded-sm" />
                        ))}
                    </div>
                    <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
}
