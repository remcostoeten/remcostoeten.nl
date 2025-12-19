'use client';

import { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { getLatestTracks, SpotifyTrack } from '@/core/spotify-service';
import { useGitHubEventsByDate, GitHubEventDetail, useGitHubContributions } from '@/hooks/use-github';

interface ActivityDay {
  date: string;
  githubCount: number;
  spotifyCount: number;
  totalActivity: number;
  level: number;
  details?: {
    commits: Array<{ message: string; url: string; projectName: string }>;
    tracks: Array<{ name: string; artist: string; url: string }>;
  };
}

interface ActivityContributionGraphProps {
  year?: number;
  showLegend?: boolean;
  className?: string;
}

export function ActivityContributionGraph({
  year = new Date().getFullYear(),
  showLegend = true,
  className = ""
}: ActivityContributionGraphProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedDay, setSelectedDay] = useState<ActivityDay | null>(null);

  const { data: githubContributions = new Map(), isLoading: githubLoading } = useGitHubContributions(year);

  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Use new hook for detailed events on demand or pre-fetch
  // For now, we'll fetch a broad range to cover the view
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const { data: detailedEvents } = useGitHubEventsByDate(startDate, endDate);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // GitHub contributions now fetched via hook
        const spotifyTracks = await getLatestTracks();
        setTracks(spotifyTracks);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  useLayoutEffect(() => {
    if (!loading && !githubLoading && scrollContainerRef.current) {
      const now = new Date();
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const weekOfYear = Math.floor(dayOfYear / 7);

      const scrollPosition = Math.max(0, (weekOfYear - 8) * 13);

      scrollContainerRef.current.scrollLeft = scrollPosition;

      setTimeout(() => setIsVisible(true), 100);
    }
  }, [loading, githubLoading, year]);

  const activityData = useMemo(() => {
    if (githubLoading || loading) return [];

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const days = Math.ceil((endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

    const activityMap = new Map<string, ActivityDay>();

    for (let i = 0; i <= days; i++) {
      const date = new Date(startOfYear);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const githubData = githubContributions.get(dateStr);
      const githubCount = githubData?.contributionCount || 0;

      activityMap.set(dateStr, {
        date: dateStr,
        githubCount,
        spotifyCount: 0,
        totalActivity: githubCount,
        level: 0,
        details: { commits: [], tracks: [] }
      });
    }

    // Merge detailed events if available
    if (detailedEvents) {
      detailedEvents.forEach((day: { date: string, events: GitHubEventDetail[] }) => {
        const mapDay = activityMap.get(day.date);
        if (mapDay) {
          // Map detailed events to the expected structure
          mapDay.details = mapDay.details || { commits: [], tracks: [] };
          day.events.forEach(event => {
            mapDay.details!.commits.push({
              message: event.title,
              url: event.url,
              projectName: event.repository
            });
          });
        }
      });
    }

    tracks.forEach(track => {
      const dateStr = new Date(track.played_at).toISOString().split('T')[0];
      const day = activityMap.get(dateStr);
      if (day) {
        day.spotifyCount++;
        day.totalActivity++;
        if (!day.details) day.details = { commits: [], tracks: [] };
        day.details.tracks.push({
          name: track.name,
          artist: track.artist,
          url: track.url
        });
      }
    });

    activityMap.forEach(day => {
      if (day.githubCount === 0) day.level = 0;
      else if (day.githubCount <= 3) day.level = 1;
      else if (day.githubCount <= 6) day.level = 2;
      else if (day.githubCount <= 9) day.level = 3;
      else day.level = 4;
    });

    return Array.from(activityMap.values());
  }, [githubContributions, tracks, year, loading, githubLoading, detailedEvents]);

  const getColorForLevel = (level: number) => {
    const colors = [
      'bg-[#161b22]',
      'bg-[#0e4429]',
      'bg-[#006d32]',
      'bg-[#26a641]',
      'bg-[#39d353]'
    ];
    return colors[level];
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weeks = useMemo(() => {
    const weeksArray: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    let currentDate = new Date(startOfYear);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentDate.setDate(currentDate.getDate() - daysToMonday);

    while (currentDate <= endOfYear || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const day = activityData.find(d => d.date === dateStr);
      currentWeek.push(day || { date: dateStr, githubCount: 0, spotifyCount: 0, totalActivity: 0, level: 0 });

      if (currentWeek.length === 7) {
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
      if (weeksArray.length > 60) break;
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', githubCount: 0, spotifyCount: 0, totalActivity: 0, level: 0 });
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [activityData, year]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayWithDate = week.find(d => d.date);
      if (firstDayWithDate?.date) {
        const date = new Date(firstDayWithDate.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], position: weekIndex * 13 });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);



  if (loading || githubLoading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-2">
          <div className="flex gap-[3px] pl-7">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-10 h-3 bg-muted/20 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="flex gap-0">
            <div className="w-7 flex flex-col gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[10px]"></div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="w-[10px] h-[10px] bg-muted/20 rounded-sm animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>

        <div ref={graphRef} className="inline-block min-w-max">
          <div className="flex text-[10px] text-muted-foreground mb-1 pl-7 h-4">
            {monthLabels.map(({ month, position }, idx) => (
              <motion.span
                key={idx}
                className="absolute"
                style={{ marginLeft: `${position + 28}px` }}
                initial={{ opacity: 0, y: -5 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
              >
                {month}
              </motion.span>
            ))}
          </div>

          <div className="flex gap-0">
            <div className="flex flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground w-7">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[10px] flex items-center justify-end pr-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    if (!day.date) {
                      return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                    }

                    return (
                      <motion.div
                        key={dayIndex}
                        className={`w-[10px] h-[10px] rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-white/30 ${getColorForLevel(day.level)}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          delay: weekIndex * 0.015 + dayIndex * 0.008,
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        onClick={() => setSelectedDay(day)}
                        title={`${day.date}: ${day.githubCount} contributions`}
                        whileHover={{ scale: 1.3 }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <motion.div
          className="flex items-center gap-2 text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-[10px] h-[10px] rounded-sm ${getColorForLevel(level)}`} />
            ))}
          </div>
          <span>More</span>
        </motion.div>
      )}

      {selectedDay && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDay(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-card border border-border rounded-lg p-4 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-foreground">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${getColorForLevel(selectedDay.level)}`}></div>
                <span className="text-muted-foreground">
                  {selectedDay.githubCount} contribution{selectedDay.githubCount !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedDay.details?.tracks && selectedDay.details.tracks.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <div className="text-muted-foreground text-xs mb-1">
                    🎵 {selectedDay.spotifyCount} track{selectedDay.spotifyCount !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}