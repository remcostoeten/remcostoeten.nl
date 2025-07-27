import { createSignal, onMount, Show, For, onCleanup, createEffect } from 'solid-js';
import '~/styles/outerbase-dashboard.css';

type TDatabaseTestResult = {
  success: boolean
  message: string
  data?: {
    connection: string
    timestamp: string
    tables: string[]
    stats: {
      adminUsers: number
      projects: number
    }
  }
  error?: string
  timestamp: string
}

type TTableData = {
  tableName: string
  columns: string[]
  rows: Record<string, any>[]
  totalRows: number
}

type TTableSchema = {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

function EnhancedDatabaseStatus() {
  const [cpuUsage, setCpuUsage] = createSignal(0)
  const [memoryUsage, setMemoryUsage] = createSignal(0)
  const [activeConnections, setActiveConnections] = createSignal(0)
  const [errors, setErrors] = createSignal(0)
  const [testResult, setTestResult] = createSignal<TDatabaseTestResult | null>(null)
  const [isLoading, setIsLoading] = createSignal(false)
  const [lastRefresh, setLastRefresh] = createSignal<string>("")
  const [selectedTable, setSelectedTable] = createSignal<string>("")
  const [autoRefresh, setAutoRefresh] = createSignal(false)
  const [refreshInterval, setRefreshInterval] = createSignal<number | null>(null)
  const [testHistory, setTestHistory] = createSignal<{ time: string; success: boolean }[]>([])
  const [responseTime, setResponseTime] = createSignal<number>(0)
  const [tableData, setTableData] = createSignal<TTableData | null>(null)
  const [tableSchema, setTableSchema] = createSignal<TTableSchema[]>([])
  const [loadingTableData, setLoadingTableData] = createSignal(false)
  const [currentPage, setCurrentPage] = createSignal(1)
  const [itemsPerPage] = createSignal(10)
  const [sortColumn, setSortColumn] = createSignal<string>("")
  const [sortDirection, setSortDirection] = createSignal<"asc" | "desc">("asc")

  async function testConnection() {
    setIsLoading(true)
    const startTime = Date.now()
    try {
      const response = await fetch("/api/db/test")
      const result = await response.json()
      const endTime = Date.now()
      const duration = endTime - startTime
      setTestResult(result)
      setResponseTime(duration)
      setLastRefresh(new Date().toLocaleTimeString())
      // Add to history
      setTestHistory((prev) => [
        { time: new Date().toLocaleTimeString(), success: result.success },
        ...prev.slice(0, 9), // Keep last 10 results
      ])
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      setTestResult({
        success: false,
        message: "Failed to reach database test endpoint",
        error: error instanceof Error ? error.message : "Network error",
        timestamp: new Date().toISOString(),
      })
      setResponseTime(duration)
      // Add failed test to history
      setTestHistory((prev) => [{ time: new Date().toLocaleTimeString(), success: false }, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(false)
    }
  }

  function toggleAutoRefresh() {
    setAutoRefresh(!autoRefresh())
  }

  async function fetchTableData(tableName: string) {
    if (!tableName) return
    setLoadingTableData(true)
    try {
      const [dataResponse, schemaResponse] = await Promise.all([
        fetch(`/api/db/table/${tableName}?page=${currentPage()}&limit=${itemsPerPage()}`),
        fetch(`/api/db/table/${tableName}/schema`),
      ])
      if (dataResponse.ok && schemaResponse.ok) {
        const data = await dataResponse.json()
        const schema = await schemaResponse.json()
        setTableData({
          tableName,
          columns: data.columns || [],
          rows: data.rows || [],
          totalRows: data.totalRows || 0,
        })
        setTableSchema(schema.columns || [])
      }
    } catch (error) {
      console.error("Failed to fetch table data:", error)
      setTableData(null)
      setTableSchema([])
    } finally {
      setLoadingTableData(false)
    }
  }

  function handleTableSelect(tableName: string) {
    const newTable = selectedTable() === tableName ? "" : tableName
    setSelectedTable(newTable)
    setCurrentPage(1)
    if (newTable) {
      fetchTableData(newTable)
    } else {
      setTableData(null)
      setTableSchema([])
    }
  }

  function handleSort(column: string) {
    if (sortColumn() === column) {
      setSortDirection(sortDirection() === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  function getSortedData() {
    const data = tableData()
    if (!data || !sortColumn()) return data?.rows || []
    return [...data.rows].sort((a, b) => {
      const aVal = a[sortColumn()]
      const bVal = b[sortColumn()]
      const direction = sortDirection() === "asc" ? 1 : -1
      if (aVal < bVal) return -1 * direction
      if (aVal > bVal) return 1 * direction
      return 0
    })
  }

  function formatCellValue(value: any): string {
    if (value === null || value === undefined) return "NULL"
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
    if (typeof value === "object") return JSON.stringify(value)
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "..."
    }
    return String(value)
  }

  function getDataTypeIcon(dataType: string): string {
    if (dataType.includes("varchar") || dataType.includes("text")) return "📝"
    if (dataType.includes("int") || dataType.includes("serial")) return "🔢"
    if (dataType.includes("bool")) return "✓"
    if (dataType.includes("timestamp") || dataType.includes("date")) return "📅"
    if (dataType.includes("uuid")) return "🔑"
    return "📄"
  }

  // Handle auto-refresh
  createEffect(() => {
    if (autoRefresh()) {
      const interval = setInterval(testConnection, 30000) // Every 30 seconds
      setRefreshInterval(interval as unknown as number)
    } else {
      if (refreshInterval()) {
        clearInterval(refreshInterval()!)
        setRefreshInterval(null)
      }
    }
  })

  onMount(() => {
    testConnection()
  })

  onCleanup(() => {
    if (refreshInterval()) {
      clearInterval(refreshInterval()!)
    }
  })

  return (
    <div class="outerbase-dashboard">
      {/* Sidebar */}
      <div class="outerbase-sidebar-dashboard">
        <div class="outerbase-sidebar-content-dashboard">
          {/* Header */}
          <div class="outerbase-sidebar-header-dashboard">
            <h2 class="outerbase-sidebar-title-dashboard">Database Monitor</h2>
            <button
              onClick={testConnection}
              disabled={isLoading()}
              class="outerbase-refresh-btn"
              title="Refresh connection"
            >
              <svg
                class={`w-4 h-4 ${isLoading() ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <div class="outerbase-auto-refresh-section">
            <label class="outerbase-checkbox-label">
              <input type="checkbox" checked={autoRefresh()} onChange={toggleAutoRefresh} class="outerbase-checkbox" />
              <span class="outerbase-checkbox-text">Auto refresh (30s)</span>
            </label>
          </div>

          {/* Connection Status */}
          <div class="outerbase-status-section">
            <h3 class="outerbase-section-title">Connection Status</h3>
            <Show when={testResult()}>
              <div class={`outerbase-status-card ${testResult()!.success ? "success" : "error"}`}>
                <div class={`outerbase-status-indicator ${testResult()!.success ? "success" : "error"}`}></div>
                <div class="outerbase-status-info">
                  <p class="outerbase-status-text">{testResult()!.success ? "Connected" : "Disconnected"}</p>
                  <p class="outerbase-status-meta">{responseTime()}ms response time</p>
                </div>
              </div>
            </Show>
          </div>

          {/* Stats */}
          <Show when={testResult()?.data}>
            <div class="outerbase-stats-section">
              <h3 class="outerbase-section-title">Database Stats</h3>
              <div class="outerbase-stat-item">
                <span class="outerbase-stat-label">Tables</span>
                <span class="outerbase-stat-value">{testResult()!.data!.tables.length}</span>
              </div>
              <div class="outerbase-stat-item">
                <span class="outerbase-stat-label">Admin Users</span>
                <span class="outerbase-stat-value">{testResult()!.data!.stats.adminUsers}</span>
              </div>
              <div class="outerbase-stat-item">
                <span class="outerbase-stat-label">Projects</span>
                <span class="outerbase-stat-value">{testResult()!.data!.stats.projects}</span>
              </div>
            </div>
          </Show>

          {/* Tables List */}
          <Show when={testResult()?.data?.tables}>
            <div class="outerbase-tables-section">
              <h3 class="outerbase-section-title">Tables</h3>
              <div class="outerbase-tables-list">
                <For each={testResult()!.data!.tables}>
                  {(table) => (
                    <button
                      onClick={() => handleTableSelect(table)}
                      class={`outerbase-table-item ${selectedTable() === table ? "active" : ""}`}
                    >
                      <div class="outerbase-table-info">
                        <span class="outerbase-table-name">{table}</span>
                        <Show when={selectedTable() === table}>
                          <svg
                            class="w-4 h-4 outerbase-table-arrow"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Show>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Test History */}
          <Show when={testHistory().length > 0}>
            <div class="outerbase-history-section">
              <h3 class="outerbase-section-title">Recent Tests</h3>
              <div class="outerbase-history-list">
                <For each={testHistory().slice(0, 5)}>
                  {(test) => (
                    <div class="outerbase-history-item">
                      <span class="outerbase-history-time">{test.time}</span>
                      <div class={`outerbase-history-status ${test.success ? "success" : "error"}`}>
                        <div class={`outerbase-history-dot ${test.success ? "success" : "error"}`}></div>
                        {test.success ? "OK" : "FAIL"}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Main Content Area */}
      <div class="outerbase-main-content">
        <div class="outerbase-content-wrapper">
          {/* Header */}
          <div class="outerbase-main-header">
            <h1 class="outerbase-main-title">Database Status Dashboard</h1>
            <Show when={lastRefresh()}>
              <p class="outerbase-last-updated">Last updated: {lastRefresh()}</p>
            </Show>
          </div>

          {/* Connection Stats Grid */}
          <Show when={testResult()}>
            <div class="outerbase-stats-grid">
              <div class="outerbase-stat-card">
                <div class="outerbase-stat-card-value">{responseTime()}ms</div>
                <div class="outerbase-stat-card-label">Response Time</div>
              </div>
              <div class="outerbase-stat-card">
                <div class="outerbase-stat-card-value">{testResult()!.data?.tables.length || 0}</div>
                <div class="outerbase-stat-card-label">Tables</div>
              </div>
              <div class="outerbase-stat-card">
                <div class="outerbase-stat-card-value">{testResult()!.data?.stats.adminUsers || 0}</div>
                <div class="outerbase-stat-card-label">Admin Users</div>
              </div>
              <div class="outerbase-stat-card">
                <div class="outerbase-stat-card-value">{testResult()!.data?.stats.projects || 0}</div>
                <div class="outerbase-stat-card-label">Projects</div>
              </div>
            </div>
          </Show>

          {/* Status Message */}
          <Show when={testResult()}>
            <div class={`outerbase-message-card ${testResult()!.success ? "success" : "error"}`}>
              <p class="outerbase-message-text">{testResult()!.message}</p>
              <Show when={testResult()!.error}>
                <div class="outerbase-error-details">
                  <p class="outerbase-error-text">❌ {testResult()!.error}</p>
                </div>
              </Show>
            </div>
          </Show>

          {/* Loading State */}
          <Show when={isLoading()}>
            <div class="outerbase-loading">
              <div class="outerbase-spinner">
                <div class="outerbase-spinner-ring"></div>
                <div class="outerbase-spinner-dot"></div>
              </div>
            </div>
          </Show>

          {/* Tables Grid */}
          <Show when={testResult()?.data?.tables && !selectedTable()}>
            <div class="outerbase-tables-grid-container">
              <h3 class="outerbase-tables-grid-title">Database Tables</h3>
              <div class="outerbase-tables-grid">
                <For each={testResult()!.data!.tables}>
                  {(table) => (
                    <button onClick={() => handleTableSelect(table)} class="outerbase-table-card">
                      <div class="outerbase-table-card-name">{table}</div>
                      <div class="outerbase-table-card-subtitle">Click to explore</div>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Selected Table Details */}
          <Show when={selectedTable()}>
            <div class="outerbase-table-details">
              {/* Table Header */}
              <div class="outerbase-table-header">
                <div class="outerbase-table-header-left">
                  <button onClick={() => handleTableSelect("")} class="outerbase-back-btn" title="Back to tables list">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h4 class="outerbase-table-title">📊 {selectedTable()}</h4>
                  <Show when={tableData()}>
                    <div class="outerbase-table-row-count">{tableData()!.totalRows} total rows</div>
                  </Show>
                </div>
                <Show when={loadingTableData()}>
                  <div class="outerbase-table-loading">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
                  </div>
                </Show>
              </div>

              {/* Schema Information */}
              <Show when={tableSchema().length > 0}>
                <div class="outerbase-schema-container">
                  <div class="outerbase-schema-header">
                    <h5 class="outerbase-schema-title">📋 Table Schema</h5>
                  </div>
                  <div class="outerbase-schema-table-wrapper">
                    <table class="outerbase-schema-table">
                      <thead class="outerbase-schema-thead">
                        <tr>
                          <th class="outerbase-schema-th">Column</th>
                          <th class="outerbase-schema-th">Type</th>
                          <th class="outerbase-schema-th">Nullable</th>
                          <th class="outerbase-schema-th">Default</th>
                        </tr>
                      </thead>
                      <tbody class="outerbase-schema-tbody">
                        <For each={tableSchema()}>
                          {(column) => (
                            <tr class="outerbase-schema-tr">
                              <td class="outerbase-schema-td">
                                <div class="outerbase-column-info">
                                  <span class="outerbase-column-icon">{getDataTypeIcon(column.data_type)}</span>
                                  <span class="outerbase-column-name">{column.column_name}</span>
                                </div>
                              </td>
                              <td class="outerbase-schema-td">
                                <span class="outerbase-data-type">{column.data_type}</span>
                              </td>
                              <td class="outerbase-schema-td">
                                <span
                                  class={`outerbase-nullable-badge ${column.is_nullable === "YES" ? "nullable" : "not-nullable"}`}
                                >
                                  {column.is_nullable === "YES" ? "NULL" : "NOT NULL"}
                                </span>
                              </td>
                              <td class="outerbase-schema-td">
                                <span class="outerbase-default-value">{column.column_default || "None"}</span>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Show>

              {/* Table Data */}
              <Show when={tableData() && tableData()!.rows.length > 0}>
                <div class="outerbase-data-container">
                  <div class="outerbase-data-header">
                    <h5 class="outerbase-data-title">📄 Table Data</h5>
                    <div class="outerbase-data-pagination-info">
                      <span>Page {currentPage()}</span>
                      <span>•</span>
                      <span>
                        {Math.min(itemsPerPage(), tableData()!.totalRows)} of {tableData()!.totalRows} rows
                      </span>
                    </div>
                  </div>
                  <div class="outerbase-data-table-wrapper">
                    <table class="outerbase-data-table">
                      <thead class="outerbase-data-thead">
                        <tr>
                          <For each={tableData()!.columns}>
                            {(column) => (
                              <th class="outerbase-data-th">
                                <button onClick={() => handleSort(column)} class="outerbase-sort-btn">
                                  {column}
                                  <Show when={sortColumn() === column}>
                                    <span class="outerbase-sort-indicator">
                                      {sortDirection() === "asc" ? "↑" : "↓"}
                                    </span>
                                  </Show>
                                </button>
                              </th>
                            )}
                          </For>
                        </tr>
                      </thead>
                      <tbody class="outerbase-data-tbody">
                        <For each={getSortedData()}>
                          {(row) => (
                            <tr class="outerbase-data-tr">
                              <For each={tableData()!.columns}>
                                {(column) => (
                                  <td class="outerbase-data-td">
                                    <div
                                      class={`outerbase-cell-value ${row[column] === null || row[column] === undefined ? "null" : ""}`}
                                    >
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

                  {/* Pagination */}
                  <Show when={tableData()!.totalRows > itemsPerPage()}>
                    <div class="outerbase-pagination">
                      <div class="outerbase-pagination-info">
                        Showing {(currentPage() - 1) * itemsPerPage() + 1} to{" "}
                        {Math.min(currentPage() * itemsPerPage(), tableData()!.totalRows)} of {tableData()!.totalRows}{" "}
                        results
                      </div>
                      <div class="outerbase-pagination-controls">
                        <button
                          onClick={() => {
                            setCurrentPage(Math.max(1, currentPage() - 1))
                            fetchTableData(selectedTable())
                          }}
                          disabled={currentPage() === 1}
                          class="outerbase-pagination-btn"
                        >
                          ← Previous
                        </button>
                        <span class="outerbase-pagination-current">
                          {currentPage()} of {Math.ceil(tableData()!.totalRows / itemsPerPage())}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentPage(currentPage() + 1)
                            fetchTableData(selectedTable())
                          }}
                          disabled={currentPage() >= Math.ceil(tableData()!.totalRows / itemsPerPage())}
                          class="outerbase-pagination-btn"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </Show>
                </div>
              </Show>

              <Show when={tableData() && tableData()!.rows.length === 0 && !loadingTableData()}>
                <div class="outerbase-empty-state">
                  <div class="outerbase-empty-icon">📋</div>
                  <h5 class="outerbase-empty-title">No Data Found</h5>
                  <p class="outerbase-empty-description">
                    This table appears to be empty or no data matches the current criteria.
                  </p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDatabaseStatus
