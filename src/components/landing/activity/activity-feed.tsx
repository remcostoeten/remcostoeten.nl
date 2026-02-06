import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Music, GitCommit, GitPullRequest, Star, AlertCircle, Eye, Box, Copy, Plus, GitBranch, Lock, Globe } from 'lucide-react';
import type { SpotifyTrack } from '@/server/services/spotify';
import type { GitHubEventDetail } from '@/hooks/use-github';
import { useCombinedActivity } from '@/hooks/use-combined-activity';
import { ProjectHoverWrapper, SpotifyHoverWrapper } from './hover-wrappers';
import { useSpotifyPlayback } from '@/hooks/use-spotify-playback';
import { ActivityStatusBar } from './activity-status-bar';

const SPRING_CONFIG = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.8,
};

const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Sentence variants for automatic transitions with stagger
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

// Directional variants for manual slide transitions
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
        }
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.95,
        transition: {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
        }
    })
};

const wordVariants = {
    initial: {
        y: 20,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: SMOOTH_EASE,
        }
    },
    exit: {
        y: -10,
        opacity: 0,
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
    },
    animate: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: SMOOTH_EASE,
        }
    },
    exit: {
        y: -12,
        opacity: 0,
        scale: 0.95,
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
        case 'delete': return <GitBranch className='size-3 opacity-70' />;
        default: return <GitBranch className='size-3' />;
    }
}

type IntroPhrase = {
    prefix: string;
    connector: string;
};

const INTRO_PHRASES: Record<string, IntroPhrase[]> = {
    commit: [
        { prefix: 'Just pushed to', connector: 'via' },
        { prefix: 'Shipped code to', connector: 'in' },
        { prefix: 'Hacking on', connector: 'with' },
        { prefix: 'Commits on', connector: 'for' },
    ],
    pr: [
        { prefix: 'Opened a PR on', connector: 'for' },
        { prefix: 'Contributing to', connector: 'via' },
        { prefix: 'Submitted to', connector: 'on' },
    ],
    create: [
        { prefix: 'Just created', connector: 'called' },
        { prefix: 'Spinning up', connector: 'named' },
        { prefix: 'Started', connector: 'for' },
    ],
    review: [
        { prefix: 'Reviewed', connector: 'on' },
        { prefix: 'Code review on', connector: 'for' },
    ],
    issue: [
        { prefix: 'Opened issue on', connector: 'about' },
        { prefix: 'Debugging', connector: 'in' },
    ],
    star: [
        { prefix: 'Starred', connector: '—' },
        { prefix: 'Bookmarked', connector: '—' },
    ],
    fork: [
        { prefix: 'Forked', connector: 'from' },
    ],
    release: [
        { prefix: 'Released', connector: 'tag' },
        { prefix: 'Shipped', connector: 'version' },
    ],
    default: [
        { prefix: 'Active on', connector: 'via' },
        { prefix: 'Working on', connector: 'in' },
    ],
};

function getActivityIntro(type: GitHubEventDetail['type'], seed: number): IntroPhrase {
    const phrases = INTRO_PHRASES[type] || INTRO_PHRASES.default;
    return phrases[seed % phrases.length];
}

function getShortRepoName(fullName: string) {
    return fullName?.split('/').pop() || fullName;
}

function formatRelativeTime(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins === 1) return 'one minute ago'
    if (diffMins < 30) return `${diffMins} minutes ago`
    if (diffMins < 45) return 'half an hour ago'
    if (diffMins < 60) return '45 minutes ago'
    if (diffHours === 1) return 'one hour ago'
    if (diffHours < 12) return `${diffHours}h ago`
    if (diffHours < 24) return 'half a day ago'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

function formatTrackTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

interface LiveGlowProps {
    progress: number;
    currentMs: number;
    durationMs: number;
}

