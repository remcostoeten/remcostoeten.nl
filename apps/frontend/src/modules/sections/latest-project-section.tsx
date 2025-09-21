'use client';
 
import { motion } from "framer-motion";
import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { fetchSpecificFeaturedProjects } from "@/services/github-service";
import { SimpleProject } from "@/modules/projects/types";

export const LatestProjectSection = () => {
  const [featuredProjects, setFeaturedProjects] = useState<SimpleProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        console.log('🔄 Fetching featured projects from GitHub API...');
        const repoDataArray = await fetchSpecificFeaturedProjects();
        
        if (repoDataArray && repoDataArray.length > 0) {
          // Transform the repo data into SimpleProject format for hover functionality
          const projectsData: SimpleProject[] = repoDataArray.map(repoData => ({
            name: repoData.title,
            url: repoData.deploymentUrl || repoData.url,
            gitInfo: {
              stars: repoData.stars,
              forks: repoData.forks,
              lastCommit: repoData.latestCommit ? `${repoData.latestCommit.message} (${repoData.latestCommit.age})` : repoData.lastUpdated,
              language: repoData.language,
              contributors: repoData.contributors || 1,
              description: repoData.description || "No description available",
              totalCommits: repoData.totalCommits,
              startDate: repoData.startDate,
              lastCommitDate: repoData.latestCommit?.date
            }
          }));
          
          setFeaturedProjects(projectsData);
          setError(null);
          console.log(`✅ Successfully loaded ${projectsData.length} featured projects from API`);
        } else {
          throw new Error('No valid data received from GitHub API');
        }
      } catch (error) {
        console.error('❌ Failed to load featured projects from API:', error);
        setError('Failed to load project data from GitHub API');
        setFeaturedProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProjects();
  }, []);

  return (
    <motion.div 
      className="py-6 border-t border-border/50"
      {...ANIMATION_CONFIGS.staggered(0.3)}
    >
      <motion.div className="flex items-center gap-3 mb-3" {...ANIMATION_CONFIGS.fadeInUp}>
        <Folder className="w-4 h-4 text-accent" />
        <h2 className="text-heading font-medium text-foreground">Featured Projects</h2>
      </motion.div>
      
      {isLoading ? (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.staggered(0.1)}>
          {[...Array(3)].map((_, index) => (
            <div 
              key={index}
              className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-all duration-200"
            >
              <div className="animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </div>
              <div className="animate-pulse flex items-center gap-2">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="w-1 h-1 bg-muted rounded-full"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : error ? (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.staggered(0.1)}>
          <div className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-all duration-200">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="transition-transform">⚠</span>
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-accent hover:underline"
            >
              Retry
            </button>
          </div>
        </motion.div>
      ) : featuredProjects.length > 0 ? (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.staggered(0.1)}>
          {featuredProjects.map((project, index) => (
            <motion.div 
              key={project.name} 
              className="flex items-center justify-between group hover:bg-muted/30 -mx-2 px-2 py-1 rounded transition-all duration-200"
              {...ANIMATION_CONFIGS.staggered(0.05 * index)}
            >
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1 duration-200 inline-flex items-center gap-2"
              >
                <span className="transition-transform group-hover:translate-x-1">→</span>
                {project.name}
              </a>
              <div className="text-xs text-muted-foreground/70 flex items-center gap-2 group-hover:text-muted-foreground transition-colors">
                <span>{project.gitInfo?.stars || 0} stars</span>
                <span>•</span>
                <span>{project.gitInfo?.language || 'Unknown'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className="space-y-2 mb-4" {...ANIMATION_CONFIGS.staggered(0.1)}>
          <div className="flex items-center justify-center py-4">
            <div className="text-xs text-muted-foreground">
              No project data available
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div {...ANIMATION_CONFIGS.fadeInUp}>
        <a 
          href="https://github.com/remcostoeten"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium group"
        >
          <span>View all projects</span>
          <span className="transition-transform group-hover:translate-x-1">↗</span>
        </a>
      </motion.div>
    </motion.div>
  );
};