'use client';

// Generate a unique session ID for the current browser session
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server-session';
  }

  // Check if we already have a session ID in sessionStorage
  let sessionId = sessionStorage.getItem('blog-session-id');
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('blog-session-id', sessionId);
  }
  
  return sessionId;
}

// Get a persistent user ID (survives browser restarts)
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-user';
  }

  // Check if we already have a user ID in localStorage
  let userId = localStorage.getItem('blog-user-id');
  
  if (!userId) {
    // Generate a new user ID
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('blog-user-id', userId);
  }
  
  return userId;
}

// Clear session data (useful for testing)
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('blog-session-id');
  localStorage.removeItem('blog-user-id');
}