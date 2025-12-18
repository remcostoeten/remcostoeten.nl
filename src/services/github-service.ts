interface GitHubEventDetail {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'review' | 'release' | 'fork' | 'star' | 'create' | 'unknown';
  title: string;
  description: string;
  url: string;
  repository: string;
  timestamp: string;
  icon?: string;
  payload?: any;
}

class GitHubService {
  private token: string;
  private baseUrl = 'https://api.github.com';
  private username: string;

  constructor() {
    this.token = this.getGitHubToken();
    if (!this.token) {
      console.warn('GitHub token not found in environment variables');
    }
    this.username = 'remcostoeten';
  }

  private getGitHubToken(): string {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
    if (token) {
      return token.trim();
    }
    return '';
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Parse raw GitHub event into normalized detail format
   */
  private parseGitHubEvent(event: any): GitHubEventDetail | null {
    const base = {
      id: event.id,
      timestamp: event.created_at,
      repository: event.repo.name,
      url: `https://github.com/${event.repo.name}`,
    };

    switch (event.type) {
      case 'PushEvent':
        if (!event.payload) return null;
        let commitCount = 0;

        if (typeof event.payload.size === 'number') {
          commitCount = event.payload.size;
        } else if (event.payload.commits) {
          commitCount = event.payload.commits.length;
        }

        if (commitCount === 0) return null;

        const branchName = event.payload.ref?.replace('refs/heads/', '') || 'branch';
        const commitMessage = event.payload.commits?.[0]?.message || 'No commit message';
        const shortMessage = commitMessage.split('\n')[0].trim();

        return {
          ...base,
          type: 'commit',
          title: `Pushed ${commitCount} commit${commitCount === 1 ? '' : 's'} to ${branchName}`,
          description: shortMessage || `Updated ${branchName} branch`,
          url: `https://github.com/${event.repo.name}/commits/${event.payload.head}`,
          payload: event.payload
        };
      case 'CreateEvent':
        return {
          ...base,
          type: 'create',
          title: `Created ${event.payload.ref_type} ${event.payload.ref || ''}`,
          description: `Created new ${event.payload.ref_type} in ${event.repo.name}`,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      case 'PullRequestEvent':
        const prAction = event.payload.action;
        const prNumber = event.payload.number;
        const prTitle = event.payload.pull_request?.title || 'No title';
        const prState = event.payload.pull_request?.state || 'unknown';
        
        let actionText = prAction;
        if (prAction === 'closed') {
          actionText = event.payload.pull_request?.merged ? 'Merged' : 'Closed';
        }
        
        return {
          ...base,
          type: 'pr',
          title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} PR #${prNumber}`,
          description: prTitle,
          url: event.payload.pull_request?.html_url || `https://github.com/${event.repo.name}/pull/${prNumber}`,
          payload: event.payload
        };
      case 'IssuesEvent':
        const issueAction = event.payload.action;
        const issueNumber = event.payload.issue?.number || 'unknown';
        const issueTitle = event.payload.issue?.title || 'No title';
        
        return {
          ...base,
          type: 'issue',
          title: `${issueAction.charAt(0).toUpperCase() + issueAction.slice(1)} Issue #${issueNumber}`,
          description: issueTitle,
          url: event.payload.issue?.html_url || `https://github.com/${event.repo.name}/issues/${issueNumber}`,
          payload: event.payload
        };
      case 'PullRequestReviewEvent':
        const reviewPrTitle = event.payload.pull_request?.title || 'No title';
        const reviewState = event.payload.review?.state || 'unknown';
        const reviewAction = reviewState === 'approved' ? 'Approved' : 
                           reviewState === 'changes_requested' ? 'Requested changes on' : 
                           'Reviewed';
        
        return {
          ...base,
          type: 'review',
          title: `${reviewAction} Pull Request`,
          description: reviewPrTitle,
          url: event.payload.review?.html_url || event.payload.pull_request?.html_url || `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      case 'ReleaseEvent':
        const releaseName = event.payload.release?.name;
        const releaseTag = event.payload.release?.tag_name;
        const releaseTitle = releaseName || releaseTag || 'No title';
        
        return {
          ...base,
          type: 'release',
          title: 'Published Release',
          description: releaseTitle,
          url: event.payload.release?.html_url || `https://github.com/${event.repo.name}/releases`,
          payload: event.payload
        };
      case 'WatchEvent':
        return {
          ...base,
          type: 'star',
          title: `Starred ${event.repo.name}`,
          description: 'Added to favorites',
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      case 'ForkEvent':
        const forkedTo = event.payload.forkee?.full_name || 'unknown repository';
        
        return {
          ...base,
          type: 'fork',
          title: `Forked ${event.repo.name}`,
          description: `Forked to ${forkedTo}`,
          url: event.payload.forkee?.html_url || `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      default:
        return {
          ...base,
          type: 'unknown',
          title: event.type.replace('Event', ''),
          description: event.repo.name,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
    }
  }

  /**
   * Get recent activity for the feed component
   */
  async getRecentActivity(limit: number = 10): Promise<GitHubEventDetail[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${this.username}/events?per_page=50`,
        {
          headers: this.getHeaders(),
          next: { revalidate: 60 } // Cache for 1 min
        } as any
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();
      const details: GitHubEventDetail[] = [];
      const seenRepos = new Set<string>();

      for (const event of events) {
        if (!seenRepos.has(event.repo.name)) {
          const detail = this.parseGitHubEvent(event);
          if (detail) {
            details.push(detail);
            seenRepos.add(event.repo.name);
          }
        }
        if (details.length >= limit) break;
      }

      return details;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

export const githubService = new GitHubService();
export type { GitHubEventDetail };
