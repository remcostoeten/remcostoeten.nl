'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { SOCIAL_LINKS } from "@/modules/contact";
import { SimpleProjectCard } from "@/modules/projects/components/SimpleProjectCard";
import { fetchFeaturedProjects } from "@/services/githubService";
import { SimpleProject } from "@/modules/projects/types";
import { LatestActivity } from "./components/LatestActivity";

export const ProjectsSection = () => {
  const [projects, setProjects] = useState<SimpleProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        console.log('🔄 Loading featured projects from GitHub API: remcostoeten.nl and RYOA...');
        const { remcostoetenNl, ryoa } = await fetchFeaturedProjects();

        const featuredProjects: SimpleProject[] = [];

        // Add remcostoeten.nl project
        if (remcostoetenNl) {
          featuredProjects.push({
            name: "Remcostoeten.nl",
            url: remcostoetenNl.deploymentUrl || "https://remcostoeten.nl",
            gitInfo: {
              stars: remcostoetenNl.stars,
              forks: remcostoetenNl.forks,
              lastCommit: remcostoetenNl.latestCommit ? `${remcostoetenNl.latestCommit.message} (${remcostoetenNl.latestCommit.age})` : remcostoetenNl.lastUpdated,
              language: remcostoetenNl.language,
              contributors: remcostoetenNl.contributors || 1,
              description: remcostoetenNl.description || "Personal portfolio and blog with real-time analytics",
              totalCommits: remcostoetenNl.totalCommits,
              startDate: remcostoetenNl.startDate,
              lastCommitDate: remcostoetenNl.latestCommit?.date
            }
          });
        }

        // Add RYOA project
        if (ryoa) {
          featuredProjects.push({
            name: "RYOA",
            url: ryoa.deploymentUrl || ryoa.url,
            gitInfo: {
              stars: ryoa.stars,
              forks: ryoa.forks,
              lastCommit: ryoa.latestCommit ? `${ryoa.latestCommit.message} (${ryoa.latestCommit.age})` : ryoa.lastUpdated,
              language: ryoa.language,
              contributors: ryoa.contributors || 1,
              description: ryoa.description || "Next.js 15 Roll Your Own Authentication system",
              totalCommits: ryoa.totalCommits,
              startDate: ryoa.startDate,
              lastCommitDate: ryoa.latestCommit?.date
            }
          });
        }

        if (featuredProjects.length > 0) {
          console.log(`✅ Loaded ${featuredProjects.length} featured projects from GitHub API:`, {
            remcostoetenNl: remcostoetenNl ? { stars: remcostoetenNl.stars, forks: remcostoetenNl.forks } : null,
            ryoa: ryoa ? { stars: ryoa.stars, forks: ryoa.forks } : null
          });
          setProjects(featuredProjects);
          setError(null);
        } else {
          throw new Error('No project data received from GitHub API');
        }
      } catch (error) {
        console.error('❌ Failed to load featured projects from GitHub API:', error);
        setError('Failed to load project data from GitHub API');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  return (
    <motion.div {...ANIMATION_CONFIGS.staggered(0.2)}>
      <motion.p
        className="text-body text-foreground"
        {...ANIMATION_CONFIGS.staggered(0.2)}
      >
        {isLoading ? (
          <span className="animate-pulse">Loading real project data from GitHub API...</span>
        ) : error ? (
          <span className="text-muted-foreground">
            Failed to load project data from GitHub API.{" "}
            <button 
              onClick={() => window.location.reload()} 
              className="text-accent hover:underline"
            >
              Retry
            </button>
          </span>
        ) : projects.length > 0 ? (
          <>
            Lately I have been building{" "}
            {projects.map((project, index) => (
              <span key={project.name}>
                <SimpleProjectCard {...project} />
                {index < projects.length - 1 && (
                  index === projects.length - 2 ? " and " : ", "
                )}
              </span>
            ))}
            . Additional projects are on{" "}
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-medium"
            >
              GitHub ↗
            </a>
            .
          </>
        ) : (
          <span className="text-muted-foreground">
            No project data available from GitHub API.
          </span>
        )}
      </motion.p>
      
      <LatestActivity />
    </motion.div>
  );
};