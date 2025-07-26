import { A } from "@solidjs/router";
import DatabaseStatus from "~/components/debug/DatabaseStatus";
import { CMSContainer } from "~/cms/container";

function DatabaseTestPage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class={CMSContainer()}>
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-primary mb-4">Database Connection Test</h1>
          <p class="text-muted-foreground mb-6">
            Test your Neon PostgreSQL connection and view database status
          </p>
          <A 
            href="/" 
            class="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80 transition-colors"
          >
            ← Back to Home
          </A>
        </div>

        <DatabaseStatus />

        <div class="mt-8 text-center">
          <div class="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 class="font-semibold text-foreground mb-2">What this test checks:</h3>
            <ul class="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Database connection to Neon PostgreSQL</li>
              <li>• Available tables in your schema</li>
              <li>• Record counts for key tables</li>
              <li>• Connection latency and response time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseTestPage;
