'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitCommit, GitPullRequest, Star, AlertCircle, Eye, Box, Copy, Plus, GitBranch, Lock, Globe } from 'lucide-react';
import { useGitHubRecentActivity, GitHubEventDetail } from '@/hooks/use-github';
import { getLatestTracks, getNowPlaying, SpotifyTrack, NowPlaying } from '@/core/spotify-service';
import { ProjectHoverWrapper, ActivityHoverWrapper, SpotifyHoverWrapper } from './hover-wrappers';
import { useSpotifyPlayback } from '@/hooks/use-spotify-playback';

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
        default:
            return 'working on';
    }
}

function getShortRepoName(fullName: string) {
    return fullName?.split('/').pop() || fullName;
}


function Equalizer({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex items-end gap-[2px] h-3 mx-1 ${className}`} aria-hidden='true'>
            <span className='w-[2px] bg-green-500 rounded-none animate-[music-bar_0.8s_ease-in-out_infinite]' />
            <span className='w-[2px] bg-green-500 rounded-none animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]' />
            <span className='w-[2px] bg-green-500 rounded-none animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]' />
        </span>
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

    // Fetch recent tracks history
    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const spotifyTracks = await getLatestTracks(activityCount);
                setTracks(spotifyTracks);
            } catch (error) {
                console.error('Error fetching recent tracks:', error);
            } finally {
                setSpotifyLoading(false);
            }
        };
        fetchRecent();
    }, [activityCount]);

    // Rotate through activities
    useEffect(() => {
        if (activities.length === 0 || isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, rotationInterval);
        return () => clearInterval(interval);
    }, [activities.length, rotationInterval, isPaused]);

    const isLoading = githubLoading || spotifyLoading;
    const currentActivity = activities[currentIndex];
    const isRealTimePlaying = playbackState.isPlaying && playbackState.track;

    // Build the track rotation: if live playing, playbackState.track is slot 0, then recent tracks (excluding the current song)
    // If not live, just cycle through the 5 recent tracks
    const filteredTracks = isRealTimePlaying && playbackState.track
        ? tracks.filter(t => t.name !== playbackState.track!.name || t.artist !== playbackState.track!.artist)
        : tracks;
    const trackRotation = isRealTimePlaying
        ? [playbackState.track, ...filteredTracks.slice(0, 4)]
        : tracks.slice(0, 5);
    const currentTrack = trackRotation[currentIndex % Math.max(trackRotation.length, 1)];
    const isCurrentTrackLive = isRealTimePlaying && currentIndex % Math.max(trackRotation.length, 1) === 0;

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
            className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm"
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

            <div className="p-4 md:p-5">
                {/* Fixed height container to prevent layout shift */}
                <div className="min-h-[3.5rem] md:min-h-[4rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentIndex}-${currentActivity.id}`}
                            variants={sentenceVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm md:text-base leading-relaxed"
                        >
                            {/* "Lately I've been" */}
                            <motion.span
                                variants={wordVariants}
                                className="text-muted-foreground/70"
                            >
                                Lately I've been
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
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none bg-amber-500/10 text-amber-500 font-medium cursor-pointer">
                                            <Lock className="size-2.5" />
                                            {repoName}
                                        </span>
                                    ) : (
                                        <a
                                            href={currentActivity.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                                        >
                                            <Globe className="size-2.5" />
                                            {repoName}
                                        </a>
                                    )}
                                </ProjectHoverWrapper>
                            </motion.span>

                            {/* ", where I recently" */}
                            <motion.span
                                variants={wordVariants}
                                className="text-muted-foreground/70"
                            >
                                , where I recently
                            </motion.span>

                            {/* Activity title with icon and timestamp */}
                            <motion.span
                                variants={highlightVariants}
                                className="inline-flex items-center gap-1.5 text-foreground font-medium"
                            >
                                <ActivityHoverWrapper activity={currentActivity}>
                                    <span className="inline-flex items-center gap-1.5 cursor-pointer">
                                        <span className="inline-flex items-center justify-center size-4 rounded-none bg-muted/60 text-foreground/80">
                                            {getEventIcon(currentActivity.type)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {currentActivity.title}
                                            <span className="text-[10px] font-normal text-muted-foreground/40 tabular-nums">
                                                · {formatRelativeTime(currentActivity.timestamp)}
                                            </span>
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
                                                className="text-muted-foreground/70 inline-flex items-center"
                                            >
                                                listening to
                                                <Equalizer />
                                            </motion.span>

                                            {/* Song name */}
                                            <SpotifyHoverWrapper track={currentTrack} isPlaying={true}>
                                                <motion.a
                                                    variants={highlightVariants}
                                                    href={currentTrack.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none font-medium hover:opacity-80 transition-opacity cursor-pointer bg-green-500/10 text-green-500"
                                                >
                                                    <Music className="size-2.5" />
                                                    {currentTrack.name}
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
                                                className="text-foreground/90 font-medium"
                                            >
                                                {currentTrack.artist}
                                            </motion.span>

                                            {/* Live Progress Bar & Timestamp */}
                                            {isCurrentTrackLive && playbackState.duration > 0 && (
                                                <motion.div
                                                    variants={wordVariants}
                                                    className="inline-flex items-center gap-2 ml-2 px-2 py-1 rounded-none bg-green-500/5 border border-green-500/20"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-16 h-1 bg-muted/30 rounded-none overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500 transition-all duration-200 ease-linear"
                                                                style={{ width: `${playbackState.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-green-500 font-mono tabular-nums">
                                                            {playbackState.formattedProgress} / {playbackState.formattedDuration}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
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
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none font-medium hover:opacity-80 transition-opacity cursor-pointer bg-orange-500/10 text-orange-500"
                                                >
                                                    <Music className="size-2.5" />
                                                    {currentTrack.name}
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
                                                className="text-foreground/90 font-medium"
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

                {/* Commit message preview - always rendered with fixed height */}
                <div className="h-6 mt-3">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`desc-${currentIndex}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="text-sm text-muted-foreground/60 truncate max-w-xl"
                        >
                            {currentActivity.description ? `"${currentActivity.description}"` : '—'}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Activity indicator dots */}
            {activities.length > 1 && (
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 flex gap-2 md:gap-1.5">

                    {activities.slice(0, activityCount).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`size-2.5 md:size-1.5 rounded-none transition-all duration-300 hover:scale-125 ${idx === currentIndex
                                ? 'bg-primary/60 scale-110 md:scale-125'
                                : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                                }`}
                            aria-label={`Go to activity ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
