import { createSignal, createEffect, Show, For, onMount } from 'solid-js';

type TQueryResult = {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
};

type TQueryError = {
  message: string;
  code?: string;
  detail?: string;
};

type TQueryHistory = {
  id: string;
  query: string;
  timestamp: Date;
  executionTime?: number;
  rowCount?: number;
  success: boolean;
};

type TProps = {
  onQueryExecute?: (query: string) => void;
};

function QueryEditor(props: TProps) {
  const [query, setQuery] = createSignal('');
  const [result, setResult] = createSignal<TQueryResult | null>(null);
  const [error, setError] = createSignal<TQueryError | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [queryHistory, setQueryHistory] = createSignal<TQueryHistory[]>([]);
  const [showHistory, setShowHistory] = createSignal(false);
  const [savedQueries, setSavedQueries] = createSignal<{ name: string; query: string }[]>([]);
  const [queryName, setQueryName] = createSignal('');
  const [showSaveDialog, setShowSaveDialog] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'results' | 'structure'>('results');
  const [exportFormat, setExportFormat] = createSignal<'csv' | 'json'>('csv');

  // Load saved queries and history from localStorage
  onMount(() => {
    const saved = localStorage.getItem('savedQueries');
    if (saved) {
      setSavedQueries(JSON.parse(saved));
    }
    
    const history = localStorage.getItem('queryHistory');
    if (history) {
      setQueryHistory(JSON.parse(history).map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      })));
    }
  });

  // Save history to localStorage when it changes
  createEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory()));
  });

  createEffect(() => {
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries()));
  });

  async function executeQuery() {
    const sql = query().trim();
    if (!sql) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/db/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(data.error || 'Query execution failed');
      }

      setResult({
        columns: data.columns || [],
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
        executionTime
      });

      // Add to history
      const historyEntry: TQueryHistory = {
        id: Date.now().toString(),
        query: sql,
        timestamp: new Date(),
        executionTime,
        rowCount: data.rowCount || 0,
        success: true
      };

      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 49)]);

      if (props.onQueryExecute) {
        props.onQueryExecute(sql);
      }
    } catch (err) {
      const executionTime = Date.now() - startTime;
      setError({
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'QUERY_ERROR'
      });

      // Add failed query to history
      const historyEntry: TQueryHistory = {
        id: Date.now().toString(),
        query: sql,
        timestamp: new Date(),
        executionTime,
        success: false
      };

      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
    } finally {
      setIsLoading(false);
    }
  }

  function formatSQL(sql: string): string {
    // Basic SQL formatting
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'ON', 'AND', 'OR', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
      'DROP', 'ALTER', 'ADD', 'COLUMN', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'
    ];

    let formatted = sql;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, match => match.toUpperCase());
    });

    return formatted;
  }

  function saveQuery() {
    const name = queryName().trim();
    const sql = query().trim();
    
    if (!name || !sql) return;

    setSavedQueries(prev => [...prev, { name, query: sql }]);
    setShowSaveDialog(false);
    setQueryName('');
  }

  function loadQuery(savedQuery: { name: string; query: string }) {
    setQuery(savedQuery.query);
  }

  function deleteQuery(index: number) {
    setSavedQueries(prev => prev.filter((_, i) => i !== index));
  }

  function loadFromHistory(historyItem: TQueryHistory) {
    setQuery(historyItem.query);
    setShowHistory(false);
  }

  function exportResults() {
    const data = result();
    if (!data) return;

    if (exportFormat() === 'csv') {
      exportAsCSV(data);
    } else {
      exportAsJSON(data);
    }
  }

  function exportAsCSV(data: TQueryResult) {
    const csv = [
      data.columns.join(','),
      ...data.rows.map(row => 
        data.columns.map(col => {
          const value = row[col];
          if (value === null) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    downloadFile(csv, 'query-results.csv', 'text/csv');
  }

  function exportAsJSON(data: TQueryResult) {
    const json = JSON.stringify(data.rows, null, 2);
    downloadFile(json, 'query-results.json', 'application/json');
  }

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatCellValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  function getCellClass(value: any): string {
    if (value === null || value === undefined) return 'null-value';
    if (typeof value === 'boolean') return 'boolean-value';
    if (typeof value === 'number') return 'number-value';
    if (typeof value === 'object') return 'json-value';
    return 'string-value';
  }

  return (
    <div class="query-editor-container">
      <div class="query-editor-header">
        <div class="query-editor-title">
          <svg class="query-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2>SQL Query Editor</h2>
        </div>
        
        <div class="query-editor-actions">
          <button
            onClick={() => setShowHistory(!showHistory())}
            class="query-action-btn"
            title="Query History"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            class="query-action-btn"
            disabled={!query().trim()}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
            Save Query
          </button>
        </div>
      </div>

      <div class="query-editor-main">
        <div class="query-editor-sidebar">
          <h3 class="sidebar-title">Saved Queries</h3>
          <div class="saved-queries-list">
            <Show when={savedQueries().length === 0}>
              <p class="empty-state-text">No saved queries yet</p>
            </Show>
            <For each={savedQueries()}>
              {(saved, index) => (
                <div class="saved-query-item">
                  <button
                    onClick={() => loadQuery(saved)}
                    class="saved-query-btn"
                    title={saved.query}
                  >
                    {saved.name}
                  </button>
                  <button
                    onClick={() => deleteQuery(index())}
                    class="delete-query-btn"
                    title="Delete query"
                  >
                    ×
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class="query-editor-content">
          <div class="query-input-section">
            <div class="query-input-wrapper">
              <textarea
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
                placeholder="Enter your SQL query here..."
                class="query-input"
                spellcheck={false}
              />
              <div class="query-line-numbers">
                <For each={query().split('\n')}>
                  {(_, index) => <div>{index() + 1}</div>}
                </For>
              </div>
            </div>
            
            <div class="query-controls">
              <button
                onClick={executeQuery}
                disabled={isLoading() || !query().trim()}
                class="execute-btn"
              >
                <Show when={!isLoading()} fallback={
                  <>
                    <div class="spinner-small"></div>
                    Executing...
                  </>
                }>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Execute Query
                </Show>
              </button>
              
              <button
                onClick={() => setQuery(formatSQL(query()))}
                disabled={!query().trim()}
                class="format-btn"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Format
              </button>
              
              <button
                onClick={() => setQuery('')}
                disabled={!query()}
                class="clear-btn"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>

          <Show when={error()}>
            <div class="query-error">
              <div class="error-header">
                <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Query Error</span>
              </div>
              <div class="error-message">{error()!.message}</div>
              <Show when={error()!.detail}>
                <div class="error-detail">{error()!.detail}</div>
              </Show>
            </div>
          </Show>

          <Show when={result()}>
            <div class="query-results">
              <div class="results-header">
                <div class="results-info">
                  <span class="result-count">{result()!.rowCount} rows</span>
                  <span class="execution-time">{result()!.executionTime}ms</span>
                </div>
                
                <div class="results-actions">
                  <select
                    value={exportFormat()}
                    onChange={(e) => setExportFormat(e.currentTarget.value as 'csv' | 'json')}
                    class="export-format-select"
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                  
                  <button
                    onClick={exportResults}
                    class="export-btn"
                    disabled={result()!.rows.length === 0}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              <div class="results-table-wrapper">
                <table class="results-table">
                  <thead>
                    <tr>
                      <For each={result()!.columns}>
                        {(column) => (
                          <th class="results-th">
                            <div class="column-header">
                              <span class="column-name">{column}</span>
                            </div>
                          </th>
                        )}
                      </For>
                    </tr>
                  </thead>
                  <tbody>
                    <Show when={result()!.rows.length === 0}>
                      <tr>
                        <td colspan={result()!.columns.length} class="empty-results">
                          No data returned
                        </td>
                      </tr>
                    </Show>
                    <For each={result()!.rows}>
                      {(row) => (
                        <tr class="results-tr">
                          <For each={result()!.columns}>
                            {(column) => (
                              <td class={`results-td ${getCellClass(row[column])}`}>
                                <div class="cell-content">
                                  {formatCellValue(row[column])}
                                </div>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Query History Modal */}
      <Show when={showHistory()}>
        <div class="modal-overlay" onClick={() => setShowHistory(false)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Query History</h3>
              <button onClick={() => setShowHistory(false)} class="modal-close">×</button>
            </div>
            <div class="modal-body">
              <div class="history-list">
                <For each={queryHistory()}>
                  {(item) => (
                    <div class={`history-item ${item.success ? 'success' : 'error'}`}>
                      <div class="history-header">
                        <span class="history-time">
                          {item.timestamp.toLocaleString()}
                        </span>
                        <div class="history-stats">
                          <Show when={item.success}>
                            <span class="history-rows">{item.rowCount} rows</span>
                            <span class="history-duration">{item.executionTime}ms</span>
                          </Show>
                        </div>
                      </div>
                      <div class="history-query">{item.query}</div>
                      <button
                        onClick={() => loadFromHistory(item)}
                        class="use-query-btn"
                      >
                        Use this query
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Save Query Dialog */}
      <Show when={showSaveDialog()}>
        <div class="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div class="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Save Query</h3>
              <button onClick={() => setShowSaveDialog(false)} class="modal-close">×</button>
            </div>
            <div class="modal-body">
              <input
                type="text"
                value={queryName()}
                onInput={(e) => setQueryName(e.currentTarget.value)}
                placeholder="Query name..."
                class="query-name-input"
                autofocus
              />
              <div class="modal-actions">
                <button onClick={() => setShowSaveDialog(false)} class="cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={saveQuery}
                  disabled={!queryName().trim()}
                  class="save-btn"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default QueryEditor;
