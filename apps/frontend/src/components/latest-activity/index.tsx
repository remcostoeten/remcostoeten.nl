'use client';

import { useState, useEffect, useCallback } from "react";
import { fetchLatestActivities, type LatestActivity as TLatestActivity } from "@/services/github-service";
import { ActivityShell } from "./activity-shell";
import { GitHubActivityContent, GitHubActivitySkeletonContent, GitHubActivityErrorContent } from "./github-content";
import { SpotifyIntegration } from "./spotify-integration";

/**
 * LatestActivity - Main component with zero layout shift architecture
 * 
 * This component uses the ActivityShell to provide consistent layout structure
 * while different content states (loading, error, success) are swapped in/out
 * without affecting the overall dimensions.
 */

export function LatestActivity() {
  const [activities, setActivities] = useState<TLatestActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCommit, setHoveredCommit] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLatestActivities();

      setActivities(result.activities);
    } catch (err) {
      console.error('Failed to load latest activities:', err);
      setError('Unable to load GitHub activities. Please check your GitHub token configuration.');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (activities.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 5950);

    return () => clearInterval(interval);
  }, [activities.length, isPaused]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleCommitMouseEnter = useCallback(() => {
    setHoveredCommit(currentActivityIndex);
  }, [currentActivityIndex]);

  const handleCommitMouseLeave = useCallback(() => {
    setHoveredCommit(null);
  }, []);

  const currentActivity = activities[currentActivityIndex];

  // Determine GitHub content based on state
  const githubContent = (() => {
    if (loading) {
      return <GitHubActivitySkeletonContent />;
    }
    if (error || activities.length === 0) {
      return (
        <GitHubActivityErrorContent
          error={error || 'No recent GitHub activities found.'}
          onRetry={loadActivities}
          loading={loading}
        />
      );
    }
    return (
      <GitHubActivityContent
        currentActivity={currentActivity}
        currentActivityIndex={currentActivityIndex}
        hoveredCommit={hoveredCommit}
        onCommitMouseEnter={handleCommitMouseEnter}
        onCommitMouseLeave={handleCommitMouseLeave}
      />
    );
  })();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ActivityShell
        githubContent={githubContent}
        spotifyContent={<SpotifyIntegration />}
      />
    </div>
  );
}
