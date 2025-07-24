export interface AnalyticsEvent {
  id: string;
  eventType: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface PageView extends AnalyticsEvent {
  eventType: 'page_view';
  page: string;
}

export interface ButtonClick extends AnalyticsEvent {
  eventType: 'button_click';
  data: {
    buttonText: string;
    buttonId?: string;
    section?: string;
  };
}

export interface ProjectView extends AnalyticsEvent {
  eventType: 'project_view';
  data: {
    projectId: string;
    projectTitle: string;
  };
}

export interface ContactFormSubmission extends AnalyticsEvent {
  eventType: 'contact_form_submission';
  data: {
    success: boolean;
    errors?: string[];
  };
}

export interface SkillHover extends AnalyticsEvent {
  eventType: 'skill_hover';
  data: {
    skillName: string;
    skillCategory: string;
  };
}

export interface ScrollDepth extends AnalyticsEvent {
  eventType: 'scroll_depth';
  data: {
    depth: number; // percentage
    section?: string;
  };
}

export interface SessionStart extends AnalyticsEvent {
  eventType: 'session_start';
  data: {
    timezone: string;
    screenWidth: number;
    screenHeight: number;
    userAgent: string;
  };
}

export interface ExternalLinkClick extends AnalyticsEvent {
  eventType: 'external_link_click';
  data: {
    url: string;
    linkText: string;
    section?: string;
  };
}

export type AnalyticsEventType = 
  | PageView
  | ButtonClick
  | ProjectView
  | ContactFormSubmission
  | SkillHover
  | ScrollDepth
  | SessionStart
  | ExternalLinkClick;

export interface AnalyticsMetrics {
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
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  page?: string;
  eventType?: string;
}

export interface RealTimeMetrics {
  activeUsers: number;
  currentPageViews: Array<{
    page: string;
    activeUsers: number;
  }>;
  recentEvents: AnalyticsEvent[];
}
