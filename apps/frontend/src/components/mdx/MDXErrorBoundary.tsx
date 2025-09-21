'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MDXErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MDXErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="my-6 p-4 border border-red-200 bg-red-50 rounded-lg text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold mb-2">
          MDX Component Error
        </div>
        <div className="text-sm">
          <p>There was an error rendering this component.</p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-xs overflow-auto">
                {error.message}
                {error.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  </div>
);

export class MDXErrorBoundary extends React.Component<
  MDXErrorBoundaryProps,
  MDXErrorBoundaryState
> {
  constructor(props: MDXErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MDXErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('MDX Component Error:', error, errorInfo);
    }
    
    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Higher-order component to wrap MDX components with error boundary
export function withMDXErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error }>
) {
  const WrappedComponent = (props: P) => (
    <MDXErrorBoundary fallback={fallback}>
      <Component {...props} />
    </MDXErrorBoundary>
  );

  WrappedComponent.displayName = `withMDXErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}