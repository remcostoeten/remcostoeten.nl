'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { SOCIAL_LINKS } from "@/modules/contact";
import { SimpleProjectCard } from "@/modules/projects/components/SimpleProjectCard";
import { fetchFeaturedProjects } from "@/services/github-service";
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

function createProjectFromData(name: string, data: any, fallbackUrl: string): TSimpleProject {
  return {
    name,
    url: data?.deploymentUrl || data?.url || fallbackUrl,
    gitInfo: {
      stars: data?.stars || 0,
      forks: data?.forks || 0,
      lastCommit: data?.latestCommit
        ? `${data.latestCommit.message} (${data.latestCommit.age})`
        : data?.lastUpdated || 'Unknown',
      language: data?.language || 'TypeScript',
      contributors: data?.contributors || 1,
      description: data?.description || `${name} - Portfolio project`,
      totalCommits: data?.totalCommits || 0,
      startDate: data?.startDate,
      lastCommitDate: data?.latestCommit?.date
    }
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function ProjectsSection() {
  const [state, setState] = useState<TProjectsState>(INITIAL_STATE);

  const loadFeaturedProjects = useCallback(async (isRetry = false): Promise<void> => {
    if (!isRetry) {
      setState(prev => ({
        ...prev,
        loadingState: 'loading',
        error: null
      }));
    }

    try {
      console.log('🔄 Loading featured projects...');
      const { remcostoetenNl, ryoa } = await fetchFeaturedProjects();
      console.log('📊 Featured projects response:', { remcostoetenNl: !!remcostoetenNl, ryoa: !!ryoa });

      const featuredProjects: TSimpleProject[] = [];

      if (remcostoetenNl) {
        console.log('✅ Adding remcostoeten.nl project');
        featuredProjects.push(
          createProjectFromData("Remcostoeten.nl", remcostoetenNl, "https://remcostoeten.nl")
        );
      }

      if (ryoa) {
        console.log('✅ Adding RYOA project');
        featuredProjects.push(
          createProjectFromData("RYOA", ryoa, "#")
        );
      }

      console.log('📋 Total featured projects:', featuredProjects.length);

      if (featuredProjects.length === 0) {
        throw new Error('No project data received from GitHub API');
      }

      setState({
        projects: featuredProjects,
        loadingState: 'success',
        error: null,
        retryCount: 0
      });

    } catch (error) {
      console.error('❌ Error loading featured projects:', error);
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
      await loadFeaturedProjects(true);
    } else {
      window.location.reload();
    }
  }, [loadFeaturedProjects, state.retryCount]);

  useEffect(() => {
    loadFeaturedProjects();
  }, [loadFeaturedProjects]);


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

        <div className="mt-2">
          <LatestActivity />
        </div>
      </div>
    </section>
  );
}