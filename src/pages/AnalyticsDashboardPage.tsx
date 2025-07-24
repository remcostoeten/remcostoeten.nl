import React from 'react';
import { AnalyticsDashboard } from '../modules/analytics';
import { useAuth } from '../modules/analytics/hooks/useAuth';
import { LoginForm } from '../modules/analytics/components/LoginForm';
import { Button } from '../components/ui/button';
import { LogOutIcon } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const { 
    isAuthenticated, 
    isLoading, 
    isLockedOut,
    lockoutTimeRemaining,
    login, 
    logout, 
    getRemainingAttempts 
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={login} 
        isLockedOut={isLockedOut}
        lockoutTimeRemaining={lockoutTimeRemaining}
        getRemainingAttempts={getRemainingAttempts}
      />
    );
  }

  return (
    <div className="relative">
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button onClick={logout} variant="outline" size="sm">
          <LogOutIcon className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}
