import { CMSLink } from '@/components/ui/cms-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HomeIcon, 
  ExternalLinkIcon, 
  BarChart3Icon, 
  SettingsIcon,
  ArrowRightIcon,
  GithubIcon,
  TwitterIcon
} from 'lucide-react';

export default function CMSLinkDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">CMS Link Component Demo</h1>
          <p className="text-muted-foreground mb-8">
            Showcase of the configurable link component with various options for CMS integration.
          </p>
        </div>

        {/* Basic Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Link Variants</CardTitle>
            <CardDescription>Different visual styles for links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <CMSLink href="/" variant="default">Default Link</CMSLink>
              <CMSLink href="/" variant="primary">Primary Link</CMSLink>
              <CMSLink href="/" variant="muted">Muted Link</CMSLink>
              <CMSLink href="/" variant="ghost">Ghost Link</CMSLink>
              <CMSLink href="/" variant="outline">Outline Link</CMSLink>
              <CMSLink href="/" variant="destructive">Destructive Link</CMSLink>
              <CMSLink href="/" variant="accent">Accent Link</CMSLink>
            </div>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Link Sizes</CardTitle>
            <CardDescription>Different sizes available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <CMSLink href="/" size="sm" variant="primary">Small Link</CMSLink>
              <CMSLink href="/" size="md" variant="primary">Medium Link</CMSLink>
              <CMSLink href="/" size="lg" variant="primary">Large Link</CMSLink>
            </div>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card>
          <CardHeader>
            <CardTitle>Links with Icons</CardTitle>
            <CardDescription>Icons can be positioned left or right</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <CMSLink href="/" icon={HomeIcon} iconPosition="left" variant="primary">
                Home Page
              </CMSLink>
              <CMSLink href="/admin" icon={SettingsIcon} iconPosition="left" variant="muted">
                Admin Panel
              </CMSLink>
              <CMSLink href="/analytics" icon={BarChart3Icon} iconPosition="right" variant="outline">
                View Analytics
              </CMSLink>
              <CMSLink href="https://github.com" icon={GithubIcon} iconPosition="left" variant="ghost">
                GitHub
              </CMSLink>
            </div>
          </CardContent>
        </Card>

        {/* Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Link Indicators</CardTitle>
            <CardDescription>Various indicators to show link behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Arrow Indicators</h4>
              <div className="flex flex-wrap gap-4">
                <CMSLink href="/" indicator="arrow-left" variant="muted">
                  Back to Home
                </CMSLink>
                <CMSLink href="/next-page" indicator="arrow-right" variant="primary">
                  Continue Reading
                </CMSLink>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">External Link Indicators</h4>
              <div className="flex flex-wrap gap-4">
                <CMSLink href="https://example.com" indicator="external" variant="primary">
                  External Website
                </CMSLink>
                <CMSLink href="https://docs.example.com" indicator="new-tab" variant="outline">
                  Documentation
                </CMSLink>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Status Indicators</h4>
              <div className="flex flex-wrap gap-4">
                <CMSLink href="/live-data" indicator="pulse" variant="primary">
                  Live Dashboard
                </CMSLink>
                <CMSLink href="/status" indicator="dot" variant="muted">
                  System Status
                </CMSLink>
                <CMSLink href="/notifications" indicator="badge" indicatorText="3" variant="primary">
                  Notifications
                </CMSLink>
                <CMSLink href="/updates" indicator="badge" indicatorText="New" variant="accent">
                  Latest Updates
                </CMSLink>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active States */}
        <Card>
          <CardHeader>
            <CardTitle>Active States</CardTitle>
            <CardDescription>How links look when active/current</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <CMSLink href="/current" isActive variant="default">
                Current Page
              </CMSLink>
              <CMSLink href="/analytics" isActive variant="primary" icon={BarChart3Icon} iconPosition="left">
                Active Analytics
              </CMSLink>
              <CMSLink href="/settings" isActive variant="ghost" indicator="arrow-right">
                Active Settings
              </CMSLink>
            </div>
          </CardContent>
        </Card>

        {/* Complex Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Complex Examples</CardTitle>
            <CardDescription>Real-world usage examples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Navigation Menu</h4>
              <nav className="flex gap-4 p-4 bg-muted rounded-lg">
                <CMSLink href="/" variant="primary" isActive>Home</CMSLink>
                <CMSLink href="/about" variant="muted">About</CMSLink>
                <CMSLink href="/projects" variant="muted">Projects</CMSLink>
                <CMSLink href="/contact" variant="muted">Contact</CMSLink>
                <CMSLink href="/blog" variant="muted" indicator="badge" indicatorText="New">
                  Blog
                </CMSLink>
              </nav>
            </div>

            <div>
              <h4 className="font-medium mb-3">Social Links</h4>
              <div className="flex gap-4">
                <CMSLink 
                  href="https://github.com/username" 
                  icon={GithubIcon} 
                  iconPosition="left" 
                  variant="outline"
                  indicator="external"
                >
                  GitHub Profile
                </CMSLink>
                <CMSLink 
                  href="https://twitter.com/username" 
                  icon={TwitterIcon} 
                  iconPosition="left" 
                  variant="outline"
                  indicator="external"
                >
                  Follow on Twitter
                </CMSLink>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Admin Panel Links</h4>
              <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg max-w-xs">
                <CMSLink href="/admin" variant="ghost" icon={HomeIcon} iconPosition="left">
                  Dashboard
                </CMSLink>
                <CMSLink href="/admin/analytics" variant="ghost" icon={BarChart3Icon} iconPosition="left" isActive>
                  Analytics
                </CMSLink>
                <CMSLink href="/admin/settings" variant="ghost" icon={SettingsIcon} iconPosition="left">
                  Settings
                </CMSLink>
                <CMSLink href="/" variant="muted" indicator="arrow-left" size="sm">
                  Back to Site
                </CMSLink>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CMS Configuration Example */}
        <Card>
          <CardHeader>
            <CardTitle>CMS Configuration Example</CardTitle>
            <CardDescription>How this component could be configured in a CMS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
{`// CMS Configuration Object
{
  "text": "View Documentation",
  "href": "https://docs.example.com",
  "variant": "primary",
  "size": "md",
  "icon": "ExternalLinkIcon",
  "iconPosition": "right",
  "indicator": "external",
  "isExternal": true,
  "showHoverEffect": true
}

// Renders as:
<CMSLink 
  href="https://docs.example.com"
  variant="primary"
  size="md"
  icon={ExternalLinkIcon}
  iconPosition="right"
  indicator="external"
  isExternal={true}
  showHoverEffect={true}
>
  View Documentation
</CMSLink>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
