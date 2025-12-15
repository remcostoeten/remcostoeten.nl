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

        return {
          ...base,
          type: 'commit',
          title: `Pushed ${commitCount} commit${commitCount === 1 ? '' : 's'} to ${event.payload.ref?.replace('refs/heads/', '') || 'branch'}`,
          description: event.payload.commits?.[0]?.message || 'No commit message',
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
        return {
          ...base,
          type: 'pr',
          title: `${event.payload.action === 'opened' ? 'Opened' : 'Closed'} PR #${event.payload.number}`,
          description: event.payload.pull_request.title,
          url: event.payload.pull_request.html_url,
          payload: event.payload
        };
      case 'IssuesEvent':
        return {
          ...base,
          type: 'issue',
          title: `${event.payload.action === 'opened' ? 'Opened' : 'Closed'} Issue #${event.payload.issue.number}`,
          description: event.payload.issue.title,
          url: event.payload.issue.html_url,
          payload: event.payload
        };
      case 'PullRequestReviewEvent':
        return {
          ...base,
          type: 'review',
          title: 'Reviewed Pull Request',
          description: event.payload.pull_request.title,
          url: event.payload.review.html_url,
          payload: event.payload
        };
      case 'ReleaseEvent':
        return {
          ...base,
          type: 'release',
          title: 'Published Release',
          description: event.payload.release.name || event.payload.release.tag_name,
          url: event.payload.release.html_url,
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
        return {
          ...base,
          type: 'fork',
          title: `Forked ${event.repo.name}`,
          description: `Forked to ${event.payload.forkee.full_name}`,
          url: event.payload.forkee.html_url,
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
