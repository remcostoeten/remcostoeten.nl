import { Link } from 'react-router-dom';
import { DemoLayout } from '@/components/layout/demo-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Hash, ArrowRight } from 'lucide-react';

type TDemoCard = {
  title: string;
  description: string;
  path: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
};

function createDemoCards(): TDemoCard[] {
  return [
    {
      title: 'Timezone Demo',
      description: 'Interactive timezone selector and world clock with real-time updates',
      path: '/demos/timezone',
      category: 'Time',
      icon: Clock,
      features: ['Real-time updates', 'Multiple timezones', 'Interactive selector', 'Time formatting'],
    },
    {
      title: 'NumberFlow Demo',
      description: 'Animated number transitions with various presets and configurations',
      path: '/demos/numberflow',
      category: 'Animation',
      icon: Hash,
      features: ['Smooth animations', 'Multiple presets', 'Custom configurations', 'Performance optimized'],
    },
  ];
}

export default function DemosIndex() {
  const demoCards = createDemoCards();

  return (
    <DemoLayout
      title="Component Demos"
      description="Interactive demonstrations of reusable components with various configurations and use cases."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoCards.map((demo) => {
          const Icon = demo.icon;
          
          return (
            <Card key={demo.path} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {demo.title}
                      <Badge variant="secondary" className="text-xs">
                        {demo.category}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {demo.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {demo.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button asChild className="w-full group-hover:gap-3 transition-all">
                    <Link to={demo.path} className="flex items-center gap-2">
                      View Demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About These Demos</h2>
        <p className="text-muted-foreground">
          These demonstrations showcase reusable components built with modern React patterns,
          TypeScript, and Tailwind CSS. Each demo includes interactive examples, configuration
          options, and performance considerations.
        </p>
      </div>
    </DemoLayout>
  );
}
