import { PageLayout } from '@/components/layout/PageLayout';
import { DevApiPanel } from '@/components/dev/DevApiPanel';

export default function DevPage() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Development Tools</h1>
            <p className="text-muted-foreground">
              Test and monitor your localhost:3001 analytics API
            </p>
          </div>
          
          <DevApiPanel />
        </div>
      </div>
    </PageLayout>
  );
}
