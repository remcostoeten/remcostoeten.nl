"use client";

import { useMemo } from 'react';
import { API, apiFetch } from '@/config/api.config';

type TVisitorData = {
  userAgent: string;
  acceptLanguage: string;
  screenResolution: string;
  timezone: string;
  platform: string;
};

function getVisitorData(): TVisitorData {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server',
      acceptLanguage: 'en',
      screenResolution: '1920x1080',
      timezone: 'UTC',
      platform: 'server',
    };
  }
  
  return {
    userAgent: navigator.userAgent,
    acceptLanguage: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
  };
}

function generateVisitorId(data: TVisitorData): string {
  if (typeof window === 'undefined') {
    return 'server-id';
  }
  
  // Try to get existing visitor ID from localStorage first
  const existingId = localStorage.getItem('blog-visitor-id');
  if (existingId) {
    return existingId;
  }
  
  // Generate new ID - use crypto.randomUUID if available, fallback to fingerprint
  let newId: string;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    newId = crypto.randomUUID();
  } else {
    // Fallback fingerprinting for older browsers
    const fingerprint = [
      data.userAgent,
      data.acceptLanguage,
      data.screenResolution,
      data.timezone,
      data.platform,
      Date.now().toString(), // Add timestamp to make it unique
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    newId = Math.abs(hash).toString(16).substring(0, 16);
  }
  
  // Store in localStorage for persistence
  localStorage.setItem('blog-visitor-id', newId);
  return newId;
}

export function useVisitorTracking() {
  const visitorData = useMemo(() => getVisitorData(), []);
  const visitorId = useMemo(() => generateVisitorId(visitorData), [visitorData]);

  return useMemo(() => ({
    async trackVisitor() {
      const result = await apiFetch(API.visitors.track(), {
        method: 'POST',
        headers: {
          'X-Screen-Resolution': visitorData.screenResolution,
          'X-Timezone': visitorData.timezone,
          'X-Platform': visitorData.platform,
        },
        body: JSON.stringify({ visitorId, ...visitorData }),
      });
      return result.success ? result.data : null;
    },

    async trackBlogView(blogSlug: string, blogTitle: string) {
      const result = await apiFetch(API.visitors.trackBlogView(), {
        method: 'POST',
        headers: {
          'X-Screen-Resolution': visitorData.screenResolution,
          'X-Timezone': visitorData.timezone,
          'X-Platform': visitorData.platform,
        },
        body: JSON.stringify({ visitorId, blogSlug, blogTitle, ...visitorData }),
      });
      return result.success ? result.data : null;
    },

    async getBlogViewCount(blogSlug: string) {
      const result = await apiFetch(API.visitors.blogViews(blogSlug));
      return result.success ? result.data : null;
    },

    async getVisitorStats() {
      const result = await apiFetch(API.visitors.stats());
      return result.success ? result.data : null;
    },
  }), [visitorData, visitorId]);
}
