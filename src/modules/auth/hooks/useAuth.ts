import { useState, useEffect, useCallback } from "react";
import { createAuthClient } from "../services/authClient";
import type { TAuthUser, TAuthContext } from "../types/auth-types";

const AUTH_TOKEN_KEY = "admin_auth_token";
const authClient = createAuthClient();

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function getClientInfo() {
  if (typeof window === "undefined") return {};
  
  return {
    userAgent: navigator.userAgent,
    // Note: Getting real IP requires server-side implementation
    ipAddress: undefined,
  };
}

export function useAuth(): TAuthContext {
  const [user, setUser] = useState<TAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async (): Promise<boolean> => {
    const token = getStoredToken();
    
    if (!token) {
      setIsLoading(false);
      return false;
    }

    try {
      const sessionResult = await authClient.validateSession(token);
      
      if (sessionResult) {
        setUser(sessionResult.user);
        setIsLoading(false);
        return true;
      } else {
        removeStoredToken();
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Session validation error:", error);
      removeStoredToken();
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const clientInfo = getClientInfo();
      const loginResult = await authClient.login(
        email, 
        password, 
        clientInfo.ipAddress, 
        clientInfo.userAgent
      );

      setStoredToken(loginResult.token);
      setUser(loginResult.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const token = getStoredToken();
    
    if (token) {
      try {
        const clientInfo = getClientInfo();
        await authClient.logout(token, clientInfo.ipAddress);
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    removeStoredToken();
    setUser(null);
  }, []);

  // Validate session on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);


  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    validateSession,
  };
}
