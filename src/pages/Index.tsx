// import { PageLayout } from "@/components/layout/PageLayout";
import { Link, useLocation } from "react-router-dom";
import { 
  HeroSection, 
  AboutSection, 
  ProjectsSection, 
  ContactSection, 
  TimezoneSection 
} from "@/modules/sections";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Clock, Hash, TestTube, Type } from "lucide-react";

function createDemoItems() {
  return [
    {
      path: '/demos',
      label: 'All Demos',
      icon: TestTube,
      description: 'Browse all component demonstrations',
    },
    {
      path: '/text-variants',
      label: 'Text Variants',
      icon: Type,
      description: 'Text component styles and variants',
      category: 'Typography',
    },
    {
      path: '/demos/timezone', 
      label: 'Timezone Demo',
      icon: Clock,
      description: 'Interactive timezone selector',
      category: 'Time',
    },
    {
      path: '/demos/numberflow',
      label: 'NumberFlow Demo', 
      icon: Hash,
      description: 'Animated number transitions',
      category: 'Animation',
    },
  ];
}

function Index() {
  const location = useLocation();
  const demoItems = createDemoItems();
  
  const navItems = [
    { path: '/', label: 'Home' },
  ];
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  Demos
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {demoItems.map((demo, index) => {
                  const Icon = demo.icon;
                  const isActive = location.pathname === demo.path;
                  
                  return (
                    <div key={demo.path}>
                      <DropdownMenuItem asChild>
                        <Link 
                          to={demo.path} 
                          className={`flex items-start gap-3 p-3 hover:bg-accent hover:text-accent-foreground transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground'}`}
                        >
                          <div className="p-1 rounded bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{demo.label}</span>
                              {demo.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {demo.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/70 mt-1">
                              {demo.description}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      {index < demoItems.length - 1 && demo.path === '/demos' && (
                        <DropdownMenuSeparator />
                      )}
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">Try: </span>
            <kbd className="bg-background px-2 py-1 rounded text-xs">⎵ ⎵ ⎵ 1</kbd>
            <span className="hidden sm:inline"> for admin</span>
          </div>
        </nav>
        
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
        <TimezoneSection 
          highlightVariant="dashed" 
          showAnimation={true} 
          animationDelay={0.8}
        />
        
        {/* Example variants - uncomment to test:
        <TimezoneSection highlightVariant="yellow" />
        <TimezoneSection highlightVariant="solid" />
        <TimezoneSection highlightVariant="outline" />
        <TimezoneSection highlightVariant="underline" />
        <TimezoneSection highlightVariant="border-blue" />
        <TimezoneSection highlightVariant="border-green" />
        <TimezoneSection highlightVariant="border-red" />
        <TimezoneSection highlightVariant="border-purple" />
        <TimezoneSection highlightVariant="border-orange" />
        <TimezoneSection highlightVariant="border-pink" />
        <TimezoneSection highlightVariant="border-cyan" />
        <TimezoneSection highlightVariant="dashed" showAnimation={false} />
        */}
      </div>
    </div>
  );
}

export default Index;