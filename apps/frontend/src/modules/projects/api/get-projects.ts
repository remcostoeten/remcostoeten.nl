import { unstable_cache } from "next/cache";
import { fetchTargetRepositories } from "@/services/github-service";
import { TProjectData, TSimpleProject } from "../types";
import { categorizeProject } from "../utils/categorize-project";

// Server function to get projects data with caching
export async function getProjects(): Promise<{ featuredProjects: TProjectData[], simpleProjects: TSimpleProject[] }> {
    const getCachedProjects = unstable_cache(
        async () => {
            try {
                console.log('🔄 Fetching projects from GitHub API...');
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

                    // Create project data
                    const projectData: TProjectData = {
                        title: override?.title || repo.title,
                        description: override?.description || repo.description || "No description available",
                        url: repo.url,
                        stars: repo.stars,
                        forks: repo.forks,
                        language: repo.language,
                        lastUpdated: repo.lastCommit,
                        technologies,
                        highlights: override?.highlights || highlights,
                        contributors: repo.contributors,
                        totalCommits: repo.totalCommits,
                        category
                    };

                    // Add package info if it's a package
                    if (override?.packageInfo) {
                        projectData.packageInfo = override.packageInfo;
                    }

                    // Add origin label if specified
                    if (override?.originLabel) {
                        projectData.originLabel = override.originLabel;
                    }

                    // Add anchor if specified
                    if (override?.anchor) {
                        projectData.anchor = override.anchor;
                    }

                    // Categorize as featured or simple
                    if (category === 'projects' && repo.stars > 5) {
                        featuredProjects.push(projectData);
                    } else {
                        simpleProjects.push({
                            name: projectData.title,
                            url: projectData.url,
                            category,
                            gitInfo: {
                                stars: projectData.stars,
                                forks: projectData.forks,
                                lastCommit: projectData.lastUpdated,
                                language: projectData.language,
                                contributors: projectData.contributors,
                                description: projectData.description
                            },
                            packageInfo: projectData.packageInfo,
                            originLabel: projectData.originLabel,
                            anchor: projectData.anchor
                        });
                    }
                }

                console.log('📊 Projects processed:', { featuredCount: featuredProjects.length, simpleCount: simpleProjects.length });

                return {
                    featuredProjects,
                    simpleProjects
                };
            } catch (error) {
                console.error('❌ Error fetching projects:', error);
                return {
                    featuredProjects: [],
                    simpleProjects: []
                };
            }
        },
        ['projects-data'],
        {
            revalidate: 3600, // Cache for 1 hour
            tags: ['projects']
        }
    );

    return getCachedProjects();
}

// Helper functions (moved from projects.ts)
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

function getHighlights(description: string, topics: string[], stars: number, language: string): string[] {
    const highlights: string[] = [];

    if (description) {
        highlights.push(description);
    }

    if (stars > 0) {
        highlights.push(`${stars} GitHub stars`);
    }

    if (language) {
        highlights.push(`Built with ${language}`);
    }

    if (topics.length > 0) {
        highlights.push(`Topics: ${topics.slice(0, 3).join(', ')}`);
    }

    return highlights.length > 0 ? highlights : ["Active development project"];
}

// Project overrides (moved from projects.ts)
const PROJECT_OVERRIDES: Record<string, any> = {
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

