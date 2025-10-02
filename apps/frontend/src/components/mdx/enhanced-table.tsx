'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface EnhancedTableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  className?: string;
  searchable?: boolean;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

type SortDirection = 'asc' | 'desc' | null;

export function EnhancedTable({
  columns,
  data,
  className,
  searchable = true,
  defaultSortKey,
  defaultSortDirection = 'asc'
}: EnhancedTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortKey ? defaultSortDirection : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortKey && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        
        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }

    return filtered;
  }, [data, searchTerm, columnFilters, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className={cn('my-6', className)}>
      {/* Search bar */}
      {searchable && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      )}

      {/* Table container */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-foreground border-b border-border',
                    column.sortable && 'cursor-pointer hover:bg-muted/80 select-none'
                  )}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {getSortIcon(column.key) || (
                          <div className="w-4 h-4 opacity-50">
                            <ChevronUp className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Column filter */}
                  {column.filterable && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters[column.key] || ''}
                          onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                          className="w-full pl-7 pr-2 py-1 text-xs border border-border rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No data found
                </td>
              </tr>
            ) : (
              processedData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-foreground"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-2 text-sm text-muted-foreground">
        Showing {processedData.length} of {data.length} rows
        {(searchTerm || Object.values(columnFilters).some(v => v)) && (
          <span> (filtered)</span>
        )}
      </div>
    </div>
  );
}