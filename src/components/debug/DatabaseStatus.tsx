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
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Database Connection Status</h2>
        <button
          onClick={testConnection}
          disabled={isLoading()}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Refresh database connection status"
        >
          {isLoading() ? 'Testing...' : 'Refresh'}
        </button>
      </div>

      <Show when={lastRefresh()}>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Last checked: {lastRefresh()}
        </p>
      </Show>

      <Show when={testResult()}>
        <div class={`p-4 rounded-lg mb-4 ${
          testResult()!.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div class="flex items-center gap-2 mb-2">
            <div class={`w-3 h-3 rounded-full ${
              testResult()!.success ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span class={`font-medium ${
              testResult()!.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {testResult()!.success ? 'Connected' : 'Connection Failed'}
            </span>
          </div>
          
          <p class="text-sm text-gray-900 dark:text-gray-100 mb-2">
            {testResult()!.message}
          </p>

          <Show when={testResult()!.error}>
            <div class="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded p-2 mt-2">
              <p class="text-sm text-red-700 dark:text-red-400 font-mono">
                Error: {testResult()!.error}
              </p>
            </div>
          </Show>

          <Show when={testResult()!.data}>
            <div class="mt-4 space-y-3">
              <div>
                <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">Database Information</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Connection:</span>
                    <span class={`ml-2 font-mono ${
                      testResult()!.data!.connection === 'OK' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {testResult()!.data!.connection}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Admin Users:</span>
                    <span class="ml-2 font-mono text-blue-600 dark:text-blue-400">
                      {testResult()!.data!.stats.adminUsers}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Projects:</span>
                    <span class="ml-2 font-mono text-blue-600 dark:text-blue-400">
                      {testResult()!.data!.stats.projects}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Tables:</span>
                    <span class="ml-2 font-mono text-blue-600 dark:text-blue-400">
                      {testResult()!.data!.tables.length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">Available Tables</h4>
                <div class="bg-gray-100 dark:bg-gray-700 rounded p-2 max-h-32 overflow-y-auto">
                  <div class="grid grid-cols-2 gap-1 text-xs font-mono">
                    <For each={testResult()!.data!.tables}>
                      {(table) => (
                        <div class="text-gray-600 dark:text-gray-400 py-0.5">{table}</div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={isLoading()}>
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Show>
    </div>
  );
}

export default DatabaseStatus;