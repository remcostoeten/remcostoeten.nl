'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitCommit, GitPullRequest, Star, AlertCircle, Eye, Box, Copy, Plus, GitBranch, Lock, Globe } from 'lucide-react';
import { getLatestTracks, getNowPlaying, SpotifyTrack, NowPlaying } from '@/server/services/spotify';
import { useGitHubRecentActivity, GitHubEventDetail } from '@/hooks/use-github';
import { ProjectHoverWrapper, ActivityHoverWrapper, SpotifyHoverWrapper } from './hover-wrappers';
import { useSpotifyPlayback } from '@/hooks/use-spotify-playback';
import { AnimatedNumber } from '@/components/ui/animated-number';

const SPRING_CONFIG = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.8,
};

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const sentenceVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        }
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.04,
            staggerDirection: -1,
        }
    }
};

const wordVariants = {
    initial: {
        y: 20,
        opacity: 0,
        filter: "blur(8px)",
    },
    animate: {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
            ...SPRING_CONFIG,
            opacity: { duration: 0.5, ease: SMOOTH_EASE },
            filter: { duration: 0.4 },
        }
    },
    exit: {
        y: -10,
        opacity: 0,
        filter: "blur(4px)",
        transition: {
            duration: 0.2,
            ease: SMOOTH_EASE,
        }
    }
};

const highlightVariants = {
    initial: {
        y: 24,
        opacity: 0,
        scale: 0.9,
        filter: "blur(10px)",
    },
    animate: {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...SPRING_CONFIG,
            opacity: { duration: 0.6, ease: SMOOTH_EASE },
            filter: { duration: 0.5 },
            scale: { duration: 0.4, ease: SMOOTH_EASE },
        }
    },
    exit: {
        y: -12,
        opacity: 0,
        scale: 0.95,
        filter: "blur(6px)",
        transition: {
            duration: 0.25,
            ease: SMOOTH_EASE,
        }
    }
};

function getEventIcon(type: GitHubEventDetail['type']) {
    switch (type) {
        case 'commit': return <GitCommit className='size-3' />;
        case 'pr': return <GitPullRequest className='size-3' />;
        case 'issue': return <AlertCircle className='size-3' />;
        case 'review': return <Eye className='size-3' />;
        case 'release': return <Box className='size-3' />;
        case 'fork': return <Copy className='size-3' />;
        case 'star': return <Star className='size-3' />;
        case 'create': return <Plus className='size-3' />;
        case 'delete': return <GitBranch className='size-3 opacity-70' />; // Using GitBranch for delete as it's often branch/tag related
        default: return <GitBranch className='size-3' />;
    }
}

function getProjectVerb(type: GitHubEventDetail['type']): string {
    switch (type) {
        case 'commit':
        case 'pr':
        case 'create':
        case 'review':
            return 'building';
        case 'issue':
            return 'contributing to';
        case 'star':
        case 'fork':
            return 'exploring';
        case 'release':
            return 'shipping';
        case 'delete':
            return 'maintaining';
        default:
            return 'working on';
    }
}

function getShortRepoName(fullName: string) {
    return fullName?.split('/').pop() || fullName;
}

/**
 * Generate a meaningful metric/stat line for any activity type
 * This ensures every slide has something interesting to show at the bottom
 */
