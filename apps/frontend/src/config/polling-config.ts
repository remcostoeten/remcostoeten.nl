/**
 * Configuration for activity-aware API polling intervals
 * All times are in milliseconds
 */

export type TPollingConfig = {
  activeInterval: number;      // Polling interval when user is active
  inactiveInterval: number;    // Polling interval when user is inactive (0 = stop)
  maxInactiveTime: number;     // Stop polling completely after this time
  inactivityThreshold: number; // User considered inactive after this time
};

export const POLLING_CONFIGS = {
  // High-frequency updates (Spotify, current activity)
  realtime: {
    activeInterval: 30 * 1000,        // 30 seconds
    inactiveInterval: 2 * 60 * 1000,  // 2 minutes
    maxInactiveTime: 10 * 60 * 1000,  // 10 minutes
    inactivityThreshold: 5 * 60 * 1000, // 5 minutes
  } satisfies TPollingConfig,

  // Medium-frequency updates (analytics, metrics)
  analytics: {
    activeInterval: 60 * 1000,        // 1 minute
    inactiveInterval: 5 * 60 * 1000,  // 5 minutes
    maxInactiveTime: 20 * 60 * 1000,  // 20 minutes
    inactivityThreshold: 5 * 60 * 1000, // 5 minutes
  } satisfies TPollingConfig,

  // Low-frequency updates (GitHub activity, project stats)
  background: {
    activeInterval: 5 * 60 * 1000,    // 5 minutes
    inactiveInterval: 0,              // Stop when inactive
    maxInactiveTime: 30 * 60 * 1000,  // 30 minutes
    inactivityThreshold: 10 * 60 * 1000, // 10 minutes
  } satisfies TPollingConfig,

  // Very low-frequency updates (blog views, social stats)
  passive: {
    activeInterval: 15 * 60 * 1000,   // 15 minutes
    inactiveInterval: 0,              // Stop when inactive
    maxInactiveTime: 60 * 60 * 1000,  // 1 hour
    inactivityThreshold: 10 * 60 * 1000, // 10 minutes
  } satisfies TPollingConfig,
} as const;

/**
 * Helper function to get polling config for a specific component type
 */
export function getPollingConfig(type: keyof typeof POLLING_CONFIGS): TPollingConfig {
  return POLLING_CONFIGS[type];
}

/**
 * Helper function to create a custom polling config
 */
export function createPollingConfig(overrides: Partial<TPollingConfig>): TPollingConfig {
  return {
    ...POLLING_CONFIGS.realtime,
    ...overrides,
  };
}