
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TSimpleProject } from '../types';
import { SimpleProjectCard } from './simple-project-card';
import { PackagePopover } from './package-popover';
import { groupProjectsByCategory, getCategoryOrder } from '../utils/categorize-project';
import { AnimatedNumberIntersection } from '@/components/ui/animated-number-intersection';

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
  const [expanded, setExpanded] = useState(false);
  const previousCategoryRef = useRef<CategoryFilter>('projects');
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedProjects = groupProjectsByCategory(projects);
  const categories = getCategoryOrder();
  const availableCategories: CategoryFilter[] = [...categories];
  const currentCategoryIndex = categories.indexOf(currentCategory);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = (url.searchParams.get('q') || url.searchParams.get('category') || '').toLowerCase();
    if (q) {
      const match = categories.find(c => c.toLowerCase().replace(/\s+/g, '-') === q || c.toLowerCase() === q);
      if (match) setCurrentCategory(match as CategoryFilter);
    } else {
      // Default to 'APIs' without modifying the URL for SEO
      setCurrentCategory('APIs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProjects = groupedProjects[currentCategory] || [];



  const handleCategoryChange = (category: CategoryFilter) => {
    if (category === currentCategory) return;

    previousCategoryRef.current = currentCategory;
    setExpanded(false);
    setCurrentCategory(category);
  };

  const getCategoryProjectCount = (category: CategoryFilter): number => {
    return groupedProjects[category]?.length || 0;
  };

  const projectsToShow = expanded ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <div className="space-y-6">

      <div className="mb-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="sr-only">Filter by category</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableCategories.map((category, index) => {
            const isActive = currentCategory === category;
            const projectCount = getCategoryProjectCount(category);

            if (projectCount === 0) return null;

            return (
              <button
                key={category}
                onClick={() => {
                  handleCategoryChange(category);
                  const next = new URL(window.location.href);
                  next.searchParams.set('category', category.toLowerCase().replace(/\s+/g, '-'));
                  window.history.pushState({}, '', next.toString());
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 min-h-[36px] ${isActive
                  ? 'bg-transparent text-foreground border border-border/60'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
              >
                <span className="hidden sm:inline">{getCategoryDisplayName(category)}</span>
                <span className="sm:hidden">{category === 'APIs' ? 'APIs' : category === 'DX tooling' ? 'Tools' : 'Projects'}</span>
                <span className="text-xs opacity-75">
                  (<AnimatedNumberIntersection
                    value={projectCount}
                    delay={index * 300 + 200}
                    threshold={0.8}
                    rootMargin="100px"
                  />)
                </span>
              </button>



            );
          })}

        </div>
      </div>


      <div
        ref={containerRef}
        className="relative"
      >
        <div
          key={`projects-${currentCategory}`}
          className="space-y-4"
        >
          {/* First project - full width */}
          {projectsToShow.length > 0 && (
            <div className="w-full">
              {(() => {
                const firstProject = projectsToShow[0];
                return (
                  <div className="relative p-4 bg-card border border-border rounded-lg hover:border-border/80 hover:bg-muted/5 transition-colors duration-200 touch-manipulation group overflow-hidden">
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
            </div>
          )}

          {/* Remaining projects - 2 columns */}
          {projectsToShow.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsToShow.slice(1).map((project, index) => (
                <div
                  key={`${project.name}-${currentCategory}`}
                  className="relative p-4 bg-card border border-border rounded-lg hover:border-border/80 hover:bg-muted/5 transition-colors duration-200 touch-manipulation group overflow-hidden"
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
                </div>
              ))}
            </div>
          )}

          {/* Show more/less button */}
          {filteredProjects.length > 3 && (
            <div className="flex justify-center pt-4">
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
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
