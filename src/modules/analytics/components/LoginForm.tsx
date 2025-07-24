import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { LockIcon, EyeIcon, EyeOffIcon, ShieldAlertIcon } from 'lucide-react';
import { getSecurityWarning } from '../../../config/analytics';

interface LoginFormProps {
  onLogin: (password: string) => boolean;
  isLockedOut?: boolean;
  lockoutTimeRemaining?: number;
  getRemainingAttempts?: () => number;
}

export function LoginForm({ onLogin, isLockedOut, lockoutTimeRemaining, getRemainingAttempts }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const securityWarning = getSecurityWarning();
  const remainingAttempts = getRemainingAttempts?.() ?? 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Small delay to prevent brute force
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = onLogin(password);
    if (!success) {
      setError('Invalid password');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <LockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Analytics Access</CardTitle>
          <CardDescription>
            Enter the admin password to view analytics dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Security Warning */}
          {securityWarning && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-start gap-2">
                <ShieldAlertIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {securityWarning}
                </p>
              </div>
            </div>
          )}
          
          {/* Lockout Warning */}
          {isLockedOut && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
                Account Temporarily Locked
              </p>
              <p className="text-xs text-red-500 dark:text-red-400">
                Too many failed attempts. Try again in {Math.floor(lockoutTimeRemaining! / 60)}:{(lockoutTimeRemaining! % 60).toString().padStart(2, '0')}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Authorized access only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
