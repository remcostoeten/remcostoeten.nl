import { usePerformance } from '@/hooks/use-performance';

type TProps = {
  enabled?: boolean;
};

export function PerformanceDashboard({ enabled = process.env.NODE_ENV === 'development' }: TProps) {
  const { metrics } = usePerformance();

  if (!enabled || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <h3 className="text-sm font-bold mb-2">Performance Metrics</h3>
      
      {metrics.memoryUsage && (
        <div className="mb-2">
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{metrics.memoryUsage.used}MB / {metrics.memoryUsage.total}MB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div 
              className={`h-1 rounded-full ${
                metrics.memoryUsage.percentage > 80 ? 'bg-red-500' : 
                metrics.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 
                'bg-green-500'
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
  );
}
