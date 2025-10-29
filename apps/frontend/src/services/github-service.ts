// Using native fetch instead of fync library due to module resolution issues
const GITHUB_API_BASE = 'https://api.github.com';

// Import categorization function
import { categorizeProject } from '../modules/projects/utils/categorize-project';

// Fallback categorization function
function fallbackCategorizeProject(title: string): 'APIs' | 'DX tooling' | 'projects' {
  const PROJECT_CATEGORY_MAPPING: Record<string, 'APIs' | 'DX tooling' | 'projects'> = {
    'fync': 'APIs',
    'drizzleasy': 'APIs',
    'honolytics': 'APIs',
    'Hygienic': 'DX tooling',
    'Docki': 'DX tooling',
    'Turso-db-creator-auto-retrieve-env-credentials': 'DX tooling',
    'gh-select': 'DX tooling',
    'dotfiles': 'DX tooling',
    'remcostoeten.nl': 'projects',
    'expense-calendar': 'projects',
    'nextjs-15-roll-your-own-authentication': 'projects',
    'emoji-feedback-widget': 'projects',
    'The most beautifull file tree': 'projects',
    'react-beautiful-featurerich-codeblock': 'projects'
  };
  return PROJECT_CATEGORY_MAPPING[title] || 'projects';
}

export interface RepoData {
  title: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  topics: string[];
  branches?: number;
  contributors?: number;
  // Enhanced data
  deploymentUrl?: string;
  latestCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
    age: string;
  };
  repositoryAge?: string;
  size?: number;
  issues?: number;
  commits?: number;
  totalCommits?: number;
  startDate?: string;
}

