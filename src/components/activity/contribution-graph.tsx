'use client';

import { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { getLatestTracks, SpotifyTrack } from '@/server/services/spotify';
import { useGitHubEventsByDate, GitHubEventDetail, useGitHubContributions } from '@/hooks/use-github';
import { GraphSkeleton } from '@/components/ui/skeletons';

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
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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


  const activityData = useMemo(() => {
    if (githubLoading || loading) return [];

    const now = new Date();
    const isCurrentYear = year === now.getFullYear();

    // If current year, end at today. Otherwise end at Dec 31st.
    const end = isCurrentYear ? now : new Date(year, 11, 31);
    const start = new Date(year, 0, 1);

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const activityMap = new Map<string, ActivityDay>();

    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
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

  const handleMouseEnter = (e: React.MouseEvent, day: ActivityDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weeks = useMemo(() => {
    const weeksArray: ActivityDay[][] = [];
    let currentWeek: ActivityDay[] = [];

    const now = new Date();
    const isCurrentYear = year === now.getFullYear();
    const end = isCurrentYear ? now : new Date(year, 11, 31);

    // Default to start of year, but if current year we might want a rolling window.
    // However, the task specifically mentions not having empty space at the end.
    const start = new Date(year, 0, 1);

    let currentDate = new Date(start);
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentDate.setDate(currentDate.getDate() - daysToMonday);

    while (currentDate <= end) {
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

    // Add the remaining days of the current week if any, padding to 7 days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', githubCount: 0, spotifyCount: 0, totalActivity: 0, level: 0 });
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [activityData, year]);

  useLayoutEffect(() => {
    if (!loading && !githubLoading && scrollContainerRef.current) {
      const now = new Date();
      const startOfYear = new Date(year, 0, 1);
      const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      const weekOfYear = Math.floor(dayOfYear / 7);
      const currentMonth = now.getMonth();

      let scrollPosition;

      // If we're in December (month 11), scroll to show the complete December
      if (currentMonth === 11) {
        // Scroll to show the last few weeks including December
        scrollPosition = Math.max(0, (weeks.length - 10) * 13);
      } else {
        // Default behavior: center the current week
        scrollPosition = Math.max(0, (weekOfYear - 8) * 13);
      }

      scrollContainerRef.current.scrollLeft = scrollPosition;

      setTimeout(() => setIsVisible(true), 100);
    }
  }, [loading, githubLoading, year, weeks]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // Only consider days that are actually in the current year
      const firstDayInYear = week.find(d => d.date && new Date(d.date).getFullYear() === year);
      if (firstDayInYear?.date) {
        const date = new Date(firstDayInYear.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks, year]);

  // Calculate total contributions for the year
  const totalContributions = useMemo(() => {
    return activityData.reduce((sum, day) => sum + day.githubCount, 0);
  }, [activityData]);



  if (loading || githubLoading) {
    return <GraphSkeleton className={className} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        ref={scrollContainerRef}
        className="overflow-hidden"
      >
        <div ref={graphRef} className="flex flex-col w-full">
          {/* Month labels row */}
          <div className="flex text-[10px] text-muted-foreground mb-1 ml-7">
            {weeks.map((_, weekIndex) => {
              const label = monthLabels.find(l => l.weekIndex === weekIndex);
              return (
                <div key={weekIndex} className="w-[13px] shrink-0">
                  {label && (
                    <motion.span
                      className="whitespace-nowrap"
                      initial={{ opacity: 0, y: -5 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: weekIndex * 0.01, duration: 0.3 }}
                    >
                      {label.month}
                    </motion.span>
                  )}
                </div>
              );
            })}
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
                        className={`w-[10px] h-[10px] rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-brand-500/50 hover:shadow-[0_0_8px_hsl(var(--brand-500)/0.5)] ${getColorForLevel(day.level)}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          delay: Math.random() * 0.8,
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                        whileHover={{ scale: 1.3, zIndex: 10 }}
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
          className="flex items-center justify-between text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`w-[10px] h-[10px] rounded-sm ${getColorForLevel(level)}`} />
              ))}
            </div>
            <span>More</span>
          </div>
          <span className="text-muted-foreground/80">
            <span className="text-foreground font-medium">{totalContributions.toLocaleString()}</span> contributions in {year}
          </span>
        </motion.div>
      )}

      {selectedDay && selectedDay.githubCount > 0 && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedDay(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-card border border-border rounded-lg w-full max-w-md sm:max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-sm ${getColorForLevel(selectedDay.level)}`} />
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {new Date(selectedDay.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedDay.githubCount} contribution{selectedDay.githubCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Activity List */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-3">
                {/* Group commits by project */}
                {(() => {
                  const commits = selectedDay.details?.commits || [];

                  if (commits.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <div className="text-muted-foreground text-sm">
                          <p className="mb-2">No detailed activity available</p>
                          <p className="text-xs opacity-75">
                            GitHub only provides detailed events for the last ~90 days.
                            <br />
                            Contribution counts are still tracked via the contributions API.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const groupedByProject = commits.reduce((acc, commit) => {
                    const project = commit.projectName || 'Unknown';
                    if (!acc[project]) acc[project] = [];
                    acc[project].push(commit);
                    return acc;
                  }, {} as Record<string, typeof commits>);

                  return Object.entries(groupedByProject).map(([projectName, projectCommits]) => {
                    const isPrivate = !projectCommits[0]?.url || projectCommits[0].url === '#';
                    const repoName = projectName.split('/').pop() || projectName;

                    return (
                      <div key={projectName} className="space-y-2">
                        {/* Project Header */}
                        <div className="flex items-center gap-2 text-xs">
                          {isPrivate ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              {repoName}
                            </span>
                          ) : (
                            <a
                              href={`https://github.com/${projectName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              {repoName}
                            </a>
                          )}
                          <span className="text-muted-foreground">
                            {projectCommits.length} {projectCommits.length === 1 ? 'activity' : 'activities'}
                          </span>
                        </div>

                        {/* Commits List */}
                        <div className="space-y-1 pl-2 border-l-2 border-border ml-1">
                          {projectCommits.slice(0, 10).map((commit, idx) => (
                            <div key={idx} className="pl-3 py-1.5">
                              {isPrivate || !commit.url || commit.url === '#' ? (
                                <p className="text-xs text-muted-foreground leading-relaxed wrap-break-word">
                                  {commit.message}
                                </p>
                              ) : (
                                <a
                                  href={commit.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-foreground/80 hover:text-primary leading-relaxed wrap-break-word transition-colors block"
                                >
                                  {commit.message}
                                </a>
                              )}
                            </div>
                          ))}
                          {projectCommits.length > 10 && (
                            <p className="text-xs text-muted-foreground pl-3 py-1">
                              +{projectCommits.length - 10} more...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Spotify Tracks Section */}
              {selectedDay.details?.tracks && selectedDay.details.tracks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>🎵</span>
                    <span>{selectedDay.spotifyCount} track{selectedDay.spotifyCount !== 1 ? 's' : ''} played</span>
                  </div>
                  <div className="space-y-1">
                    {selectedDay.details.tracks.slice(0, 5).map((track, idx) => (
                      <a
                        key={idx}
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-foreground/70 hover:text-green-500 transition-colors"
                      >
                        <span className="truncate">{track.name}</span>
                        <span className="text-muted-foreground shrink-0">by {track.artist}</span>
                      </a>
                    ))}
                    {selectedDay.details.tracks.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{selectedDay.details.tracks.length - 5} more tracks...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Custom Tooltip */}
      {hoveredDay && hoveredDay.githubCount > 0 && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: tooltipPosition.x + 20,
            top: tooltipPosition.y - 55,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative">
            <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-md shadow-xl px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-sm ${getColorForLevel(hoveredDay.level)}`}></div>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {hoveredDay.githubCount} on {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="absolute w-1.5 h-1.5 bg-card/95 border-r border-b border-border/50 transform rotate-45 -bottom-[3px] left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}