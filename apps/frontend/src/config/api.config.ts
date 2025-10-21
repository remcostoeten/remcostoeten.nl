/**
 * API Configuration
 * Centralized configuration for internal Next.js API routes
 */

// Helper to build internal API URLs
export function apiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // For internal API routes, just return the path
  return normalizedPath;
}

// Export specific endpoint builders for internal API routes
export const API = {
  // View tracking endpoints
  views: {
    get: (slug: string) => apiUrl(`/api/views/${encodeURIComponent(slug)}`),
    record: (slug: string) => apiUrl(`/api/views/${encodeURIComponent(slug)}`),
    multiple: (slugs: string[]) => {
      const params = slugs.map(encodeURIComponent).join(',');
      return apiUrl(`/api/views?slugs=${params}`);
    }
  },

  // Blog posts endpoints
  blog: {
    posts: () => apiUrl('/api/blog/posts'),
    metadata: () => apiUrl('/api/blog/metadata'),
    metadataBySlug: (slug: string) => apiUrl(`/api/blog/metadata/${encodeURIComponent(slug)}`),
    analytics: (slug: string) => apiUrl(`/api/blog/analytics/${encodeURIComponent(slug)}`),
    recordView: (slug: string) => apiUrl(`/api/blog/analytics/${encodeURIComponent(slug)}`),
    analyticsMultiple: () => apiUrl('/api/blog/analytics/multiple'),
    analyticsStats: () => apiUrl('/api/blog/analytics/stats'),
  },

  // Projects endpoints
  projects: () => apiUrl('/api/projects'),

  // Contact form endpoints
  contact: {
    submit: () => apiUrl('/api/contact'),
    messages: () => apiUrl('/api/contact'),
    markAsRead: (id: string) => apiUrl(`/api/contact/${id}/read`),
    delete: (id: string) => apiUrl(`/api/contact/${id}`),
  },

  // Spotify authentication endpoints
  spotify: {
    callback: () => apiUrl('/api/auth/spotify/callback'),
    current: () => apiUrl('/api/auth/spotify/current'),
    token: () => apiUrl('/api/auth/spotify/token'),
    recent: () => apiUrl('/api/auth/spotify/recent'),
  },
};

// Type-safe fetch wrapper with automatic error handling
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for session tracking
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Debug helper
export function debugApiConfig() {
  console.group('🔧 API Configuration');
  if (process.env.NODE_ENV === 'development') {
    console.log('Using internal Next.js API routes');
    console.log('All API endpoints are internal');
  }
  console.groupEnd();
}

// Initialize on load (client-side only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  debugApiConfig();
}