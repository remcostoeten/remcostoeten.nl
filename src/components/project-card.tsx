import { useState } from "react";
import { ExternalLink, Star, GitBranch, Eye, Calendar, Code2 } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  url: string;
  demoUrl?: string;
  stars: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
}

export function ProjectCard({
  title,
  description,
  url,
  demoUrl,
  stars,
  branches,
  technologies,
  lastUpdated,
  highlights
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded"
      >
        {title} ↗
      </a>

      {isHovered && (
        <div
          className="absolute z-50 w-80 p-4 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl left-0 top-full"
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{branches}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-muted rounded"
                >
                  <Code2 className="w-3 h-3 text-muted-foreground" />
                </a>
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Eye className="w-3 h-3 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-foreground/80 leading-relaxed mb-3">
              {description}
            </p>

            {/* Technologies */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs rounded-md bg-muted/50 text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-foreground mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="text-xs text-foreground/70 flex items-start">
                      <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0 mt-1.5 mr-2" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Updated {lastUpdated}</span>
              </div>
              <ExternalLink className="w-3 h-3" />
            </div>
        </div>
      )}
    </div>
  );
}
