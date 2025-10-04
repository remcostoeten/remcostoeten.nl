import { TProjectData, TSimpleProject } from "../types";
import { fetchTargetRepositories } from "@/services/github-service";
import { categorizeProject } from "../utils/categorize-project";

// Project overrides - allows customizing project data while using GitHub as defaults
interface TProjectOverrides {
  [key: string]: {
    title?: string;
    description?: string;
    demoUrl?: string;
    technologies?: string[];
    highlights?: string[];
  };
}

const PROJECT_OVERRIDES: TProjectOverrides = {
  // Example overrides - customize as needed
  // "remcostoeten.nl": {
  //   title: "Personal Portfolio",
  //   description: "A modern portfolio showcasing my work and skills",
  //   technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
  //   highlights: ["Responsive design", "Modern animations", "SEO optimized"]
  // }
};


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
      const category = categorizeProject(repo.title, repo.description, technologies, repo.topics);

      // Determine if this should be a featured project or simple project (dynamic criteria)
      const isFeatured = repo.stars > 3 || // Projects with more stars are featured
        repo.forks > 1 || // Projects with forks are featured
        (repo.totalCommits && repo.totalCommits > 10) || // Active projects are featured
        repo.topics.length > 2; // Well-tagged projects are featured

      if (isFeatured) {
        // Use overrides if available, otherwise use GitHub data as defaults
        const override = PROJECT_OVERRIDES[repo.title];
        const title = override?.title || repo.title;
        const description = override?.description || repo.description || `A ${repo.language} project with ${repo.stars} stars`;
        const demoUrl = override?.demoUrl || (repo.topics.includes('demo') ? `${repo.url}#demo` : repo.url);

        featuredProjects.push({
          title,
          description,
          url: repo.url,
          demoUrl,
          stars: repo.stars,
          forks: repo.forks,
          branches: repo.branches || 1,
          technologies: override?.technologies || technologies,
          lastUpdated: repo.lastUpdated,
          highlights: override?.highlights || highlights,
          language: repo.language,
          contributors: repo.contributors || 1,
          totalCommits: repo.totalCommits || 0,
          startDate: repo.startDate,
          category
        });
      } else {
        // Use overrides if available, otherwise use GitHub data as defaults
        const override = PROJECT_OVERRIDES[repo.title];
        const name = override?.title || repo.title;
        const description = override?.description || repo.description || `A ${repo.language} project`;

        simpleProjects.push({
          name,
          url: repo.url,
          category,
          gitInfo: {
            stars: repo.stars,
            forks: repo.forks,
            lastCommit: repo.lastUpdated,
            language: repo.language,
            contributors: repo.contributors || 1,
            description
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
        totalCommits: 0,
        category: 'projects' as const
      }],
      simpleProjects: [{
        name: "GitHub Profile",
        url: "https://github.com/remcostoeten",
        category: 'projects' as const,
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
