"use client";

import { useMemo } from 'react';

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
      try {
        const response = await fetch('http://localhost:4001/api/visitors/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Screen-Resolution': visitorData.screenResolution,
            'X-Timezone': visitorData.timezone,
            'X-Platform': visitorData.platform,
          },
          body: JSON.stringify({ visitorId, ...visitorData }),
        });
        return await response.json();
      } catch (error) {
        console.error('Error tracking visitor:', error);
        return null;
      }
    },

    async trackBlogView(blogSlug: string, blogTitle: string) {
      try {
        const response = await fetch('http://localhost:4001/api/visitors/track-blog-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Screen-Resolution': visitorData.screenResolution,
            'X-Timezone': visitorData.timezone,
            'X-Platform': visitorData.platform,
          },
          body: JSON.stringify({ visitorId, blogSlug, blogTitle, ...visitorData }),
        });
        return await response.json();
      } catch (error) {
        console.error('Error tracking blog view:', error);
        return null;
      }
    },

    async getBlogViewCount(blogSlug: string) {
      try {
        const response = await fetch(`http://localhost:4001/api/visitors/blog/${blogSlug}/views`);
        return await response.json();
      } catch (error) {
        console.error('Error getting blog view count:', error);
        return null;
      }
    },

    async getVisitorStats() {
      try {
        const response = await fetch('http://localhost:4001/api/visitors/stats');
        return await response.json();
      } catch (error) {
        console.error('Error getting visitor stats:', error);
        return null;
      }
    },
  }), [visitorData, visitorId]);
}
