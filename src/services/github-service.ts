export interface CommitData {
  message: string;
  url: string;
  shortHash: string;
  hash: string;
  date: string;
  author: string;
  projectName: string;
  color: string;
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
    }>;
  };
  created_at: string;
}

const LATEST_PROJECTS = [
  { owner: 'remcostoeten', repo: 'remcostoeten.nl', name: 'remcostoeten.nl', color: 'text-blue-400' },
  { owner: 'remcostoeten', repo: 'drizzleasy', name: 'drizzleasy', color: 'text-yellow-400' },
  { owner: 'remcostoeten', repo: 'fync', name: 'fync', color: 'text-orange-400' },
];

const formatTimestamp = (dateString: string): string => {
  return new Date(dateString).toISOString();
};

const fetchCommitDetails = async (owner: string, repo: string, sha: string): Promise<GitHubCommit | null> => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

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
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching commit details for ${owner}/${repo}/${sha}:`, error);
    return null;
  }
};

export async function getLatestCommit(owner: string, repo: string): Promise<CommitData | null> {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'remcostoeten-portfolio-activity',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      { headers }
    );

    if (!response.ok) {
      console.error(`GitHub API error for ${owner}/${repo}: ${response.statusText}`);
      return null;
    }

    const commits: GitHubCommit[] = await response.json();

    if (commits.length === 0) {
      return null;
    }

    const latestCommit = commits[0];
    const projectInfo = LATEST_PROJECTS.find(p => p.owner === owner && p.repo === repo);

    return {
      message: latestCommit.commit.message,
      url: latestCommit.html_url,
      shortHash: latestCommit.sha.substring(0, 7),
      hash: latestCommit.sha,
      date: latestCommit.commit.author.date,
      author: latestCommit.commit.author.name,
      projectName: projectInfo?.name || repo,
      color: projectInfo?.color || 'text-muted-foreground'
    };
  } catch (error) {
    console.error(`Error fetching latest commit for ${owner}/${repo}:`, error);
    return null;
  }
}

export async function getLatestCommits(): Promise<CommitData[]> {
  const commitPromises = LATEST_PROJECTS.map(async (project) => {
    const commit = await getLatestCommit(project.owner, project.repo);
    return commit ? { ...commit, color: project.color, projectName: project.name } : null;
  });

  const commitResults = await Promise.all(commitPromises);
  const validCommits = commitResults.filter(Boolean) as CommitData[];

  validCommits.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });

  return validCommits;
}

export async function getRecentActivity(): Promise<CommitData[]> {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'remcostoeten-portfolio-activity',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const response = await fetch(
      `https://api.github.com/users/remcostoeten/events?per_page=100`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const events: GitHubEvent[] = await response.json();

    const pushEvents = events.filter(event => {
      if (event.type !== 'PushEvent') return false;

      const eventDate = new Date(event.created_at);
      if (eventDate < oneMonthAgo) return false;

      if (!event.payload.commits || event.payload.commits.length === 0) return false;

      return LATEST_PROJECTS.some(project =>
        event.repo.name === `${project.owner}/${project.repo}`
      );
    });

    const commits: CommitData[] = [];

    for (const event of pushEvents) {
      const [owner, repo] = event.repo.name.split('/');
      const projectInfo = LATEST_PROJECTS.find(p => p.owner === owner && p.repo === repo);

      if (!projectInfo) continue;

      const latestCommitSha = event.payload.head || event.payload.commits![0].sha;

      const commitDetails = await fetchCommitDetails(owner, repo, latestCommitSha);

      if (commitDetails) {
        const commitData: CommitData = {
          message: commitDetails.commit.message,
          url: commitDetails.html_url,
          shortHash: commitDetails.sha.substring(0, 7),
          hash: commitDetails.sha,
          date: commitDetails.commit.author.date,
          author: commitDetails.commit.author.name,
          projectName: projectInfo.name,
          color: projectInfo.color
        };

        commits.push(commitData);
      }
    }

    commits.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return timeB - timeA;
    });

    return commits.slice(0, 20);

  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    return [];
  }
}
