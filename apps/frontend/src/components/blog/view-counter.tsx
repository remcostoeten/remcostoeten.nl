'use client';

import { Eye } from "lucide-react";
import { useViewCount } from "@/hooks/use-view-count";

interface ViewCounterProps {
  slug: string;
  // Whether to automatically increment view count when component mounts
  autoIncrement?: boolean;
  // Custom class name
  className?: string;
  // Show icon
  showIcon?: boolean;
  // Increment delay in milliseconds
  incrementDelay?: number;
}

export function ViewCounter({ 
  slug, 
  autoIncrement = true, 
  className = "text-xs text-muted-foreground flex items-center gap-1",
  showIcon = true,
  incrementDelay = 2000
}: ViewCounterProps) {
  const { formattedViewCount, loading, error } = useViewCount(slug, {
    autoIncrement,
    incrementDelay
  });

  if (error) {
    return null; // Silently fail for view counts
  }

  return (
    <div className={className}>
      {showIcon && <Eye className="w-3 h-3" />}
      <span>
        {loading ? '...' : formattedViewCount}
      </span>
    </div>
  );
}