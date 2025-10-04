'use client';

import { useState, useEffect } from 'react';

type TPageVisibilityState = {
  isVisible: boolean;
  isActive: boolean;
  lastActiveTime: number;
  timeSinceActive: number;
};

type TPageVisibilityOptions = {
  inactivityThreshold?: number; // ms after which user is considered inactive
  updateInterval?: number; // ms interval to update timeSinceActive
};

export function usePageVisibility(options: TPageVisibilityOptions = {}) {
  const {
    inactivityThreshold = 5 * 60 * 1000, // 5 minutes default
    updateInterval = 1000, // 1 second default
  } = options;

  const [state, setState] = useState<TPageVisibilityState>(() => ({
    isVisible: typeof document !== 'undefined' ? !document.hidden : true,
    isActive: true,
    lastActiveTime: Date.now(),
    timeSinceActive: 0,
  }));

  useEffect(() => {
    function handleVisibilityChange() {
      const isVisible = !document.hidden;
      const now = Date.now();

      setState(prev => ({
        ...prev,
        isVisible,
        lastActiveTime: isVisible ? now : prev.lastActiveTime,
        timeSinceActive: isVisible ? 0 : now - prev.lastActiveTime,
      }));
    }

    function handleUserActivity() {
      const now = Date.now();
      setState(prev => ({
        ...prev,
        lastActiveTime: now,
        timeSinceActive: 0,
        isActive: true,
      }));
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Update timer periodically
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const timeSinceActive = now - prev.lastActiveTime;
        const isActive = prev.isVisible && timeSinceActive < inactivityThreshold;

        return {
          ...prev,
          timeSinceActive,
          isActive,
        };
      });
    }, updateInterval);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      clearInterval(interval);
    };
  }, [inactivityThreshold, updateInterval]);

  return state;
}