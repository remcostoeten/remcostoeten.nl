import { getSessionId } from '@/lib/session';

// Service for handling view counts with Next.js API integration
export interface ViewCount {
  slug: string;
  totalViews: number;
  uniqueViews: number;
  lastUpdated?: string;
}

export interface RecordViewResponse {
  success: boolean;
  data: {
    isNewView: boolean;
    viewCount: ViewCount;
  };
}

export class ViewsService {
  // Track which posts have been viewed in this session to prevent duplicate increments
  private static viewedInSession = new Set<string>();

  // Get view count for a specific post
  static async getViewCount(slug: string): Promise<ViewCount> {
    try {
      const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view count');
      }

      return result.data as ViewCount;
    } catch (error) {
      console.error(`Error fetching view count for ${slug}:`, error);
      return {
        slug,
        totalViews: 0,
        uniqueViews: 0
      };
    }
  }

  // Record a view for a post
  static async recordView(slug: string): Promise<{ success: boolean; isNewView: boolean; viewCount: ViewCount }> {
    try {
      // Check if we've already viewed this post in this session
      if (this.viewedInSession.has(slug)) {
        const viewCount = await this.getViewCount(slug);
        return {
          success: true,
          isNewView: false,
          viewCount
        };
      }

      const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': getSessionId(),
          'X-User-Agent': typeof window !== 'undefined' ? navigator.userAgent : '',
          'X-Referrer': typeof window !== 'undefined' ? document.referrer : '',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to record view');
      }

      // Mark as viewed in this session
      this.viewedInSession.add(slug);

      return {
        success: true,
        isNewView: result.data.isNewView,
        viewCount: result.data.viewCount
      };
    } catch (error) {
      console.error(`Error recording view for ${slug}:`, error);

      // Fallback: still try to get current count
      const viewCount = await this.getViewCount(slug);

      return {
        success: false,
        isNewView: false,
        viewCount
      };
    }
  }

  // Get view counts for multiple posts
  static async getMultipleViewCounts(slugs: string[]): Promise<Record<string, ViewCount>> {
    try {
      if (slugs.length === 0) return {};

      const response = await fetch(`/api/views?slugs=${slugs.map(encodeURIComponent).join(',')}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view counts');
      }

      return result.data as Record<string, ViewCount>;
    } catch (error) {
      console.error('Error fetching multiple view counts:', error);

      // Fallback: return empty counts for all slugs
      const viewCounts: Record<string, ViewCount> = {};
      slugs.forEach(slug => {
        viewCounts[slug] = {
          slug,
          totalViews: 0,
          uniqueViews: 0
        };
      });

      return viewCounts;
    }
  }

  // Format view count for display
  static formatViewCount(viewCount: ViewCount | number): string {
    const count = typeof viewCount === 'number' ? viewCount : viewCount.totalViews;

    if (count === 0) return '0 views';
    if (count === 1) return '1 view';
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  }
}