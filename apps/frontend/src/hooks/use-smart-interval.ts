'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePageVisibility } from './use-page-visibility';

type TSmartIntervalOptions = {
  activeInterval: number; // ms - polling interval when user is active
  inactiveInterval?: number; // ms - polling interval when user is inactive (0 = disabled)
  maxInactiveTime?: number; // ms - after this time, stop polling completely
  runImmediately?: boolean; // run callback immediately on mount
  enabled?: boolean; // whether the interval is enabled at all
};

export function useSmartInterval(
  callback: () => void | Promise<void>,
  options: TSmartIntervalOptions
) {
  const {
    activeInterval,
    inactiveInterval = 0, // Default: stop when inactive
    maxInactiveTime = 10 * 60 * 1000, // 10 minutes default
    runImmediately = false,
    enabled = true,
  } = options;

  const { isActive, isVisible, timeSinceActive } = usePageVisibility({
    inactivityThreshold: 5 * 60 * 1000, // 5 minutes
    updateInterval: 1000,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const hasRunImmediatelyRef = useRef(false);
  const currentIntervalDurationRef = useRef<number | null>(null);

  // Update callback ref when it changes
  callbackRef.current = callback;

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      currentIntervalDurationRef.current = null;
    }
  }, []);

  const startInterval = useCallback((interval: number) => {
    // Only start new interval if duration is different
    if (currentIntervalDurationRef.current === interval && intervalRef.current) {
      return; // Already running with correct interval
    }
    
    clearCurrentInterval();
    currentIntervalDurationRef.current = interval;
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [clearCurrentInterval]);

  useEffect(() => {
    if (!enabled) {
      clearCurrentInterval();
      return;
    }

    // Run immediately if requested and hasn't run yet
    if (runImmediately && !hasRunImmediatelyRef.current) {
      callbackRef.current();
      hasRunImmediatelyRef.current = true;
    }

    // Determine current state and appropriate interval
    const shouldStop = !isVisible || timeSinceActive > maxInactiveTime;
    const shouldUseInactiveInterval = !isActive && isVisible && inactiveInterval > 0;
    
    if (shouldStop) {
      // Stop polling completely
      if (intervalRef.current) {
        console.log('🛑 Stopping API polling - user inactive for too long or tab not visible');
        clearCurrentInterval();
      }
    } else if (shouldUseInactiveInterval) {
      // Use inactive interval
      if (currentIntervalDurationRef.current !== inactiveInterval) {
        console.log(`🐌 Switching to inactive polling (${inactiveInterval}ms)`);
        startInterval(inactiveInterval);
      }
    } else if (isActive && isVisible) {
      // Use active interval
      if (currentIntervalDurationRef.current !== activeInterval) {
        console.log(`🚀 ${intervalRef.current ? 'Switching to' : 'Starting'} active polling (${activeInterval}ms)`);
        startInterval(activeInterval);
        // Run immediately when resuming from stopped state
        if (!intervalRef.current) {
          callbackRef.current();
        }
      }
    }

  }, [
    enabled,
    isActive,
    isVisible,
    timeSinceActive,
    activeInterval,
    inactiveInterval,
    maxInactiveTime,
    runImmediately,
    startInterval,
    clearCurrentInterval,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return clearCurrentInterval;
  }, [clearCurrentInterval]);

  return {
    isPolling: intervalRef.current !== null,
    isActive,
    isVisible,
    timeSinceActive,
    manualTrigger: useCallback(() => {
      callbackRef.current();
    }, []),
  };
}