function getActivityMetric(activity: GitHubEventDetail): { label: string; value: string; icon?: React.ReactNode } | null {
    const payload = activity.payload;

    switch (activity.type) {
        case 'commit': {
            // Show commit count and short SHA
            const commitCount = payload?.size || payload?.commits?.length || 1;
            const sha = payload?.head?.substring(0, 7) || '';
            return {
                label: 'Commits',
                value: `${commitCount} ${commitCount === 1 ? 'commit' : 'commits'}${sha ? ` · ${sha}` : ''}`,
                icon: <GitCommit className="size-3" />
            };
        }
        case 'pr': {
            // Show additions/deletions if available, or just PR status
            const pr = payload?.pull_request;
            const additions = pr?.additions;
            const deletions = pr?.deletions;
            const changedFiles = pr?.changed_files;

            if (additions !== undefined && deletions !== undefined) {
                return {
                    label: 'Changes',
                    value: `+${additions} / -${deletions}${changedFiles ? ` in ${changedFiles} files` : ''}`,
                    icon: <GitPullRequest className="size-3" />
                };
            }
            // Fallback: show PR number and state
            const prNum = payload?.number || pr?.number;
            const state = pr?.state || payload?.action;
            return {
                label: 'Pull Request',
                value: `#${prNum}${state ? ` · ${state}` : ''}`,
                icon: <GitPullRequest className="size-3" />
            };
        }
        case 'create': {
            const refType = payload?.ref_type;
            const ref = payload?.ref;

            if (refType === 'branch' && ref) {
                return {
                    label: 'Branch',
                    value: ref,
                    icon: <GitBranch className="size-3" />
                };
            }
            if (refType === 'tag' && ref) {
                return {
                    label: 'Tag',
                    value: ref,
                    icon: <Box className="size-3" />
                };
            }
            if (refType === 'repository') {
                return {
                    label: 'Repository',
                    value: getShortRepoName(activity.repository),
                    icon: <Plus className="size-3" />
                };
            }
            return null;
        }
        case 'delete': {
            const refType = payload?.ref_type;
            const ref = payload?.ref;

            return {
                label: refType === 'branch' ? 'Deleted Branch' : refType === 'tag' ? 'Deleted Tag' : 'Deleted',
                value: ref || 'unknown',
                icon: <GitBranch className="size-3 opacity-70" />
            };
        }
        case 'issue': {
            const issueNum = payload?.issue?.number;
            const state = payload?.issue?.state;
            return {
                label: 'Issue',
                value: `#${issueNum}${state ? ` · ${state}` : ''}`,
                icon: <AlertCircle className="size-3" />
            };
        }
        case 'review': {
            const prNum = payload?.pull_request?.number;
            const state = payload?.review?.state;
            const stateLabel = state === 'approved' ? 'approved' :
                state === 'changes_requested' ? 'changes requested' :
                    state === 'commented' ? 'commented' : state;
            return {
                label: 'Review',
                value: `PR #${prNum}${stateLabel ? ` · ${stateLabel}` : ''}`,
                icon: <Eye className="size-3" />
            };
        }
        case 'release': {
            const tagName = payload?.release?.tag_name;
            return {
                label: 'Release',
                value: tagName || 'new release',
                icon: <Box className="size-3" />
            };
        }
        case 'star': {
            return {
                label: 'Starred',
                value: getShortRepoName(activity.repository),
                icon: <Star className="size-3" />
            };
        }
        case 'fork': {
            const forkName = payload?.forkee?.full_name;
            return {
                label: 'Forked to',
                value: forkName || 'new fork',
                icon: <Copy className="size-3" />
            };
        }
        default:
            return null;
    }
}


