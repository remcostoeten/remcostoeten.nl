'use client';

import { useEffect, useState, useCallback } from "react";
import { SOCIAL_LINKS } from "@/modules/contact";
import { CategorizedProjects } from "@/modules/projects/components/CategorizedProjects";
import { getRealProjectData } from "@/modules/projects/data/projects";
import { TSimpleProject } from "@/modules/projects/types";
import { LatestActivity } from '@/components/latest-activity';
import { LatestActivitySkeleton } from '@/components/latest-activity-skeleton';

type TLoadingState = 'idle' | 'loading' | 'success' | 'error';

type TProjectsState = {
  projects: TSimpleProject[];
  loadingState: TLoadingState;
  error: string | null;
  retryCount: number;
};

const INITIAL_STATE: TProjectsState = {
  projects: [],
  loadingState: 'idle',
  error: null,
  retryCount: 0
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;


function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function ProjectsSection() {
  const [state, setState] = useState<TProjectsState>(INITIAL_STATE);

  const loadProjects = useCallback(async (isRetry = false): Promise<void> => {
    if (!isRetry) {
      setState(prev => ({
        ...prev,
        loadingState: 'loading',
        error: null
      }));
    }

    try {
      console.log('🔄 Loading projects with categories...');
      const { featuredProjects, simpleProjects } = await getRealProjectData();
      console.log('📊 Projects response:', { featuredCount: featuredProjects.length, simpleCount: simpleProjects.length });

      // Convert featured projects to simple format if no simple projects exist
      // or combine both if they exist
      const allProjects: TSimpleProject[] = [
        ...simpleProjects,
        ...featuredProjects.map(fp => ({
          name: fp.title,
          url: fp.url,
          category: fp.category,
          gitInfo: {
            stars: fp.stars,
            forks: fp.forks,
            lastCommit: fp.lastUpdated,
            language: fp.language,
            contributors: fp.contributors,
            description: fp.description
          },
          packageInfo: fp.packageInfo,
          originLabel: fp.originLabel
        }))
      ];

      if (allProjects.length === 0) {
        throw new Error('No project data received');
      }

      setState({
        projects: allProjects,
        loadingState: 'success',
        error: null,
        retryCount: 0
      });

    } catch (error) {
      console.error('❌ Error loading projects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load project data';

      setState(prev => ({
        ...prev,
        loadingState: 'error',
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));
    }
  }, []);

  const handleRetry = useCallback(async (): Promise<void> => {
    if (state.retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * state.retryCount);
      await loadProjects(true);
    } else {
      window.location.reload();
    }
  }, [loadProjects, state.retryCount]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);


  const retryButtonText = state.retryCount >= MAX_RETRIES ? 'Refresh Page' : 'Retry';

  return (
    <section
      aria-label="Featured Projects"
      itemScope
      itemType="https://schema.org/CollectionPage"
    >
      <div>
        <p
          className="text-body text-foreground mb-1 min-h-[1.5em]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {state.loadingState === 'error' && (
            <span className="text-muted-foreground">
              Failed to load project data from GitHub API.{" "}
              <button
                onClick={handleRetry}
                className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-sm"
                aria-label={`${retryButtonText} loading projects`}
              >
                {retryButtonText}
              </button>
            </span>
          )}


          {state.loadingState === 'success' && state.projects.length === 0 && (
            <span className="text-muted-foreground">
              No project data available from GitHub API.
            </span>
          )}
        </p>

        <div className="mt-6">
          <CategorizedProjects 
            projects={state.projects}
          />
        </div>
        
        <div className="mt-8">
          <LatestActivity />
        </div>
      </div>
    </section>
  );
}