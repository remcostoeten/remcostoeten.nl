
interface GitHubContributionDay {
  date: string;
  contributionCount: number;
  contributionTypes?: {
    [key: string]: number;
  };
}

interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
  firstDay: string;
}

interface GitHubContributionData {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
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
  repository: {
    name: string;
    url: string;
  };
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
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
    this.username = 'remcostoeten'; // Change this to your GitHub username
  }

  private getGitHubToken(): string {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
    if (token) {
      // console.log('GitHub token loaded:', token.substring(0, 4) + '...');
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
   * Fetch the user's GitHub contribution data for a given year
   * This mimics the data structure used in GitHub's contribution graph
   */
  async getYearlyContributions(year: number = new Date().getFullYear()): Promise<GitHubContributionData> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            name
            contributionsCollection(from: $from, to: $to) {
              totalIssueContributions
              totalCommitContributions
              totalRepositoryContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
              contributionCalendar {
                totalContributions
                weeks {
                  firstDay
                  contributionDays {
                    date
                    contributionCount
                    color
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        username: this.username,
        from: startDate.toISOString(),
        to: endDate.toISOString()
      };

      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error('GraphQL query failed');
      }

      const calendar = data.data.user.contributionsCollection.contributionCalendar;
      if (calendar.totalContributions === 0) {
        console.warn('GitHub Graph: 0 contributions returned. Check username and token scopes.');
      } else {
        // console.log(`GitHub Graph: Fetched ${calendar.totalContributions} contributions`);
      }

      return {
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks.map((week: any) => ({
          firstDay: week.firstDay,
          contributionDays: week.contributionDays.map((day: any) => ({
            date: day.date,
            contributionCount: day.contributionCount,
            contributionTypes: day.contributionTypes
          }))
        }))
      };

    } catch (error) {
      console.error('Error fetching GitHub contributions:', error);
      return {
        totalContributions: 0,
        weeks: []
      };
    }
  }

  /**
   * Get daily contribution data as a flat map for easier processing
   */
  async getDailyContributions(year: number = new Date().getFullYear()): Promise<Map<string, GitHubContributionDay>> {
    const yearlyData = await this.getYearlyContributions(year);
    const dailyMap = new Map<string, GitHubContributionDay>();

    yearlyData.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        dailyMap.set(day.date, day);
      });
    });

    return dailyMap;
  }

  /**
   * Get contribution count for a specific date
   */
  async getContributionCountForDate(date: string): Promise<number> {
    const year = new Date(date).getFullYear();
    const dailyContributions = await this.getDailyContributions(year);
    const dayData = dailyContributions.get(date);
    return dayData?.contributionCount || 0;
  }

  /**
   * Get total contributions for the current year
   */
  async getCurrentYearContributions(): Promise<number> {
    const year = new Date().getFullYear();
    const yearlyData = await this.getYearlyContributions(year);
    return yearlyData.totalContributions;
  }

  /**
   * Get contributions for the last N days
   */
  async getRecentContributions(days: number = 30): Promise<GitHubContributionDay[]> {
    const dailyContributions = await this.getDailyContributions();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const recentDays: GitHubContributionDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyContributions.get(dateStr);
      recentDays.push(dayData || {
        date: dateStr,
        contributionCount: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return recentDays;
  }

  /**
   * Get contribution statistics for a date range
   */
  async getContributionStats(startDate: string, endDate: string): Promise<{
    totalContributions: number;
    activeDays: number;
    averagePerDay: number;
    maxContributionDay: { date: string; count: number };
  }> {
    const dailyContributions = await this.getDailyContributions();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let totalContributions = 0;
    let activeDays = 0;
    let maxCount = 0;
    let maxDate = '';

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyContributions.get(dateStr);
      const count = dayData?.contributionCount || 0;

      totalContributions += count;
      if (count > 0) activeDays++;

      if (count > maxCount) {
        maxCount = count;
        maxDate = dateStr;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      totalContributions,
      activeDays,
      averagePerDay: totalContributions / totalDays,
      maxContributionDay: { date: maxDate, count: maxCount }
    };
  }

  /**
   * Fetch recent commits for activity display
   */
  async getRecentCommits(limit: number = 10): Promise<GitHubCommit[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${this.username}/events?per_page=${limit}`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();
      const commits: GitHubCommit[] = [];

      for (const event of events) {
        if (event.type === 'PushEvent' && event.payload.commits) {
          for (const commit of event.payload.commits) {
            commits.push({
              sha: commit.sha.substring(0, 7),
              message: commit.message,
              author: {
                name: event.actor.login,
                email: event.payload.commits[0].author?.email || '',
                date: event.created_at
              },
              url: commit.url,
              repository: {
                name: event.repo.name,
                url: `https://github.com/${event.repo.name}`
              }
            });
          }
        }
      }

      return commits.slice(0, limit);

    } catch (error) {
      console.error('Error fetching recent commits:', error);
      return [];
    }
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(sort: 'updated' | 'created' | 'pushed' | 'stars' = 'updated'): Promise<GitHubRepo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${this.username}/repos?sort=${sort}&per_page=100`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  /**
   * Get contribution streak information
   */
  async getContributionStreak(): Promise<{
    currentStreak: number;
    longestStreak: number;
    startDate?: string;
  }> {
    const dailyContributions = await this.getDailyContributions();
    const dates = Array.from(dailyContributions.keys()).sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let startDate: string | undefined;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      const contribution = dailyContributions.get(date);

      if (contribution && contribution.contributionCount > 0) {
        if (!startDate) startDate = date;
        currentStreak++;
      } else {
        break;
      }
    }

    for (const date of dates) {
      const contribution = dailyContributions.get(date);
      if (contribution && contribution.contributionCount > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      currentStreak,
      longestStreak,
      startDate
    };
  }
  /**
   * Get detailed GitHub events for a date range
   */
  async getDetailedEvents(startDate: string, endDate: string): Promise<GitHubDayActivity[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${this.username}/events?per_page=100`, // Fetch sufficient events
        {
          headers: this.getHeaders(),
          next: { revalidate: 300 } // Cache for 5 mins
        } as any
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();
      const activityMap = new Map<string, GitHubEventDetail[]>();

      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      for (const event of events) {
        const eventDate = new Date(event.created_at);
        if (eventDate < start || eventDate > end) continue;

        const dateStr = eventDate.toISOString().split('T')[0];
        const detail = this.parseGitHubEvent(event);

        if (detail) {
          const current = activityMap.get(dateStr) || [];
          current.push(detail);
          activityMap.set(dateStr, current);
        }
      }

      // Fill in all days in range
      const result: GitHubDayActivity[] = [];
      const current = new Date(start);
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayEvents = activityMap.get(dateStr) || [];
        result.push({
          date: dateStr,
          events: dayEvents,
          totalCount: dayEvents.length
        });
        current.setDate(current.getDate() + 1);
      }

      return result;

    } catch (error) {
      console.error('Error fetching detailed events:', error);
      return [];
    }
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

        // Skip 0-commit pushes (usually branch creation/deletion which are covered by Create/Delete events, or empty pushes)
        if (commitCount === 0) return null;

        return {
          ...base,
          type: 'commit',
          title: `Pushed ${commitCount} commit${commitCount === 1 ? '' : 's'}`,
          description: event.payload.commits?.[0]?.message || 'No commit message',
          url: `https://github.com/${event.repo.name}/commits/${event.payload.head}`,
          payload: event.payload
        };
      case 'CreateEvent':
        return {
          ...base,
          type: 'create', // You might need to add this to the type definition if strict
          title: `Created ${event.payload.ref_type || 'repository'}`,
          description: event.payload.ref || event.repo.name,
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
          title: 'Starred Repository',
          description: event.repo.name,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      case 'ForkEvent':
        return {
          ...base,
          type: 'fork',
          title: 'Forked Repository',
          description: event.payload.forkee.full_name,
          url: event.payload.forkee.html_url,
          payload: event.payload
        };
      default:
        // Include other events as unknown or generic activity
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
        `${this.baseUrl}/users/${this.username}/events?per_page=50`, // Fetch sufficient info to filter by unique repos
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
export type {
  GitHubContributionDay,
  GitHubContributionWeek,
  GitHubContributionData,
  GitHubCommit,
  GitHubRepo
};

export interface GitHubEventDetail {
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

export interface GitHubDayActivity {
  date: string;
  events: GitHubEventDetail[];
  totalCount: number;
}