// Using native fetch instead of fync library due to module resolution issues
const GITHUB_API_BASE = 'https://api.github.com';

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
    console.log(`🔄 Fetching repository data for ${owner}/${repo}...`);

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const repository = await response.json();
    console.log(`✅ Successfully fetched repository data for ${repository.name}`);

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
    { owner: 'remcostoeten', repo: 'hono-analytics' },
    
    // DX tooling category  
    { owner: 'remcostoeten', repo: 'Hygienic' },
    { owner: 'remcostoeten', repo: 'Docki' },
    { owner: 'remcostoeten', repo: 'Turso-db-creator-auto-retrieve-env-credentials' },
    { owner: 'remcostoeten', repo: 'gh-select' },
    { owner: 'remcostoeten', repo: 'dotfiles' },
    
    // Projects category
    { owner: 'remcostoeten', repo: 'remcostoeten.nl' },
    { owner: 'remcostoeten', repo: 'expenses-calendar' },
    { owner: 'remcostoeten', repo: 'nextjs-15-roll-your-own-authentication' },
    { owner: 'remcostoeten', repo: 'emoji-feedback-widget' },
    { owner: 'remcostoeten', repo: 'Beautiful-interactive-file-tree' },
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
    console.log('🔄 Fetching featured projects: remcostoeten.nl and RYOA...');

    const [remcostoetenResult, ryoaResult] = await Promise.allSettled([
      fetchRepositoryData('remcostoeten', 'remcostoeten.nl'),
      fetchRepositoryData('remcostoeten', 'nextjs-15-roll-your-own-authentication')
    ]);

    const remcostoetenNl = remcostoetenResult.status === 'fulfilled' ? remcostoetenResult.value : null;
    const ryoa = ryoaResult.status === 'fulfilled' ? ryoaResult.value : null;

    console.log('✅ Successfully fetched featured projects data');
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
    console.log('🔄 Fetching enhanced remcostoeten.nl project data...');

    const baseData = await fetchRepositoryData('remcostoeten', 'remcostoeten.nl');
    if (!baseData) {
      throw new Error('Failed to fetch base repository data');
    }

    // Additional data is now fetched in the base fetchRepositoryData function
    // No need for duplicate API calls

    console.log('✅ Successfully fetched enhanced remcostoeten.nl data');
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
    { owner: 'remcostoeten', repo: 'hono-analytics' },
    
    // DX tooling category  
    { owner: 'remcostoeten', repo: 'Hygienic' },
    { owner: 'remcostoeten', repo: 'Docki' },
    { owner: 'remcostoeten', repo: 'Turso-db-creator-auto-retrieve-env-credentials' },
    { owner: 'remcostoeten', repo: 'gh-select' },
    { owner: 'remcostoeten', repo: 'dotfiles' },
    
    // Projects category
    { owner: 'remcostoeten', repo: 'remcostoeten.nl' },
    { owner: 'remcostoeten', repo: 'expenses-calendar' },
    { owner: 'remcostoeten', repo: 'nextjs-15-roll-your-own-authentication' },
    { owner: 'remcostoeten', repo: 'emoji-feedback-widget' },
    { owner: 'remcostoeten', repo: 'Beautiful-interactive-file-tree' },
    { owner: 'remcostoeten', repo: 'react-beautiful-featurerich-codeblock' }
  ];

  try {
    console.log('🔄 Fetching specific featured projects from GitHub API...');

    const results = await Promise.allSettled(
      featuredRepos.map(({ owner, repo }) => fetchRepositoryData(owner, repo))
    );

    // Import categorization function
    const { categorizeProject } = await import('../modules/projects/utils/categorize-project');

    const successfulResults = results
      .map((result, index) => ({
        ...featuredRepos[index],
        data: result.status === 'fulfilled' ? result.value : null
      }))
      .filter(result => result.data !== null)
      .map(result => {
        const repoData = result.data!;
        const category = categorizeProject(repoData.title, repoData.description, [repoData.language], repoData.topics);
        return {
          ...repoData,
          category
        };
      });

    console.log(`✅ Successfully fetched ${successfulResults.length} featured projects with categories`);
    return successfulResults;

  } catch (error) {
    console.error('❌ Error fetching specific featured projects:', error);
    return [];
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
    console.log('🔄 Fetching latest activities from GitHub account (up to 1 month old)...');

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
    } else {
      console.warn('⚠️ No GitHub token found, using unauthenticated requests');
    }

    // Try authenticated endpoint first, fallback to public events if it fails
    let response = await fetch(`${GITHUB_API_BASE}/user/events?per_page=100`, {
      headers
    });

    // If user/events fails (404), fallback to public events
    if (response.status === 404) {
      console.warn('⚠️ /user/events not accessible, falling back to public events');
      response = await fetch(`${GITHUB_API_BASE}/users/remcostoeten/events/public?per_page=100`, {
        headers
      });
    }

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

    // Group commits by project and collect all valid commits
    const commitsByProject = new Map<string, LatestActivity[]>();

    for (const pushEvent of recentPushEvents) {
      const commits = pushEvent.payload?.commits || [];
      const repoName = pushEvent.repo?.name?.split('/')[1] || 'unknown-repo';

      if (!commitsByProject.has(repoName)) {
        commitsByProject.set(repoName, []);
      }

      // Process all commits in this push event
      for (const commit of commits) {
        if (!commit || !commit.message) continue;

        const commitMessage = commit.message.split('\n')[0].trim();
        if (!commitMessage) continue;

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

        const activity: LatestActivity = {
          latestCommit: commitMessage,
          project: repoName,
          timestamp,
          commitUrl: `https://github.com/${pushEvent.repo.name}/commit/${commit.sha}`,
          repositoryUrl: `https://github.com/${pushEvent.repo.name}`
        };

        commitsByProject.get(repoName)!.push(activity);
      }
    }

    // Select up to 2 commits per project, prioritizing recent ones
    const selectedActivities: LatestActivity[] = [];

    for (const [project, projectCommits] of commitsByProject.entries()) {
      // Sort commits by recency (most recent first) and take up to 2
      const sortedCommits = projectCommits.slice(0, 2);
      selectedActivities.push(...sortedCommits);
    }

    // If we have fewer than 10 commits, add more from projects that have additional commits
    if (selectedActivities.length < 10) {
      const remainingSlots = 10 - selectedActivities.length;
      const additionalCommits: LatestActivity[] = [];

      for (const [project, projectCommits] of commitsByProject.entries()) {
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

    console.log('✅ Successfully processed activities:');
    console.log(`   - Total projects: ${commitsByProject.size}`);
    console.log(`   - Selected activities: ${finalActivities.length}`);
    console.log(`   - Activities by project:`,
      Array.from(commitsByProject.entries()).map(([project, commits]) =>
        `${project}: ${Math.min(commits.length, 2)} commits`
      ).join(', ')
    );

    return { activities: finalActivities, totalFound: recentPushEvents.length };

  } catch (error) {
    console.error('❌ Error fetching latest activities:', error);

    // Don't return fallback data - let the component handle the error
    throw error;
  }
};

// Function to fetch the latest push activity from remcostoeten's GitHub account (backwards compatibility)
export const fetchLatestActivity = async (): Promise<LatestActivity | null> => {
  const result = await fetchLatestActivities();
  return result.activities[0] || null;
};
