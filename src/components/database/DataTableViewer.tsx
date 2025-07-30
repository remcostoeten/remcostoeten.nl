import { createSignal, createMemo, Show, For } from 'solid-js';

type TColumn = {
  name: string;
  type: string;
  nullable: boolean;
};

type TDataTableViewerProps = {
  tableName: string;
  columns: TColumn[];
  data: Record<string, any>[];
  totalRows: number;
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  currentPage?: number;
  pageSize?: number;
};

function DataTableViewer(props: TDataTableViewerProps) {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [columnFilters, setColumnFilters] = createSignal<Record<string, string>>({});
  const [sortColumn, setSortColumn] = createSignal<string>('');
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = createSignal<Set<number>>(new Set());
  const [viewMode, setViewMode] = createSignal<'table' | 'card'>('table');
  const [showColumnSelector, setShowColumnSelector] = createSignal(false);
  const [visibleColumns, setVisibleColumns] = createSignal<Set<string>>(
    new Set(props.columns.map(col => col.name))
  );

  // Calculate filtered and sorted data
  const processedData = createMemo(() => {
    let result = [...props.data];

    // Apply search filter
    const search = searchQuery().toLowerCase();
    if (search) {
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(search)
        )
      );
    }

    // Apply column filters
    const filters = columnFilters();
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter(row => {
          const value = String(row[column]).toLowerCase();
          return value.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortColumn()) {
      result.sort((a, b) => {
        const aVal = a[sortColumn()];
        const bVal = b[sortColumn()];
        const direction = sortDirection() === 'asc' ? 1 : -1;
        
        if (aVal === null || aVal === undefined) return 1 * direction;
        if (bVal === null || bVal === undefined) return -1 * direction;
        
        if (aVal < bVal) return -1 * direction;
        if (aVal > bVal) return 1 * direction;
        return 0;
      });
    }

    return result;
  });

  function handleSort(column: string) {
    if (sortColumn() === column) {
      setSortDirection(sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    if (props.onSort) {
      props.onSort(column, sortDirection());
    }
  }

  function handleColumnFilter(column: string, value: string) {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  }

  function toggleRowSelection(index: number) {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }

  function selectAllRows() {
    if (selectedRows().size === processedData().length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData().map((_, i) => i)));
    }
  }

  function toggleColumnVisibility(column: string) {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }

  function exportData(format: 'csv' | 'json') {
    const dataToExport = selectedRows().size > 0 
      ? processedData().filter((_, i) => selectedRows().has(i))
      : processedData();

    if (format === 'csv') {
      const visibleCols = props.columns.filter(col => visibleColumns().has(col.name));
      const csv = [
        visibleCols.map(col => col.name).join(','),
        ...dataToExport.map(row => 
          visibleCols.map(col => {
            const value = row[col.name];
            if (value === null) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      downloadFile(csv, `${props.tableName}-data.csv`, 'text/csv');
    } else {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, `${props.tableName}-data.json`, 'application/json');
    }
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

  function formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined) return 'NULL';
    if (type.includes('bool')) return value ? '✓' : '✗';
    if (type.includes('json')) return JSON.stringify(value, null, 2);
    if (type.includes('timestamp') || type.includes('date')) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  }

  function getCellClass(value: any, type: string): string {
    if (value === null || value === undefined) return 'null-value';
    if (type.includes('bool')) return value ? 'bool-true' : 'bool-false';
    if (type.includes('int') || type.includes('numeric')) return 'number-value';
    if (type.includes('json')) return 'json-value';
    if (type.includes('timestamp') || type.includes('date')) return 'date-value';
    return 'string-value';
  }

  const visibleColumnsData = createMemo(() => 
    props.columns.filter(col => visibleColumns().has(col.name))
  );

  return (
    <div class="data-table-viewer">
      {/* Toolbar */}
      <div class="dtv-toolbar">
        <div class="dtv-toolbar-left">
          <div class="dtv-search-box">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={`Search in ${props.tableName}...`}
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="dtv-search-input"
            />
            <Show when={searchQuery()}>
              <button
                onClick={() => setSearchQuery('')}
                class="dtv-clear-search"
              >
                ×
              </button>
            </Show>
          </div>
          
          <div class="dtv-view-toggle">
            <button
              onClick={() => setViewMode('table')}
              class={`view-btn ${viewMode() === 'table' ? 'active' : ''}`}
              title="Table view"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 4a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm5 2a1 1 0 000 2h3a1 1 0 100-2h-3zm-5 3a1 1 0 000 2h8a1 1 0 100-2H5zm0 3a1 1 0 000 2h8a1 1 0 100-2H5z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('card')}
              class={`view-btn ${viewMode() === 'card' ? 'active' : ''}`}
              title="Card view"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="dtv-toolbar-right">
          <Show when={selectedRows().size > 0}>
            <span class="dtv-selected-count">
              {selectedRows().size} selected
            </span>
          </Show>
          
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector())}
            class="dtv-column-btn"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            Columns
          </button>
          
          <div class="dtv-export-menu">
            <button class="dtv-export-btn">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Export
            </button>
            <div class="dtv-export-dropdown">
              <button onClick={() => exportData('csv')}>Export as CSV</button>
              <button onClick={() => exportData('json')}>Export as JSON</button>
            </div>
          </div>
        </div>
      </div>

      {/* Column Selector */}
      <Show when={showColumnSelector()}>
        <div class="dtv-column-selector">
          <div class="column-selector-header">
            <h4>Visible Columns</h4>
            <button onClick={() => setShowColumnSelector(false)}>×</button>
          </div>
          <div class="column-selector-list">
            <For each={props.columns}>
              {(column) => (
                <label class="column-selector-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns().has(column.name)}
                    onChange={() => toggleColumnVisibility(column.name)}
                  />
                  <span>{column.name}</span>
                  <span class="column-type">{column.type}</span>
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Data Display */}
      <Show when={viewMode() === 'table'}>
        <div class="dtv-table-container">
          <table class="dtv-table">
            <thead>
              <tr>
                <th class="dtv-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows().size === processedData().length && processedData().length > 0}
                    onChange={selectAllRows}
                  />
                </th>
                <For each={visibleColumnsData()}>
                  {(column) => (
                    <th class="dtv-th">
                      <div class="dtv-th-content">
                        <button
                          onClick={() => handleSort(column.name)}
                          class="dtv-sort-btn"
                        >
                          <span>{column.name}</span>
                          <Show when={sortColumn() === column.name}>
                            <span class="sort-indicator">
                              {sortDirection() === 'asc' ? '↑' : '↓'}
                            </span>
                          </Show>
                        </button>
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters()[column.name] || ''}
                          onInput={(e) => handleColumnFilter(column.name, e.currentTarget.value)}
                          class="dtv-column-filter"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <Show when={processedData().length === 0}>
                <tr>
                  <td colspan={visibleColumnsData().length + 1} class="dtv-empty">
                    No data found
                  </td>
                </tr>
              </Show>
              <For each={processedData()}>
                {(row, index) => (
                  <tr class={`dtv-tr ${selectedRows().has(index()) ? 'selected' : ''}`}>
                    <td class="dtv-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedRows().has(index())}
                        onChange={() => toggleRowSelection(index())}
                      />
                    </td>
                    <For each={visibleColumnsData()}>
                      {(column) => (
                        <td class={`dtv-td ${getCellClass(row[column.name], column.type)}`}>
                          <div class="dtv-cell-content">
                            {formatCellValue(row[column.name], column.type)}
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
      </Show>

      <Show when={viewMode() === 'card'}>
        <div class="dtv-cards-container">
          <For each={processedData()}>
            {(row, index) => (
              <div class={`dtv-card ${selectedRows().has(index()) ? 'selected' : ''}`}>
                <div class="dtv-card-header">
                  <input
                    type="checkbox"
                    checked={selectedRows().has(index())}
                    onChange={() => toggleRowSelection(index())}
                  />
                  <span class="card-number">#{index() + 1}</span>
                </div>
                <div class="dtv-card-body">
                  <For each={visibleColumnsData()}>
                    {(column) => (
                      <div class="dtv-card-field">
                        <span class="field-label">{column.name}:</span>
                        <span class={`field-value ${getCellClass(row[column.name], column.type)}`}>
                          {formatCellValue(row[column.name], column.type)}
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Pagination */}
      <div class="dtv-pagination">
        <div class="dtv-pagination-info">
          Showing {processedData().length} of {props.totalRows} records
          <Show when={searchQuery() || Object.keys(columnFilters()).some(k => columnFilters()[k])}>
            <span class="filtered-indicator">(filtered)</span>
          </Show>
        </div>
        
        <Show when={props.onPageChange && props.totalRows > (props.pageSize || 10)}>
          <div class="dtv-pagination-controls">
            <button
              onClick={() => props.onPageChange!(Math.max(1, (props.currentPage || 1) - 1))}
              disabled={(props.currentPage || 1) === 1}
              class="pagination-btn"
            >
              Previous
            </button>
            <span class="page-info">
              Page {props.currentPage || 1} of {Math.ceil(props.totalRows / (props.pageSize || 10))}
            </span>
            <button
              onClick={() => props.onPageChange!((props.currentPage || 1) + 1)}
              disabled={(props.currentPage || 1) >= Math.ceil(props.totalRows / (props.pageSize || 10))}
              class="pagination-btn"
            >
              Next
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default DataTableViewer;
