'use client';

import { useState, useEffect, useCallback } from "react";
import { GitCommit } from "lucide-react";
import { fetchLatestActivities, type LatestActivity as TLatestActivity } from "@/services/github-service";
import { LatestActivitySkeleton } from "../latest-activity-skeleton";
import { ActivityContent } from "./activity-content";
import { SpotifyIntegration } from "./spotify-integration";

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

      if (!result.activities || result.activities.length === 0) {
        setError('No recent GitHub activities found');
        setActivities([]);
        return;
      }

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

  if (loading) {
    return <LatestActivitySkeleton />;
  }

  return (
    <section
      className="mt-6 p-3 xs:p-4 bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl backdrop-blur-sm relative overflow-hidden min-h-[140px] xs:min-h-[120px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-labelledby="latest-activity-heading"
      style={{ zIndex: 1 }}
    >
      <h2 id="latest-activity-heading" className="sr-only">Latest Development Activity</h2>

      <div className="flex items-start gap-2 xs:gap-3 mb-3">
        <div className="p-1.5 bg-accent/10 rounded-lg flex-shrink-0" aria-hidden="true">
          <GitCommit className="w-4 h-4 text-accent" />
        </div>

        <div className="leading-relaxed min-w-0 flex-1 text-body" role="status" aria-live="polite" aria-atomic="true">
          <div className="text-muted-foreground">
            {(error || activities.length === 0) ? (
              <div className="flex items-center">
                <span className="truncate">
                  {error || 'No recent GitHub activities found.'}{" "}
                </span>
                <button
                  onClick={loadActivities}
                  className="text-accent hover:underline focus:underline focus:outline-none transition-colors ml-1 flex-shrink-0"
                  disabled={loading}
                  aria-label="Retry loading activities"
                >
                  {loading ? 'Loading...' : 'Retry'}
                </button>
              </div>
            ) : (
              <ActivityContent
                currentActivity={currentActivity}
                currentActivityIndex={currentActivityIndex}
                hoveredCommit={hoveredCommit}
                onCommitMouseEnter={handleCommitMouseEnter}
                onCommitMouseLeave={handleCommitMouseLeave}
              />
            )}
          </div>
        </div>
      </div>

      <SpotifyIntegration />
    </section>
  );
}