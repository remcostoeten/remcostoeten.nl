import { NumberFlowDemo } from '@/components/examples/number-flow-demo';
import { NumberFlowPresetsDemo } from '@/components/examples/number-flow-presets-demo';

export default function NumberFlowTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-12">
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
