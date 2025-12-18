'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitCommit, GitPullRequest, Star, AlertCircle, Eye, Box, Copy, Plus, GitBranch, Lock, Globe } from 'lucide-react';
import { useGitHubRecentActivity, GitHubEventDetail } from '@/hooks/use-github';
import { getLatestTracks, getNowPlaying, SpotifyTrack, NowPlaying } from '@/core/spotify-service';

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
        case 'commit': return <GitCommit className='size-3.5' />;
        case 'pr': return <GitPullRequest className='size-3.5' />;
        case 'issue': return <AlertCircle className='size-3.5' />;
        case 'review': return <Eye className='size-3.5' />;
        case 'release': return <Box className='size-3.5' />;
        case 'fork': return <Copy className='size-3.5' />;
        case 'star': return <Star className='size-3.5' />;
        case 'create': return <Plus className='size-3.5' />;
        default: return <GitBranch className='size-3.5' />;
    }
}

function getActivityVerb(type: GitHubEventDetail['type']): string {
    switch (type) {
        case 'commit': return 'pushing commits to';
        case 'pr': return 'working on a PR for';
        case 'issue': return 'handling issues on';
        case 'review': return 'reviewing code on';
        case 'release': return 'releasing';
        case 'fork': return 'forking';
        case 'star': return 'starring';
        case 'create': return 'creating';
        default: return 'working on';
    }
}

function getShortRepoName(fullName: string) {
    return fullName?.split('/').pop() || fullName;
}

function isPrivateRepo(repoName: string): boolean {
    const privateRepos = ['remcostoeten.nl', 'private-repo'];
    const shortName = getShortRepoName(repoName);
    return privateRepos.includes(shortName.toLowerCase());
}

function Equalizer({ className = '' }: { className?: string }) {
    return (
        <span className={`inline-flex items-end gap-[2px] h-3 mx-1 ${className}`} aria-hidden='true'>
            <span className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]' />
            <span className='w-[2px] bg-green-500 rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]' />
            <span className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]' />
        </span>
    );
}

interface ActivityFeedProps {
    activityCount?: number;
    rotationInterval?: number;
}

export function ActivityFeed({ activityCount = 5, rotationInterval = 6000 }: ActivityFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { data: activities = [], isLoading: githubLoading } = useGitHubRecentActivity(activityCount);
    const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
    const [spotifyLoading, setSpotifyLoading] = useState(true);

    // Poll for currently playing track
    useEffect(() => {
        const checkNowPlaying = async () => {
            const data = await getNowPlaying();
            setNowPlaying(data);
        };
        checkNowPlaying();
        const interval = setInterval(checkNowPlaying, 10000);
        return () => clearInterval(interval);
    }, []);

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
        if (activities.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, rotationInterval);
        return () => clearInterval(interval);
    }, [activities.length, rotationInterval]);

    const isLoading = githubLoading || spotifyLoading;
    const currentActivity = activities[currentIndex];
    const isRealTimePlaying = nowPlaying?.isPlaying && nowPlaying?.track;
    const currentTrack = isRealTimePlaying ? nowPlaying.track : tracks[currentIndex % Math.max(tracks.length, 1)];

    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-border/30 bg-background/50 p-6">
                <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                    <span className="text-muted-foreground/60 text-sm">Loading activity...</span>
                </div>
            </div>
        );
    }

    if (!currentActivity) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-border/30 bg-background/50 p-6">
                <span className="text-muted-foreground/60 text-sm">No recent activity</span>
            </div>
        );
    }

    const repoName = getShortRepoName(currentActivity.repository);
    const activityVerb = getActivityVerb(currentActivity.type);
    const isPrivate = isPrivateRepo(currentActivity.repository);

    return (
        <div className="relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
            
            {/* Progress indicator */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-border/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary/40 to-primary/20"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    key={currentIndex}
                    transition={{ duration: rotationInterval / 1000, ease: "linear" }}
                />
            </div>

            <div className="p-6 md:p-8">
                {/* Fixed height container to prevent layout shift */}
                <div className="min-h-[4.5rem] md:min-h-[5rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentIndex}-${currentActivity.id}`}
                            variants={sentenceVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg md:text-xl leading-relaxed"
                        >
                        {/* "Lately I've been" */}
                        <motion.span 
                            variants={wordVariants}
                            className="text-muted-foreground/70"
                        >
                            Lately I've been
                        </motion.span>

                        {/* Activity verb with icon */}
                        <motion.span 
                            variants={highlightVariants}
                            className="inline-flex items-center gap-1.5 text-foreground font-medium"
                        >
                            <span className="inline-flex items-center justify-center size-5 rounded-md bg-muted/60 text-foreground/80">
                                {getEventIcon(currentActivity.type)}
                            </span>
                            {activityVerb}
                        </motion.span>

                        {/* Project name with visibility indicator */}
                        <motion.span
                            variants={highlightVariants}
                            className="inline-flex items-center gap-1.5"
                        >
                            {isPrivate ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-semibold">
                                    <Lock className="size-3" />
                                    {repoName}
                                </span>
                            ) : (
                                <a
                                    href={currentActivity.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                                >
                                    <Globe className="size-3" />
                                    {repoName}
                                </a>
                            )}
                        </motion.span>

                        {/* "whilst listening to" */}
                        <motion.span 
                            variants={wordVariants}
                            className="text-muted-foreground/70"
                        >
                            whilst
                        </motion.span>

                        {/* Spotify section */}
                        {currentTrack ? (
                            <>
                                <motion.span 
                                    variants={wordVariants}
                                    className="text-muted-foreground/70 inline-flex items-center"
                                >
                                    {isRealTimePlaying ? (
                                        <>
                                            listening to
                                            <Equalizer />
                                        </>
                                    ) : (
                                        'I listened to'
                                    )}
                                </motion.span>

                                {/* Song name */}
                                <motion.a
                                    variants={highlightVariants}
                                    href={currentTrack.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold hover:opacity-80 transition-opacity cursor-pointer ${
                                        isRealTimePlaying 
                                            ? 'bg-green-500/10 text-green-500' 
                                            : 'bg-orange-500/10 text-orange-500'
                                    }`}
                                >
                                    <Music className="size-3.5" />
                                    {currentTrack.name}
                                </motion.a>

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
                            </>
                        ) : (
                            <motion.span 
                                variants={wordVariants}
                                className="text-muted-foreground/50"
                            >
                                enjoying some quiet time
                            </motion.span>
                        )}
                    </motion.div>
                </AnimatePresence>
                </div>

                {/* Commit message preview - always rendered with fixed height */}
                <div className="h-6 mt-3">
                    <AnimatePresence mode="wait">
                        {currentActivity.description && (
                            <motion.p
                                key={`desc-${currentIndex}`}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                                className="text-sm text-muted-foreground/60 truncate max-w-xl"
                            >
                                "{currentActivity.description}"
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Activity indicator dots */}
            {activities.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                    {activities.slice(0, activityCount).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`size-1.5 rounded-full transition-all duration-300 hover:scale-125 ${
                                idx === currentIndex
                                    ? 'bg-primary/60 scale-125'
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
