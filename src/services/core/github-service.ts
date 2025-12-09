export interface CommitData {
  hash: string;
  shortHash: string;
  message: string;
  date: string;
  url: string;
  author: string;
}

const getFallbackCommit = (owner: string, repo: string): CommitData => ({
  hash: 'demo1234567890abcdef',
  shortHash: 'demo123',
  message: `feat: improve ${repo} functionality`,
  date: new Date().toISOString(),
  url: `https://github.com/${owner}/${repo}/commits/main`,
  author: 'Demo User'
});

export const getLatestCommit = async (owner: string, repo: string): Promise<CommitData | null> => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  
  if (!token || token === 'your_github_token_here') {
    console.log('No GitHub token configured, using fallback data');
    return getFallbackCommit(owner, repo);
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/main`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Site'
      }
    });

    if (!response.ok) {
      console.warn('GitHub API request failed:', response.status);
      return getFallbackCommit(owner, repo);
    }

    const commit = await response.json();
    
    const commitData: CommitData = {
      hash: commit.sha,
      shortHash: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      date: commit.commit.committer.date,
      url: commit.html_url,
      author: commit.commit.author.name
    };

    return commitData;
  } catch (error) {
    console.error('Error fetching GitHub commit:', error);
    return getFallbackCommit(owner, repo);
  }
};
