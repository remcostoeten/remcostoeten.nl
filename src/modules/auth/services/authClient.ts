import type { TAuthUser } from "../types/auth-types";

type TLoginResponse = {
  token: string;
  expiresAt: Date;
  user: TAuthUser;
};

type TValidateSessionResponse = {
  user: TAuthUser;
  session: {
    token: string;
    expiresAt: Date;
  };
} | null;

function createAuthClient() {
  async function login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<TLoginResponse> {
    const response = await fetch('/api/auth/login', {
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

    const result = await response.json();
    return {
      ...result,
      expiresAt: new Date(result.expiresAt),
    };
  }

  async function validateSession(token: string): Promise<TValidateSessionResponse> {
    const response = await fetch('/api/auth/validate', {
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

    const result = await response.json();
    if (!result) return null;

    return {
      ...result,
      session: {
        ...result.session,
        expiresAt: new Date(result.session.expiresAt),
      },
    };
  }

  async function logout(token: string, ipAddress?: string): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        token,
        ipAddress,
      }),
    });
  }

  return {
    login,
    validateSession,
    logout,
  };
}

export { createAuthClient };
