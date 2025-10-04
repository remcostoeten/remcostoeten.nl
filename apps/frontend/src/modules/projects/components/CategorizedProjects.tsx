'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TSimpleProject } from '../types';
import { SimpleProjectCard } from './SimpleProjectCard';
import { groupProjectsByCategory, getCategoryOrder } from '../utils/categorize-project';

type TProps = {
  projects: TSimpleProject[];
  isLoading?: boolean;
};

type TExpandedSections = Record<string, boolean>;

// Different initial display counts per category
function getInitialItemsToShow(category: string): number {
  switch (category) {
    case 'APIs':
      return 10; // Show all APIs (currently 3)
    case 'DX tooling': 
      return 4; // Show 4 out of 5 DX tools
    case 'projects':
      return 4; // Show 4 out of 6 projects
    default:
      return 4;
  }
}

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

export function CategorizedProjects({ projects, isLoading = false }: TProps) {
  const [expandedSections, setExpandedSections] = useState<TExpandedSections>({});

  if (isLoading) {
    return (
      <div className="space-y-8">
        {getCategoryOrder().map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: getInitialItemsToShow(category) }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groupedProjects = groupProjectsByCategory(projects);
  const categories = getCategoryOrder();

  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryProjects = groupedProjects[category];
        if (categoryProjects.length === 0) return null;

        const isExpanded = expandedSections[category];
        const itemsToShowInitially = getInitialItemsToShow(category);
        const hasMoreItems = categoryProjects.length > itemsToShowInitially;
        const visibleProjects = isExpanded
          ? categoryProjects
          : categoryProjects.slice(0, itemsToShowInitially);
        const hiddenCount = categoryProjects.length - itemsToShowInitially;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {getCategoryDisplayName(category)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({categoryProjects.length})
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getCategoryDescription(category)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleProjects.map((project, index) => (
                  <motion.div
                    key={`${project.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05
                    }}
                    className="p-4 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <SimpleProjectCard {...project} />
                        {project.gitInfo?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {project.gitInfo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {project.gitInfo?.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              {project.gitInfo.language}
                            </span>
                          )}
                          {typeof project.gitInfo?.stars === 'number' && project.gitInfo.stars > 0 && (
                            <span>★ {project.gitInfo.stars}</span>
                          )}
                          {typeof project.gitInfo?.forks === 'number' && project.gitInfo.forks > 0 && (
                            <span>⑂ {project.gitInfo.forks}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {!isExpanded && hasMoreItems && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => toggleSection(category)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
                    >
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      Show {hiddenCount} more {getCategoryDisplayName(category).toLowerCase()}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isExpanded && hasMoreItems && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {categoryProjects.slice(itemsToShowInitially).map((project, index) => (
                      <motion.div
                        key={`${project.name}-expanded-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.05
                        }}
                        className="p-4 bg-card border border-border rounded-lg hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <SimpleProjectCard {...project} />
                            {project.gitInfo?.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {project.gitInfo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {project.gitInfo?.language && (
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-accent rounded-full" />
                                  {project.gitInfo.language}
                                </span>
                              )}
                              {typeof project.gitInfo?.stars === 'number' && project.gitInfo.stars > 0 && (
                                <span>★ {project.gitInfo.stars}</span>
                              )}
                              {typeof project.gitInfo?.forks === 'number' && project.gitInfo.forks > 0 && (
                                <span>⑂ {project.gitInfo.forks}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isExpanded && hasMoreItems && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => toggleSection(category)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
                    >
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      Show less
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}