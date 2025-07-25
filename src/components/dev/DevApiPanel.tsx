import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ApiStatusIndicator } from './ApiStatusIndicator';
import { useApiFeedback } from '@/hooks/use-api-feedback';
import { 
  Activity, 
  Database, 
  Play, 
  BarChart3, 
  Users, 
  Clock,
  Send,
  TestTube
} from 'lucide-react';

type TProps = {
  isCollapsed?: boolean;
};

export function DevApiPanel({ isCollapsed = false }: TProps) {
  const [customEvent, setCustomEvent] = useState('');
  const [customPage, setCustomPage] = useState('');
  const [customEventData, setCustomEventData] = useState('{}');
  
  const {
    postAnalyticsEvent,
    getAnalyticsMetrics,
    getRealTimeStats,
    getAnalyticsEvents,
    testApiConnection,
    isLoading
  } = useApiFeedback();

  async function handleSendCustomEvent() {
    if (!customEvent.trim()) return;
    
    try {
      const additionalData = customEventData ? JSON.parse(customEventData) : {};
      await postAnalyticsEvent({
        eventType: customEvent,
        page: customPage || window.location.pathname,
        sessionId: crypto.randomUUID(),
        data: additionalData
      });
      
      setCustomEvent('');
      setCustomPage('');
      setCustomEventData('{}');
    } catch (error) {
      console.error('Invalid JSON in custom event data:', error);
    }
  }

  async function handleQuickEvent(eventName: string) {
    await postAnalyticsEvent({
      eventType: eventName,
      page: window.location.pathname,
      sessionId: crypto.randomUUID(),
      data: { source: 'dev_panel' }
    });
  }

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                API Status
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ApiStatusIndicator />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Development API Panel
        </CardTitle>
        <CardDescription>
          Monitor and test localhost:{import.meta.env.VITE_API_PORT || '3003'} analytics API
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Connection Status</h3>
            <ApiStatusIndicator />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={testApiConnection}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Full Test
          </Button>
        </div>

        <Separator />

        <div className="grid gap-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Play className="h-4 w-4" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => getAnalyticsMetrics()}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
            >
              <BarChart3 className="h-3 w-3" />
              Metrics
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => getRealTimeStats()}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
            >
              <Clock className="h-3 w-3" />
              Real-time
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => getAnalyticsEvents({ limit: 10 })}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
            >
              <Activity className="h-3 w-3" />
              Events
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickEvent('dev_test')}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs"
            >
              <Users className="h-3 w-3" />
              Test Event
            </Button>
          </div>

          <div className="grid gap-2">
            <Badge variant="secondary" className="text-xs w-fit">
              Quick Events
            </Badge>
            <div className="flex flex-wrap gap-1">
              {['page_view', 'button_click', 'form_submit', 'user_login', 'error_occurred'].map((event) => (
                <Button
                  key={event}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickEvent(event)}
                  disabled={isLoading}
                  className="text-xs h-7"
                >
                  {event}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Send className="h-4 w-4" />
            Custom Event
          </h3>
          
          <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="event-name" className="text-xs">Event Name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., user_action"
                  value={customEvent}
                  onChange={(e) => setCustomEvent(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="page-name" className="text-xs">Page (Optional)</Label>
                <Input
                  id="page-name"
                  placeholder="e.g., /dashboard"
                  value={customPage}
                  onChange={(e) => setCustomPage(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-data" className="text-xs">Additional Data (JSON)</Label>
              <Textarea
                id="event-data"
                placeholder='{"userId": "123", "action": "click"}'
                value={customEventData}
                onChange={(e) => setCustomEventData(e.target.value)}
                rows={3}
                className="text-sm font-mono"
              />
            </div>

            <Button
              onClick={handleSendCustomEvent}
              disabled={isLoading || !customEvent.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Custom Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
