import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Clock, Hash } from 'lucide-react';

type TProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  category?: string;
};

function createDemoNavigation() {
  return [
    {
      path: '/demos',
      label: 'All Demos',
      icon: Home,
    },
    {
      path: '/demos/timezone',
      label: 'Timezone Demo',
      icon: Clock,
      category: 'Time',
    },
    {
      path: '/demos/numberflow',
      label: 'NumberFlow Demo',
      icon: Hash,
      category: 'Animation',
    },
  ];
}

export function DemoLayout({ children, title, description, category }: TProps) {
  const location = useLocation();
  const navigation = createDemoNavigation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">← Home</Link>
            </Button>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.category && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">{title}</h1>
              {category && (
                <Badge variant="outline" className="text-sm">
                  {category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
