import { NumberFlowDemo } from '@/components/examples/NumberFlowDemo';
import { NumberFlowPresetsDemo } from '@/components/examples/NumberFlowPresetsDemo';

export default function NumberFlowTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation */}
        <nav className="flex gap-4 p-4 bg-muted rounded-lg mb-8">
          <a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
          <a href="/timezone-demo" className="text-muted-foreground hover:text-primary transition-colors">Timezone Demo</a>
          <a href="/numberflow-test" className="text-primary font-medium">NumberFlow Basic</a>
        </nav>
        
        <div>
          <h1 className="text-4xl font-bold mb-4">NumberFlow Component Testing</h1>
          <p className="text-muted-foreground mb-8">
            Testing the reusable NumberFlow component with various configurations.
          </p>
        </div>
        
        <NumberFlowDemo />
        
        <hr className="border-border" />
        
        <NumberFlowPresetsDemo />
      </div>
    </div>
  );
}