export const fetchRepositoryData = async (owner: string, repo: string): Promise<RepoData | null> => {
  try {

    // Prepare headers with optional GitHub token
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'remcostoeten-portfolio'
    };

    const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    // Fetch repository data using native fetch
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers
    });

    if (!response.ok) {
      if (response.status === 403) {
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        console.warn(`⚠️  GitHub API rate limit exceeded for ${owner}/${repo}. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
        throw new Error(`GitHub API rate limit exceeded. Try again later.`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const repository = await response.json();

    // Get additional data
    let branches = 0;
    let contributors = 1;
    let latestCommit = null;
    let repositoryAge = '';
    let deploymentUrl = '';
    let totalCommits = 0;
    let startDate = '';

    try {
      const branchesResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, {
        headers
      });
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json();
        branches = branchesData?.length || 0;
      }
    } catch (branchError) {
      console.warn(`Could not fetch branches for ${owner}/${repo}:`, branchError);
    }

    // Fetch contributors
    try {
      const contributorsResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
        headers
      });
      if (contributorsResponse.ok) {
        const contributorsData = await contributorsResponse.json();
        contributors = contributorsData?.length || 1;
      }
    } catch (contributorError) {
      console.warn(`Could not fetch contributors for ${owner}/${repo}:`, contributorError);
    }

    // Fetch latest commit
    try {
      const commitsResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`, {
        headers
      });
      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json();
        if (commitsData && commitsData.length > 0) {
          const commit = commitsData[0];
          const commitDate = new Date(commit.commit.author.date);
          const now = new Date();
          const ageInDays = Math.floor((now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24));

          latestCommit = {
            sha: commit.sha.substring(0, 7),
            message: commit.commit.message.split('\n')[0], // First line only
            author: commit.commit.author.name,
            date: commitDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            age: ageInDays === 0 ? 'today' : ageInDays === 1 ? 'yesterday' : `${ageInDays} days ago`
          };
        }
      }
    } catch (commitError) {
      console.warn(`Could not fetch latest commit for ${owner}/${repo}:`, commitError);
    }

    // Fetch total commits count
    try {
      // GitHub API doesn't have a direct endpoint for total commits count
      // We'll use the commits endpoint with pagination to get an approximate count
      const commitsCountResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1&page=1`, {
        headers
      });

      if (commitsCountResponse.ok) {
        // Check if there's a Link header with pagination info
        const linkHeader = commitsCountResponse.headers.get('Link');
        if (linkHeader) {
          // Parse the last page number from the Link header
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (lastPageMatch) {
            totalCommits = parseInt(lastPageMatch[1], 10);
          }
        } else {
          // If no pagination, we can try to count commits more directly
          // But this is limited to the first 100 commits due to API limitations
          const allCommitsResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=100`, {
            headers
          });
          if (allCommitsResponse.ok) {
            const commitsData = await allCommitsResponse.json();
            totalCommits = commitsData.length;
          }
        }
      }
    } catch (commitsCountError) {
      console.warn(`Could not fetch total commits count for ${owner}/${repo}:`, commitsCountError);
    }

    // Calculate repository age and start date
    try {
      const createdDate = new Date(repository.created_at);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInMonths = Math.floor(ageInDays / 30);
      const ageInYears = Math.floor(ageInDays / 365);

      // Set start date
      startDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      if (ageInYears > 0) {
        repositoryAge = `${ageInYears} year${ageInYears > 1 ? 's' : ''} old`;
      } else if (ageInMonths > 0) {
        repositoryAge = `${ageInMonths} month${ageInMonths > 1 ? 's' : ''} old`;
      } else {
        repositoryAge = `${ageInDays} day${ageInDays > 1 ? 's' : ''} old`;
      }
    } catch (ageError) {
      console.warn(`Could not calculate repository age for ${owner}/${repo}:`, ageError);
    }

    // Try to detect deployment URL from repository description or topics
    try {
      const description = repository.description || '';
      const topics = repository.topics || [];

      // Look for common deployment patterns in description
      const deploymentPatterns = [
        /https?:\/\/[^\s]+\.vercel\.app/gi,
        /https?:\/\/[^\s]+\.netlify\.app/gi,
        /https?:\/\/[^\s]+\.github\.io/gi,
        /https?:\/\/[^\s]+\.pages\.dev/gi,
        /https?:\/\/[^\s]+\.surge\.sh/gi,
        /https?:\/\/[^\s]+\.herokuapp\.com/gi
      ];

      for (const pattern of deploymentPatterns) {
        const match = description.match(pattern);
        if (match) {
          deploymentUrl = match[0];
          break;
        }
      }

      // If no deployment URL found in description, try to construct from repo name
      if (!deploymentUrl && topics.includes('portfolio') || topics.includes('website')) {
        // Common patterns for personal sites
        const possibleUrls = [
          `https://${owner}.github.io/${repo}`,
          `https://${repo}.vercel.app`,
          `https://${repo}.netlify.app`
        ];
        // We'll let the component decide which one to use
        deploymentUrl = possibleUrls[0];
      }
    } catch (deploymentError) {
      console.warn(`Could not detect deployment URL for ${owner}/${repo}:`, deploymentError);
    }

    return {
      title: repository.name,
      description: repository.description || '',
      url: repository.html_url,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      language: repository.language || '',
      lastUpdated: new Date(repository.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      topics: repository.topics || [],
      branches,
      contributors,
      // Enhanced data
      deploymentUrl: deploymentUrl || undefined,
      latestCommit: latestCommit || undefined,
      repositoryAge: repositoryAge || undefined,
      size: repository.size || undefined,
      issues: repository.open_issues_count || undefined,
      totalCommits: totalCommits || undefined,
      startDate: startDate || undefined
    };
  } catch (error) {
    console.error(`❌ Error fetching repository data for ${owner}/${repo}:`, error);
    return null;
  }
};

export async function fetchMultipleRepos(repos: Array<{ owner: string; repo: string }>) {
  const results = await Promise.allSettled(
    repos.map(({ owner, repo }) => fetchRepositoryData(owner, repo))
  );

  return results.map((result, index) => ({
    ...repos[index],
    data: result.status === 'fulfilled' ? result.value : null
  }));
};


