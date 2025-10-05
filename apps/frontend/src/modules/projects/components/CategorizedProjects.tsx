
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TSimpleProject } from '../types';
import { SimpleProjectCard } from './SimpleProjectCard';
import { PackagePopover } from './PackagePopover';
import { groupProjectsByCategory, getCategoryOrder } from '../utils/categorize-project';

type TProps = {
  projects: TSimpleProject[];
};

type ProjectCategory = 'APIs' | 'DX tooling' | 'projects';
type CategoryFilter = ProjectCategory;

function getCategoryDisplayName(category: string): string {
  switch (category) {
    case 'APIs':
      return 'APIs';
    case 'DX tooling':
      return 'DX tooling';
    case 'projects':
      return 'Projects';
    default:
      return category;
  }
}

function getCategoryDescription(category: string): string {
  switch (category) {
    case 'APIs':
      return 'Backend services, REST APIs, and server-side applications';
    case 'DX tooling':
      return 'Developer tools, utilities, and workflow improvements';
    case 'projects':
      return 'Frontend applications, websites, and complete solutions';
    default:
      return '';
  }
}

export function CategorizedProjects({ projects }: TProps) {
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('projects');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const previousCategoryRef = useRef<CategoryFilter>('projects');
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedProjects = groupProjectsByCategory(projects);
  const categories = getCategoryOrder();
  const availableCategories: CategoryFilter[] = [...categories];
  const currentCategoryIndex = categories.indexOf(currentCategory);

  const filteredProjects = groupedProjects[currentCategory] || [];

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 50; // Minimum swipe distance
    const velocity = info.velocity.x;

    if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
      if (info.offset.x > 0 && currentCategoryIndex > 0) {
        handleCategoryChange(categories[currentCategoryIndex - 1]);
      } else if (info.offset.x < 0 && currentCategoryIndex < categories.length - 1) {
        handleCategoryChange(categories[currentCategoryIndex + 1]);
      }
    }
    setDragOffset(0);
  }, [currentCategoryIndex, categories]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    setDragOffset(info.offset.x);
  }, []);

  const handleCategoryChange = (category: CategoryFilter) => {
    if (category === currentCategory || isTransitioning) return;

    setIsTransitioning(true);
    previousCategoryRef.current = currentCategory;
    setExpanded(false);

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentCategory(category);
      }).finished.then(() => {
        setIsTransitioning(false);
      });
    } else {
      setCurrentCategory(category);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const getCategoryProjectCount = (category: CategoryFilter): number => {
    return groupedProjects[category]?.length || 0;
  };

  const projectsToShow = expanded ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="md:hidden text-center text-xs text-muted-foreground/60 mb-2">
        ← Swipe to navigate categories →
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="sr-only">Filter by category</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableCategories.map((category) => {
            const isActive = currentCategory === category;
            const projectCount = getCategoryProjectCount(category);

            if (projectCount === 0) return null;

            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                disabled={isTransitioning}
                className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 min-h-[36px] ${isActive
                  ? 'bg-accent text-accent-foreground shadow-sm border border-accent/20 ring-1 ring-accent/30'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  } ${isTransitioning ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="hidden sm:inline">{getCategoryDisplayName(category)}</span>
                <span className="sm:hidden">{category === 'APIs' ? 'APIs' : category === 'DX tooling' ? 'Tools' : 'Projects'}</span>
                <span className="text-xs opacity-75">({projectCount})</span>
              </button>



            );
          })}

        </div>
      </div>


      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: dragOffset }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.8
        }}
        className="relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`projects-${currentCategory}`}
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.98 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
            }}
            className="space-y-4"
          >
            {/* First project - full width */}
            {projectsToShow.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0,
                  ease: [0.16, 1, 0.3, 1],
                  scale: {
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                className="w-full"
              >
                {(() => {
                  const firstProject = projectsToShow[0];
                  return (
                    <div className="relative p-4 bg-card border border-border rounded-lg hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 hover:bg-gradient-to-br hover:from-card hover:via-card/95 hover:to-accent/5 transition-all duration-300 touch-manipulation group overflow-hidden">
                      {firstProject.packageInfo?.isPackage && (
                        <div className="absolute top-3 right-3">
                          <PackagePopover
                            packageInfo={firstProject.packageInfo}
                            projectName={firstProject.name}
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <SimpleProjectCard {...firstProject} />
                          </div>
                          {firstProject.gitInfo?.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {firstProject.gitInfo.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                            {firstProject.gitInfo?.language && (
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-accent rounded-full" />
                                <span className="hidden sm:inline">{firstProject.gitInfo.language}</span>
                              </span>
                            )}
                            {typeof firstProject.gitInfo?.stars === 'number' && firstProject.gitInfo.stars > 0 && (
                              <span className="flex items-center gap-1">
                                <span>★</span>
                                <span className="font-medium">{firstProject.gitInfo.stars}</span>
                              </span>
                            )}
                            {typeof firstProject.gitInfo?.forks === 'number' && firstProject.gitInfo.forks > 0 && (
                              <span className="flex items-center gap-1">
                                <span>⑂</span>
                                <span className="font-medium">{firstProject.gitInfo.forks}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Remaining projects - 2 columns */}
            {projectsToShow.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1],
                  scale: {
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {projectsToShow.slice(1).map((project, index) => (
                  <motion.div
                    key={`${project.name}-${currentCategory}`}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: (index + 1) * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                      scale: {
                        duration: 0.4,
                        delay: (index + 1) * 0.06,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                    className="relative p-4 bg-card border border-border rounded-lg hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10 hover:bg-gradient-to-br hover:from-card hover:via-card/95 hover:to-accent/5 transition-all duration-300 touch-manipulation group overflow-hidden"
                  >
                    {project.packageInfo?.isPackage && (
                      <div className="absolute top-3 right-3">
                        <PackagePopover
                          packageInfo={project.packageInfo}
                          projectName={project.name}
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <SimpleProjectCard {...project} />
                        </div>
                        {project.gitInfo?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {project.gitInfo.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                          {project.gitInfo?.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              <span className="hidden sm:inline">{project.gitInfo.language}</span>
                            </span>
                          )}
                          {typeof project.gitInfo?.stars === 'number' && project.gitInfo.stars > 0 && (
                            <span className="flex items-center gap-1">
                              <span>★</span>
                              <span className="font-medium">{project.gitInfo.stars}</span>
                            </span>
                          )}
                          {typeof project.gitInfo?.forks === 'number' && project.gitInfo.forks > 0 && (
                            <span className="flex items-center gap-1">
                              <span>⑂</span>
                              <span className="font-medium">{project.gitInfo.forks}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Show more/less button */}
            {filteredProjects.length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  scale: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }
                }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? (
                    <>
                      Show less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show {filteredProjects.length - 3} more <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
