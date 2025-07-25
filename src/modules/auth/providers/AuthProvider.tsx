import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import type { TAuthContext } from "../types/auth-types";

const AuthContext = createContext<TAuthContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: TProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): TAuthContext {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  
  return context;
}
