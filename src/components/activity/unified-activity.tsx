'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, GitBranch, GitPullRequest, GitCommit, Star, AlertCircle, Eye, Box, Copy, Plus, ExternalLink, Lock, Unlock } from 'lucide-react';
import { useGitHubRecentActivity, GitHubEventDetail } from '@/hooks/use-github';
import { getLatestTracks, getNowPlaying, SpotifyTrack, NowPlaying, formatDuration } from '@/server/services/spotify';
import { AnimatedNumber } from '../ui/animated-number';

function getEventIcon(type: GitHubEventDetail['type']) {
    switch (type) {
        case 'commit': return <GitCommit className='size-3.5' />
        case 'pr': return <GitPullRequest className='size-3.5' />
        case 'issue': return <AlertCircle className='size-3.5' />
        case 'review': return <Eye className='size-3.5' />
        case 'release': return <Box className='size-3.5' />
        case 'fork': return <Copy className='size-3.5' />
        case 'star': return <Star className='size-3.5' />
        case 'create': return <Plus className='size-3.5' />
        default: return <GitBranch className='size-3.5' />
    }
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

function Equalizer() {
    return (
        <div className='flex items-end gap-[1px] h-3' aria-hidden='true'>
            <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]' />
            <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s]' />
            <div className='w-[2px] bg-green-500 rounded-full animate-[music-bar_0.5s_ease-in-out_infinite_0.2s]' />
        </div>
    )
}

const ActivityItem = ({ children }: { children: React.ReactNode }) => (
    <div className="relative flex items-start gap-4 pl-8 pr-4 py-3 bg-background/30 rounded-lg overflow-hidden border border-border/20">
        {children}
    </div>
);

const ActivityIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute left-2.5 top-3.5 flex size-5 items-center justify-center rounded-full bg-muted/60 text-foreground/70">
        {children}
    </div>
);

const ActivityContent = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 space-y-1">
        {children}
    </div>
);


export function UnifiedActivity() {
    const { data: activities = [], isLoading: githubLoading } = useGitHubRecentActivity(5);
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
                const spotifyTracks = await getLatestTracks();
                setTracks(spotifyTracks);
            } catch (error) {
                console.error('Error fetching recent tracks:', error);
            } finally {
                setSpotifyLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const isRealTimePlaying = nowPlaying?.isPlaying && nowPlaying?.track;
    const spotifyTrack = isRealTimePlaying ? nowPlaying.track : tracks[0];

    const progressPercent = nowPlaying ? Math.min(100, (nowPlaying.progress_ms / nowPlaying.duration_ms) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
                {githubLoading && <p>Loading GitHub activity...</p>}
                {activities.map((activity) => (
                    <ActivityItem key={activity.id}>
                        <ActivityIcon>{getEventIcon(activity.type)}</ActivityIcon>
                        <ActivityContent>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span>{activity.title}</span>
                                    <span className="text-muted-foreground/40">•</span>
                                    <span className='flex items-center gap-1'>
                                        {activity.isPrivate ? <Lock className="size-2.5" /> : <Unlock className="size-2.5" />}
                                        {activity.isPrivate ? 'Private' : 'Public'}
                                    </span>
                                </div>
                                <span className="text-muted-foreground/60">{formatRelativeTime(activity.timestamp)}</span>
                            </div>

                            <p className="text-sm font-medium text-foreground leading-snug">
                                {activity.isPrivate ? (
                                    <span>{activity.repository}</span>
                                ) : (
                                    <a href={activity.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        {activity.repository}
                                    </a>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                "{activity.description}"
                            </p>

                        </ActivityContent>
                        {!activity.isPrivate && (
                            <a href={activity.url} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 text-muted-foreground/40 hover:text-foreground transition-colors" title="View on GitHub">
                                <ExternalLink className="size-3" />
                            </a>
                        )}
                    </ActivityItem>
                ))}
            </div>
            <div className="space-y-3">
                {spotifyLoading && <p>Loading Spotify activity...</p>}
                {spotifyTrack && (
                    <ActivityItem>
                        <ActivityIcon>
                            <Music className={`size-3.5 ${isRealTimePlaying ? 'text-green-500' : 'text-orange-500'}`} />
                        </ActivityIcon>
                        <ActivityContent>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{isRealTimePlaying ? 'Currently Playing' : 'Recently Played'}</span>
                                {isRealTimePlaying && <Equalizer />}
                            </div>
                            <a href={spotifyTrack.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate">
                                {spotifyTrack.name}
                            </a>
                            <p className="text-xs text-muted-foreground truncate">{spotifyTrack.artist}</p>
                            {isRealTimePlaying && nowPlaying && (
                                <div className="pt-1">
                                    <div className="h-1 w-full bg-border/30 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500 rounded-full"
                                            initial={{ width: `${progressPercent}%` }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "linear" }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground/60 tabular-nums">
                                        <span>{formatDuration(nowPlaying.progress_ms)}</span>
                                        <span>{formatDuration(nowPlaying.duration_ms)}</span>
                                    </div>
                                </div>
                            )}
                        </ActivityContent>
                    </ActivityItem>
                )}
            </div>
        </div>
    );
}
