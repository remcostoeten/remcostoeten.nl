import { TProjectData, TSimpleProject } from "../types";
import { fetchTargetRepositories } from "@/services/github-service";
import { categorizeProject } from "../utils/categorize-project";

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
      text: string;
      description?: string;
      color?: 'website' | 'community' | 'personal' | 'client';
      icon?: string;
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
    originLabel: {
      text: "Born from this site",
      description: "Created while building remcostoeten.nl",
      color: "website",
      icon: "🚀"
    },
    anchor: "/projects/fync" // Example: custom anchor for this project
  },
  "drizzleasy": {
    packageInfo: {
      npmUrl: "https://www.npmjs.com/package/drizzleasy",
      githubUrl: "https://github.com/remcostoeten/drizzleasy",
      isPackage: true
    },
    originLabel: {
      text: "Born from this site",
      description: "Created while building remcostoeten.nl",
      color: "website",
      icon: "⚡"
    }
  },
  "hono-analytics": {
    packageInfo: {
      npmUrl: "https://www.npmjs.com/package/hono-analytics",
      githubUrl: "https://github.com/remcostoeten/hono-analytics",
      isPackage: true
    },
    originLabel: {
      text: "Born from this site",
      description: "Created while building remcostoeten.nl",
      color: "website",
      icon: "🚀"
    }
  },
  "beautiful-interactive-file-tree": {
    title: "The most beautifull file tree",
    demoUrl: "https://beautiful-file-tree-v2.vercel.app/",
    originLabel: {
      text: "Born from this site",
      description: "Created while building remcostoeten.nl",
      color: "website",
      icon: "🌳"
    }
  },
  "react-beautiful-featurerich-codeblock": {
    title: "The most beautifull code block",
    demoUrl: "https://react-beautiful-featurerich-codeblo.vercel.app/",
    originLabel: {
      text: "Born from this site",
      description: "Created while building remcostoeten.nl",
      color: "website",
      icon: "📝"
    }
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
      const override = PROJECT_OVERRIDES[repo.title];
      const category = override?.category || categorizeProject(repo.title, repo.description, technologies, repo.topics);

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
        // Use overrides if available, otherwise use GitHub data as defaults
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

