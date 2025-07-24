// Analytics Configuration
// You can set these via environment variables or change them here

export const ANALYTICS_CONFIG = {
  // Change this password to something secure!
  ADMIN_PASSWORD: import.meta.env.VITE_ANALYTICS_PASSWORD || 'admin123',
  
  // Session timeout in milliseconds (24 hours)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  
  // API base URL
  API_BASE: '/api/analytics',
  
  // Real-time update interval (30 seconds)
  REALTIME_INTERVAL: 30 * 1000,
  
  // Max failed login attempts before temporary lockout
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Lockout duration in milliseconds (15 minutes)
  LOCKOUT_DURATION: 15 * 60 * 1000
};

// Helper to check if analytics is properly configured
export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_CONFIG.ADMIN_PASSWORD !== 'admin123';
}

// Warning message for default password
export function getSecurityWarning(): string | null {
  if (!isAnalyticsConfigured()) {
    return '⚠️ Using default password! Set VITE_ANALYTICS_PASSWORD environment variable or change ADMIN_PASSWORD in src/config/analytics.ts';
  }
  return null;
}
