import type { 
  TAnalyticsEvent, 
  TAnalyticsMetrics, 
  TAnalyticsFilters,
  TRealTimeMetrics 
} from './types';

export class AnalyticsService {
  private static readonly API_BASE = 
    typeof window !== 'undefined' && (
      (import.meta?.env?.DEV || window.location.hostname === 'localhost')
        ? `http://localhost:${import.meta?.env?.VITE_API_PORT || '3003'}/api/analytics`
        : '/api/analytics'
    );

  static async trackEvent(event: Omit<TAnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
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
    }
  }

  static async getMetrics(filters?: TAnalyticsFilters): Promise<TAnalyticsMetrics> {
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

  static async getRealTimeMetrics(): Promise<TRealTimeMetrics> {
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

  static async getEvents(
    page: number = 1, 
    limit: number = 50, 
    filters?: TAnalyticsFilters
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
}
