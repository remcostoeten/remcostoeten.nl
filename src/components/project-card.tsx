'use client';

import { useState, useEffect } from 'react';
import { GitHub } from '@remcostoeten/fync/github';
import { Star, GitBranch } from 'lucide-react';

type ProjectCardProps = {
  title: string;
  description: string;
  url: string;
  stars: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
};

export function ProjectCard({
  title,
  description,
  url,
  stars,
  branches,
  technologies,
  lastUpdated,
  highlights,
}: ProjectCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-none-lg shadow-lg p-6 min-w-80 max-w-md">
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {title}
        </a>
      </h3>
      <p className="text-[hsl(var(--muted-foreground))] mb-4">{description}</p>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          <span className="text-[hsl(var(--foreground))]">{stars}</span>
        </div>
        <div className="flex items-center">
          <GitBranch className="w-4 h-4 mr-1 text-[hsl(var(--muted-foreground))]" />
          <span className="text-[hsl(var(--foreground))]">{branches}</span>
        </div>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">Last updated: {lastUpdated}</span>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-[hsl(var(--foreground))]">Technologies:</h4>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={tech} className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] text-xs font-medium px-2 py-1 rounded-none-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
      {highlights.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 text-[hsl(var(--foreground))]">Highlights:</h4>
          <ul className="list-disc list-inside space-y-1">
            {highlights.map((highlight) => (
              <li key={highlight} className="text-[hsl(var(--muted-foreground))]">{highlight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function GitHubProjectCard({ owner, repo }: { owner: string; repo: string }) {
  const [projectData, setProjectData] = useState<ProjectCardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = process.env.VITE_GITHUB_TOKEN;
        if (!token) {
          throw new Error('GitHub token not found. Please set VITE_GITHUB_TOKEN in your .env.local file.');
        }
        const github = GitHub({ token });

        const [repoData, branchesData] = await Promise.all([
          github.repo(owner, repo).get(),
          github.repo(owner, repo).branches.get(),
        ]);

        setProjectData({
          title: repoData.name,
          description: repoData.description || 'No description available.',
          url: repoData.html_url,
          stars: repoData.stargazers_count,
          branches: Array.isArray(branchesData) ? branchesData.length : 0,
          technologies: repoData.topics || [repoData.language].filter(Boolean) as string[],
          lastUpdated: new Date(repoData.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          highlights: repoData.topics?.slice(0, 5) || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="text-center p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-none-lg">
        <div className="animate-spin rounded-none-full h-6 w-6 border-b-2 border-[hsl(var(--accent))] mx-auto"></div>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">Loading project data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-[hsl(var(--card))] border border-red-500 rounded-none-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!projectData) {
    return null;
  }

  return <ProjectCard {...projectData} />;
}