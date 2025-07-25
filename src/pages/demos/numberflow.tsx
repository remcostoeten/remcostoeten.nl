import { DemoLayout } from '@/components/layout/demo-layout';
import { NumberFlowDemo } from '@/components/examples/NumberFlowDemo';
import { NumberFlowPresetsDemo } from '@/components/examples/NumberFlowPresetsDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Settings, Palette, TrendingUp } from 'lucide-react';

function createNumberFlowFeatures() {
  return [
    {
      icon: Zap,
      title: 'Smooth Animations',
      description: 'Fluid number transitions with customizable easing and duration',
    },
    {
      icon: Palette,
      title: 'Multiple Presets',
      description: 'Pre-configured animation styles for common use cases',
    },
    {
      icon: Settings,
      title: 'Highly Configurable',
      description: 'Fine-tune animations with extensive customization options',
    },
    {
      icon: TrendingUp,
      title: 'Performance Optimized',
      description: 'Efficient animations with minimal impact on performance',
    },
  ];
}

export default function NumberFlowDemoPage() {
  const features = createNumberFlowFeatures();

  return (
    <DemoLayout
      title="NumberFlow Demo"
      description="Animated number transitions with smooth animations, multiple presets, and extensive customization options."
      category="Animation"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle>Basic NumberFlow Demo</CardTitle>
              <Badge variant="outline">Interactive</Badge>
            </div>
            <CardDescription>
              Basic number animation controls with customizable values, format options,
              and animation settings. Click buttons to see smooth transitions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NumberFlowDemo />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Animation Presets</CardTitle>
              <Badge variant="outline">Multiple Styles</Badge>
            </div>
            <CardDescription>
              Pre-configured animation presets optimized for different use cases.
              Each preset includes specific timing, easing, and formatting options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NumberFlowPresetsDemo />
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Animation Engine</h4>
              <p className="text-sm text-muted-foreground">
                Built on @number-flow/react library with custom presets and configurations.
                Uses requestAnimationFrame for smooth 60fps animations.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Performance Optimizations</h4>
              <p className="text-sm text-muted-foreground">
                Minimal re-renders with memoized components and efficient state updates.
                GPU-accelerated transforms where supported.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Customization Options</h4>
              <p className="text-sm text-muted-foreground">
                Supports custom formatting, localization, decimal handling, and animation timing.
                Extensible preset system for consistent styling across applications.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Accessibility</h4>
              <p className="text-sm text-muted-foreground">
                Respects prefers-reduced-motion settings and provides accessible fallbacks
                for users with motion sensitivity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DemoLayout>
  );
}
