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
  // Get view count for a specific post
  static async getViewCount(slug: string): Promise<ViewCount> {
    try {
      const result = await apiFetch(API.blog.analytics.get(slug));
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view count');
      }
      
      // Transform the analytics data to ViewCount format
      const analytics = result.data.data || result.data;
      return {
        slug,
        totalViews: analytics.viewCount || analytics.views || 0,
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
      // Use the analytics increment endpoint that actually exists
      const result = await apiFetch(API.blog.analytics.increment(slug), {
        method: 'POST',
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to record view');
      }

      // Get updated view count
      const viewCount = await this.getViewCount(slug);
      
      return {
        success: true,
        isNewView: true, // Assume it's a new view since we incremented
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

      const result = await apiFetch<ViewCount[]>(API.blog.analytics.multiple(), {
        method: 'POST',
        body: JSON.stringify({ slugs }),
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch view counts');
      }

      const viewCounts: Record<string, ViewCount> = {};
      
      // Handle both array and object responses
      const dataArray = Array.isArray(result.data) ? result.data : [result.data];
      
      dataArray.forEach((viewCount: ViewCount) => {
        viewCounts[viewCount.slug] = viewCount;
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