import { A } from "@solidjs/router";
import { CMSContainer } from "~/cms/container";

function AdminPage() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div class="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div class={CMSContainer()}>
        <div class="relative z-10 py-12">
          {/* Header */}
          <div class="text-center mb-12">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <div class="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span class="text-sm font-medium text-accent">Admin Dashboard</span>
            </div>
            <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient mb-4">
              Welcome Back
            </h1>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your application with powerful tools and insights
            </p>
          </div>

          {/* Main Card */}
          <div class="max-w-4xl mx-auto">
            <div class="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Card Header */}
              <div class="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-8 border-b border-border/50">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-semibold mb-2">Admin Controls</h2>
                    <p class="text-muted-foreground">
                      Quick access to your most used features
                    </p>
                  </div>
                  <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div class="p-8">
                {/* Stats Grid */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div class="bg-background/50 rounded-xl p-6 border border-border/30 hover:border-accent/30 transition-all group">
                    <div class="text-3xl font-bold text-accent mb-1">42</div>
                    <div class="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div class="bg-background/50 rounded-xl p-6 border border-border/30 hover:border-accent/30 transition-all group">
                    <div class="text-3xl font-bold text-accent mb-1">128</div>
                    <div class="text-sm text-muted-foreground">Total Posts</div>
                  </div>
                  <div class="bg-background/50 rounded-xl p-6 border border-border/30 hover:border-accent/30 transition-all group">
                    <div class="text-3xl font-bold text-accent mb-1">99.9%</div>
                    <div class="text-sm text-muted-foreground">Uptime</div>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div class="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-6 mb-8">
                  <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Keyboard Shortcuts
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex items-center gap-3">
                      <kbd class="px-3 py-1.5 bg-background/80 border border-border/50 rounded-lg text-sm font-mono shadow-sm">
                        space × 3 → 1
                      </kbd>
                      <span class="text-sm text-muted-foreground">Navigate to Admin</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <kbd class="px-3 py-1.5 bg-background/80 border border-border/50 rounded-lg text-sm font-mono shadow-sm">
                        1 → space × 3
                      </kbd>
                      <span class="text-sm text-muted-foreground">Return to Home</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div class="flex flex-col sm:flex-row gap-4">
                  <A 
                    href="/" 
                    class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background font-medium rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </A>
                  <button class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border-2 border-border hover:border-accent/50 font-medium rounded-xl transition-all hover:-translate-y-0.5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
