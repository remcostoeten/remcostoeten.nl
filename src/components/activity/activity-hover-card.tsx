'use client';

import { useState, useRef, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Hook to detect if device is touch/mobile
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check for touch capability and screen size
        const checkMobile = () => {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(hasTouch || isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

interface ActivityHoverCardProps {
    trigger: ReactNode;
    children: ReactNode;
    side?: 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
    delay?: number;
    disabled?: boolean;
}

export function ActivityHoverCard({
    trigger,
    children,
    side = 'bottom',
    align = 'center',
    delay = 150,
    disabled = false,
}: ActivityHoverCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        // Use actual card dimensions if available, otherwise use defaults
        const cardWidth = cardRef.current?.offsetWidth || 300;
        const cardHeight = cardRef.current?.offsetHeight || 200;
        const gap = 8;

        let top = side === 'top' ? rect.top - cardHeight - gap : rect.bottom + gap;
        let left = rect.left;

        // Align horizontally
        if (align === 'center') {
            left = rect.left + rect.width / 2 - cardWidth / 2;
        } else if (align === 'end') {
            left = rect.right - cardWidth;
        }

        // Keep within viewport bounds with padding
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 16;

        // Horizontal bounds
        if (left + cardWidth > viewportWidth - padding) {
            left = viewportWidth - cardWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        // Vertical bounds - flip if needed
        if (top + cardHeight > viewportHeight - padding) {
            // Try flipping to top
            top = rect.top - cardHeight - gap;
        }
        if (top < padding) {
            // If still out of bounds, position below
            top = rect.bottom + gap;
        }

        setPosition({ top, left });
    };

    const handleMouseEnter = () => {
        if (disabled || isMobile) return;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        updatePosition();
        timeoutRef.current = setTimeout(() => {
            setIsOpen(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Add a small delay before closing to allow mouse to move to card
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 100);
    };

    useEffect(() => {
        if (isOpen && !isMobile) {
            // Update position after card renders to get accurate dimensions
            requestAnimationFrame(() => {
                updatePosition();
            });

            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, isMobile]);

    // On mobile, just render the trigger without hover functionality
    if (isMobile) {
        return <span className="inline-block">{trigger}</span>;
    }

    return (
        <>
            <span
                ref={triggerRef}
                className="inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {trigger}
            </span>
            {typeof window !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={cardRef}
                            initial={{ opacity: 0, y: side === 'top' ? 8 : -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: side === 'top' ? 8 : -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'fixed',
                                top: `${position.top}px`,
                                left: `${position.left}px`,
                                zIndex: 9999,
                            }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="rounded-none border border-border/50 bg-background/95 backdrop-blur-md shadow-xl p-3 min-w-[280px] max-w-[320px]">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

// === GitHub Project Content ===
interface GitHubProjectCardProps {
    repoName: string;
    description?: string;
    topics?: string[];
    languages?: { name: string; color: string; percentage: number }[];
    stars?: number;
    forks?: number;
    url: string;
    isPrivate?: boolean;
}

export function GitHubProjectCard({
    repoName,
    description,
    topics = [],
    languages = [],
    stars,
    forks,
    url,
    isPrivate,
}: GitHubProjectCardProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="size-8 rounded-none bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{repoName[0]?.toUpperCase()}</span>
                </div>
                <div>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                        {repoName}
                    </a>
                    {isPrivate && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-none bg-amber-500/10 text-amber-500">
                            Private
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}

            {/* Topics */}
            {topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {topics.slice(0, 5).map((topic) => (
                        <span
                            key={topic}
                            className="text-xs px-2 py-0.5 rounded-none bg-primary/10 text-primary"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
                <div className="space-y-1.5">
                    <div className="h-1.5 rounded-none overflow-hidden flex bg-muted/30">
                        {languages.map((lang) => (
                            <div
                                key={lang.name}
                                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                                className="h-full"
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {languages.slice(0, 4).map((lang) => (
                            <div key={lang.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span
                                    className="size-2 rounded-none"
                                    style={{ backgroundColor: lang.color }}
                                />
                                {lang.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            {(stars !== undefined || forks !== undefined) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/30">
                    {stars !== undefined && (
                        <span className="flex items-center gap-1">
                            <svg className="size-3.5" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.791l.72-4.192L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
                            </svg>
                            {stars.toLocaleString()}
                        </span>
                    )}
                    {forks !== undefined && (
                        <span className="flex items-center gap-1">
                            <svg className="size-3.5" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
                            </svg>
                            {forks.toLocaleString()}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// === GitHub Activity Content ===
interface GitHubActivityCardProps {
    type: string;
    title: string;
    description?: string;
    repository: string;
    timestamp: string;
    url: string;
}

export function GitHubActivityCard({
    type,
    title,
    description,
    repository,
    timestamp,
    url,
}: GitHubActivityCardProps) {
    const formatTime = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary capitalize">{type}</span>
                <span className="text-xs text-muted-foreground">{formatTime(timestamp)}</span>
            </div>

            {/* Title */}
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium text-foreground hover:text-primary transition-colors"
            >
                {title}
            </a>

            {/* Description */}
            {description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
            )}

            {/* Repository */}
            <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                {repository}
            </div>
        </div>
    );
}

// === Spotify Content ===
interface SpotifyCardProps {
    name: string;
    artist: string;
    album?: string;
    albumArt?: string;
    duration?: string;
    url: string;
    isPlaying?: boolean;
}

export function SpotifyCard({
    name,
    artist,
    album,
    albumArt,
    duration,
    url,
    isPlaying,
}: SpotifyCardProps) {
    return (
        <div className="flex gap-3">
            {/* Album Art */}
            {albumArt ? (
                <img
                    src={albumArt}
                    alt={album || name}
                    className="size-16 rounded-none object-cover shadow-md"
                />
            ) : (
                <div className="size-16 rounded-none bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                    <svg className="size-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                </div>
            )}

            {/* Track Info */}
            <div className="flex-1 min-w-0 space-y-1">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-medium text-foreground hover:text-green-500 transition-colors truncate"
                >
                    {name}
                </a>
                <p className="text-sm text-muted-foreground truncate">{artist}</p>
                {album && (
                    <p className="text-xs text-muted-foreground/70 truncate">{album}</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                    {isPlaying && (
                        <span className="text-xs px-1.5 py-0.5 rounded-none bg-green-500/10 text-green-500 flex items-center gap-1">
                            <span className="inline-flex items-end gap-[2px] h-2.5">
                                <span className="w-[2px] bg-green-500 rounded-none animate-[music-bar_0.8s_ease-in-out_infinite]" />
                                <span className="w-[2px] bg-green-500 rounded-none animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]" />
                                <span className="w-[2px] bg-green-500 rounded-none animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]" />
                            </span>
                            Now Playing
                        </span>
                    )}
                    {duration && (
                        <span className="text-xs text-muted-foreground">{duration}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
