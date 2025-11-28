export interface TLatestActivity {
  latestCommit: string;           // Commit message
  commitUrl: string;             // GitHub commit URL
  project: string;               // Repository name
  repositoryUrl: string;         // Repository URL
  timestamp: string;            // Human-readable timestamp
  branch?: string;               // Optional branch name
  additions?: number;            // Optional line additions
  deletions?: number;            // Optional line deletions
  author?: {                     // Optional author info
    name: string;
    url?: string;
  };
}

// GitHub API Event Types
interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: {
    ref?: string;
    head?: string;
    commits?: Array<{
      sha: string;
      message: string;
      author: {
        name: string;
        email: string;
      };
      url: string;
      distinct: boolean;
    }>;
    size?: number;
  };
  created_at: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

// Helper function to format timestamp
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Fetch commit details from GitHub API
async function fetchCommitDetails(
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubCommit | null> {
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'remcostoeten-portfolio-activity',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      { headers }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch commit ${sha}: ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`Error fetching commit ${sha}:`, error);
    return null;
  }
}

/**
 * Fetch latest activities from GitHub
 * Returns recent commits from the last month with detailed information
 */
export async function fetchLatestActivities(): Promise<{
  activities: TLatestActivity[];
}> {
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'remcostoeten-portfolio-activity',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // Fetch user's public events from the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const formattedDate = oneMonthAgo.toISOString();

    const response = await fetch(
      `https://api.github.com/users/remcostoeten/events?per_page=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const events: GitHubEvent[] = await response.json();

    // Filter for PushEvent events within the last month
    const pushEvents = events.filter(event => {
      if (event.type !== 'PushEvent') return false;
      const eventDate = new Date(event.created_at);
      return eventDate >= oneMonthAgo && event.payload.commits && event.payload.commits.length > 0;
    });

    // Process each push event to get commit details
    const activities: TLatestActivity[] = [];

    for (const event of pushEvents) {
      const [owner, repo] = event.repo.name.split('/');

      // Get the latest commit from this push
      const latestCommitSha = event.payload.head || event.payload.commits![0].sha;
      const latestCommitMsg = event.payload.commits![event.payload.commits!.length - 1].message;

      // Fetch detailed commit information
      const commitDetails = await fetchCommitDetails(owner, repo, latestCommitSha);

      const activity: TLatestActivity = {
        latestCommit: latestCommitMsg,
        commitUrl: `https://github.com/${event.repo.name}/commit/${latestCommitSha}`,
        project: event.repo.name,
        repositoryUrl: `https://github.com/${event.repo.name}`,
        timestamp: formatTimestamp(event.created_at),
        branch: event.payload.ref?.replace('refs/heads/', ''),
        additions: commitDetails?.stats?.additions,
        deletions: commitDetails?.stats?.deletions,
        author: {
          name: commitDetails?.commit.author.name || event.actor.login,
          url: event.actor.url
        }
      };

      activities.push(activity);
    }

    // Sort by timestamp (most recent first) and limit to 20
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    return {
      activities: activities.slice(0, 20)
    };

  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    throw new Error(`Failed to fetch GitHub activities: ${error.message}`);
  }
}
