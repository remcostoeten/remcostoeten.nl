import { getSessionId } from '@/lib/session';
import { API, apiFetch } from '@/config/api.config';

// Service for handling view counts with backend integration
export interface ViewCount {
  slug: string;
  totalViews: number;
  uniqueViews: number;
}

export interface RecordViewResponse {
  success: boolean;
  data: {
    isNewView: boolean;
    view?: any;
  };
  message: string;
}

export class ViewsService {
  // Track which posts have been viewed in this session to prevent duplicate increments
  private static viewedInSession = new Set<string>();

  // Get view count for a specific post
  static async getViewCount(slug: string): Promise<ViewCount> {
    try {
      const result = await apiFetch(API.blog.analytics.get(slug));

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view count');
      }

      // Transform the analytics data to ViewCount format
      // Backend returns 'totalViews', map it to our ViewCount interface
      const analytics = result.data.data || result.data;
      return {
        slug,
        totalViews: analytics.totalViews || analytics.viewCount || analytics.views || 0,
        uniqueViews: analytics.uniqueViews || 0
      };
    } catch (error) {
      console.error(`Error fetching view count for ${slug}:`, error);
      return {
        slug,
        totalViews: 0,
        uniqueViews: 0
      };
    }
  }

  // Record a view for a post (only increments if new session)
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

      // Use the correct analytics increment endpoint
      const result = await apiFetch(API.blog.analytics.increment(slug), {
        method: 'POST',
        headers: {
          'X-Session-ID': getSessionId(),
          'X-User-Agent': typeof window !== 'undefined' ? navigator.userAgent : '',
          'X-Referrer': typeof window !== 'undefined' ? document.referrer : '',
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to record view');
      }

      // Mark as viewed in this session
      this.viewedInSession.add(slug);

      // Get updated view count
      const viewCount = await this.getViewCount(slug);

      return {
        success: true,
        isNewView: true,
        viewCount
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

      const result = await apiFetch(API.blog.analytics.multiple(), {
        method: 'POST',
        body: JSON.stringify({ slugs }),
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view counts');
      }

      const viewCounts: Record<string, ViewCount> = {};

      // Handle the response format from the backend
      const dataArray = Array.isArray(result.data) ? result.data : result.data.data || [];

      dataArray.forEach((item: any) => {
        viewCounts[item.slug] = {
          slug: item.slug,
          totalViews: item.totalViews || 0,
          uniqueViews: item.uniqueViews || 0
        };
      });

      // Ensure all requested slugs have entries
      slugs.forEach(slug => {
        if (!viewCounts[slug]) {
          viewCounts[slug] = {
            slug,
            totalViews: 0,
            uniqueViews: 0
          };
        }
      });

      return viewCounts;
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

  // Get blog view statistics
  static async getStats(): Promise<any> {
    try {
      const result = await apiFetch(API.blog.views.stats());

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching blog view stats:', error);
      return null;
    }
  }
}