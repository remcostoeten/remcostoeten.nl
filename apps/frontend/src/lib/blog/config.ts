// Blog system configuration
const DEFAULT_API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4001/api'
    : 'https://backend-thrumming-cloud-5273.fly.dev/api';

export const BLOG_CONFIG = {
  // API base URL - can be overridden with environment variable
  API_BASE: process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API_BASE,
  
  // Content directory
  CONTENT_DIR: 'content/blog',
  
  // Default values
  DEFAULTS: {
    category: 'development' as const,
    status: 'published' as const,
    readTime: 5,
  },
  
  // Features
  FEATURES: {
    analytics: true,
    admin: true,
    cli: true,
    fallback: true,
  },
} as const;

// Check if backend is available
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${BLOG_CONFIG.API_BASE.replace('/api', '')}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}
