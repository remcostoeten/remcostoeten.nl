import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CMSSectionProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  fallback?: React.ReactNode;
  className?: string;
}

export const CMSSection: React.FC<CMSSectionProps> = ({
  children,
  loading = false,
  error = null,
  fallback,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load content: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!children && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
};

// Generic CMS content wrapper with loading states
interface CMSContentWrapperProps<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  loadingSkeleton?: React.ReactNode;
  className?: string;
}

export function CMSContentWrapper<T>({
  data,
  loading,
  error,
  children,
  fallback,
  loadingSkeleton,
  className = ''
}: CMSContentWrapperProps<T>) {
  if (loading) {
    return (
      <div className={className}>
        {loadingSkeleton || (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load content: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children(data)}</div>;
}