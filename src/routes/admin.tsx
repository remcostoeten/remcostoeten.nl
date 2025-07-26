import { A } from "@solidjs/router";
import { CMSContainer } from "~/cms/container";

function AdminPage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class={CMSContainer()}>
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary mb-8">Admin Panel</h1>
          <div class="bg-card p-8 rounded-lg border border-border">
            <h2 class="text-2xl font-semibold mb-4">Welcome to Admin</h2>
            <p class="text-muted-foreground mb-6">
              You've successfully accessed the admin panel using the keyboard shortcut!
            </p>
            <div class="space-y-4">
              <div class="bg-muted p-4 rounded text-sm">
                <p><strong>Keyboard Shortcuts:</strong></p>
                <p>• <kbd class="bg-background px-2 py-1 rounded text-xs">space space space 1</kbd> - Go to Admin</p>
                <p>• <kbd class="bg-background px-2 py-1 rounded text-xs">1 space space space</kbd> - Go to Home</p>
              </div>
              <A 
                href="/" 
                class="inline-block bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </A>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
