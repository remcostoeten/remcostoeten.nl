'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit } from "lucide-react";
import { fetchLatestActivities, LatestActivity as LatestActivityType } from "@/services/githubService";
import { SpotifyAnimation } from "./SpotifyAnimation";

export const LatestActivity = () => {
  const [activities, setActivities] = useState<LatestActivityType[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading latest 5 GitHub activities...');
      const result = await fetchLatestActivities();
      setActivities(result.activities);
      console.log('✅ Latest activities loaded:', result.activities.length, 'activities');
    } catch (err) {
      console.error('❌ Failed to load latest activities:', err);
      setError('Failed to load latest activities');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on first render
  useEffect(() => {
    loadActivities();
  }, []);

  // Cycle through activities every 4 seconds
  useEffect(() => {
    if (activities.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="text-body-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-start gap-2 mb-2">
        <GitCommit className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <span className="leading-relaxed">
          {loading ? (
            <span className="animate-pulse">Loading latest activities...</span>
          ) : error || activities.length === 0 ? (
            <span>
              Unable to load latest activities.{" "}
              <button
                onClick={loadActivities}
                className="text-accent hover:underline"
                disabled={loading}
              >
                Retry
              </button>
            </span>
          ) : (
            <div className="relative">
              {activities.length > 1 && (
                <motion.span 
                  className="text-xs text-muted-foreground mr-2 inline-block"
                  key={`counter-${currentActivityIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  ({currentActivityIndex + 1}/{activities.length})
                </motion.span>
              )}
              
              <span className="inline-block">
                The latest thing I've done is{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`commit-${currentActivityIndex}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{ 
                      duration: 0.7, 
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                  >
                    <a
                      href={activities[currentActivityIndex].commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:text-accent transition-colors"
                      title="View commit on GitHub"
                    >
                      {activities[currentActivityIndex].latestCommit}
                    </a>
                  </motion.span>
                </AnimatePresence>
                {" "}on{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`project-${currentActivityIndex}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.05,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                  >
                    <a
                      href={activities[currentActivityIndex].repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline font-medium"
                    >
                      {activities[currentActivityIndex].project}
                    </a>
                  </motion.span>
                </AnimatePresence>
                {" "}
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={`timestamp-${currentActivityIndex}`}
                    className="text-xs inline-block"
                    initial={{ opacity: 0, y: 8, filter: "blur(1px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(1px)" }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.1,
                      ease: [0.16, 1, 0.3, 1],
                      filter: { duration: 0.4 }
                    }}
                  >
                    ({activities[currentActivityIndex].timestamp})
                  </motion.span>
                </AnimatePresence>
              </span>
            </div>
          )}
        </span>
      </div>

      <SpotifyAnimation />
    </div>
  );
};