'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
import { Music, GitBranch } from 'lucide-react';
import { getLatestCommit, CommitData } from 'src/services/core/github-service';
import { getLatestTracks, SpotifyTrack } from 'src/services/core/spotify-service';
import { ActivityHoverCard } from './ActivityHoverCard';

// Workaround for framer-motion type mismatch
const motion = motionOriginal as any;

// Modern spring-like easing for smooth, natural motion
const SPRING_EASE = [0.32, 0.72, 0, 1];

// Staggered animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 }
  },
  exit: { 
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 }
  }
};

const itemVariants = {
  initial: { y: 12, opacity: 0, filter: 'blur(4px)' },
  animate: { 
    y: 0, 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: SPRING_EASE }
  },
  exit: { 
    y: -8, 
    opacity: 0, 
    filter: 'blur(2px)',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] }
  }
};

const Equalizer = () => (
  <div className="flex items-end gap-[1px] h-3 ml-2" aria-hidden="true">
    <div className="w-[2px] bg-green-500/70 group-hover:bg-green-500/90 transition-colors duration-300 animate-[music-bar_0.8s_ease-in-out_infinite] rounded-sm" />
    <div className="w-[2px] bg-green-500/70 group-hover:bg-green-500/90 transition-colors duration-300 animate-[music-bar_1.2s_ease-in-out_infinite_0.1s] rounded-sm" />
    <div className="w-[2px] bg-green-500/70 group-hover:bg-green-500/90 transition-colors duration-300 animate-[music-bar_0.5s_ease-in-out_infinite_0.2s] rounded-sm" />
  </div>
);

// Format relative timestamp
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // For older tracks, just show the date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Your 5 latest projects
const LATEST_PROJECTS = [
  { owner: 'remcostoeten', repo: 'remcostoeten.nl', name: 'remcostoeten.nl', color: 'text-blue-400' },
  { owner: 'remcostoeten', repo: 'drizzleasy', name: 'drizzleasy', color: 'text-yellow-400' },
  { owner: 'remcostoeten', repo: 'fync', name: 'fync', color: 'text-orange-400' },
  { owner: 'remcostoeten', repo: 'next-forge', name: 'next-forge', color: 'text-purple-400' },
  { owner: 'remcostoeten', repo: 'planorama', name: 'planorama', color: 'text-green-400' }
];

