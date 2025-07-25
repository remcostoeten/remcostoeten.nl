export type TAnalyticsEvent = {
  id: string;
  eventType: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  userId?: string;
  data?: Record<string, string | number | boolean | string[]>;
  timestamp: Date;
  country?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
}

export type TPageView = TAnalyticsEvent & {
  eventType: 'page_view';
  page: string;
}

export type TButtonClick = TAnalyticsEvent & {
  eventType: 'button_click';
  data: {
    buttonText: string;
    buttonId?: string;
    section?: string;
  };
}

export type TProjectView = TAnalyticsEvent & {
  eventType: 'project_view';
  data: {
    projectId: string;
    projectTitle: string;
  };
}

export type TContactFormSubmission = TAnalyticsEvent & {
  eventType: 'contact_form_submission';
  data: {
    success: boolean;
    errors?: string[];
  };
}

export type TPageCompleted = TAnalyticsEvent & {
  eventType: 'page_completed';
  data: {
    timeOnPage: number;
    section?: string;
  };
}

export type TSessionStart = TAnalyticsEvent & {
  eventType: 'session_start';
  data: {
    timezone: string;
    screenWidth: number;
    screenHeight: number;
    userAgent: string;
  };
}

export type TExternalLinkClick = TAnalyticsEvent & {
  eventType: 'external_link_click';
  data: {
    url: string;
    linkText: string;
    section?: string;
  };
}

export type TAnalyticsEventType = 
  | TPageView
  | TButtonClick
  | TProjectView
  | TContactFormSubmission
  | TPageCompleted
  | TSessionStart
  | TExternalLinkClick;

export type TAnalyticsMetrics = {
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    visits: number;
  }>;
  deviceTypes: Array<{
    type: string;
    count: number;
  }>;
  popularProjects: Array<{
    projectId: string;
    projectTitle: string;
    views: number;
  }>;
  contactFormStats: {
    submissions: number;
    successRate: number;
  };
  hourlyActivity: Array<{
    hour: number;
    count: number;
  }>;
  dailyActivity: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
  }>;
  topCountries: Array<{
    country: string;
    visits: number;
    percentage: number;
  }>;
  topRegions: Array<{
    region: string;
    country: string;
    visits: number;
  }>;
  topCities: Array<{
    city: string;
    region: string;
    country: string;
    visits: number;
  }>;
}

export type TAnalyticsFilters = {
  startDate?: Date;
  endDate?: Date;
  page?: string;
  eventType?: string;
}

export type TRealTimeMetrics = {
  activeUsers: number;
  activeSessions?: number; // Optional for backward compatibility
  currentPageViews: Array<{
    page: string;
    activeUsers: number;
  }>;
  recentEvents: TAnalyticsEvent[];
}
