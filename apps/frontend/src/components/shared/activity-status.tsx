'use client';

import { memo } from 'react';
import { Activity, Pause, Play, Wifi, WifiOff, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type TActivityStatusProps = {
  isActive: boolean;
  isVisible: boolean;
  isPolling: boolean;
  timeSinceActive: number;
  className?: string;
  showDetails?: boolean;
};

export const ActivityStatus = memo(function ActivityStatus({
  isActive,
  isVisible,
  isPolling,
  timeSinceActive,
  className,
  showDetails = false,
}: TActivityStatusProps) {
  const formatTimeAgo = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getStatusInfo = () => {
    if (!isVisible) {
      return {
        icon: WifiOff,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        status: 'Hidden',
        description: 'Tab not visible',
      };
    }

    if (!isActive) {
      return {
        icon: Pause,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        status: 'Inactive',
        description: `Last activity ${formatTimeAgo(timeSinceActive)}`,
      };
    }

    if (isPolling) {
      return {
        icon: Activity,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        status: 'Active',
        description: 'Real-time updates enabled',
      };
    }

    return {
      icon: Play,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      status: 'Ready',
      description: 'Monitoring activity',
    };
  };

  const { icon: Icon, color, bgColor, status, description } = getStatusInfo();

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div className={cn('p-1 rounded-full', bgColor)}>
          <Icon className={cn('w-3 h-3', color)} />
        </div>
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 bg-card border rounded-lg', className)}>
      <div className={cn('p-2 rounded-full', bgColor)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{status}</span>
          {isPolling && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {showDetails && timeSinceActive > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(timeSinceActive)}</span>
        </div>
      )}
    </div>
  );
});