export const ActivitySection = () => {
  const [songIndex, setSongIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const [commits, setCommits] = useState<(CommitData & { color: string })[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hover state
  const [hoveredItem, setHoveredItem] = useState<{ type: 'github' | 'spotify'; data: any } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commitPromises = LATEST_PROJECTS.map(async (project) => {
          const commit = await getLatestCommit(project.owner, project.repo);
          return commit ? { ...commit, color: project.color, projectName: project.name } : null;
        });
        
        const commitResults = await Promise.all(commitPromises);
        const validCommits = commitResults.filter(Boolean) as (CommitData & { color: string; projectName: string })[];
        setCommits(validCommits);

        // Fetch Spotify tracks
        const spotifyTracks = await getLatestTracks();
        setTracks(spotifyTracks);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cycle Music every 5 seconds
  useEffect(() => {
    if (tracks.length === 0) return;
    const interval = setInterval(() => {
      setSongIndex((prev) => (prev + 1) % tracks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tracks.length]);

  // Cycle Activity every 4 seconds
  useEffect(() => {
    if (commits.length === 0) return;
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % commits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [commits.length]);

  // Mouse move handler for hover card positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Hover handlers
  const handleGitHubHover = () => {
    setHoveredItem({ type: 'github', data: currentCommit });
  };

  const handleSpotifyHover = () => {
    setHoveredItem({ type: 'spotify', data: currentTrack });
  };

  const handleHoverEnd = () => {
    setHoveredItem(null);
  };

  const currentTrack = tracks[songIndex] || { name: 'Loading...', artist: '...', url: '#' };
  const currentCommit = commits[activityIndex] || { 
    message: 'Loading recent commits...', 
    url: '#', 
    shortHash: '....',
    color: 'text-muted-foreground',
    projectName: 'Loading...',
    hash: '....',
    date: '',
    author: ''
  };

  if (loading) {
    return (
      <div className="w-full rounded-xl border border-border/40 bg-muted/10 p-1 md:p-1.5 mb-12 shadow-sm group">
        <div className="relative flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/40 bg-background/40 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="flex-1 flex items-center gap-4 p-4 min-h-[80px]">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/5 border border-accent/10 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded animate-pulse mb-2 min-h-[1rem]" />
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse min-h-[0.75rem]" />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 p-4 min-h-[80px]">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-green-500/5 border border-green-500/10 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-muted rounded animate-pulse mb-2 min-h-[1rem]" />
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse min-h-[0.75rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div 
        ref={activityRef}
        className="w-full rounded-xl border border-border/40 bg-muted/10  md:p-1.5 mb-12 animate-enter shadow-sm group transition-all duration-300 group-hover:border-border/60 group-hover:bg-muted/15"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleHoverEnd}
      >
        <div className="relative flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/40 bg-background/40 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 group-hover:bg-background/50">

        <div 
          className="flex-1 flex items-center gap-4 p-4 min-w-0 cursor-pointer"
          onMouseEnter={handleGitHubHover}
        >
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent/5 border border-accent/10 text-accent transition-all duration-300 group-hover:bg-accent/10 group-hover:border-accent/20 group-hover:scale-105">
            <GitBranch className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">Building</span>
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            </div>
            
            <AnimatePresence mode='wait'>
               <motion.div
                  key={activityIndex}
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col gap-1"
               >
                 <div className="flex items-center gap-2">
                   <motion.a 
                      href={currentCommit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium truncate shrink-0 ${currentCommit.color} hover:underline`}
                      variants={itemVariants}
                   >
                     {(currentCommit as any).projectName}
                   </motion.a>
                   
                   <motion.span 
                      className="text-muted-foreground/30 font-light hidden sm:inline-block"
                      variants={itemVariants}
                   >
                     /
                   </motion.span>
                   
                   <motion.span 
                      className="text-xs text-muted-foreground font-mono truncate"
                      variants={itemVariants}
                   >
                     {currentCommit.message.split('\n')[0]}
                   </motion.span>
                 </div>
                 
                 <motion.div 
                    className="flex items-center gap-2"
                    variants={itemVariants}
                 >
                   <motion.span 
                      className="text-xs text-muted-foreground/60 font-medium"
                      variants={itemVariants}
                   >
                     • {formatRelativeTime(currentCommit.date)}
                   </motion.span>
                 </motion.div>
               </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Section 2: Listening (Music) */}
        <div 
          className="flex-1 flex items-center gap-4 p-4 min-w-0 cursor-pointer"
          onMouseEnter={handleSpotifyHover}
        >
          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/5 border border-green-500/10 text-green-500 transition-all duration-300 group-hover:bg-green-500/10 group-hover:border-green-500/20 group-hover:scale-105">
            <Music className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">Whilst probably listening to</span>
              <Equalizer />
            </div>
            
            <AnimatePresence mode='wait'>
               <motion.div
                  key={songIndex}
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col gap-1"
               >
                 <div className="flex items-center gap-2">
                   <motion.a 
                      href={currentTrack.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground truncate block hover:underline"
                      variants={itemVariants}
                   >
                     {currentTrack.name}
                   </motion.a>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <motion.span 
                      className="text-xs text-muted-foreground truncate block"
                      variants={itemVariants}
                   >
                     {currentTrack.artist}
                   </motion.span>
                   
                   <motion.span 
                      className="text-xs text-muted-foreground/60 font-medium"
                      variants={itemVariants}
                   >
                     • {formatRelativeTime(currentTrack.played_at)}
                   </motion.span>
                 </div>
               </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
      </div>

      {/* Hover Card */}
      {hoveredItem && (
        <ActivityHoverCard
          type={hoveredItem.type}
          data={hoveredItem.data}
          isVisible={true}
          position={mousePosition}
        />
      )}
    </Fragment>
  );
};
