import { DemoLayout } from '@/components/layout/demo-layout';
import { TimezoneDemo } from '@/modules/time';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Zap } from 'lucide-react';

function createTimezoneFeatures() {
  return [
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Live clock updates every second with accurate time display',
    },
    {
      icon: Globe,
      title: 'Multiple Timezones',
      description: 'Support for major world timezones with automatic daylight saving',
    },
    {
      icon: Zap,
      title: 'Performance Optimized',
      description: 'Efficient rendering with minimal re-renders and memory usage',
    },
  ];
}

export default function TimezoneDemoPage() {
  const features = createTimezoneFeatures();

  return (
    <DemoLayout
      title="Timezone Demo"
      description="Interactive timezone selector and world clock with real-time updates across multiple timezones."
      category="Time"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="text-center">
                <CardHeader className="pb-3">
                  <div className="mx-auto p-2 w-fit rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Interactive Demo</CardTitle>
              <Badge variant="outline">Live</Badge>
            </div>
            <CardDescription>
              Select different timezones and see real-time updates. The component automatically
              handles time formatting, daylight saving transitions, and timezone conversions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimezoneDemo />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Performance Considerations</h4>
              <p className="text-sm text-muted-foreground">
                Uses efficient time updates with proper cleanup to prevent memory leaks.
                Only re-renders when time values actually change.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Timezone Handling</h4>
              <p className="text-sm text-muted-foreground">
                Leverages native Intl.DateTimeFormat for accurate timezone conversions
                and automatic daylight saving time adjustments.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">State Management</h4>
              <p className="text-sm text-muted-foreground">
                Uses React Context for timezone state sharing across components
                with pure reducer functions for predictable state updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}
