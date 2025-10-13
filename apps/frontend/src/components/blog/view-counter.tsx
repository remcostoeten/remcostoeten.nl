'use client';

import { Eye } from "lucide-react";
import { useViewCount } from "@/hooks/use-view-count";
import { AnimatedNumber } from "@/components/ui/animated-number";

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
  const { viewCount, loading, error } = useViewCount(slug, {
    autoIncrement,
    incrementDelay
  });

  if (error) {
    return null; // Silently fail for view counts
  }

  // Use the numeric view count directly
  const numericViewCount = viewCount || 0;

  return (
    <div className={className}>
      {showIcon && <Eye className="w-3 h-3" />}
      {loading ? (
        <span>...</span>
      ) : (
        <AnimatedNumber
          value={numericViewCount}
          format="number"
          decimals={0}
          randomStart={true}
          randomRange={Math.max(1, numericViewCount - 5)}
          duration={1200}
          delay={500}
          className="inline-block"
        />
      )}
    </div>
  );
}