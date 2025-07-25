// Paths to exclude from analytics tracking
// Add any path patterns here that should not be tracked
export const EXCLUDED_ANALYTICS_PATHS = [
  '/analytics'
] as const;

// Helper function to check if a path should be excluded from tracking
export function shouldExcludeFromTracking(path: string): boolean {
  return EXCLUDED_ANALYTICS_PATHS.some(excludedPath => 
    path.startsWith(excludedPath)
  );
}
