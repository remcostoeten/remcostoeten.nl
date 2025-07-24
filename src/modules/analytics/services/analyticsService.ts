import type { 
  AnalyticsEvent, 
  AnalyticsMetrics, 
  AnalyticsFilters,
  RealTimeMetrics 
} from '../types';

export class AnalyticsService {
  private static readonly API_BASE = '/api/analytics';

  // Track a new analytics event
  static async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  // Get analytics metrics with filters
  static async getMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.page) params.append('page', filters.page);
      if (filters?.eventType) params.append('eventType', filters.eventType);

      const response = await fetch(`${this.API_BASE}/metrics?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics metrics:', error);
      // Return empty metrics as fallback
      return {
        totalPageViews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        topPages: [],
        topReferrers: [],
        deviceTypes: [],
        popularProjects: [],
        contactFormStats: { submissions: 0, successRate: 0 },
        hourlyActivity: [],
        dailyActivity: []
      };
    }
  }

  // Get real-time metrics
  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(`${this.API_BASE}/realtime`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
      return {
        activeUsers: 0,
        currentPageViews: [],
        recentEvents: []
      };
    }
  }

  // Get events with pagination
  static async getEvents(
    page: number = 1, 
    limit: number = 50, 
    filters?: AnalyticsFilters
  ) {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters?.page) params.append('filterPage', filters.page);
      if (filters?.eventType) params.append('eventType', filters.eventType);

      const response = await fetch(`${this.API_BASE}/events?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics events:', error);
      return {
        events: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  // Helper method to categorize device types from user agents
  private static categorizeDeviceTypes(userAgents: string[]) {
    const categories = {
      'Desktop': 0,
      'Mobile': 0,
      'Tablet': 0,
      'Unknown': 0
    };

    userAgents.forEach(ua => {
      if (!ua) {
        categories.Unknown++;
        return;
      }

      const lowerUA = ua.toLowerCase();
      
      if (lowerUA.includes('mobile') || lowerUA.includes('android') || lowerUA.includes('iphone')) {
        categories.Mobile++;
      } else if (lowerUA.includes('tablet') || lowerUA.includes('ipad')) {
        categories.Tablet++;
      } else if (lowerUA.includes('mozilla') || lowerUA.includes('chrome') || lowerUA.includes('safari')) {
        categories.Desktop++;
      } else {
        categories.Unknown++;
      }
    });

    return Object.entries(categories).map(([type, count]) => ({
      type,
      count
    }));
  }
}
