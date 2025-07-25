import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from 'from "../providers/AuthProvider"';
import type { TProtectedRouteProps } from "../types/auth-types";

export function ProtectedRoute({ children, fallback }: TProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
