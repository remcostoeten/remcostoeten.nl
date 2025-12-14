'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, GitPullRequest, GitCommit, Star, AlertCircle, Eye, Box, Copy, Plus, ExternalLink } from 'lucide-react';
import { useGitHubRecentActivity, GitHubEventDetail } from '@/hooks/use-github';

const SPRING_EASE = [0.32, 0.72, 0, 1] as const;

const containerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.02 }
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
};

const itemVariants = {
    initial: { y: 6, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.25, ease: SPRING_EASE }
    },
    exit: {
        y: -4,
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

function formatRelativeTime(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getEventIcon(type: GitHubEventDetail['type']) {
    switch (type) {
        case 'commit': return <GitCommit className='size-3' />
        case 'pr': return <GitPullRequest className='size-3' />
        case 'issue': return <AlertCircle className='size-3' />
        case 'review': return <Eye className='size-3' />
        case 'release': return <Box className='size-3' />
        case 'fork': return <Copy className='size-3' />
        case 'star': return <Star className='size-3' />
        case 'create': return <Plus className='size-3' />
        default: return <GitBranch className='size-3' />
    }
}

function getEventColor(type: GitHubEventDetail['type']) {
    switch (type) {
        case 'commit': return 'bg-muted/60 text-foreground/70'
        case 'pr': return 'bg-muted/60 text-foreground/70'
        case 'issue': return 'bg-muted/60 text-foreground/70'
        case 'review': return 'bg-muted/60 text-foreground/70'
        case 'release': return 'bg-muted/60 text-foreground/70'
        case 'star': return 'bg-muted/60 text-foreground/70'
        case 'create': return 'bg-muted/60 text-foreground/70'
        default: return 'bg-muted/50 text-muted-foreground'
    }
}

function getShortRepoName(fullName: string) {
    return fullName?.split('/').pop() || fullName;
};

function formatCommitMessage(message: string | undefined, maxLength = 50) {
    if (!message) return 'No description';
    const firstLine = message.split('\n')[0].trim();
    if (firstLine.length <= maxLength) return firstLine;
    return firstLine.substring(0, maxLength - 3) + '...';
};

export function GitHubActivityCard() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: activities = [], isLoading } = useGitHubRecentActivity(5);

    useEffect(() => {
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [activities.length]);

    const currentActivity = activities[currentIndex] || {
        type: 'unknown' as const,
        title: 'Loading...',
        description: 'Fetching GitHub activity',
        repository: 'github',
        url: '#',
        timestamp: new Date().toISOString()
    };

    const repoName = getShortRepoName(currentActivity.repository);

    return (
        <div className="border-t border-border/30 bg-background/50 p-3 relative overflow-hidden group min-h-[100px]">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`flex size-5 items-center justify-center rounded-md transition-all duration-300 ${getEventColor(currentActivity.type as any)}`}>
                        {getEventIcon(currentActivity.type as any)}
                    </div>
                    <span className="text-xs font-medium text-foreground/80">Latest Activity</span>
                </div>
                <a
                    href={currentActivity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/40 hover:text-foreground transition-colors"
                    title="View on GitHub"
                >
                    <ExternalLink className="size-3" />
                </a>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="pl-7 space-y-1 relative z-10"
                >
                    {/* Primary: Description/Commit message */}
                    <motion.p
                        className="text-sm font-medium text-foreground leading-snug"
                        variants={itemVariants}
                    >
                        "{formatCommitMessage(currentActivity.description)}"
                    </motion.p>

                    {/* Secondary: Action + Repo */}
                    <motion.div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        variants={itemVariants}
                    >
                        <span className="text-muted-foreground/70">{currentActivity.title}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <a
                            href={`https://github.com/${currentActivity.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary/80 hover:text-primary transition-colors"
                        >
                            {repoName}
                        </a>
                    </motion.div>

                    {/* Timestamp */}
                    <motion.div
                        className="text-[10px] text-muted-foreground/50 pt-0.5"
                        variants={itemVariants}
                    >
                        {formatRelativeTime(currentActivity.timestamp)}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Activity indicator dots */}
            {activities.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1">
                    {activities.slice(0, 5).map((_, idx) => (
                        <div
                            key={idx}
                            className={`size-1 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-foreground/40 scale-125'
                                : 'bg-muted-foreground/20'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-border/10">
                <motion.div
                    className="h-full bg-muted-foreground/30"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    key={currentIndex}
                    transition={{ duration: 6, ease: "linear" }}
                />
            </div>
        </div>
    );
};
