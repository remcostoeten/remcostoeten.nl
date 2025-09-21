'use client';

import { useState, useEffect } from 'react';
import { getApiConfig, setApiEnvironment, type ApiEnvironment } from '@/config/api.config';

export function ApiEnvironmentSwitcher() {
  const [currentEnv, setCurrentEnv] = useState<ApiEnvironment>('local');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const config = getApiConfig();
    setCurrentEnv(config.environment);
  }, []);

  function handleEnvironmentChange(env: ApiEnvironment) {
    setApiEnvironment(env);
  }

  // Only show in development or when explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    (typeof window !== 'undefined' && 
                     window.location.search.includes('debug=true'));

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute -left-12 top-1/2 -translate-y-1/2 bg-background border border-border rounded-l-md p-2 hover:bg-muted transition-colors"
        aria-label="Toggle API environment switcher"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">API Environment</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="api-env"
              value="local"
              checked={currentEnv === 'local'}
              onChange={() => handleEnvironmentChange('local')}
              className="w-4 h-4 text-accent"
            />
            <span className="text-sm">
              Local
              <span className="text-xs text-muted-foreground block">localhost:4001</span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="api-env"
              value="production"
              checked={currentEnv === 'production'}
              onChange={() => handleEnvironmentChange('production')}
              className="w-4 h-4 text-accent"
            />
            <span className="text-sm">
              Production
              <span className="text-xs text-muted-foreground block">Fly.io</span>
            </span>
          </label>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                currentEnv === 'production' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {currentEnv === 'production' ? 'Using Cloud API' : 'Using Local API'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal indicator component for production
export function ApiEnvironmentIndicator() {
  const [config, setConfig] = useState<ReturnType<typeof getApiConfig> | null>(null);

  useEffect(() => {
    setConfig(getApiConfig());
  }, []);

  if (!config) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            config.isProduction ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        <span className="text-xs text-muted-foreground">
          API: {config.environment}
        </span>
      </div>
    </div>
  );
}