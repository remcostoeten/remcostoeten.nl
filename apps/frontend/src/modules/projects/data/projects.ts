import { TProjectData, TSimpleProject } from "../types";
import { fetchTargetRepositories } from "@/services/github-service";


function getTechnologies(language: string, topics: string[]): string[] {
  const technologies: string[] = [];

  if (language) {
    technologies.push(language);
  }

  topics.forEach(topic => {
    const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    if (!technologies.includes(formattedTopic)) {
      technologies.push(formattedTopic);
    }
  });

  return technologies;
}

// Helper function to generate highlights based on repo data (dynamic)
function getHighlights(description: string, topics: string[], stars: number, language: string): string[] {
  const highlights: string[] = [];

  // Add description as first highlight if available
  if (description) {
    highlights.push(description);
  }

  // Add dynamic highlights based on actual repo data
  if (stars > 0) {
    highlights.push(`${stars} GitHub stars`);
  }

  if (language) {
    highlights.push(`Built with ${language}`);
  }

  // Add topic-based highlights (dynamic)
  if (topics.length > 0) {
    highlights.push(`Topics: ${topics.slice(0, 3).join(', ')}`);
  }

  return highlights.length > 0 ? highlights : ["Active development project"];
}

// Create a function to get real project data from GitHub
export async function getRealProjectData(): Promise<{ featuredProjects: TProjectData[], simpleProjects: TSimpleProject[] }> {
  try {
    const repoData = await fetchTargetRepositories();

    const featuredProjects: TProjectData[] = [];
    const simpleProjects: TSimpleProject[] = [];

    // Process each repository
    for (const repoResult of repoData) {
      if (!repoResult.data) continue;

      const repo = repoResult.data;
      const technologies = getTechnologies(repo.language, repo.topics);
      const highlights = getHighlights(repo.description, repo.topics, repo.stars, repo.language);

      // Determine if this should be a featured project or simple project (dynamic criteria)
      const isFeatured = repo.stars > 3 || // Projects with more stars are featured
        repo.forks > 1 || // Projects with forks are featured
        (repo.totalCommits && repo.totalCommits > 10) || // Active projects are featured
        repo.topics.length > 2; // Well-tagged projects are featured

      if (isFeatured) {
        // Add to featured projects with dynamic title
        const title = repo.title;

        featuredProjects.push({
          title,
          description: repo.description || `A ${repo.language} project with ${repo.stars} stars`,
          url: repo.url,
          demoUrl: repo.topics.includes('demo') ? `${repo.url}#demo` : repo.url,
          stars: repo.stars,
          forks: repo.forks,
          branches: repo.branches || 1,
          technologies,
          lastUpdated: repo.lastUpdated,
          highlights,
          language: repo.language,
          contributors: repo.contributors || 1,
          totalCommits: repo.totalCommits || 0,
          startDate: repo.startDate
        });
      } else {
        simpleProjects.push({
          name: repo.title,
          url: repo.url,
          gitInfo: {
            stars: repo.stars,
            forks: repo.forks,
            lastCommit: repo.lastUpdated,
            language: repo.language,
            contributors: repo.contributors || 1,
            description: repo.description || `A ${repo.language} project`
          }
        });
      }
    }

    featuredProjects.sort((a, b) => b.stars - a.stars);

    simpleProjects.sort((a, b) => (b.gitInfo?.stars || 0) - (a.gitInfo?.stars || 0));

    return { featuredProjects, simpleProjects };
  } catch (error) {
    console.error('Error fetching real project data:', error);

    return {
      featuredProjects: [{
        title: "Loading Projects...",
        description: "Fetching real project data from GitHub...",
        url: "https://github.com/remcostoeten",
        stars: 0,
        forks: 0,
        branches: 0,
        technologies: ["GitHub API"],
        lastUpdated: "recently",
        highlights: ["Real-time data from GitHub"],
        language: "Various",
        contributors: 1,
        totalCommits: 0
      }],
      simpleProjects: [{
        name: "GitHub Profile",
        url: "https://github.com/remcostoeten",
        gitInfo: {
          stars: 0,
          forks: 0,
          lastCommit: "recently",
          language: "Various",
          contributors: 1,
          description: "Visit GitHub profile for all projects"
        }
      }]
    };
  }
}

export const FEATURED_PROJECTS: TProjectData[] = [];
export const SIMPLE_PROJECTS: TSimpleProject[] = [];
