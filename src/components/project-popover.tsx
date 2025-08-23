import { useState, useReducer, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Star, GitBranch, Eye, Calendar, Code2 } from "lucide-react";

type TProps = {
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

type TState = {
  hoverRoot: boolean;
  hoverPanel: boolean;
  manualOpen: boolean;
}

type TAction = 
  | { type: 'rootEnter' }
  | { type: 'rootLeave' }
  | { type: 'panelEnter' }
  | { type: 'panelLeave' }
  | { type: 'close' }

function projectPopoverReducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case 'rootEnter':
      return { ...state, hoverRoot: true, manualOpen: true };
    case 'rootLeave':
      return { ...state, hoverRoot: false };
    case 'panelEnter':
      return { ...state, hoverPanel: true, manualOpen: true };
    case 'panelLeave':
      return { ...state, hoverPanel: false };
    case 'close':
      return { ...state, manualOpen: false, hoverRoot: false, hoverPanel: false };
    default:
      return state;
  }
}

export function ProjectPopover({
  title,
  description,
  url,
  demoUrl,
  stars,
  branches,
  technologies,
  lastUpdated,
  highlights
}: TProps) {
  const [state, dispatch] = useReducer(projectPopoverReducer, {
    hoverRoot: false,
    hoverPanel: false,
    manualOpen: false
  });
  
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVisible = state.hoverRoot || state.hoverPanel || state.manualOpen;

  const handleRootEnter = useCallback(() => {
    dispatch({ type: 'rootEnter' });
  }, []);

  const handleRootLeave = useCallback(() => {
    dispatch({ type: 'rootLeave' });
  }, []);

  const handlePanelEnter = useCallback(() => {
    dispatch({ type: 'panelEnter' });
  }, []);

  const handlePanelLeave = useCallback(() => {
    dispatch({ type: 'panelLeave' });
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      dispatch({ type: 'close' });
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, handleClickOutside]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
    >
      <motion.a
        ref={triggerRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline font-medium cursor-pointer border-2 border-dotted border-accent/30 hover:border-accent/60 px-1 rounded transition-colors duration-200"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={handleRootEnter}
        onMouseLeave={handleRootLeave}
      >
        {title} ↗
      </motion.a>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-80 p-4 bg-card/98 backdrop-blur-md border border-border rounded-lg shadow-2xl left-0 top-full mt-2"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              background: "hsl(var(--card) / 0.98)",
            }}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
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
                <motion.a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-muted rounded"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Code2 className="w-3 h-3 text-muted-foreground" />
                </motion.a>
                {demoUrl && (
                  <motion.a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-muted rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-3 h-3 text-muted-foreground" />
                  </motion.a>
                )}
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed mb-3">
              {description}
            </p>

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

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Updated {lastUpdated}</span>
              </div>
              <ExternalLink className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
