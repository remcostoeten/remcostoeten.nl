'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Code, Star, GitBranch, Eye, Calendar } from "lucide-react";
import { TProjectData } from "../types";

interface ProjectCardProps extends TProjectData { }

export const ProjectCard = ({
  title,
  description,
  url,
  demoUrl,
  stars,
  branches,
  technologies,
  lastUpdated,
  highlights,
  originLabel,
}: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getOriginLabelStyles = (color?: string) => {
    switch (color) {
      case 'website':
        return 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border-accent/30 shadow-accent/20';
      case 'community':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30 shadow-blue-500/20';
      case 'personal':
        return 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 border-green-500/30 shadow-green-500/20';
      case 'client':
        return 'bg-gradient-to-r from-purple-500/20 to-purple-500/10 text-purple-600 border-purple-500/30 shadow-purple-500/20';
      default:
        return 'bg-gradient-to-r from-muted/20 to-muted/10 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 font-medium inline-flex items-center gap-1.5 transition-all duration-200"
        >
          {title}
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 z-50 w-96 max-w-[90vw]"
          >
            <div className="bg-gradient-to-br from-card via-card/98 to-card/95 border border-border/80 rounded-lg shadow-2xl shadow-accent/5 backdrop-blur-sm p-6 group-hover:shadow-accent/10 group-hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {branches}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Key Highlights:</h4>
                <ul className="space-y-1">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start">
                      <span className="w-1 h-1 bg-accent rounded-full mt-2 mr-2 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated {lastUpdated}
                  </span>
                </div>

                <div className="flex gap-2">
                  {demoUrl && (
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Demo
                    </a>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    <Code className="w-3 h-3" />
                    Code
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};