function LiveGlow({ progress, currentMs, durationMs }: LiveGlowProps) {
    return (
        <motion.div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="relative">
                <div className="relative h-[2px]">
                    <div className="absolute inset-0 bg-white/5 w-full" />
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-brand-500/80 shadow-[0_0_8px_hsl(var(--brand-500)/0.4)]"
                        style={{ width: `${progress}%` }}
                        layout
                    />
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
                    <motion.div
                        className="absolute -top-5 flex flex-col items-center"
                        style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                    >
                        <span className="text-[10px] font-mono text-brand-400 tabular-nums select-none whitespace-nowrap">
                            {formatTrackTime(currentMs)}
                        </span>
                    </motion.div>
                </div>
                <div className="absolute -top-5 left-0 right-0 flex justify-between px-0">
                    <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums select-none">
                        0:00
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums select-none">
                        {formatTrackTime(durationMs)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

interface ActivityFeedProps {
    activityCount?: number;
    rotationInterval?: number;
}



export function ActivityFeed({ activityCount = 5, rotationInterval = 6000 }: ActivityFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 left, 1 right
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [transitionType, setTransitionType] = useState<'auto' | 'manual'>('auto');

    // *** PERFORMANCE OPTIMIZATION: Uses shared combined hook ***
    // This reuses the same cached data as contribution-graph instead of making another 2 API calls
    const { data: combinedData, isLoading: dataLoading } = useCombinedActivity(activityCount, 10);
    const activities = combinedData?.recentActivity || [];
    const tracks = combinedData?.spotifyTracks || [];

    const playbackState = useSpotifyPlayback();

    // Motion values for drag and velocity
    // Removed velocity-based blur for performance - was causing heavy per-frame calculations

    const [isReady, setIsReady] = useState(false);

    // Delay everything to unblock initial TBT (reduced from 3500ms since we're not making separate fetches)
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // No longer need separate Spotify fetch - it comes from combined data
    const isLoading = dataLoading || !isReady;

    // Pair activities with tracks - use minimum of both to avoid index out of bounds
    const pairedContent = useMemo(() => {
        const minLength = Math.min(activities.length, tracks.length);
        return Array.from({ length: minLength }, (_, i) => ({
            activity: activities[i],
            track: tracks[i]
        }));
    }, [activities, tracks]);

    const rotateActivity = useCallback(() => {
        if (pairedContent.length === 0 || isPaused) return;
        setTransitionType('auto');
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % pairedContent.length);
        setElapsedTime(0);
    }, [pairedContent.length, isPaused]);

    const goToNextSlide = useCallback(() => {
        if (pairedContent.length === 0) return;
        setTransitionType('manual');
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % pairedContent.length);
        setElapsedTime(0);
    }, [pairedContent.length]);

    const goToPrevSlide = useCallback(() => {
        if (pairedContent.length === 0) return;
        setTransitionType('manual');
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + pairedContent.length) % pairedContent.length);
        setElapsedTime(0);
    }, [pairedContent.length]);

    const handleDragEnd = (info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        const width = 100; // threshold

        if (offset < -width || velocity < -500) {
            setTransitionType('manual');
            goToNextSlide();
        } else if (offset > width || velocity > 500) {
            setTransitionType('manual');
            goToPrevSlide();
        }
    };

    useEffect(() => {
        if (pairedContent.length === 0 || !isReady) return;

        const interval = setInterval(() => {
            if (!isPaused) {
                setElapsedTime((prev) => {
                    const newTime = prev + 100;
                    if (newTime >= rotationInterval) {
                        rotateActivity();
                        return 0;
                    }
                    return newTime;
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [pairedContent.length, isPaused, rotationInterval, rotateActivity, isReady]);

    useEffect(() => {
        setElapsedTime(0);
    }, [currentIndex]);

    const totalSlides = Math.max(1, pairedContent.length);

    const currentContent = useMemo(() =>
        pairedContent[currentIndex % totalSlides],
        [pairedContent, currentIndex, totalSlides]
    );

    const currentActivity = currentContent?.activity;
    const currentTrack = currentContent?.track;

    const isRealTimePlaying = useMemo(() => playbackState.isPlaying && playbackState.track, [playbackState.isPlaying, playbackState.track]);

    // If currently playing live, replace the current track with the live one
    const displayTrack = useMemo(() => {
        if (isRealTimePlaying && currentIndex % totalSlides === 0) {
            return playbackState.track;
        }
        return currentTrack;
    }, [isRealTimePlaying, playbackState.track, currentTrack, currentIndex, totalSlides]);

    const isCurrentTrackLive = useMemo(() =>
        isRealTimePlaying && currentIndex % totalSlides === 0,
        [isRealTimePlaying, currentIndex, totalSlides]
    );

    if (isLoading) {
        return (
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
    const introPhrase = getActivityIntro(currentActivity.type, currentIndex);
    const isPrivate = currentActivity.isPrivate;

    return (
        <motion.div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            className="relative overflow-hidden rounded-none border border-border/30 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing touch-pan-y"
            role="region"
            aria-label="Recent activity feed showing GitHub contributions and Spotify listening history"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

            <div className="absolute top-0 left-0 w-full h-[2px] bg-border/10">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary/40 to-primary/20"
                    animate={{ width: `${(elapsedTime / rotationInterval) * 100}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                />
            </div>

            <div className="relative z-10 px-4 pt-4 pb-2 md:px-6" aria-live="polite" aria-atomic="true">

                <AnimatePresence mode={transitionType === 'auto' ? 'wait' : 'popLayout'} custom={direction} initial={false}>
                    {transitionType === 'auto' ? (
                        <motion.div
                            key={`${currentIndex}-${currentActivity.id}`}
                            variants={sentenceVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="text-[13px] leading-relaxed"
                        >
                            {/* GITHUB ROW */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <motion.span variants={wordVariants} className="text-muted-foreground/70 shrink-0">
                                        {introPhrase.prefix}
                                    </motion.span>

                                    <motion.span variants={highlightVariants}>
                                        <ProjectHoverWrapper repository={currentActivity.repository} isPrivate={isPrivate}>
                                            {isPrivate ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/5 text-amber-500 border border-amber-500/20 rounded-[4px] cursor-pointer transition-colors group">
                                                    <Lock className="size-3 opacity-70" />
                                                    <span className="font-medium text-[12px]">{repoName}</span>
                                                </span>
                                            ) : (
                                                <a
                                                    href={currentActivity.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded-[4px] transition-colors cursor-pointer group"
                                                >
                                                    <GitBranch className="size-3 opacity-70" />
                                                    <span className="font-medium text-[12px]">{repoName}</span>
                                                </a>
                                            )}
                                        </ProjectHoverWrapper>
                                    </motion.span>

                                    <motion.span variants={wordVariants} className="text-muted-foreground/50 shrink-0">
                                        on
                                    </motion.span>

                                    <motion.span variants={highlightVariants} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 border border-border/40 rounded-[4px]">
                                        <span className="opacity-60">{getEventIcon(currentActivity.type)}</span>
                                        <span className="font-medium text-[12px] text-foreground/80">{currentActivity.title}</span>
                                    </motion.span>

                                    <motion.span variants={wordVariants} className="text-muted-foreground/40 text-[11px] shrink-0">
                                        · {formatRelativeTime(currentActivity.timestamp)}
                                    </motion.span>
                                </div>

                                {/* NAVIGATION ARROWS */}
                                <div className="flex items-center gap-1 text-muted-foreground/40 shrink-0">
                                    <button
                                        onClick={goToPrevSlide}
                                        className="p-1 hover:text-foreground transition-colors"
                                        aria-label="Previous slide"
                                    >
                                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-[10px] font-mono tabular-nums">
                                        {(currentIndex % totalSlides) + 1} / {totalSlides}
                                    </span>
                                    <button
                                        onClick={goToNextSlide}
                                        className="p-1 hover:text-foreground transition-colors"
                                        aria-label="Next slide"
                                    >
                                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* SPOTIFY ROW */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                                <motion.span variants={wordVariants} className="flex items-center gap-2 text-muted-foreground/60 text-[12px]">
                                    <Music className="size-4" />
                                    While listening to
                                </motion.span>

                                {displayTrack ? (
                                    <>
                                        <SpotifyHoverWrapper track={displayTrack} isPlaying={isCurrentTrackLive}>
                                            <motion.a
                                                variants={highlightVariants}
                                                href={displayTrack.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-medium text-[12px] transition-colors cursor-pointer ${isCurrentTrackLive
                                                    ? 'bg-brand-500/5 text-brand-500 border border-brand-500/20'
                                                    : 'bg-muted/40 text-foreground/80 border border-border/40'
                                                    }`}
                                            >
                                                {isCurrentTrackLive && <Equalizer />}
                                                <span className="font-semibold">{displayTrack.name}</span>
                                            </motion.a>
                                        </SpotifyHoverWrapper>

                                        <motion.span variants={wordVariants} className="text-muted-foreground/50">
                                            by
                                        </motion.span>

                                        <motion.span variants={highlightVariants} className="text-foreground/70 font-medium text-[12px]">
                                            {displayTrack.artist}
                                        </motion.span>
                                    </>
                                ) : (
                                    <motion.span variants={wordVariants} className="text-muted-foreground/50 italic text-[12px]">
                                        Coding in silence
                                    </motion.span>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        // MANUAL SLIDE VARIANT (Simplified for brevity as structure mirrors above, but usually kept in sync)
                        <motion.div
                            key={`${currentIndex}-${currentActivity.id}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => handleDragEnd(info)}
                            className="text-[13px] leading-relaxed md:leading-loose"
                        >
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5 pr-8">
                                <span className="text-muted-foreground/80 font-normal">
                                    {introPhrase.prefix}
                                </span>

                                <ProjectHoverWrapper repository={currentActivity.repository} isPrivate={isPrivate}>
                                    {isPrivate ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/5 text-amber-500 font-medium border border-amber-500/20 rounded-[4px] text-[12px]">
                                            <Lock className="size-3" />
                                            <span className="truncate max-w-[140px]">{repoName}</span>
                                        </span>
                                    ) : (
                                        <a
                                            href={currentActivity.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary font-medium border border-primary/20 rounded-[4px] text-[12px]"
                                        >
                                            <Globe className="size-3" />
                                            <span className="truncate max-w-[140px]">{repoName}</span>
                                        </a>
                                    )}
                                </ProjectHoverWrapper>

                                {introPhrase.connector && introPhrase.connector !== '—' && (
                                    <span className="text-muted-foreground/60 font-light italic text-[12px]">{introPhrase.connector}</span>
                                )}

                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/40 border border-border/40 rounded-[4px] text-foreground/90 font-medium">
                                    <span className="opacity-70">{getEventIcon(currentActivity.type)}</span>
                                    <span className="truncate max-w-[180px] text-[12px]">{currentActivity.title}</span>
                                </span>

                                <span className="inline-flex items-center gap-1 text-muted-foreground/40 text-[11px] ml-1">
                                    <span className="w-0.5 h-0.5 rounded-full bg-current" />
                                    <time dateTime={currentActivity.timestamp}>
                                        {formatRelativeTime(currentActivity.timestamp)}
                                    </time>
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-3 pt-3 border-t border-border/40">
                                {displayTrack ? (
                                    <>
                                        <span className="flex items-center gap-2 text-muted-foreground/70 text-[12px]">
                                            <span className="flex items-center justify-center size-5 rounded-full bg-muted/30 text-muted-foreground/60">
                                                <Music className="size-3" />
                                            </span>
                                            While listening to
                                        </span>

                                        {isCurrentTrackLive && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded xs">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                                <span className="text-[9px] font-bold text-brand-500 tracking-wider">LIVE</span>
                                            </span>
                                        )}

                                        <SpotifyHoverWrapper track={displayTrack} isPlaying={isCurrentTrackLive}>
                                            <a
                                                href={displayTrack.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-medium text-[12px] max-w-[320px] overflow-hidden ${isCurrentTrackLive
                                                    ? 'bg-brand-500/5 text-brand-500 border border-brand-500/20'
                                                    : 'bg-muted/40 text-foreground/80 border border-border/40'
                                                    }`}
                                            >
                                                <span className="truncate font-semibold min-w-0 shrink">{displayTrack.name}</span>
                                                <span className="text-muted-foreground/40 font-light mx-0.5 shrink-0 whitespace-nowrap">by</span>
                                                <span className={`${isCurrentTrackLive ? 'text-brand-400' : 'text-foreground/70'} truncate min-w-0 shrink`}>{displayTrack.artist}</span>
                                            </a>
                                        </SpotifyHoverWrapper>
                                    </>
                                ) : (
                                    <span className="flex items-center gap-2 text-muted-foreground/50 italic text-[12px]">
                                        <span className="flex items-center justify-center size-5 rounded-full bg-muted/20">
                                            <Music className="size-3 opacity-50" />
                                        </span>
                                        Coding in silence
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- METRIC BAR --- */}
            <div className="h-6 flex items-center px-0 pb-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`metric-${currentIndex}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="w-full"
                    >
                        <ActivityStatusBar />
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isCurrentTrackLive && (
                    <LiveGlow
                        progress={playbackState.percentage}
                        currentMs={playbackState.progress}
                        durationMs={playbackState.duration}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
