'use client';

import { useState } from 'react';
import { ActivityHoverCard, GitHubProjectCard, GitHubActivityCard, SpotifyCard, GitHubProjectCardSkeleton, SpotifyCardSkeleton } from './activity-hover-card';
import { useRepoDetails } from '@/hooks/use-repo-details';
import { GitHubEventDetail } from '@/hooks/use-github';
import { SpotifyTrack } from '@/server/services/spotify';

interface ProjectHoverWrapperProps {
    children: React.ReactNode;
    repository: string; // format: owner/repo
    isPrivate: boolean;
}

export function ProjectHoverWrapper({ children, repository, isPrivate }: ProjectHoverWrapperProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [owner, repo] = repository.split('/');

    const { data: repoDetails, isLoading } = useRepoDetails(owner, repo, isHovering);

    return (
        <ActivityHoverCard
            delay={200}
            trigger={
                <span
                    onMouseEnter={() => setIsHovering(true)}
                    onFocus={() => setIsHovering(true)} // Also prefetch on focus
                >
                    {children}
                </span>
            }
            side="bottom"
            align="start"
        >
            {isLoading ? (
                <GitHubProjectCardSkeleton />
            ) : repoDetails ? (
                <GitHubProjectCard
                    repoName={repoDetails.name}
                    description={repoDetails.description || undefined}
                    topics={repoDetails.topics}
                    languages={repoDetails.languages}
                    stars={repoDetails.stars}
                    forks={repoDetails.forks}
                    url={repoDetails.url}
                    isPrivate={repoDetails.isPrivate}
                />
            ) : (
                <div className="text-sm text-muted-foreground">
                    {isPrivate ? 'Private repository' : 'Could not load repository details'}
                </div>
            )}
        </ActivityHoverCard>
    );
}

interface ActivityHoverWrapperProps {
    children: React.ReactNode;
    activity: GitHubEventDetail;
}

export function ActivityHoverWrapper({ children, activity }: ActivityHoverWrapperProps) {
    return (
        <ActivityHoverCard
            trigger={children}
            side="bottom"
            align="center"
        >
            <GitHubActivityCard
                type={activity.type}
                title={activity.title}
                description={activity.description}
                repository={activity.repository}
                timestamp={activity.timestamp}
                url={activity.url}
            />
        </ActivityHoverCard>
    );
}

interface SpotifyHoverWrapperProps {
    children: React.ReactNode;
    track: SpotifyTrack;
    isPlaying?: boolean;
}

export function SpotifyHoverWrapper({ children, track, isPlaying }: SpotifyHoverWrapperProps) {
    return (
        <ActivityHoverCard
            trigger={children}
            side="bottom"
            align="end"
        >
            <SpotifyCard
                name={track.name}
                artist={track.artist}
                album={track.album}
                albumArt={track.image}
                url={track.url}
                isPlaying={isPlaying}
            />
        </ActivityHoverCard>
    );
}

