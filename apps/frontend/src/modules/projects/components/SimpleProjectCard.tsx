'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, GitBranch, Calendar, Users, GitCommit, Clock } from "lucide-react";
import { TSimpleProject } from "../types";

interface SimpleProjectCardProps extends TSimpleProject {}

export const SimpleProjectCard = ({ name, url, gitInfo }: SimpleProjectCardProps) => {
  // Don't render hover card if no git info is available
  if (!gitInfo) {
    return (
      <a 
        href={url} 
        className="text-accent hover:underline font-medium cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded transition-colors duration-200"
      >
        {name} ↗
      </a>
    );
  }
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href={url} 
        className="text-accent hover:underline font-medium cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded transition-colors duration-200"
      >
        {name} ↗
      </a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 w-80 max-w-[90vw]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Invisible bridge to prevent hover loss */}
            <div className="h-4 w-full -mx-2" />
            
            {/* Actual card content */}
            <div className="bg-card border border-border rounded-lg shadow-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base text-foreground">{name}</h3>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {gitInfo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {gitInfo.forks}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {gitInfo.description}
              </p>

              <div className="space-y-3 text-xs text-muted-foreground">
                {/* First row: Last commit and contributors */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {gitInfo.lastCommit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {gitInfo.contributors}
                    </span>
                  </div>
                  
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    {gitInfo.language}
                  </span>
                </div>
                
                {/* Second row: Additional stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                  {gitInfo.totalCommits && (
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3" />
                      {gitInfo.totalCommits} commits
                    </span>
                  )}
                  {gitInfo.startDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started {gitInfo.startDate}
                    </span>
                  )}
                  {gitInfo.lastCommitDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last: {gitInfo.lastCommitDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};