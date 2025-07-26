import { A } from "@solidjs/router";
import EnhancedDatabaseStatus from "~/components/debug/EnhancedDatabaseStatus";
import { CMSContainer } from "~/cms/container";

function DatabaseTestPage() {
  return (
    <div class="min-h-screen bg-background text-foreground">
      <div class={CMSContainer()}>
        {/* Hero Section */}
        <div class="text-center mb-12">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-3xl opacity-30"></div>
            <div class="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Live Database Monitor
              </div>
              
              <h1 class="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
                Database Health Check
              </h1>
              
              <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Monitor your Neon PostgreSQL connection in real-time with advanced diagnostics, 
                performance metrics, and interactive database exploration.
              </p>
              
              <div class="flex flex-wrap items-center justify-center gap-4">
                <A 
                  href="/" 
                  class="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-all duration-200 font-medium shadow-sm"
                >
                  <span>←</span> Back to Home
                </A>
                
                <A 
                  href="/admin" 
                  class="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-lg hover:bg-primary/20 transition-all duration-200 font-medium"
                >
                  <span>🔐</span> Admin Panel
                </A>
              </div>
            </div>
          </div>
        </div>

        {/* Main Database Status */}
        <EnhancedDatabaseStatus />

        {/* Features Grid */}
        <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">🔗</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Connection Monitoring</h3>
            <p class="text-sm text-muted-foreground">
              Real-time connection status with response time tracking and automatic health checks.
            </p>
          </div>
          
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">📊</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Database Analytics</h3>
            <p class="text-sm text-muted-foreground">
              View table counts, record statistics, and database schema information at a glance.
            </p>
          </div>
          
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">🔄</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Auto Refresh</h3>
            <p class="text-sm text-muted-foreground">
              Automatic monitoring with configurable intervals and manual refresh controls.
            </p>
          </div>
          
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">📋</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Table Explorer</h3>
            <p class="text-sm text-muted-foreground">
              Interactive table browser with detailed information and schema exploration.
            </p>
          </div>
          
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">📈</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Performance Metrics</h3>
            <p class="text-sm text-muted-foreground">
              Track connection latency, query performance, and database response times.
            </p>
          </div>
          
          <div class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div class="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
              <span class="text-2xl">📚</span>
            </div>
            <h3 class="font-semibold text-foreground mb-2">Test History</h3>
            <p class="text-sm text-muted-foreground">
              Keep track of recent connection tests with success/failure history logging.
            </p>
          </div>
        </div>
        
        {/* Tech Stack Info */}
        <div class="mt-12 text-center">
          <div class="bg-muted/30 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 class="text-xl font-semibold text-foreground mb-4">Technology Stack</h3>
            <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div class="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-muted-foreground">Neon PostgreSQL</span>
              </div>
              <div class="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-muted-foreground">Drizzle ORM</span>
              </div>
              <div class="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span class="text-muted-foreground">SolidJS</span>
              </div>
              <div class="flex items-center gap-2 bg-card px-4 py-2 rounded-lg">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span class="text-muted-foreground">TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseTestPage;
