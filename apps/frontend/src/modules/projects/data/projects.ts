import { TProjectData, TSimpleProject } from "../types";
import { fetchTargetRepositories } from "@/services/github-service";

// Helper function to determine project technologies based on repo data
const getTechnologies = (repoName: string, language: string, topics: string[]): string[] => {
  const baseTech = language ? [language] : [];

  // Add specific technologies based on repo name and topics
  if (repoName.includes('nextjs') || topics.includes('nextjs')) {
    baseTech.push('Next.js', 'React');
  }
  if (repoName.includes('auth') || topics.includes('authentication')) {
    baseTech.push('Authentication');
  }
  if (topics.includes('typescript') || language === 'TypeScript') {
    baseTech.push('TypeScript');
  }
  if (topics.includes('tailwindcss') || topics.includes('tailwind')) {
    baseTech.push('Tailwind CSS');
  }
  if (topics.includes('api') || repoName.includes('api')) {
    baseTech.push('REST API');
  }
  if (topics.includes('cli')) {
    baseTech.push('CLI');
  }
  if (topics.includes('database') || repoName.includes('db')) {
    baseTech.push('Database');
  }

  return Array.from(new Set(baseTech)); // Remove duplicates
};

// Helper function to generate highlights based on repo data
const getHighlights = (repoName: string, description: string, topics: string[]): string[] => {
  const highlights: string[] = [];

  if (repoName.includes('fync')) {
    highlights.push(
      "Unified architecture across 9 different APIs",
      "GitHub, GitLab, Spotify, Discord, Notion integrations",
      "Zero dependencies except undici for HTTP",
      "Tree-shakeable with dual package support",
      "100% TypeScript with comprehensive type definitions"
    );
  } else if (repoName.includes('auth')) {
    highlights.push(
      "Custom authentication implementation",
      "Next.js 15 App Router",
      "TypeScript throughout",
      "No external auth dependencies",
      "Modern React patterns"
    );
  } else if (repoName.includes('turso') || repoName.includes('db')) {
    highlights.push(
      "One-command database creation",
      "Automatic credential management",
      "Clipboard integration with .env format",
      "Smart credential overwriting",
      "Sub-10 second deployment workflow"
    );
  } else if (repoName.includes('portfolio') || repoName.includes('remcostoeten.nl')) {
    highlights.push(
      "Modern React architecture",
      "Server-side rendering with Next.js",
      "Real-time analytics integration",
      "Responsive design system",
      "Blog with MDX support"
    );
  }

  // Add generic highlights based on topics
  if (topics.includes('typescript')) highlights.push("Full TypeScript support");
  if (topics.includes('react')) highlights.push("Modern React patterns");
  if (topics.includes('api')) highlights.push("RESTful API design");

  return highlights.length > 0 ? highlights : [
    "Modern development practices",
    "Clean, maintainable code",
    "Comprehensive documentation"
  ];
};

// Create a function to get real project data from GitHub
export const getRealProjectData = async (): Promise<{ featuredProjects: TProjectData[], simpleProjects: TSimpleProject[] }> => {
  try {
    const repoData = await fetchTargetRepositories();

    const featuredProjects: TProjectData[] = [];
    const simpleProjects: TSimpleProject[] = [];

    // Process each repository
    for (const repoResult of repoData) {
      if (!repoResult.data) continue;

      const repo = repoResult.data;
      const technologies = getTechnologies(repo.title, repo.language, repo.topics);
      const highlights = getHighlights(repo.title, repo.description, repo.topics);

      // Determine if this should be a featured project or simple project
      const isFeatured = repo.title.includes('fync') ||
        repo.title.includes('auth') ||
        repo.title.includes('turso') ||
        repo.stars > 5; // Projects with more stars are featured

      if (isFeatured) {
        // Add to featured projects
        let title = repo.title;
        if (repo.title.includes('fync')) {
          title = `${repo.title} - Unified API Library`;
        } else if (repo.title.includes('auth')) {
          title = `${repo.title} - Next.js Authentication`;
        } else if (repo.title.includes('turso')) {
          title = `${repo.title} - Database CLI Tool`;
        }

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
        // Add to simple projects
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

    // Sort featured projects by stars (descending)
    featuredProjects.sort((a, b) => b.stars - a.stars);

    // Sort simple projects by stars (descending)
    simpleProjects.sort((a, b) => (b.gitInfo?.stars || 0) - (a.gitInfo?.stars || 0));

    return { featuredProjects, simpleProjects };
  } catch (error) {
    console.error('Error fetching real project data:', error);

    // Return minimal fallback data
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
};

// Export the function as the primary way to get project data
export { getRealProjectData };

// No static fallback data - we always fetch from GitHub API
export const FEATURED_PROJECTS: TProjectData[] = [];
export const SIMPLE_PROJECTS: TSimpleProject[] = [];
