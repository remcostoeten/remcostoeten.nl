import { getSiteConfig } from './site';

// Analytics Configuration
// Configuration is now managed centrally in src/config/site.ts

function getAnalyticsConfig() {
  const config = getSiteConfig();
  return {
    ADMIN_PASSWORD: config.analytics.adminPassword,
    SESSION_TIMEOUT: config.analytics.sessionTimeout,
    API_BASE: '/api/analytics',
    REALTIME_INTERVAL: config.analytics.realtimeInterval,
    MAX_LOGIN_ATTEMPTS: config.analytics.maxLoginAttempts,
    LOCKOUT_DURATION: config.analytics.lockoutDuration
  };
}

export const ANALYTICS_CONFIG = getAnalyticsConfig();

// Helper to check if analytics is properly configured
export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_CONFIG.ADMIN_PASSWORD !== 'change-me';
}

// Warning message for default password
export function getSecurityWarning(): string | null {
  if (!isAnalyticsConfigured()) {
    return '⚠️ Using default password! Set VITE_ANALYTICS_PASSWORD environment variable';
  }
  return null;
}
