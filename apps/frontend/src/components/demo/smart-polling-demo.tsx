'use client';

import { useState } from 'react';
import { useSmartInterval } from '@/hooks/use-smart-interval';
import { ActivityStatus } from '@/components/shared/activity-status';
import { getPollingConfig, createPollingConfig } from '@/config/polling-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings } from 'lucide-react';

type TPollingType = 'realtime' | 'background' | 'passive';

export function SmartPollingDemo() {
  const [pollingType, setPollingType] = useState<TPollingType>('realtime');
  const [fetchCount, setFetchCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const simulateFetch = () => {
    setFetchCount(prev => prev + 1);
    setLastFetchTime(new Date());
    console.log(`🔄 Mock API fetch #${fetchCount + 1} (${pollingType} mode)`);
  };

  const config = getPollingConfig(pollingType);
  const { isPolling, isActive, isVisible, timeSinceActive, manualTrigger } = useSmartInterval(
    simulateFetch,
    {
      ...config,
      runImmediately: false,
      enabled,
    }
  );

  const pollingTypes: { type: TPollingType; label: string; description: string }[] = [
    { type: 'realtime', label: 'Real-time', description: 'High-frequency updates (30s/2m)' },
    { type: 'background', label: 'Background', description: 'Low-frequency updates (5m/off)' },
    { type: 'passive', label: 'Passive', description: 'Very low-frequency (15m/off)' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Activity-Aware API Polling Demo
        </h2>
        <p className="text-muted-foreground">
          Watch how polling adapts to your activity. Try switching tabs, being idle, or changing modes.
        </p>
      </div>

      {/* Polling Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Polling Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {pollingTypes.map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => setPollingType(type)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  pollingType === type
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Active interval:</span>{' '}
                {Math.floor(config.activeInterval / 1000)}s
              </div>
              <div>
                <span className="font-medium">Inactive interval:</span>{' '}
                {config.inactiveInterval ? `${Math.floor(config.inactiveInterval / 1000)}s` : 'Stopped'}
              </div>
              <div>
                <span className="font-medium">Max inactive time:</span>{' '}
                {Math.floor(config.maxInactiveTime / 60000)}m
              </div>
              <div>
                <span className="font-medium">Inactivity threshold:</span>{' '}
                {Math.floor(config.inactivityThreshold / 60000)}m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityStatus
              isActive={isActive}
              isVisible={isVisible}
              isPolling={isPolling}
              timeSinceActive={timeSinceActive}
              showDetails={true}
            />
            
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={() => setEnabled(!enabled)}
                variant={enabled ? "default" : "outline"}
                size="sm"
              >
                {enabled ? 'Disable' : 'Enable'} Polling
              </Button>
              <Button
                onClick={manualTrigger}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Manual Fetch
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fetch Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{fetchCount}</div>
                <div className="text-sm text-muted-foreground">Total API calls</div>
              </div>
              
              {lastFetchTime && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Last fetch: {lastFetchTime.toLocaleTimeString()}
                  </Badge>
                </div>
              )}
              
              <div className="pt-4 border-t border-border/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Polling:</span>{' '}
                    <Badge variant={isPolling ? "default" : "secondary"}>
                      {isPolling ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">User:</span>{' '}
                    <Badge variant={isActive ? "default" : "outline"}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">1</Badge>
              <div>
                <strong>Try different modes:</strong> Switch between polling types to see different intervals.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">2</Badge>
              <div>
                <strong>Test tab switching:</strong> Switch to another tab and come back to see polling pause/resume.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">3</Badge>
              <div>
                <strong>Be idle:</strong> Stop moving your mouse/keyboard for a few minutes.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">4</Badge>
              <div>
                <strong>Check console:</strong> Open dev tools to see polling activity logs.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}