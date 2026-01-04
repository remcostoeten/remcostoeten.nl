'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useCombinedActivity } from '@/hooks/use-combined-activity';
import type { SpotifyTrack } from '@/server/services/spotify';
import type { GitHubEventDetail } from '@/hooks/use-github';


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
  const [selectedDay, setSelectedDay] = useState<ActivityDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // For a rolling 12-month view
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // *** PERFORMANCE OPTIMIZATION: Single combined API call instead of 4+ separate ones ***
  const { data: combinedData, isLoading: loading } = useCombinedActivity(5, 10);

  // Process contributions into a Map for lookup
  const githubContributions = useMemo(() => {
    const map = new Map<string, { date: string; contributionCount: number }>();
    if (combinedData?.contributions) {
      for (const item of combinedData.contributions) {
        map.set(item.date, item);
      }
    }
    return map;
  }, [combinedData?.contributions]);

  // Get tracks from combined data
  const tracks = combinedData?.spotifyTracks || [];

  // Get detailed events from recentActivity (limited to what we have from combined)
  const detailedEvents = useMemo(() => {
    if (!combinedData?.recentActivity) return [];
    // Group by date for the calendar view
    const byDate = new Map<string, GitHubEventDetail[]>();
    for (const event of combinedData.recentActivity) {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      const existing = byDate.get(dateStr) || [];
      existing.push(event);
      byDate.set(dateStr, existing);
    }
    return Array.from(byDate.entries()).map(([date, events]) => ({ date, events }));
  }, [combinedData?.recentActivity]);

  const graphRef = useRef<HTMLDivElement>(null);

  // Mobile optimization: verify if touch device to disable tooltips
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const activityData = useMemo(() => {
    const now = new Date();

    // Rolling 12-month view: start from Feb of previous year, end at current date
    const end = now;
    const start = new Date(previousYear, 1, 1); // February 1st of previous year

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


    if (detailedEvents) {
      detailedEvents.forEach((day: { date: string, events: GitHubEventDetail[] }) => {
        const mapDay = activityMap.get(day.date);
        if (mapDay) {
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
  }, [githubContributions, tracks, year, loading, detailedEvents]);

  const getColorForLevel = (level: number) => {
    const darkColors = [
      'bg-[#0d1117]',
      'bg-brand-500/30',
      'bg-brand-500/50',
      'bg-brand-500/75',
      'bg-brand-500'
    ];

    const lightColors = [
      'bg-neutral-800/60',
      'bg-brand-500/30',
      'bg-brand-500/50',
      'bg-brand-500/75',
      'bg-brand-500'
    ];

    const isDarkTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return isDarkTheme ? darkColors[level] : lightColors[level];
  };

  const handleMouseEnter = (e: React.MouseEvent, day: ActivityDay) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };


  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Rolling 12-month view - ~48 weeks from Feb previous year to end of Jan current year
  const totalWeeks = 48;
  const gap = 3;

  // Data weeks - for rendering actual data, starting from Feb of previous year
  const weeks = useMemo(() => {
    const weeksArray: ActivityDay[][] = [];
    const start = new Date(previousYear, 1, 1); // February 1st of previous year

    let currentDate = new Date(start);
    const dayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - dayOfWeek);

    for (let i = 0; i < totalWeeks; i++) {
      const week: ActivityDay[] = [];
      for (let j = 0; j < 7; j++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const day = activityData.find(d => d.date === dateStr);
        week.push(day || { date: dateStr, githubCount: 0, spotifyCount: 0, totalActivity: 0, level: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeksArray.push(week);
    }

    return weeksArray;
  }, [activityData, previousYear, totalWeeks]);

  // STATIC month labels - calculate for rolling 12-month view
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonthKey = '';
    const start = new Date(previousYear, 1, 1); // February 1st of previous year
    let currentDate = new Date(start);
    const dayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - dayOfWeek);

    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const monthKey = `${year}-${month}`;

      // Show month label at first week of each month
      if (monthKey !== lastMonthKey && currentDate >= new Date(previousYear, 1, 1)) {
        labels.push({ month: months[month], weekIndex });
        lastMonthKey = monthKey;
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return labels;
  }, [previousYear, totalWeeks]);

  const totalContributions = useMemo(() => {
    return activityData.reduce((sum, day) => sum + day.githubCount, 0);
  }, [activityData]);

  const handleDayClick = (day: ActivityDay) => {
    setSelectedDay(day);
    // Auto-scroll removed as we are now edge-to-edge
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Container for the graph - No scroll, just fit */}
      <div
        ref={graphRef}
        className="w-full overflow-hidden"
        role="img"
        aria-label={`GitHub contribution graph from Feb ${previousYear} to Jan ${currentYear}, showing ${totalContributions} total contributions`}
      >
        <div className="flex flex-col w-full relative">
          {/* Month labels row - Using Grid to match columns exactly */}
          <div className="grid w-full mb-1 relative h-[15px] gap-[3px]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}>
            {weeks.map((_, weekIndex) => {
              const label = monthLabels.find(l => l.weekIndex === weekIndex);
              return (
                <div key={weekIndex} className="relative overflow-visible z-20">
                  {label && (
                    <span className="whitespace-nowrap absolute text-[10px] text-muted-foreground">
                      {label.month}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Data Grid - column-based grid for rolling 12-month view */}
          <div className="grid w-full gap-[3px]" style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col gap-[3px]"
              >
                {week.map((day, dayIndex) => {
                  const hasData = !!day.date;
                  const showData = !loading;
                  const delayMs = (weekIndex * 7 + dayIndex) * 2;

                  return (
                    <div
                      key={dayIndex}
                      className={`w-full aspect-square rounded-[2px] transition-all duration-300 ease-out ${hasData ? 'cursor-pointer' : ''
                        } ${hasData ? getColorForLevel(day.level) : 'bg-secondary/40 border border-border/20'
                        } ${!hasData ? 'opacity-0' : ''
                        }`}
                      style={{ transitionDelay: `${delayMs}ms` }}
                      onMouseEnter={(e) => hasData && handleMouseEnter(e, day)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleDayClick(day)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLegend && (
        <motion.div
          className="flex items-center justify-between text-[10px] text-muted-foreground px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0 }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-[2px]">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`w-[10px] h-[10px] rounded-sm ${getColorForLevel(level)}`} />
              ))}
            </div>
          </div>
          <span className="text-muted-foreground/80 pr-1">
            {totalContributions.toLocaleString()} contributions (Feb {previousYear} - Jan {currentYear})
          </span>

        </motion.div>
      )}

      {selectedDay && selectedDay.githubCount > 0 && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedDay(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-dialog-title"
        >
          <motion.div
            className="bg-card border border-border rounded-none AAAA w-full max-w-md sm:max-w-lg max-h-[85vh] flex flex-col"
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
                  <h3 id="activity-dialog-title" className="text-sm font-medium text-foreground">
                    <time dateTime={selectedDay.date}>
                      {new Date(selectedDay.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
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
                              +{projectCommits.length - 10} more tracks...
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
                        className="flex items-center gap-2 text-xs text-foreground/70 hover:text-brand-500 transition-colors"
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
      {hoveredDay && hoveredDay.date && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 12,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative bg-[#1e1e1e]/90 text-white text-xs py-1.5 px-3 rounded shadow-lg backdrop-blur-sm border border-white/10 flex flex-col items-center gap-0.5 whitespace-nowrap">
            <span className="font-medium text-white/90">
              {hoveredDay.githubCount > 0 ? `${hoveredDay.githubCount} contributions` : 'No contributions'} on {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e]/90 rotate-45 border-r border-b border-white/10"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}