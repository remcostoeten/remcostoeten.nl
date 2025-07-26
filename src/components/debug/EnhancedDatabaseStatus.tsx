import { createSignal, onMount, Show, For, onCleanup, createEffect } from 'solid-js';

type TDatabaseTestResult = {
  success: boolean;
  message: string;
  data?: {
    connection: string;
    timestamp: string;
    tables: string[];
    stats: {
      adminUsers: number;
      projects: number;
    };
  };
  error?: string;
  timestamp: string;
};

function EnhancedDatabaseStatus() {
  const [testResult, setTestResult] = createSignal<TDatabaseTestResult | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [lastRefresh, setLastRefresh] = createSignal<string>('');
  const [selectedTable, setSelectedTable] = createSignal<string>('');
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [refreshInterval, setRefreshInterval] = createSignal<number | null>(null);
  const [testHistory, setTestHistory] = createSignal<{ time: string; success: boolean }[]>([]);
  const [responseTime, setResponseTime] = createSignal<number>(0);

  async function testConnection() {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/db/test');
      const result = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setTestResult(result);
      setResponseTime(duration);
      setLastRefresh(new Date().toLocaleTimeString());
      
      // Add to history
      setTestHistory(prev => [
        { time: new Date().toLocaleTimeString(), success: result.success },
        ...prev.slice(0, 9) // Keep last 10 results
      ]);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setTestResult({
        success: false,
        message: 'Failed to reach database test endpoint',
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
      });
      setResponseTime(duration);
      
      // Add failed test to history
      setTestHistory(prev => [
        { time: new Date().toLocaleTimeString(), success: false },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAutoRefresh() {
    setAutoRefresh(!autoRefresh());
  }

  // Handle auto-refresh
  createEffect(() => {
    if (autoRefresh()) {
      const interval = setInterval(testConnection, 30000); // Every 30 seconds
      setRefreshInterval(interval as unknown as number);
    } else {
      if (refreshInterval()) {
        clearInterval(refreshInterval()!);
        setRefreshInterval(null);
      }
    }
  });

  onMount(() => {
    testConnection();
  });

  onCleanup(() => {
    if (refreshInterval()) {
      clearInterval(refreshInterval()!);
    }
  });

  return (
    <div class="space-y-6">
      {/* Main Status Card */}
      <div class="bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold text-foreground">Database Status</h2>
            <Show when={testResult()}>
              <div class={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                testResult()!.success 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <div class={`w-2 h-2 rounded-full ${
                  testResult()!.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                {testResult()!.success ? 'Online' : 'Offline'}
              </div>
            </Show>
          </div>
          
          <div class="flex items-center gap-3">
            <button
              onClick={toggleAutoRefresh}
              class={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                autoRefresh() 
                  ? 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30' 
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
            >
              {autoRefresh() ? '🔄 Auto (30s)' : '⏸️ Manual'}
            </button>
            
            <button
              onClick={testConnection}
              disabled={isLoading()}
              class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all duration-200 font-medium shadow-sm"
            >
              {isLoading() ? '🔄 Testing...' : '🚀 Test Now'}
            </button>
          </div>
        </div>

        {/* Connection Stats Grid */}
        <Show when={testResult()}>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-foreground">
                {responseTime()}ms
              </div>
              <div class="text-sm text-muted-foreground">Response Time</div>
            </div>
            
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-accent">
                {testResult()!.data?.tables.length || 0}
              </div>
              <div class="text-sm text-muted-foreground">Tables</div>
            </div>
            
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-accent">
                {testResult()!.data?.stats.adminUsers || 0}
              </div>
              <div class="text-sm text-muted-foreground">Admin Users</div>
            </div>
            
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-accent">
                {testResult()!.data?.stats.projects || 0}
              </div>
              <div class="text-sm text-muted-foreground">Projects</div>
            </div>
          </div>
        </Show>

        {/* Status Message */}
        <Show when={testResult()}>
          <div class={`p-4 rounded-lg border transition-all duration-300 ${
            testResult()!.success 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <p class="text-foreground font-medium mb-2">
              {testResult()!.message}
            </p>
            
            <Show when={lastRefresh()}>
              <p class="text-sm text-muted-foreground">
                Last checked: {lastRefresh()}
              </p>
            </Show>

            <Show when={testResult()!.error}>
              <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                <p class="text-sm text-red-400 font-mono">
                  ❌ {testResult()!.error}
                </p>
              </div>
            </Show>
          </div>
        </Show>

        {/* Loading State */}
        <Show when={isLoading()}>
          <div class="flex items-center justify-center py-12">
            <div class="relative">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Tables Grid */}
      <Show when={testResult()?.data?.tables}>
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Database Tables</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <For each={testResult()!.data!.tables}>
              {(table) => (
                <button
                  onClick={() => setSelectedTable(selectedTable() === table ? '' : table)}
                  class={`p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
                    selectedTable() === table
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div class="text-sm font-mono">{table}</div>
                </button>
              )}
            </For>
          </div>
          
          <Show when={selectedTable()}>
            <div class="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 class="font-semibold text-primary mb-2">
                📋 Selected: {selectedTable()}
              </h4>
              <p class="text-sm text-muted-foreground">
                This table is part of your database schema. You could extend this to show table details, row counts, or schema information.
              </p>
            </div>
          </Show>
        </div>
      </Show>

      {/* Test History */}
      <Show when={testHistory().length > 0}>
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-foreground mb-4">Recent Tests</h3>
          <div class="space-y-2">
            <For each={testHistory()}>
              {(test) => (
                <div class="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span class="text-sm font-mono text-muted-foreground">{test.time}</span>
                  <div class={`flex items-center gap-2 text-sm ${
                    test.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div class={`w-2 h-2 rounded-full ${
                      test.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {test.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default EnhancedDatabaseStatus;
