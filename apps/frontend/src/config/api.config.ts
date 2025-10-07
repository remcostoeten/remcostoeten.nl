/**
 * API Configuration
 * Centralized configuration for API endpoints with environment switching
 */

// Environment types
export type ApiEnvironment = 'local' | 'production';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Allow override via environment variable or localStorage
const getEnvironmentOverride = (): ApiEnvironment | null => {
  if (typeof window !== 'undefined') {
    // Check localStorage for user preference
    const stored = localStorage.getItem('apiEnvironment');
    if (stored === 'local' || stored === 'production') {
      return stored;
    }
    
    // Check URL params for override (useful for testing)
    const params = new URLSearchParams(window.location.search);
    const env = params.get('api');
    if (env === 'local' || env === 'production') {
      localStorage.setItem('apiEnvironment', env);
      return env;
    }
  }
  return null;
};

// Determine which environment to use
export function getApiEnvironment(): ApiEnvironment {
  // 1. Check for explicit override
  const override = getEnvironmentOverride();
  if (override) return override;
  
  // 2. Use environment variable if set
  if (process.env.NEXT_PUBLIC_API_ENV === 'production') return 'production';
  if (process.env.NEXT_PUBLIC_API_ENV === 'local') return 'local';
  
  // 3. Default: local for development, production for production
  return isDevelopment ? 'local' : 'production';
}

// API Endpoints configuration
const API_ENDPOINTS = {
  local: {
    base: 'http://localhost:4001',
    analytics: 'http://localhost:4001/api',
  },
  production: {
    base: 'https://backend-thrumming-cloud-5273.fly.dev',
    analytics: 'https://backend-thrumming-cloud-5273.fly.dev/api',
  },
} as const;

// Get current API configuration
export function getApiConfig() {
  const environment = getApiEnvironment();
  return {
    environment,
    ...API_ENDPOINTS[environment],
    isLocal: environment === 'local',
    isProduction: environment === 'production',
  };
}

// Helper to build API URLs
export function apiUrl(path: string, baseType: 'base' | 'analytics' = 'analytics'): string {
  const config = getApiConfig();
  const base = baseType === 'base' ? config.base : config.analytics;
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove /api prefix if it exists and we're using analytics base
  const cleanPath = baseType === 'analytics' && normalizedPath.startsWith('/api/')
    ? normalizedPath.slice(4)
    : normalizedPath;
  
  return `${base}${cleanPath}`;
}

// Helper to switch environments programmatically
export function setApiEnvironment(env: ApiEnvironment) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiEnvironment', env);
    // Reload to apply changes
    window.location.reload();
  }
}

// Helper to clear environment override
export function clearApiEnvironmentOverride() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apiEnvironment');
    window.location.reload();
  }
}

// Export specific endpoint builders
export const API = {
  // Visitor endpoints
  visitors: {
    track: () => apiUrl('/visitors/track-visitor'),
    trackBlogView: () => apiUrl('/visitors/track-blog-view'),
    stats: () => apiUrl('/visitors/stats'),
    blogViews: (slug: string) => apiUrl(`/visitors/blog/${slug}/views`),
    visitor: (id: string) => apiUrl(`/visitors/visitor/${id}`),
  },
  
  // Pageview endpoints
  pageviews: {
    track: () => apiUrl('/pageviews'),
    list: () => apiUrl('/pageviews'),
    stats: () => apiUrl('/pageviews/stats'),
  },
  
  // Blog endpoints
  blog: {
    metadata: {
      create: () => apiUrl('/blog/metadata'),
      list: () => apiUrl('/blog/metadata'),
      get: (slug: string) => apiUrl(`/blog/metadata/${slug}`),
      update: (slug: string) => apiUrl(`/blog/metadata/${slug}`),
      delete: (slug: string) => apiUrl(`/blog/metadata/${slug}`),
    },
    analytics: {
      increment: (slug: string) => apiUrl(`/blog/analytics/${slug}/view`),
      get: (slug: string) => apiUrl(`/blog/analytics/${slug}`),
      multiple: () => apiUrl('/blog/analytics/multiple'),
    },
    // Note: The backend uses analytics endpoints, not separate views endpoints
    views: {
      record: () => apiUrl('/blog/analytics/record'), // This will need to be created or use analytics
      get: (slug: string) => apiUrl(`/blog/analytics/${slug}`),
      multiple: () => apiUrl('/blog/analytics/multiple'),
      list: () => apiUrl('/blog/analytics'),
      stats: () => apiUrl('/blog/analytics/stats'),
      cleanup: () => apiUrl('/blog/analytics/cleanup'),
    },
    // Feedback endpoints
    feedback: {
      submit: (slug: string) => apiUrl(`/blog/feedback/${slug}`),
      get: (slug: string) => apiUrl(`/blog/feedback/${slug}`),
      reactions: (slug: string) => apiUrl(`/blog/feedback/${slug}/reactions`),
      userFeedback: (slug: string) => apiUrl(`/blog/feedback/${slug}/user`),
    },
  },
  
  // Health check
  health: () => apiUrl('/health', 'base'),
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
  const config = getApiConfig();
  console.group('🔧 API Configuration');
if (process.env.NODE_ENV === 'development') {
  console.log('Environment:', config.environment);
  console.log('Base URL:', config.base);
  console.log('Analytics URL:', config.analytics);
  console.log('Is Local:', config.isLocal);
  console.log('Is Production:', config.isProduction);
}
  console.groupEnd();
}

// Initialize on load (client-side only)
if (typeof window !== 'undefined' && isDevelopment) {
  debugApiConfig();
}