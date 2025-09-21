export interface Pageview {
  id: string;
  url: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

export interface CreatePageviewData {
  url: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}

export interface PageviewFilters {
  limit?: number;
  offset?: number;
  url?: string;
}

export interface PageviewStats {
  total: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  uniqueUrls: number;
  topPages: Array<{
    url: string;
    count: number;
  }>;
}
