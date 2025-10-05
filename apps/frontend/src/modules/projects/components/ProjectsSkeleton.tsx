import { motion } from 'framer-motion';

export function ProjectsSkeleton() {
    return (
        <div className="space-y-6">
            {/* Category filter buttons skeleton */}
            <div className="mb-8">
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
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
                }}
                className="mb-6"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-6 bg-muted-foreground/20 rounded animate-pulse" />
                        <div className="w-8 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                    </div>
                    <div className="w-64 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
            </motion.div>

            {/* Projects skeleton */}
            <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
                }}
                className="space-y-4"
            >
                {/* First project skeleton - full width */}
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: 0,
                        ease: [0.16, 1, 0.3, 1],
                        scale: {
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }
                    }}
                    className="w-full"
                >
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
                </motion.div>

                {/* Remaining projects skeleton - 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.08,
                        ease: [0.16, 1, 0.3, 1],
                        scale: {
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {[1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: i * 0.06,
                                ease: [0.16, 1, 0.3, 1],
                                scale: {
                                    duration: 0.4,
                                    delay: i * 0.06,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                }
                            }}
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
                        </motion.div>
                    ))}
                </motion.div>

                {/* Show more button skeleton */}
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.3,
                        delay: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        scale: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
                    }}
                    className="flex justify-center pt-4"
                >
                    <div className="w-24 h-8 bg-muted-foreground/20 rounded animate-pulse" />
                </motion.div>
            </motion.div>
        </div>
    );
}
