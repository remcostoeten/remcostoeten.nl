import { GitHub } from '@remcostoeten/fync/github';
import type { TGitHubRepository } from '@remcostoeten/fync/github';

type TGitHubRepoData = {
  title: string;
  description: string;
  url: string;
  demoUrl?: string;
  stars: number;
  branches: number;
  technologies: string[];
  lastUpdated: string;
  highlights: string[];
}

type TGitHubUrlParts = {
  owner: string;
  repo: string;
} | null;

function extractGitHubUrlParts(url: string): TGitHubUrlParts {
  try {
    const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!githubMatch) return null;
    
    const [, owner, repo] = githubMatch;
    return { owner: owner.trim(), repo: repo.trim() };
  } catch (error) {
    console.error('Error extracting GitHub URL parts:', error);
    return null;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } catch (error) {
    return 'recently';
  }
}

export async function fetchGitHubRepoData(githubUrl: string): Promise<TGitHubRepoData | null> {
  const urlParts = extractGitHubUrlParts(githubUrl);
  if (!urlParts) {
    console.error('Invalid GitHub URL format:', githubUrl);
    return null;
  }

  const { owner, repo } = urlParts;

  try {
    const github = GitHub({
      token: import.meta.env.VITE_GITHUB_TOKEN,
      cache: true,
      cacheTTL: 300000, // 5 minutes
    });

    const [repoData, branches] = await Promise.all([
      github.repo(owner, repo).get(),
      github.repo(owner, repo).branches.get().catch(() => []),
    ]);

    const technologies: string[] = [];
    
    // Add primary language if available
    if (repoData.language) {
      technologies.push(repoData.language);
    }
    
    // Add topics as technologies
    if (repoData.topics && repoData.topics.length > 0) {
      technologies.push(...repoData.topics.slice(0, 5)); // Limit to 5 topics
    }

    // Generate highlights based on repository data
    const highlights: string[] = [];
    
    if (repoData.stargazers_count > 100) {
      highlights.push(`⭐ ${repoData.stargazers_count.toLocaleString()} stars`);
    }
    
    if (repoData.forks_count > 10) {
      highlights.push(`🍴 ${repoData.forks_count.toLocaleString()} forks`);
    }
    
    if (repoData.open_issues_count > 0) {
      highlights.push(`🐛 ${repoData.open_issues_count} open issues`);
    }
    
    if (repoData.license) {
      highlights.push(`📄 ${repoData.license.name} license`);
    }

    const result: TGitHubRepoData = {
      title: repoData.name,
      description: repoData.description || 'No description available',
      url: repoData.html_url,
      demoUrl: repoData.homepage || undefined,
      stars: repoData.stargazers_count,
      branches: Array.isArray(branches) ? branches.length : 1,
      technologies: technologies.slice(0, 6), // Limit to 6 technologies
      lastUpdated: formatRelativeTime(repoData.pushed_at),
      highlights: highlights.slice(0, 4), // Limit to 4 highlights
    };

    return result;
  } catch (error) {
    console.error('Error fetching GitHub repository data:', error);
    
    // Return fallback data
    return {
      title: repo,
      description: 'Unable to load repository data',
      url: githubUrl,
      stars: 0,
      branches: 1,
      technologies: [],
      lastUpdated: 'unknown',
      highlights: ['❌ Failed to load repository data'],
    };
  }
}

export function isGitHubUrl(url: string): boolean {
  return /github\.com\/[^\/]+\/[^\/\?#]+/.test(url);
}
