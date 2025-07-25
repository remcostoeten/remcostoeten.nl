// Client-side auth service that makes API calls
// Server-side auth logic is in the API

const API_BASE = 'http://localhost:3334/api';

export function createAuthService() {
  async function login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        ipAddress,
        userAgent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    return await response.json();
  }

  async function validateSession(token: string) {
    const response = await fetch(`${API_BASE}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async function logout(token: string, ipAddress?: string) {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token, ipAddress }),
    });

    return response.ok;
  }

  async function logActivity(
    userId: string, 
    action: string, 
    module: string, 
    details?: any, 
    ipAddress?: string
  ) {
    // This will be handled server-side
    return true;
  }

  async function cleanExpiredSessions() {
    // This will be handled server-side
    return true;
  }

  async function getRecentActivity(limit: number = 50) {
    const response = await fetch(`${API_BASE}/auth/activity?limit=${limit}`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  }

  return {
    login,
    validateSession,
    logout,
    logActivity,
    cleanExpiredSessions,
    getRecentActivity,
  };
}
