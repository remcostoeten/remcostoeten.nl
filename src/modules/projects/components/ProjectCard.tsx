import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Code, Star, GitBranch, Eye, Calendar } from "lucide-react";
import { ProjectData } from "../types";

interface ProjectCardProps extends ProjectData {}

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
}: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium inline-flex items-center gap-1"
      >
        {title}
        <ExternalLink className="w-3 h-3" />
      </a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 z-50 w-96 max-w-[90vw]"
          >
            <div className="bg-card border border-border rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-foreground">{title}</h3>
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