function Equalizer({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex items-end gap-[2px] h-3 mx-1 ${className}`} aria-hidden='true'>
            <span className='w-[2px] bg-brand-500 rounded-none animate-[music-bar_0.8s_ease-in-out_infinite]' />
            <span className='w-[2px] bg-brand-500 rounded-none animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]' />
            <span className='w-[2px] bg-brand-500 rounded-none animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]' />
        </span>
    );
}



function LiveGlow({ progress }: { progress: number }) {
    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Track background */}
            <div className="absolute inset-0 bg-white/5 w-full" />

            {/* Progress line */}
            <motion.div
                className="absolute inset-y-0 left-0 bg-brand-500/80 shadow-[0_0_8px_hsl(var(--brand-500)/0.4)]"
                style={{ width: `${progress}%` }}
                layout
            />

            {/* Pulsing glow point at the head of the progress */}
            <motion.div
                className="absolute inset-y-0 bg-brand-400 blur-[2px]"
                animate={{
                    opacity: [0.4, 1, 0.4],
                    left: `${progress}%`
                }}
                style={{
                    width: '4px',
                    marginLeft: '-2px'
                }}
                transition={{
                    opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    left: { duration: 0.1 }
                }}
            />

            {/* Soft upward fade following progress */}
            <motion.div
                className="absolute bottom-0 left-0 h-4 bg-gradient-to-t from-brand-500/10 to-transparent"
                style={{ width: `${progress}%` }}
            />
        </motion.div>
    );
}

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

/**
 * Render metric value with animated numbers
 * Parses strings like "#63 · opened" and animates the numeric parts
 */
function renderMetricValue(value: string): React.ReactNode {
    // Split the value into parts, keeping numbers as separate segments
    const parts = value.split(/(\d+)/);

    return parts.map((part, index) => {
        if (/^\d+$/.test(part)) {
            // This is a number - animate it with staggered delay
            return (
                <AnimatedNumber
                    key={index}
                    value={parseInt(part, 10)}
                    duration={800}
                    delay={600 + (index * 100)}
                    animateOnMount
                />
            );
        }
        // Non-numeric part - return as-is
        return <span key={index}>{part}</span>;
    });
}


interface ActivityFeedProps {
    activityCount?: number;
    rotationInterval?: number;
}

export function ActivityFeed({ activityCount = 5, rotationInterval = 6000 }: ActivityFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const { data: activities = [], isLoading: githubLoading } = useGitHubRecentActivity(activityCount);
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [spotifyLoading, setSpotifyLoading] = useState(true);

    // Real-time playback monitoring
    const playbackState = useSpotifyPlayback();

    // Fetch recent tracks history (memoized)
    useEffect(() => {
        let cancelled = false;
        const fetchRecent = async () => {
            try {
                const spotifyTracks = await getLatestTracks(activityCount);
                if (!cancelled) {
                    setTracks(spotifyTracks);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Error fetching recent tracks:', error);
                }
            } finally {
                if (!cancelled) {
                    setSpotifyLoading(false);
                }
            }
        };
        fetchRecent();
        return () => { cancelled = true; };
    }, [activityCount]);

    // Memoize callback to prevent re-renders
    const rotateActivity = useCallback(() => {
        if (activities.length === 0 || isPaused) return;
        setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, [activities.length, isPaused]);

    // Navigate to specific slide
    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Navigate to next/prev slide
    const goToNextSlide = useCallback(() => {
        if (activities.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, [activities.length]);

    const goToPrevSlide = useCallback(() => {
        if (activities.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
    }, [activities.length]);

    // Rotate through activities
    useEffect(() => {
        if (activities.length === 0 || isPaused) return;
        const interval = setInterval(rotateActivity, rotationInterval);
        return () => clearInterval(interval);
    }, [rotateActivity, rotationInterval, isPaused]);

    // Touch/swipe handling
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = null;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNextSlide();
        } else if (isRightSwipe) {
            goToPrevSlide();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    }, [goToNextSlide, goToPrevSlide]);

    // Memoize expensive calculations
    const isLoading = githubLoading || spotifyLoading;
    const currentActivity = useMemo(() => activities[currentIndex], [activities, currentIndex]);
    const isRealTimePlaying = useMemo(() => playbackState.isPlaying && playbackState.track, [playbackState.isPlaying, playbackState.track]);

    // Build the track rotation: if live playing, playbackState.track is slot 0, then recent tracks (excluding the current song)
    // If not live, just cycle through the 5 recent tracks (memoized)
    const trackRotation = useMemo(() => {
        const filteredTracks = isRealTimePlaying && playbackState.track
            ? tracks.filter(t => t.name !== playbackState.track!.name || t.artist !== playbackState.track!.artist)
            : tracks;
        return isRealTimePlaying
            ? [playbackState.track, ...filteredTracks.slice(0, 4)]
            : tracks.slice(0, 5);
    }, [isRealTimePlaying, tracks, playbackState.track]);

    const currentTrack = useMemo(() =>
        trackRotation[currentIndex % Math.max(trackRotation.length, 1)],
        [trackRotation, currentIndex]
    );
    const isCurrentTrackLive = useMemo(() =>
        isRealTimePlaying && currentIndex % Math.max(trackRotation.length, 1) === 0,
        [isRealTimePlaying, currentIndex, trackRotation.length]
    );

    // Skeleton loading state - matches final layout to prevent CLS
    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-border/10" />
                <div className="relative p-4 md:p-6">
                    {/* Skeleton text lines */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="h-4 w-32 bg-muted/30 animate-pulse" />
                            <div className="h-5 w-24 bg-muted/20 animate-pulse" />
                            <div className="h-4 w-20 bg-muted/30 animate-pulse" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="h-5 w-28 bg-muted/20 animate-pulse" />
                            <div className="h-4 w-16 bg-muted/30 animate-pulse" />
                            <div className="h-5 w-32 bg-muted/20 animate-pulse" />
                        </div>
                    </div>
                    {/* Skeleton description */}
                    <div className="h-6 mt-3">
                        <div className="h-4 w-48 bg-muted/20 animate-pulse" />
                    </div>
                </div>
                {/* Skeleton dots */}
                <div className="flex items-center justify-end gap-1.5 px-4 pb-3 md:px-6 md:pb-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="size-1.5 bg-muted/20 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!currentActivity) {
        return (
            <div className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm">
                <div className="relative p-4 md:p-6">
                    <span className="text-muted-foreground/60 text-sm">No recent activity</span>
                </div>
            </div>
        );
    }

    const repoName = getShortRepoName(currentActivity.repository);
    const projectVerb = getProjectVerb(currentActivity.type);
    const isPrivate = currentActivity.isPrivate;

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm touch-pan-y"
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

            {/* Progress indicator */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-border/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary/40 to-primary/20"
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? undefined : "100%" }}
                    key={`${currentIndex}-${isPaused}`}
                    transition={{
                        duration: isPaused ? 0 : rotationInterval / 1000,
                        ease: "linear"
                    }}
                />
            </div>

            <div className="relative z-10 p-4 md:p-5">
                {/* Fixed height container to prevent layout shift */}
                <div className="min-h-[4.5rem] md:min-h-[5rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentIndex}-${currentActivity.id}`}
                            variants={sentenceVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm md:text-base"
                        >
                            {/* "Lately I've been" */}
                            <motion.span
                                variants={wordVariants}
                                className="text-muted-foreground/70"
                            >
                                Furthermore, I've been
                            </motion.span>

                            {/* Project Verb */}
                            <motion.span
                                variants={wordVariants}
                                className="text-muted-foreground/70"
                            >
                                {projectVerb}
                            </motion.span>

                            {/* Project name with visibility indicator */}
                            <motion.span
                                variants={highlightVariants}
                                className="inline-flex items-center gap-1.5"
                            >
                                <ProjectHoverWrapper repository={currentActivity.repository} isPrivate={isPrivate}>
                                    {isPrivate ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20 cursor-pointer">
                                            <Lock className="size-3" />
                                            {repoName}
                                        </span>
                                    ) : (
                                        <a
                                            href={currentActivity.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-primary/10 text-primary font-medium border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                                        >
                                            <Globe className="size-3" />
                                            {repoName}
                                        </a>
                                    )}
                                </ProjectHoverWrapper>
                            </motion.span>

                            <motion.span
                                variants={wordVariants}
                                className="text-muted-foreground/70"
                            >
                                where I recently
                            </motion.span>

                            {/* Activity title with icon and timestamp */}
                            <motion.span
                                variants={highlightVariants}
                                className="inline-flex items-center gap-1.5 text-foreground font-medium"
                            >
                                <ActivityHoverWrapper activity={currentActivity}>
                                    <span className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <span className="inline-flex items-center justify-center size-5 rounded-none bg-muted/30 text-foreground/80 border border-border/20">
                                            {getEventIcon(currentActivity.type)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {currentActivity.title}
                                        </span>
                                    </span>
                                </ActivityHoverWrapper>
                            </motion.span>

                            {/* Spotify section */}
                            {currentTrack ? (
                                <>
                                    <motion.span
                                        variants={wordVariants}
                                        className="text-muted-foreground/70"
                                    >
                                        whilst
                                    </motion.span>

                                    {isCurrentTrackLive ? (
                                        <>
                                            <motion.span
                                                variants={wordVariants}
                                                className="text-muted-foreground/70 inline-flex items-center gap-1.5"
                                            >
                                                <div className="flex items-center gap-1 bg-brand-500/10 px-1.5 py-0.5 rounded-none border border-brand-500/20">
                                                    <span className="text-[10px] font-bold text-brand-500 tracking-wider">CURRENTLY</span>
                                                    <Equalizer className="translate-y-[-1px]" />
                                                </div>
                                                listening to
                                            </motion.span>

                                            {/* Song name */}
                                            <SpotifyHoverWrapper track={currentTrack} isPlaying={true}>
                                                <motion.a
                                                    variants={highlightVariants}
                                                    href={currentTrack.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-medium hover:opacity-80 transition-opacity cursor-pointer bg-brand-500/10 text-brand-500 border border-brand-500/20 max-w-[200px]"
                                                >
                                                    <Music className="size-3 shrink-0" />
                                                    <span className="truncate">{currentTrack.name}</span>
                                                </motion.a>
                                            </SpotifyHoverWrapper>

                                            {/* Artist */}
                                            <motion.span
                                                variants={wordVariants}
                                                className="text-muted-foreground/70"
                                            >
                                                by
                                            </motion.span>

                                            <motion.span
                                                variants={highlightVariants}
                                                className="text-foreground/90 font-medium truncate max-w-[160px]"
                                            >
                                                {currentTrack.artist}
                                            </motion.span>
                                        </>
                                    ) : (
                                        <>
                                            {/* Song name */}
                                            <SpotifyHoverWrapper track={currentTrack} isPlaying={false}>
                                                <motion.a
                                                    variants={highlightVariants}
                                                    href={currentTrack.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-medium hover:opacity-80 transition-opacity cursor-pointer bg-orange-500/10 text-orange-500 border border-orange-500/20 max-w-[200px]"
                                                >
                                                    <Music className="size-3 shrink-0" />
                                                    <span className="truncate">{currentTrack.name}</span>
                                                </motion.a>
                                            </SpotifyHoverWrapper>

                                            {/* Artist */}
                                            <motion.span
                                                variants={wordVariants}
                                                className="text-muted-foreground/70"
                                            >
                                                by
                                            </motion.span>

                                            <motion.span
                                                variants={highlightVariants}
                                                className="text-foreground/90 font-medium truncate max-w-[160px]"
                                            >
                                                {currentTrack.artist}
                                            </motion.span>

                                            <motion.span
                                                variants={wordVariants}
                                                className="text-muted-foreground/70"
                                            >
                                                was playing
                                            </motion.span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <motion.span
                                    variants={wordVariants}
                                    className="text-muted-foreground/50"
                                >
                                    whilst enjoying some quiet time
                                </motion.span>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="h-5 mt-2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`metric-${currentIndex}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ delay: 0.5, duration: 0.25 }}
                            className="flex items-center justify-between gap-2"
                        >
                            {(() => {
                                const metric = getActivityMetric(currentActivity);
                                if (metric) {
                                    return (
                                        <>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                {metric.icon && (
                                                    <span className="text-muted-foreground/30 shrink-0 flex items-center translate-y-[0.5px]">
                                                        {metric.icon}
                                                    </span>
                                                )}
                                                <span className="text-muted-foreground/30 translate-y-[2px] uppercase tracking-wide text-[9px] font-medium shrink-0 leading-none">

                                                    {metric.label}:
                                                </span>
                                                <span className="text-muted-foreground/50 text-xs truncate leading-none">
                                                    {renderMetricValue(metric.value)}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground/40 tabular-nums font-mono shrink-0 ml-auto flex items-center gap-1">
                                                <span className="opacity-50 font-sans">GH ·</span>
                                                {formatRelativeTime(currentActivity.timestamp)}
                                            </span>
                                        </>
                                    );
                                }
                                return (
                                    <>
                                        <span className="text-xs text-muted-foreground/40 italic truncate">
                                            {currentActivity.description ? `"${currentActivity.description}"` : '—'}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground/40 tabular-nums font-mono shrink-0 ml-auto flex items-center gap-1">
                                            <span className="opacity-50 font-sans">GH ·</span>
                                            {formatRelativeTime(currentActivity.timestamp)}
                                        </span>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Activity indicator - clickable dots */}
            {
                activities.length > 1 && (
                    <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-1.5">
                        {activities.slice(0, activityCount).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`rounded-none transition-all duration-300 cursor-pointer hover:scale-150 focus:outline-none focus:ring-1 focus:ring-brand-500/50 ${idx === currentIndex
                                    ? 'size-2 bg-brand-500 scale-125'
                                    : 'size-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                                    }`}
                                aria-label={`Go to activity ${idx + 1}`}
                                aria-current={idx === currentIndex ? 'true' : undefined}
                            />
                        ))}
                    </div>
                )
            }
            {/* Live Glow Effect */}
            <AnimatePresence>
                {isCurrentTrackLive && <LiveGlow progress={playbackState.percentage} />}
            </AnimatePresence>
        </div >
    );
}