export async function fetchTargetRepositories() {
  const targetRepos = [
    // APIs category
    { owner: 'remcostoeten', repo: 'fync' },
    { owner: 'remcostoeten', repo: 'drizzleasy' },
        
    // DX tooling category  
    { owner: 'remcostoeten', repo: 'Hygienic' },
    { owner: 'remcostoeten', repo: 'Docki' },
    { owner: 'remcostoeten', repo: 'Turso-db-creator-auto-retrieve-env-credentials' },
    { owner: 'remcostoeten', repo: 'gh-select' },
    { owner: 'remcostoeten', repo: 'dotfiles' },
    
    // Projects category
    { owner: 'remcostoeten', repo: 'remcostoeten.nl' },
    { owner: 'remcostoeten', repo: 'expense-calendar' },
    { owner: 'remcostoeten', repo: 'nextjs-15-roll-your-own-authentication' },
    { owner: 'remcostoeten', repo: 'emoji-feedback-widget' },
    { owner: 'remcostoeten', repo: 'beautiful-interactive-file-tree' },
    { owner: 'remcostoeten', repo: 'react-beautiful-featurerich-codeblock' }
  ];

  return await fetchMultipleRepos(targetRepos);
};

// Function to fetch both featured projects: remcostoeten.nl and RYOA
export const fetchFeaturedProjects = async (): Promise<{
  remcostoetenNl: RepoData | null;
  ryoa: RepoData | null;
}> => {
  try {

    const [remcostoetenResult, ryoaResult] = await Promise.allSettled([
      fetchRepositoryData('remcostoeten', 'remcostoeten.nl'),
      fetchRepositoryData('remcostoeten', 'nextjs-15-roll-your-own-authentication')
    ]);

    const remcostoetenNl = remcostoetenResult.status === 'fulfilled' ? remcostoetenResult.value : null;
    const ryoa = ryoaResult.status === 'fulfilled' ? ryoaResult.value : null;

    return { remcostoetenNl, ryoa };

  } catch (error) {
    console.error('❌ Error fetching featured projects:', error);
    return { remcostoetenNl: null, ryoa: null };
  }
};

// Enhanced function specifically for the remcostoeten.nl project with additional details
export const fetchRemcostoetenPortfolio = async (): Promise<RepoData & {
  commits?: number;
  issues?: number;
  pullRequests?: number;
  size?: number;
}> => {
  try {

    const baseData = await fetchRepositoryData('remcostoeten', 'remcostoeten.nl');
    if (!baseData) {
      throw new Error('Failed to fetch base repository data');
    }

    // Additional data is now fetched in the base fetchRepositoryData function
    // No need for duplicate API calls

    return baseData;

  } catch (error) {
    console.error('❌ Error fetching enhanced remcostoeten.nl data:', error);

    // Don't return fallback data - let the component handle the error
    throw error;
  }
};

