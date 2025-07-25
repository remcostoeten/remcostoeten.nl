export type TAuthUser = {
  id: string;
  email: string;
  lastLoginAt: Date | null;
};

export type TLoginRequest = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  token: string;
  expiresAt: Date;
  user: TAuthUser;
};

export type TSession = {
  user: TAuthUser;
  token: string;
  expiresAt: Date;
};

export type TActivityLogEntry = {
  action: string;
  module: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
};

export type TAuthContext = {
  user: TAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<boolean>;
};

export type TProtectedRouteProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};
