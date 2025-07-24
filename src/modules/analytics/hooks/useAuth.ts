import { useState, useEffect } from 'react';
import { ANALYTICS_CONFIG } from '../../../config/analytics';

const AUTH_KEY = 'analytics-auth';
const ATTEMPTS_KEY = 'analytics-attempts';
const LOCKOUT_KEY = 'analytics-lockout';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  useEffect(() => {
    // Check if already authenticated
    const stored = sessionStorage.getItem(AUTH_KEY);
    const timestamp = sessionStorage.getItem(AUTH_KEY + '_timestamp');
    
    if (stored === 'true' && timestamp) {
      const authTime = parseInt(timestamp);
      const now = Date.now();
      
      // Check if session is still valid
      if (now - authTime < ANALYTICS_CONFIG.SESSION_TIMEOUT) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY + '_timestamp');
      }
    }
    
    // Check lockout status
    checkLockoutStatus();
    setIsLoading(false);
  }, []);

  const checkLockoutStatus = () => {
    const lockoutTime = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutTime) {
      const lockoutEnd = parseInt(lockoutTime);
      const now = Date.now();
      
      if (now < lockoutEnd) {
        setIsLockedOut(true);
        setLockoutTimeRemaining(Math.ceil((lockoutEnd - now) / 1000));
        
        // Update countdown
        const interval = setInterval(() => {
          const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000);
          if (remaining <= 0) {
            setIsLockedOut(false);
            setLockoutTimeRemaining(0);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            clearInterval(interval);
          } else {
            setLockoutTimeRemaining(remaining);
          }
        }, 1000);
      } else {
        // Lockout expired
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }
  };

  const login = (password: string): boolean => {
    if (isLockedOut) {
      return false;
    }

    if (password === ANALYTICS_CONFIG.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      const now = Date.now();
      sessionStorage.setItem(AUTH_KEY, 'true');
      sessionStorage.setItem(AUTH_KEY + '_timestamp', now.toString());
      
      // Clear failed attempts
      localStorage.removeItem(ATTEMPTS_KEY);
      return true;
    } else {
      // Handle failed attempt
      const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
      
      if (attempts >= ANALYTICS_CONFIG.MAX_LOGIN_ATTEMPTS) {
        // Lock out user
        const lockoutEnd = Date.now() + ANALYTICS_CONFIG.LOCKOUT_DURATION;
        localStorage.setItem(LOCKOUT_KEY, lockoutEnd.toString());
        checkLockoutStatus();
      }
      
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY + '_timestamp');
  };

  const getRemainingAttempts = (): number => {
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');
    return Math.max(0, ANALYTICS_CONFIG.MAX_LOGIN_ATTEMPTS - attempts);
  };

  return {
    isAuthenticated,
    isLoading,
    isLockedOut,
    lockoutTimeRemaining,
    login,
    logout,
    getRemainingAttempts
  };
}
