import { TProjectData, TSimpleProject } from "../types";
import { fetchTargetRepositories } from "@/services/github-service";
import { categorizeProject } from "../utils/categorize-project";
import { unstable_cache } from "next/cache";

type TProjectOverrides = {
  [key: string]: {
    title?: string;
    description?: string;
    demoUrl?: string;
    technologies?: string[];
    highlights?: string[];
    category?: 'APIs' | 'DX tooling' | 'projects';
    anchor?: string;
    packageInfo?: {
      npmUrl?: string;
      githubUrl?: string;
      isPackage?: boolean;
    };
    originLabel?: {
      text?: string;
      description?: string;
      color?: 'website' | 'community' | 'personal' | 'client' | 'component' | 'tool' | 'config' | 'tutorial' | 'blog';
      icon?: string;
      blogUrl?: string;
    };
    [key: string]: any;
  };
}

const PROJECT_OVERRIDES: TProjectOverrides = {
  "fync": {
    packageInfo: {
      npmUrl: "https://www.npmjs.com/package/fync",
      githubUrl: "https://github.com/remcostoeten/fync",
      isPackage: true
    },
    anchor: "/projects/fync"
  },
  "drizzleasy": {
    packageInfo: {
      npmUrl: "https://www.npmjs.com/package/drizzleasy",
      githubUrl: "https://github.com/remcostoeten/drizzleasy",
      isPackage: true
    }
  },
  "hono-analytics": {
    packageInfo: {
      npmUrl: "https://www.npmjs.com/package/hono-analytics",
      githubUrl: "https://github.com/remcostoeten/hono-analytics",
      isPackage: true
    }
  },
  "beautiful-interactive-file-tree": {
    demoUrl: "https://beautiful-file-tree-v2.vercel.app/"
  },
  "react-beautiful-featurerich-codeblock": {
    title: "Beautifull featurerich codeblock",
    description: "A polished, highly customizable code block with copy, line numbers, highlighting, and theming.",
    demoUrl: "https://beautiful-codeblock.vercel.app/"
  },
  "emoji-picker-component": {
    title: "Emoji picker component",
    description: "Lightweight emoji picker with categories, recent history, search, and keyboard navigation.",
    demoUrl: "https://emoji-picker-demo.vercel.app/"
  },
  "Hygienic": {},
  "Docki": {},
  "Turso-db-creator-auto-retrieve-env-credentials": {},
  "gh-select": {},
  "dotfiles": {},
  "remcostoeten.nl": {
    originLabel: {
      blogUrl: "/posts/building-remcostoeten-nl"
    }
  },
  "expense-calendar": {
    title: "Work commute tracking",
    description: "A full‑stack app to track my daily commuting kilometers and submit accurate reimbursement claims to HR."
  },
  "nextjs-15-roll-your-own-authentication": {},
  "emoji-feedback-widget": {
    title: "Emoji feedback widget"
  }
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

// Create a cached function to get real project data from GitHub
const getCachedProjectData = unstable_cache(
  async (): Promise<{ featuredProjects: TProjectData[], simpleProjects: TSimpleProject[] }> => {
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
        const override = PROJECT_OVERRIDES[repo.title];
        const category = override?.category || categorizeProject(repo.title, repo.description, technologies, repo.topics);

        const isFeatured = repo.stars > 3 || // Projects with more stars are featured
          repo.forks > 1 || // Projects with forks are featured
          (repo.totalCommits && repo.totalCommits > 10) || // Active projects are featured
          repo.topics.length > 2; // Well-tagged projects are featured

        if (isFeatured) {
          const override = PROJECT_OVERRIDES[repo.title];
          const title = override?.title || repo.title;
          const description = override?.description || repo.description || `A ${repo.language} project with ${repo.stars} stars`;
          const demoUrl = override?.demoUrl || (repo.topics.includes('demo') ? `${repo.url}#demo` : repo.url);
          const overrideCategory = override?.category;

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
            category: overrideCategory || category,
            packageInfo: override?.packageInfo,
            originLabel: override?.originLabel,
            anchor: override?.anchor
          });
        } else {
          const override = PROJECT_OVERRIDES[repo.title];
          const name = override?.title || repo.title;
          const description = override?.description || repo.description || `A ${repo.language} project`;
          const overrideCategory = override?.category;

          simpleProjects.push({
            name,
            url: repo.url,
            category: overrideCategory || category,
            gitInfo: {
              stars: repo.stars,
              forks: repo.forks,
              lastCommit: repo.lastUpdated,
              language: repo.language,
              contributors: repo.contributors || 1,
              description
            },
            packageInfo: override?.packageInfo,
            originLabel: override?.originLabel,
            anchor: override?.anchor
          });
        }
      }

      featuredProjects.sort((a, b) => b.stars - a.stars);

      simpleProjects.sort((a, b) => (b.gitInfo?.stars || 0) - (a.gitInfo?.stars || 0));

      return { featuredProjects, simpleProjects };
    } catch (error) {
      console.error('Error fetching project data:', error);
      return {
        featuredProjects: [],
        simpleProjects: []
      };
    }
  },
  ['projects-data'], // Cache key
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['projects']
  }
);

// Export the cached function
export async function getRealProjectData(): Promise<{ featuredProjects: TProjectData[], simpleProjects: TSimpleProject[] }> {
  return getCachedProjectData();
}

