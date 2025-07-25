import { usePerformance } from '@/hooks/use-performance';
import { ApiStatusIndicator } from './ApiStatusIndicator';

type TProps = {
  enabled?: boolean;
};

export function PerformanceDashboard({ enabled = import.meta.env.VITE_NODE_ENV === 'development' }: TProps) {
  const { metrics } = usePerformance();

  if (!enabled || !metrics) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-card/95 border border-border text-card-foreground p-4 rounded-lg text-xs font-mono z-50 max-w-xs backdrop-blur-sm">
        <h3 className="text-sm font-bold mb-2 text-foreground">Performance Metrics</h3>
      
      {metrics.memoryUsage && (
        <div className="mb-2">
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full ${
                metrics.memoryUsage.percentage > 80 ? 'bg-destructive' : 
                metrics.memoryUsage.percentage > 60 ? 'bg-yellow-400' : 
                'bg-accent'
              }`}
              style={{ width: `${metrics.memoryUsage.percentage}%` }}
            />
          </div>
          <div className="text-xs opacity-75">{metrics.memoryUsage.percentage}% used</div>
        </div>
      )}
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span>{Math.round(metrics.loadTime)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>DOM Ready:</span>
          <span>{Math.round(metrics.domContentLoaded)}ms</span>
        </div>
        {metrics.firstContentfulPaint && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span>{Math.round(metrics.firstContentfulPaint)}ms</span>
          </div>
        )}
      </div>
      </div>
      
      <div className="fixed bottom-4 left-4 z-50">
        <ApiStatusIndicator showDetails={false} />
      </div>
    </>
  );
}
