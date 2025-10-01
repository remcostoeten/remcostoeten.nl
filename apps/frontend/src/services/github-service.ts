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
    
    // Fetch branches
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

export const fetchMultipleRepos = async (repos: Array<{ owner: string; repo: string }>) => {
  const results = await Promise.allSettled(
    repos.map(({ owner, repo }) => fetchRepositoryData(owner, repo))
  );
  
  return results.map((result, index) => ({
    ...repos[index],
    data: result.status === 'fulfilled' ? result.value : null
  }));
};

// Specific function to fetch your target repositories
export const fetchTargetRepositories = async () => {
  const targetRepos = [
    { owner: 'remcostoeten', repo: 'nextjs-15-roll-your-own-authentication' },
    { owner: 'remcostoeten', repo: 'remcostoeten.nl' },
    { owner: 'remcostoeten', repo: 'fync' },
    { owner: 'remcostoeten', repo: 'Turso-db-creator-auto-retrieve-env-credentials' }
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

// Function to fetch the specific featured repositories you requested
export const fetchSpecificFeaturedProjects = async (): Promise<RepoData[]> => {
  const featuredRepos = [
    { owner: 'remcostoeten', repo: 'emoji-feedback-widget' },
    { owner: 'remcostoeten', repo: 'Beautiful-interactive-file-tree' },
    { owner: 'remcostoeten', repo: 'react-beautiful-featurerich-codeblock' },
    { owner: 'remcostoeten', repo: 'HonoJS-api-page-analytics' },
    { owner: 'remcostoeten', repo: 'Hygienic' },
    { owner: 'remcostoeten', repo: 'Docki' }
  ];

  try {
    console.log('🔄 Fetching specific featured projects from GitHub API...');
    
    const results = await Promise.allSettled(
      featuredRepos.map(({ owner, repo }) => fetchRepositoryData(owner, repo))
    );
    
    const successfulResults = results
      .map((result, index) => ({
        ...featuredRepos[index],
        data: result.status === 'fulfilled' ? result.value : null
      }))
      .filter(result => result.data !== null)
      .map(result => result.data!);
    
    console.log(`✅ Successfully fetched ${successfulResults.length} featured projects`);
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
    console.log('🔄 Fetching latest 5 activities from GitHub account (public + private repos)...');
    
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

    // Use authenticated endpoint to get both public and private events
    const response = await fetch(`${GITHUB_API_BASE}/user/events?per_page=50`, {
      headers
    });
    
    console.log('📡 GitHub API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API Error Response:', errorText);
      
      if (response.status === 401) {
        console.error('GitHub token authentication failed. Token may not have required scopes (read:user, repo).');
        throw new Error('GitHub token authentication failed. Please check your GITHUB_TOKEN permissions.');
      } else if (response.status === 403) {
        console.error('GitHub API rate limit exceeded or insufficient permissions.');
        throw new Error('GitHub API rate limit exceeded or insufficient permissions.');
      } else if (response.status === 404) {
        console.error('GitHub user events endpoint not found. Token may lack required scopes.');
        throw new Error('GitHub user events not accessible. Token may need read:user scope.');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const events = await response.json();
    console.log('📊 Total events received:', events.length);
    
    // Find all push events
    const pushEvents = events.filter((event: any) => event.type === 'PushEvent');
    console.log('🔍 Push events found:', pushEvents.length);
    
    if (pushEvents.length === 0) {
      console.warn('⚠️ No recent push events found');
      return { activities: [], totalFound: 0 };
    }
    
    // Process up to 5 most recent push events
    const activities: LatestActivity[] = [];
    const maxActivities = 5;
    let processedCount = 0;
    
    for (let i = 0; i < pushEvents.length && processedCount < maxActivities; i++) {
      const pushEvent = pushEvents[i];
      
      // Extract commit information
      const commits = pushEvent.payload?.commits || [];
      const latestCommit = commits[commits.length - 1]; // Get the most recent commit in the push
      
      if (!latestCommit || !latestCommit.message) {
        console.warn('⚠️ No valid commit found in push event, skipping...');
        continue;
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
        timestamp = `${days} day${days > 1 ? 's' : ''} ago`;
      }
      
      const repoName = pushEvent.repo?.name?.split('/')[1] || 'unknown-repo';
      const commitMessage = latestCommit.message.split('\n')[0].trim(); // Only first line, trimmed
      
      // Skip if commit message is empty after trimming
      if (!commitMessage) {
        console.warn('⚠️ Empty commit message after trimming, skipping...');
        continue;
      }
      
      activities.push({
        latestCommit: commitMessage,
        project: repoName,
        timestamp,
        commitUrl: `https://github.com/${pushEvent.repo.name}/commit/${latestCommit.sha}`,
        repositoryUrl: `https://github.com/${pushEvent.repo.name}`
      });
      
      processedCount++;
    }
    
    console.log('✅ Successfully fetched', activities.length, 'activities');
    return { activities, totalFound: pushEvents.length };
    
  } catch (error) {
    console.error('❌ Error fetching latest activities:', error);
    
    // Don't return fallback data - let the component handle the error
    throw error;
  }
};

// Function to fetch the latest push activity from remcostoeten's GitHub account (backwards compatibility)
export const fetchLatestActivity = async (): Promise<LatestActivity | null> => {
  const result = await fetchLatestActivities();
  return result.activities.length > 0 ? result.activities[0] : null;
};