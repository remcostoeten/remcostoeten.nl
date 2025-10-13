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
                            anchor: projectData.anchor,
                            detailedInfo: override?.detailedInfo
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
    "fync": {
        packageInfo: {
            npmUrl: "https://www.npmjs.com/package/@remcostoeten/fync",
            githubUrl: "https://github.com/remcostoeten/fync",
            isPackage: true
        },
        detailedInfo: {
            longDescription: "A unified TypeScript library that provides easy, type-safe access to popular APIs including GitHub, GitLab, Spotify, NPM Registry, and Google Calendar. Built with developer experience in mind, Fync simplifies API integrations with consistent interfaces and zero configuration hassle.",
            problemSolved: "Eliminates the complexity of working with multiple API clients. Instead of learning different SDKs for GitHub, Spotify, NPM, etc., developers get one consistent, chainable interface for all services. No more wrestling with authentication flows, rate limits, or response parsing.",
            features: [
                "Unified API for GitHub, GitLab, Spotify, NPM Registry, and Google Calendar",
                "Type-safe TypeScript interfaces with full IntelliSense support",
                "Chainable, fluent API design for intuitive usage",
                "Built-in caching and rate limit handling",
                "Zero-config OAuth flows for supported services",
                "Comprehensive test coverage and documentation",
                "Monorepo structure with usage examples"
            ],
            techStack: ["TypeScript", "Bun", "Monorepo", "OAuth 2.0", "REST APIs"],
            targetAudience: "Developers building applications that integrate with popular APIs, especially useful for portfolio sites, dashboards, and automation tools.",
            usageExample: `import { GitHub, Spotify } from '@remcostoeten/fync'\n\nconst github = GitHub({ token: process.env.GITHUB_TOKEN })\nconst repos = await github.user('octocat').repos.get()\n\nconst spotify = Spotify({ token: process.env.SPOTIFY_TOKEN })\nconst nowPlaying = await spotify.player.currentlyPlaying()`
        }
    },
    "hono-analytics": {
        packageInfo: {
            npmUrl: "https://www.npmjs.com/package/hono-analytics",
            githubUrl: "https://github.com/remcostoeten/hono-analytics",
            isPackage: true
        },
        detailedInfo: {
            longDescription: "A lightweight, privacy-focused analytics middleware for Hono framework. Track page views, user behavior, and performance metrics without compromising user privacy or adding bloat to your application.",
            problemSolved: "Most analytics solutions are bloated, slow, or violate user privacy. Hono Analytics provides minimal overhead tracking that respects GDPR while giving you the insights you need.",
            features: [
                "Zero-dependency analytics middleware",
                "Privacy-first design with no PII collection",
                "Minimal performance impact",
                "Works seamlessly with Hono's middleware system",
                "Customizable tracking events",
                "Built-in rate limiting and abuse prevention"
            ],
            techStack: ["TypeScript", "Hono", "Edge Runtime"],
            targetAudience: "Developers using Hono framework who need lightweight, privacy-conscious analytics."
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
        },
        detailedInfo: {
            longDescription: "My personal portfolio and playground built with Next.js 15, showcasing projects, blog posts, and experiments. Features custom animations, dark mode, and integrations with various APIs.",
            features: [
                "Server-side rendering with Next.js 15",
                "Custom design system with Tailwind CSS",
                "Dynamic project showcase with GitHub integration",
                "MDX-powered blog with syntax highlighting",
                "Smooth animations and transitions",
                "Responsive design for all devices"
            ],
            techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "MDX", "Vercel"],
            targetAudience: "Developers, recruiters, and anyone interested in my work and technical writing."
        }
    },
    "expense-calendar": {
        title: "Work commute tracking",
        description: "A full‑stack app to track my daily commuting kilometers and submit accurate reimbursement claims to HR.",
        detailedInfo: {
            longDescription: "A practical full-stack application built to solve a real-world problem: tracking daily commute distances for accurate expense reimbursement. Features calendar integration, automatic distance calculation, and PDF export for HR submissions.",
            problemSolved: "Manual tracking of daily commutes is tedious and error-prone. This app automates distance calculation, provides visual calendar view, and generates professional reports for HR.",
            features: [
                "Interactive calendar with daily commute tracking",
                "Automatic distance calculation between locations",
                "Monthly summary and statistics",
                "PDF export for expense claims",
                "Historical data and trends visualization",
                "Offline support with data sync"
            ],
            techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "TailwindCSS"],
            targetAudience: "Anyone who needs to track commute expenses for work reimbursement."
        }
    },
    "nextjs-15-roll-your-own-authentication": {},
    "emoji-feedback-widget": {
        title: "Emoji feedback widget"
    }
};

