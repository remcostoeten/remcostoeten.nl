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

type TTableData = {
  tableName: string;
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
};

type TTableSchema = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

export default function EnhancedDatabaseStatus() {
  const [testResult, setTestResult] = createSignal<TDatabaseTestResult | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [lastRefresh, setLastRefresh] = createSignal<string>('');
  const [selectedTable, setSelectedTable] = createSignal<string>('');
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [refreshInterval, setRefreshInterval] = createSignal<number | null>(null);
  const [responseTime, setResponseTime] = createSignal<number>(0);
  const [tableData, setTableData] = createSignal<TTableData | null>(null);
  const [tableSchema, setTableSchema] = createSignal<TTableSchema[]>([]);
  const [loadingTableData, setLoadingTableData] = createSignal(false);
  const [currentPage, setCurrentPage] = createSignal(1);
  const [itemsPerPage] = createSignal(20);

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
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAutoRefresh() {
    setAutoRefresh(!autoRefresh());
  }

  async function fetchTableData(tableName: string) {
    if (!tableName) return;
    
    setLoadingTableData(true);
    try {
      const [dataResponse, schemaResponse] = await Promise.all([
        fetch(`/api/db/table/${tableName}?page=${currentPage()}&limit=${itemsPerPage()}`),
        fetch(`/api/db/table/${tableName}/schema`)
      ]);
      
      if (dataResponse.ok && schemaResponse.ok) {
        const data = await dataResponse.json();
        const schema = await schemaResponse.json();
        
        setTableData({
          tableName,
          columns: data.columns || [],
          rows: data.rows || [],
          totalRows: data.totalRows || 0
        });
        setTableSchema(schema.columns || []);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
      setTableData(null);
      setTableSchema([]);
    } finally {
      setLoadingTableData(false);
    }
  }

  function handleTableSelect(tableName: string) {
    const newTable = selectedTable() === tableName ? '' : tableName;
    setSelectedTable(newTable);
    setCurrentPage(1);
    
    if (newTable) {
      fetchTableData(newTable);
    } else {
      setTableData(null);
      setTableSchema([]);
    }
  }

  function formatCellValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  }

  function getDataTypeColor(dataType: string): string {
    if (dataType.includes('varchar') || dataType.includes('text')) return 'text-blue-600';
    if (dataType.includes('int') || dataType.includes('serial')) return 'text-green-600';
    if (dataType.includes('bool')) return 'text-purple-600';
    if (dataType.includes('timestamp') || dataType.includes('date')) return 'text-orange-600';
    if (dataType.includes('uuid')) return 'text-pink-600';
    return 'text-gray-600';
  }

  createEffect(() => {
    if (autoRefresh()) {
      const interval = setInterval(testConnection, 30000);
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
    <div class="flex h-full">
      {/* Sidebar */}
      <div class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div class="p-4">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Connection Status</h3>
          
          {/* Connection Info */}
          <div class="mb-6">
            <Show when={testResult()}>
              <div class={`flex items-center gap-2 p-3 rounded-lg ${
                testResult()!.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div class={`w-2 h-2 rounded-full ${
                  testResult()!.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <div class="flex-1">
                  <p class={`text-sm font-medium ${
                    testResult()!.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {testResult()!.success ? 'Connected' : 'Disconnected'}
                  </p>
                  <p class="text-xs text-gray-600">
                    {responseTime()}ms response time
                  </p>
                </div>
              </div>
            </Show>
            
            <button
              onClick={toggleAutoRefresh}
              data-action="auto-refresh-toggle"
              class="hidden"
            >
              Toggle Auto Refresh
            </button>
          </div>
          
          {/* Stats */}
          <Show when={testResult()?.data}>
            <div class="space-y-3 mb-6">
              <div class="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <span class="text-sm text-gray-600">Tables</span>
                <span class="text-sm font-medium text-gray-900">
                  {testResult()!.data!.tables.length}
                </span>
              </div>
              <div class="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <span class="text-sm text-gray-600">Admin Users</span>
                <span class="text-sm font-medium text-gray-900">
                  {testResult()!.data!.stats.adminUsers}
                </span>
              </div>
              <div class="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <span class="text-sm text-gray-600">Projects</span>
                <span class="text-sm font-medium text-gray-900">
                  {testResult()!.data!.stats.projects}
                </span>
              </div>
            </div>
          </Show>
          
          {/* Tables List */}
          <Show when={testResult()?.data?.tables}>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tables</h3>
              <div class="space-y-1">
                <For each={testResult()!.data!.tables}>
                  {(table) => (
                    <button
                      onClick={() => handleTableSelect(table)}
                      data-table-button
                      class={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTable() === table
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div class="flex items-center justify-between">
                        <span class="font-mono">{table}</span>
                        <Show when={selectedTable() === table}>
                          <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Show>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div class="flex-1 overflow-auto bg-gray-50">
        <div class="p-6">
          {/* Welcome State */}
          <Show when={!selectedTable()}>
            <div class="max-w-4xl mx-auto">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Select a table to explore</h2>
                <p class="text-gray-600">Choose a table from the sidebar to view its schema and data</p>
              </div>
            </div>
          </Show>

          {/* Table View */}
          <Show when={selectedTable()}>
            <div class="max-w-full">
              {/* Table Header */}
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">{selectedTable()}</h2>
                    <Show when={tableData()}>
                      <p class="text-sm text-gray-600">{tableData()!.totalRows} total rows</p>
                    </Show>
                  </div>
                  <Show when={loadingTableData()}>
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-indigo-600"></div>
                  </Show>
                </div>
              </div>

              {/* Schema Section */}
              <Show when={tableSchema().length > 0}>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                  <div class="px-4 py-3 border-b border-gray-200">
                    <h3 class="text-sm font-semibold text-gray-900">Schema</h3>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <For each={tableSchema()}>
                        {(column) => (
                          <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <div class="flex-1">
                              <p class="font-mono text-sm font-medium text-gray-900">{column.column_name}</p>
                              <p class={`text-xs font-medium ${getDataTypeColor(column.data_type)}`}>
                                {column.data_type}
                              </p>
                              <div class="flex items-center gap-2 mt-1">
                                <span class={`text-xs px-2 py-0.5 rounded-full ${
                                  column.is_nullable === 'YES' 
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {column.is_nullable === 'YES' ? 'Nullable' : 'Required'}
                                </span>
                                <Show when={column.column_default}>
                                  <span class="text-xs text-gray-500">
                                    Default: {column.column_default}
                                  </span>
                                </Show>
                              </div>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </Show>

              {/* Data Table */}
              <Show when={tableData() && tableData()!.rows.length > 0}>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="min-w-full">
                      <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <For each={tableData()!.columns}>
                            {(column) => (
                              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {column}
                              </th>
                            )}
                          </For>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <For each={tableData()!.rows}>
                          {(row) => (
                            <tr class="hover:bg-gray-50">
                              <For each={tableData()!.columns}>
                                {(column) => (
                                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class={`font-mono ${
                                      row[column] === null || row[column] === undefined
                                        ? 'text-gray-400 italic'
                                        : 'text-gray-900'
                                    }`}>
                                      {formatCellValue(row[column])}
                                    </span>
                                  </td>
                                )}
                              </For>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <Show when={tableData()!.totalRows > itemsPerPage()}>
                    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <p class="text-sm text-gray-700">
                        Showing {(currentPage() - 1) * itemsPerPage() + 1} to{' '}
                        {Math.min(currentPage() * itemsPerPage(), tableData()!.totalRows)} of{' '}
                        {tableData()!.totalRows} results
                      </p>
                      <div class="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentPage(Math.max(1, currentPage() - 1));
                            fetchTableData(selectedTable());
                          }}
                          disabled={currentPage() === 1}
                          class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            setCurrentPage(currentPage() + 1);
                            fetchTableData(selectedTable());
                          }}
                          disabled={currentPage() >= Math.ceil(tableData()!.totalRows / itemsPerPage())}
                          class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Empty State */}
              <Show when={tableData() && tableData()!.rows.length === 0 && !loadingTableData()}>
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="text-sm font-medium text-gray-900 mb-1">No data found</h3>
                  <p class="text-sm text-gray-500">This table is empty</p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
