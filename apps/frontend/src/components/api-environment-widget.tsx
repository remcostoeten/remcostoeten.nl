'use client';

import { useState } from 'react';
import { useApiEnvironment } from '@/hooks/use-api-environment';
import type { ApiEnvironment } from '@/config/api.config';

type TProps = {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultCollapsed?: boolean;
};

function getPositionClasses(position: TProps['position']): string {
  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  return positions[position || 'bottom-right'];
}

function getToggleButtonPosition(position: TProps['position']): string {
  const positions = {
    'bottom-right': '-left-12 top-1/2 -translate-y-1/2 rounded-l-md',
    'bottom-left': '-right-12 top-1/2 -translate-y-1/2 rounded-r-md',
    'top-right': '-left-12 top-1/2 -translate-y-1/2 rounded-l-md',
    'top-left': '-right-12 top-1/2 -translate-y-1/2 rounded-r-md',
  };
  return positions[position || 'bottom-right'];
}

export function ApiEnvironmentWidget({ position = 'bottom-right', defaultCollapsed = false }: TProps) {
  const { currentEnvironment, config, isLocal, isProduction, switchEnvironment, isDevelopment } = useApiEnvironment();
  const [isVisible, setIsVisible] = useState(!defaultCollapsed);

  if (!isDevelopment) return null;

  function handleEnvironmentChange(env: ApiEnvironment) {
    switchEnvironment(env);
  }

  function toggleVisibility() {
    setIsVisible(!isVisible);
  }

  const positionClasses = getPositionClasses(position);
  const toggleButtonClasses = getToggleButtonPosition(position);

  return (
    <div
      className={`fixed ${positionClasses} z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <button
        onClick={toggleVisibility}
        className={`absolute ${toggleButtonClasses} bg-background border border-border p-2 hover:bg-muted transition-colors`}
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
            onClick={toggleVisibility}
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
              checked={isLocal}
              onChange={() => handleEnvironmentChange('local')}
              className="w-4 h-4 text-accent"
            />
            <span className="text-sm">
              Local
              <span className="text-xs text-muted-foreground block">
                {config.base.replace('http://', '')}
              </span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="api-env"
              value="production"
              checked={isProduction}
              onChange={() => handleEnvironmentChange('production')}
              className="w-4 h-4 text-accent"
            />
            <span className="text-sm">
              Production
              <span className="text-xs text-muted-foreground block">
                {config.base.replace('https://', '').split('.')[0]}.fly.dev
              </span>
            </span>
          </label>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isProduction ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isProduction ? 'Using Cloud API' : 'Using Local API'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApiEnvironmentIndicator() {
  const { currentEnvironment, isProduction } = useApiEnvironment();

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            isProduction ? 'bg-green-500' : 'bg-yellow-500'
          }`}
        />
        <span className="text-xs text-muted-foreground">
          API: {currentEnvironment}
        </span>
      </div>
    </div>
  );
}
