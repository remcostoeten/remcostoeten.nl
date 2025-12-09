
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
    return (
      process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN ||
      ''
    );
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
}

export const githubService = new GitHubService();

export type {
  GitHubContributionDay,
  GitHubContributionWeek,
  GitHubContributionData,
  GitHubCommit,
  GitHubRepo
};