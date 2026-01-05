import { Skeleton } from './skeleton'
import { ActivitySkeleton } from './activity-skeleton'
import { Plus } from 'lucide-react'

export function TechStackSkeleton() {
    const CARD_STYLES = [
        {
            className: "relative border-r border-b bg-secondary dark:bg-secondary/30",
            hasDecorator: true
        },
        {
            className: "border-b md:border-r",
            hasDecorator: false
        },
        {
            className: "relative border-r border-b md:bg-secondary dark:md:bg-secondary/30",
            hasDecorator: true
        },
        {
            className: "relative border-b bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background",
            hasDecorator: false
        },
        {
            className: "relative border-r border-b bg-secondary md:border-b-0 md:bg-background dark:bg-secondary/30 md:dark:bg-background",
            hasDecorator: true
        },
        {
            className: "border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30",
            hasDecorator: false
        },
        {
            className: "border-r border-b md:border-b-0",
            hasDecorator: false
        },
        {
            className: "bg-secondary dark:bg-secondary/30 border-b md:border-b-0",
            hasDecorator: false
        }
    ]

    return (
        <div className="relative grid grid-cols-2 border-x md:grid-cols-4">
            <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />
            {Array.from({ length: 8 }).map((_, i) => {
                const style = CARD_STYLES[i] || { className: "border-r border-b", hasDecorator: false }
                return (
                    <div
                        key={i}
                        className={`flex items-center justify-center bg-background px-4 py-8 md:p-8 relative overflow-hidden group min-h-[120px] ${style.className}`}
                    >
                        <div className="relative flex flex-col items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-muted/20 rounded-sm animate-pulse will-change-opacity" />
                        </div>

                        {style.hasDecorator && (
                            <Plus
                                className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-muted-foreground/50"
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                        )}
                        {i === 2 && (
                            <Plus
                                className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block text-muted-foreground/50"
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                        )}
                        {i === 4 && (
                            <Plus
                                className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 size-6 md:hidden text-muted-foreground/50"
                                strokeWidth={1}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                )
            })}
            <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b" />
        </div>
    )
}

// Static arrays moved before functions that use them
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const WEEKS = Array.from({ length: 53 }, (_, i) => i)
const DAYS = Array.from({ length: 7 }, (_, i) => i)
const LEGEND_OPACITIES = [0.2, 0.3, 0.5, 0.75, 1] as const

export function ActivitySectionSkeleton() {
    // Must match structure of Section -> noPadding={true} contentPadding={true}
    // Uses exact same layout as ContributionGraphSkeleton for ZERO CLS
    return (
        <section className="relative" aria-busy="true" aria-label="Loading activity section">
            <div className="full-width-header">
                <div className="header-content-container flex items-center justify-between header-content-container--with-padding">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>

            <div className="space-y-4 pt-3">
                {/* Paragraph */}
                <div className="px-4 md:px-5">
                    <Skeleton className="h-4 w-full max-w-xl" />
                </div>

                {/* Contribution Graph Skeleton - Uses exact CSS Grid layout to match ActivityContributionGraph */}
                <div className="px-4 md:px-5">
                    <div className="space-y-2 w-full" role="img" aria-label="Loading contribution graph" aria-hidden="true">
                        {/* Month labels Skeleton */}
                        <div className="grid w-full mb-1 relative h-[15px] gap-[3px]" style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}>
                            {MONTHS.map((month) => (
                                <div key={month} className="relative overflow-visible z-20">
                                    <span className="whitespace-nowrap absolute text-[10px] text-muted-foreground/30">
                                        {month}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Skeleton - 53 cols x 1 row (column-based grid) */}
                        <div
                            className="grid w-full gap-[3px]"
                            style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}
                        >
                            {WEEKS.map((weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[3px]">
                                    {DAYS.map((dayIndex) => (
                                        <div
                                            key={dayIndex}
                                            className="w-full aspect-square rounded-[2px] bg-neutral-800/10 dark:bg-white/5"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Legend row Skeleton */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
                            <div className="flex items-center gap-[2px]">
                                {LEGEND_OPACITIES.map((opacity, i) => (
                                    <div
                                        key={i}
                                        className="w-[10px] h-[10px] rounded-sm bg-brand-500"
                                        style={{ opacity }}
                                    />
                                ))}
                            </div>
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </div>

                {/* Activity Feed Skeleton - Matches ActivityFeed component exactly */}
                <div className="px-4 md:px-5">
                    <div className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm">
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
                        <div className="h-6 flex items-center px-0 pb-1" aria-hidden="true">
                            <div className="w-full h-[1px] bg-muted/20 animate-pulse will-change-opacity" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// LanguageStats skeleton matching actual structure
export function LanguageStatsSkeleton() {
    return (
        <section className="relative py-4 space-y-4" aria-busy="true" aria-label="Loading language stats">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
            </div>

            {/* Skeleton rows */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border border-border/30 bg-background/50 hover:bg-muted/30">
                    {/* Icon */}
                    <div className="shrink-0">
                        <div className="w-8 h-8 bg-muted/20 rounded-lg animate-pulse will-change-opacity" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-12" />
                        </div>

                        <Skeleton className="h-3 w-16" />

                        {/* Repos */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <Skeleton className="h-6 w-20 rounded-full will-change-opacity" />
                            <Skeleton className="h-6 w-24 rounded-full will-change-opacity" />
                            <Skeleton className="h-6 w-16 rounded-full will-change-opacity" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

// Standalone contribution graph skeleton for comparison testing
export function ContributionGraphSkeleton() {
    return (
        <div
            className="space-y-2 w-full"
            role="img"
            aria-label="Loading contribution graph"
        >
            {/* Month labels row - evenly distributed, hidden from screen readers */}
            <div className="flex w-full text-[10px] text-muted-foreground/50 h-[15px]" aria-hidden="true">
                {MONTHS.map((month) => (
                    <span key={month} className="flex-1">{month}</span>
                ))}
            </div>

            {/* Grid - 53 weeks x 7 days, uses CSS grid for better performance */}
            <div
                className="grid w-full gap-[3px]"
                style={{ gridTemplateColumns: 'repeat(53, 1fr)' }}
                aria-hidden="true"
            >
                {WEEKS.map((weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {DAYS.map((dayIndex) => (
                            <div
                                key={dayIndex}
                                className="w-full aspect-square rounded-[2px] bg-neutral-800/20 dark:bg-white/5"
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend row */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/50" aria-hidden="true">
                <div className="flex items-center gap-[2px]">
                    {LEGEND_OPACITIES.map((opacity, i) => (
                        <div
                            key={i}
                            className="w-[10px] h-[10px] rounded-sm bg-brand-500"
                            style={{ opacity }}
                        />
                    ))}
                </div>
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
}

// Static arrays for WorkExperience skeleton
const EXPERIENCE_ITEMS = Array.from({ length: 5 }, (_, i) => i)

export function BlogPostsSkeleton() {
  return (
    <section className="relative" aria-busy="true" aria-label="Loading blog posts">
      <div className="full-width-header">
        <div className="header-content-container flex items-center justify-between header-content-container--with-padding">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-border/30 last:border-0">
            <Skeleton className="h-8 w-8 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full max-w-xl" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// WorkExperience skeleton matching the actual structure
export function WorkExperienceSkeleton() {
    return (
        <section className="relative" aria-busy="true" aria-label="Loading work experience">
            {/* Section Header */}
            <div className="full-width-header">
                <div className="header-content-container flex items-center justify-between header-content-container--with-padding">
                    <Skeleton className="h-5 w-32" />
                </div>
            </div>

            {/* Experience Items */}
            <div className="px-4 md:px-5 pt-3 space-y-4">
                {EXPERIENCE_ITEMS.map((i) => (
                    <div key={i} className="flex gap-4 py-3 border-b border-border/30 last:border-0">
                        {/* Icon placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-muted/20 shrink-0" />

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-3 w-32" />
                            {/* Skills row */}
                            <div className="flex gap-2 pt-1">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
