import { createSignal, onMount, Show, For } from 'solid-js';

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

function DatabaseStatus() {
  const [testResult, setTestResult] = createSignal<TDatabaseTestResult | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [lastRefresh, setLastRefresh] = createSignal<string>('');
  const [selectedTable, setSelectedTable] = createSignal<string>('');
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [refreshInterval, setRefreshInterval] = createSignal<number | null>(null);

  async function testConnection() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/db/test');
      const result = await response.json();
      setTestResult(result);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to reach database test endpoint',
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }

  onMount(() => {
    testConnection();
  });

  return (
    <div class="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-foreground">Database Connection Status</h2>
        <button
          onClick={testConnection}
          disabled={isLoading()}
          class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading() ? 'Testing...' : 'Refresh'}
        </button>
      </div>

      <Show when={lastRefresh()}>
        <p class="text-sm text-muted-foreground mb-4">
          Last checked: {lastRefresh()}
        </p>
      </Show>

      <Show when={testResult()}>
        <div class={`p-4 rounded-lg mb-4 ${
          testResult()!.success 
            ? 'bg-green-500/10 border border-green-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <div class="flex items-center gap-2 mb-2">
            <div class={`w-3 h-3 rounded-full ${
              testResult()!.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span class={`font-medium ${
              testResult()!.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testResult()!.success ? 'Connected' : 'Connection Failed'}
            </span>
          </div>
          
          <p class="text-sm text-foreground mb-2">
            {testResult()!.message}
          </p>

          <Show when={testResult()!.error}>
            <div class="bg-red-500/5 border border-red-500/10 rounded p-2 mt-2">
              <p class="text-sm text-red-400 font-mono">
                Error: {testResult()!.error}
              </p>
            </div>
          </Show>

          <Show when={testResult()!.data}>
            <div class="mt-4 space-y-3">
              <div>
                <h4 class="font-medium text-foreground mb-2">Database Information</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-muted-foreground">Connection:</span>
                    <span class={`ml-2 font-mono ${
                      testResult()!.data!.connection === 'OK' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {testResult()!.data!.connection}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Admin Users:</span>
                    <span class="ml-2 font-mono text-accent">
                      {testResult()!.data!.stats.adminUsers}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Projects:</span>
                    <span class="ml-2 font-mono text-accent">
                      {testResult()!.data!.stats.projects}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Tables:</span>
                    <span class="ml-2 font-mono text-accent">
                      {testResult()!.data!.tables.length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-medium text-foreground mb-2">Available Tables</h4>
                <div class="bg-muted/50 rounded p-2 max-h-32 overflow-y-auto">
                  <div class="grid grid-cols-2 gap-1 text-xs font-mono">
                    {testResult()!.data!.tables.map(table => (
                      <div class="text-muted-foreground">{table}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={isLoading()}>
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Show>
    </div>
  );
}

export default DatabaseStatus;