// Function to fetch the specific featured repositories you requested with categorization
export const fetchSpecificFeaturedProjects = async (): Promise<(RepoData & { category: 'APIs' | 'DX tooling' | 'projects' })[]> => {
  // Use the same repos as fetchTargetRepositories for consistency
  const featuredRepos = [
    // APIs category
    { owner: 'remcostoeten', repo: 'fync' },
    { owner: 'remcostoeten', repo: 'drizzleasy' },
        
    // DX tooling category  
    { owner: 'remcostoeten', repo: 'Hygienic' },
    { owner: 'remcostoeten', repo: 'Docki' },
    { owner: 'remcostoeten', repo: 'Turso-db-creator-auto-retrieve-env-credentials' },
    { owner: 'remcostoeten', repo: 'gh-select' },
    { owner: 'remcostoeten', repo: 'dotfiles' },
    
    // Projects category
    { owner: 'remcostoeten', repo: 'remcostoeten.nl' },
    { owner: 'remcostoeten', repo: 'expense-calendar' },
    { owner: 'remcostoeten', repo: 'nextjs-15-roll-your-own-authentication' },
    { owner: 'remcostoeten', repo: 'emoji-feedback-widget' },
    { owner: 'remcostoeten', repo: 'beautiful-interactive-file-tree' },
    { owner: 'remcostoeten', repo: 'react-beautiful-featurerich-codeblock' }
  ];

  try {

    const results = await Promise.allSettled(
      featuredRepos.map(({ owner, repo }) => fetchRepositoryData(owner, repo))
    );

    // Log detailed results for debugging
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;
    console.log(`📊 Promise.allSettled results: ${fulfilled} fulfilled, ${rejected} rejected`);

    // Log any rejections for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const { owner, repo } = featuredRepos[index];
        console.warn(`⚠️  Failed to fetch ${owner}/${repo}:`, result.reason?.message || result.reason);
      }
    });

    const successfulResults = results
      .map((result, index) => ({
        ...featuredRepos[index],
        data: result.status === 'fulfilled' ? result.value : null
      }))
      .filter(result => result.data !== null)
      .map(result => {
        const repoData = result.data!;
        try {
          const category = categorizeProject(repoData.title, repoData.description, [repoData.language], repoData.topics);
          return {
            ...repoData,
            category
          };
        } catch (categorizationError) {
          console.warn(`⚠️  Failed to categorize ${repoData.title}, using fallback:`, categorizationError);
          const fallbackCategory = fallbackCategorizeProject(repoData.title);
          return {
            ...repoData,
            category: fallbackCategory
          };
        }
      });

    
    // Log category breakdown for debugging
    const categoryBreakdown = successfulResults.reduce((acc, proj) => {
      acc[proj.category] = (acc[proj.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📋 Category breakdown:', categoryBreakdown);
    
    // Ensure we always return some data, even if some fetches failed
    if (successfulResults.length === 0) {
      console.error('❌ No repositories were successfully fetched. This might indicate a GitHub API issue.');
      // Instead of returning empty array, throw an error that can be caught and handled
      throw new Error(`Failed to fetch any repository data. Attempted ${featuredRepos.length} repositories but all failed.`);
    }

    return successfulResults;

  } catch (error) {
    console.error('❌ Error in fetchSpecificFeaturedProjects:', error);
    // Re-throw the error so components can handle it appropriately
    throw new Error(`GitHub API fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Interface for latest activity data
export interface LatestActivity {
  latestCommit: string;
  project: string;
  timestamp: string;
  commitUrl: string;
  repositoryUrl: string;
}

export interface LatestActivities {
  activities: LatestActivity[];
  totalFound: number;
}

export const fetchLatestActivities = async (): Promise<LatestActivities> => {
  try {

    // Fetch user events (this includes push events)
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'remcostoeten-portfolio'
    };

    // Add GitHub token if available
    const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
      console.log('🔑 Using GitHub token for authentication');
      console.log('🔑 Token length:', githubToken.length);
    } else {
      console.warn('⚠️ No GitHub token found, using unauthenticated requests');
      console.warn('⚠️ NEXT_PUBLIC_GITHUB_TOKEN available:', !!process.env.NEXT_PUBLIC_GITHUB_TOKEN);
      console.warn('⚠️ GITHUB_TOKEN available:', !!process.env.GITHUB_TOKEN);
    }

    // Use public events endpoint directly for better reliability
    let response = await fetch(`${GITHUB_API_BASE}/users/remcostoeten/events/public?per_page=100`, {
      headers
    });

    console.log('📡 GitHub API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API Error Response:', errorText);

      if (response.status === 401) {
        console.error('GitHub token authentication failed. Token may not have required scopes.');
        throw new Error('GitHub token authentication failed. Please check your token permissions.');
      } else if (response.status === 403) {
        console.error('GitHub API rate limit exceeded or insufficient permissions.');
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (response.status === 404) {
        console.error('GitHub events endpoint not accessible.');
        throw new Error('GitHub events not accessible. This may be due to token scope limitations.');
      }

      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const events = await response.json();
    console.log('📊 Total events received:', events.length);

    // Filter push events within the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentPushEvents = events.filter((event: any) => {
      if (event.type !== 'PushEvent') return false;
      const eventDate = new Date(event.created_at);
      return eventDate >= oneMonthAgo;
    });

    console.log('🔍 Recent push events found (within 1 month):', recentPushEvents.length);

    if (recentPushEvents.length === 0) {
      console.warn('⚠️ No recent push events found within the last month');
      return { activities: [], totalFound: 0 };
    }

    // Group commits by project and fetch commit details
    const commitsByProject = new Map<string, LatestActivity[]>();

    // Process up to 20 most recent push events to avoid too many API calls
    const limitedPushEvents = recentPushEvents.slice(0, 20);

    console.log(`🔍 Processing ${limitedPushEvents.length} push events to fetch commit details`);

    for (const pushEvent of limitedPushEvents) {
      const repoName = pushEvent.repo?.name?.split('/')[1] || 'unknown-repo';
      const headCommitSha = pushEvent.payload?.head;

      if (!headCommitSha || !pushEvent.repo?.name) continue;

      if (!commitsByProject.has(repoName)) {
        commitsByProject.set(repoName, []);
      }

      // Calculate time ago
      const eventDate = new Date(pushEvent.created_at);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60));

      let timestamp: string;
      if (diffInMinutes < 1) {
        timestamp = 'just now';
      } else if (diffInMinutes < 60) {
        timestamp = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        timestamp = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days === 1) {
          timestamp = 'yesterday';
        } else if (days < 60) {
          timestamp = `${days} days ago`;
        } else {
          timestamp = '2 months ago';
        }
      }

      // Fetch commit details to get the actual commit message
      let commitMessage = `Latest commit to ${repoName}`;

      try {
        const commitResponse = await fetch(`${GITHUB_API_BASE}/repos/${pushEvent.repo.name}/commits/${headCommitSha}`, {
          headers
        });

        if (commitResponse.ok) {
          const commitData = await commitResponse.json();
          commitMessage = commitData.commit?.message?.split('\n')[0]?.trim() || commitMessage;
          console.log(`📝 Fetched commit message for ${repoName}: ${commitMessage}`);
        } else {
          console.warn(`⚠️ Could not fetch commit details for ${pushEvent.repo.name}/${headCommitSha}: ${commitResponse.status}`);
        }
      } catch (commitError) {
        console.warn(`⚠️ Error fetching commit details for ${pushEvent.repo.name}:`, commitError);
      }

      const activity: LatestActivity = {
        latestCommit: commitMessage,
        project: repoName,
        timestamp,
        commitUrl: `https://github.com/${pushEvent.repo.name}/commit/${headCommitSha}`,
        repositoryUrl: `https://github.com/${pushEvent.repo.name}`
      };

      commitsByProject.get(repoName)!.push(activity);
    }

    // Select up to 2 commits per project, prioritizing recent ones
    const selectedActivities: LatestActivity[] = [];

    for (const [project, projectCommits] of Array.from(commitsByProject.entries())) {
      // Sort commits by recency (most recent first) and take up to 2
      const sortedCommits = projectCommits.slice(0, 2);
      selectedActivities.push(...sortedCommits);
    }

    // If we have fewer than 10 commits, add more from projects that have additional commits
    if (selectedActivities.length < 10) {
      const remainingSlots = 10 - selectedActivities.length;
      const additionalCommits: LatestActivity[] = [];

      for (const [project, projectCommits] of Array.from(commitsByProject.entries())) {
        if (projectCommits.length > 2) {
          // Add the 3rd, 4th, etc. commits from this project
          const extraCommits = projectCommits.slice(2);
          additionalCommits.push(...extraCommits);
        }
      }

      // Add additional commits up to our limit
      selectedActivities.push(...additionalCommits.slice(0, remainingSlots));
    }

    // Shuffle the activities for randomization while keeping the most recent ones prioritized
    const shuffledActivities = [...selectedActivities];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffledActivities.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledActivities[i], shuffledActivities[j]] = [shuffledActivities[j], shuffledActivities[i]];
    }

    // Take up to 10 activities
    const finalActivities = shuffledActivities.slice(0, 10);

    return { activities: finalActivities, totalFound: recentPushEvents.length };

  } catch (error) {
    console.error('❌ Error fetching latest activities:', error);

    throw error;
  }
};

export const fetchLatestActivity = async (): Promise<LatestActivity | null> => {
  const result = await fetchLatestActivities();
  return result.activities[0] || null;
};
