
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
    * Get languages used across all repositories
    */
  async getLanguageStats(): Promise<Map<string, { count: number; repos: string[] }>> {
    try {
      const repos = await this.getUserRepositories('updated');

      const languageMap = new Map<string, { count: number; repos: string[] }>();

      repos.forEach((repo: GitHubRepo) => {
        const language = repo.language;
        if (!language) return;

        const existing = languageMap.get(language) || { count: 0, repos: [] };
        existing.count++;
        existing.repos.push(repo.name);

        languageMap.set(language, {
          count: existing.count + 1,
          repos: existing.repos
        });
      });

      return languageMap;
    } catch (error) {
      console.error('Error fetching language stats:', error);
      return new Map();
    }
  }

  /**
    * Get detailed GitHub events for a date range
    */
  async getDetailedEvents(startDate: string, endDate: string): Promise<GitHubDayActivity[]> {
    try {
      const allEvents: any[] = [];

      // Fetch up to 3 pages (300 events) to cover more history
      // GitHub Events API supports up to 300 events / 90 days windows
      for (let page = 1; page <= 3; page++) {
        const response = await fetch(
          `${this.baseUrl}/users/${this.username}/events?per_page=100&page=${page}`,
          {
            headers: this.getHeaders(),
            next: { revalidate: 300 } // Cache for 5 mins
          } as any
        );

        if (!response.ok) {
          // If page 1 fails, throw. If later pages fail (e.g. 404 for empty), just stop.
          if (page === 1) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
          break;
        }

        const events = await response.json();
        if (!Array.isArray(events) || events.length === 0) break;

        allEvents.push(...events);

        // Optimization: Stop if we've gone past the startDate (events are reverse chronological)
        const lastEvent = events[events.length - 1];
        const lastDate = new Date(lastEvent.created_at);
        if (lastDate < new Date(startDate)) break;
      }

      const activityMap = new Map<string, GitHubEventDetail[]>();

      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      for (const event of allEvents) {
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
   * Parse raw GitHub event into normalized detail format with natural language
   */
  private parseGitHubEvent(event: any): GitHubEventDetail | null {
    const repoName = event.repo.name.split('/').pop() || event.repo.name;
    const base = {
      id: event.id,
      timestamp: event.created_at,
      repository: event.repo.name,
      url: `https://github.com/${event.repo.name}`,
      isPrivate: event.public === false,
    };

    switch (event.type) {
      case 'PushEvent': {
        if (!event.payload) return null;
        let commitCount = 0;

        if (typeof event.payload.size === 'number') {
          commitCount = event.payload.size;
        } else if (event.payload.commits) {
          commitCount = event.payload.commits.length;
        }

        // Skip 0-commit pushes
        if (commitCount === 0) return null;

        const commitMsg = event.payload.commits?.[0]?.message?.split('\n')[0] || 'No commit message';
        const ref = event.payload.ref?.replace('refs/heads/', '') || '';
        return {
          ...base,
          type: 'commit',
          title: `pushed ${commitCount} commit${commitCount === 1 ? '' : 's'}${ref ? ` to ${ref}` : ''}`,
          description: commitMsg,
          url: `https://github.com/${event.repo.name}/commits/${event.payload.head}`,
          payload: event.payload
        };
      }

      case 'CreateEvent': {
        const refType = event.payload.ref_type || 'repository';
        const ref = event.payload.ref;

        if (refType === 'repository') {
          return {
            ...base,
            type: 'create',
            title: `created repository ${repoName}`,
            description: repoName,
            url: `https://github.com/${event.repo.name}`,
            payload: event.payload
          };
        } else if (refType === 'branch') {
          return {
            ...base,
            type: 'create',
            title: `created branch ${ref}`,
            description: `Branch: ${ref}`,
            url: `https://github.com/${event.repo.name}/tree/${ref}`,
            payload: event.payload
          };
        } else if (refType === 'tag') {
          return {
            ...base,
            type: 'create',
            title: `created tag ${ref}`,
            description: `Tag: ${ref}`,
            url: `https://github.com/${event.repo.name}/releases/tag/${ref}`,
            payload: event.payload
          };
        }
        return {
          ...base,
          type: 'create',
          title: `created a ${refType}`,
          description: ref || repoName,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      }

      case 'DeleteEvent': {
        const refType = event.payload.ref_type || 'ref';
        const ref = event.payload.ref;
        return {
          ...base,
          type: 'delete',
          title: `deleted ${refType} ${ref}`,
          description: `${refType}: ${ref}`,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      }

      case 'PullRequestEvent': {
        const action = event.payload.action;
        const prNumber = event.payload.number;
        const prTitle = event.payload.pull_request?.title?.trim() || '';
        const prBody = event.payload.pull_request?.body?.split('\n')[0]?.trim() || '';
        const branchName = event.payload.pull_request?.head?.ref || '';

        let verb = 'worked on';
        if (action === 'opened') verb = 'opened';
        else if (action === 'closed' && event.payload.pull_request?.merged) verb = 'merged';
        else if (action === 'merged') verb = 'merged';
        else if (action === 'closed') verb = 'closed';
        else if (action === 'reopened') verb = 'reopened';
        else if (action === 'synchronize') verb = 'updated';
        else if (action === 'edited') verb = 'edited';
        else if (action === 'review_requested') verb = 'requested review on';
        else if (action === 'ready_for_review') verb = 'marked ready';

        if (prTitle) {
          return {
            ...base,
            type: 'pr',
            title: `${verb} "${prTitle}"`,
            description: prBody || prTitle,
            url: event.payload.pull_request?.html_url || base.url,
            payload: event.payload
          };
        }

        const branchLabel = branchName
          .replace(/^(feat|feature|fix|chore|refactor|infra|docs|style|test|ci|build|perf)\//i, '')
          .replace(/[-_]/g, ' ')
          .trim();

        if (branchLabel) {
          return {
            ...base,
            type: 'pr',
            title: `${verb} "${branchLabel}"`,
            description: `PR #${prNumber} from ${branchName}`,
            url: event.payload.pull_request?.html_url || base.url,
            payload: event.payload
          };
        }

        return {
          ...base,
          type: 'pr',
          title: `${verb} PR #${prNumber}`,
          description: prBody || `Pull request #${prNumber}`,
          url: event.payload.pull_request?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'IssuesEvent': {
        const action = event.payload.action;
        const issueNumber = event.payload.issue?.number;
        const issueTitle = event.payload.issue?.title?.trim() || '';
        const issueBody = event.payload.issue?.body?.split('\n')[0]?.trim() || '';

        let verb = 'worked on';
        if (action === 'opened') verb = 'opened';
        else if (action === 'closed') verb = 'closed';
        else if (action === 'reopened') verb = 'reopened';
        else if (action === 'edited') verb = 'edited';
        else if (action === 'assigned') verb = 'assigned';
        else if (action === 'labeled') verb = 'labeled';
        else if (action === 'milestoned') verb = 'milestoned';
        else if (action === 'pinned') verb = 'pinned';

        // Show the issue title directly, not just issue #N
        if (issueTitle) {
          return {
            ...base,
            type: 'issue',
            title: `${verb} "${issueTitle}"`,
            description: issueBody || issueTitle,
            url: event.payload.issue?.html_url || base.url,
            payload: event.payload
          };
        }

        // Fallback if no title available
        return {
          ...base,
          type: 'issue',
          title: `${verb} issue #${issueNumber}`,
          description: issueBody || `Issue #${issueNumber}`,
          url: event.payload.issue?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'IssueCommentEvent': {
        const issueNumber = event.payload.issue?.number;
        const commentBody = event.payload.comment?.body?.split('\n')[0] || '';
        const isPR = !!event.payload.issue?.pull_request;

        return {
          ...base,
          type: 'issue',
          title: `commented on ${isPR ? 'PR' : 'issue'} #${issueNumber}`,
          description: commentBody.substring(0, 100) + (commentBody.length > 100 ? '...' : ''),
          url: event.payload.comment?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'PullRequestReviewEvent': {
        const prNumber = event.payload.pull_request?.number;
        const prTitle = event.payload.pull_request?.title?.trim() || '';
        const reviewState = event.payload.review?.state;
        const reviewBody = event.payload.review?.body?.split('\n')[0]?.trim() || '';

        let verb = 'reviewed';
        if (reviewState === 'approved') verb = 'approved';
        else if (reviewState === 'changes_requested') verb = 'requested changes on';
        else if (reviewState === 'commented') verb = 'commented on';
        else if (reviewState === 'dismissed') verb = 'dismissed review on';

        // Show the PR title directly
        if (prTitle) {
          return {
            ...base,
            type: 'review',
            title: `${verb} "${prTitle}"`,
            description: reviewBody || prTitle,
            url: event.payload.review?.html_url || event.payload.pull_request?.html_url || base.url,
            payload: event.payload
          };
        }

        // Fallback if no title available
        return {
          ...base,
          type: 'review',
          title: `${verb} PR #${prNumber}`,
          description: reviewBody || `Review on PR #${prNumber}`,
          url: event.payload.review?.html_url || event.payload.pull_request?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'PullRequestReviewCommentEvent': {
        const prNumber = event.payload.pull_request?.number;
        const prTitle = event.payload.pull_request?.title?.trim() || '';
        const commentBody = event.payload.comment?.body?.split('\n')[0]?.trim() || '';
        const filePath = event.payload.comment?.path?.split('/').pop() || '';

        // Prefer showing what was reviewed (file or PR title) over just the number
        if (filePath && prTitle) {
          return {
            ...base,
            type: 'review',
            title: `reviewed ${filePath} in "${prTitle}"`,
            description: commentBody || prTitle,
            url: event.payload.comment?.html_url || base.url,
            payload: event.payload
          };
        } else if (prTitle) {
          return {
            ...base,
            type: 'review',
            title: `reviewed code in "${prTitle}"`,
            description: commentBody || prTitle,
            url: event.payload.comment?.html_url || base.url,
            payload: event.payload
          };
        }

        // Fallback
        return {
          ...base,
          type: 'review',
          title: `reviewed code in PR #${prNumber}`,
          description: commentBody || `Review on PR #${prNumber}`,
          url: event.payload.comment?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'ReleaseEvent': {
        const releaseName = event.payload.release?.name || event.payload.release?.tag_name || '';
        return {
          ...base,
          type: 'release',
          title: 'published a release',
          description: releaseName,
          url: event.payload.release?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'WatchEvent': {
        return {
          ...base,
          type: 'star',
          title: 'starred it',
          description: repoName,
          url: `https://github.com/${event.repo.name}`,
          payload: event.payload
        };
      }

      case 'ForkEvent': {
        const forkName = event.payload.forkee?.full_name || '';
        return {
          ...base,
          type: 'fork',
          title: 'forked it',
          description: forkName,
          url: event.payload.forkee?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'GollumEvent': {
        // Wiki page edits
        const pages = event.payload.pages || [];
        const action = pages[0]?.action === 'created' ? 'created' : 'edited';
        const pageName = pages[0]?.page_name || 'wiki';
        return {
          ...base,
          type: 'unknown',
          title: `${action} wiki page`,
          description: pageName,
          url: pages[0]?.html_url || base.url,
          payload: event.payload
        };
      }

      case 'MemberEvent': {
        const memberLogin = event.payload.member?.login || '';
        const action = event.payload.action === 'added' ? 'added' : 'removed';
        return {
          ...base,
          type: 'unknown',
          title: `${action} a collaborator`,
          description: memberLogin,
          url: base.url,
          payload: event.payload
        };
      }

      case 'PublicEvent': {
        return {
          ...base,
          type: 'unknown',
          title: 'made repository public',
          description: repoName,
          url: base.url,
          payload: event.payload
        };
      }

      case 'CommitCommentEvent': {
        const commitId = event.payload.comment?.commit_id?.substring(0, 7) || '';
        const commentBody = event.payload.comment?.body?.split('\n')[0] || '';
        return {
          ...base,
          type: 'commit',
          title: `commented on commit ${commitId}`,
          description: commentBody.substring(0, 100) + (commentBody.length > 100 ? '...' : ''),
          url: event.payload.comment?.html_url || base.url,
          payload: event.payload
        };
      }

      default:
        // Skip unknown events or make them more readable
        const typeName = event.type.replace('Event', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        return {
          ...base,
          type: 'unknown',
          title: typeName,
          description: repoName,
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
          next: { revalidate: 60 }
        } as any
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();
      const details: GitHubEventDetail[] = [];

      for (const event of events) {
        const detail = this.parseGitHubEvent(event);
        if (detail) {
          details.push(detail);
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
  type: 'commit' | 'pr' | 'issue' | 'review' | 'release' | 'fork' | 'star' | 'create' | 'delete' | 'unknown';
  title: string;
  description: string;
  url: string;
  repository: string;
  timestamp: string;
  isPrivate: boolean;
  icon?: string;
  payload?: any;
}

export interface GitHubDayActivity {
  date: string;
  events: GitHubEventDetail[];
  totalCount: number;
}