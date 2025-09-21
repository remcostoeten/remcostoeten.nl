import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EnhancedTable, type TableColumn } from '../EnhancedTable';

describe('EnhancedTable', () => {
  const mockColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'email', label: 'Email', filterable: true },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <span className={`status-${value}`}>{value}</span>
      )
    }
  ];

  const mockData = [
    { name: 'John Doe', age: 30, email: 'john@example.com', status: 'active' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com', status: 'inactive' },
    { name: 'Bob Johnson', age: 35, email: 'bob@example.com', status: 'active' }
  ];

  it('renders table with data', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders custom cell content using render function', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const statusCells = screen.getAllByText('active');
    expect(statusCells[0]).toHaveClass('status-active');
  });

  it('shows search input when searchable is true', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} searchable={true} />);
    
    expect(screen.getByPlaceholderText('Search table...')).toBeInTheDocument();
  });

  it('hides search input when searchable is false', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} searchable={false} />);
    
    expect(screen.queryByPlaceholderText('Search table...')).not.toBeInTheDocument();
  });

  it('filters data based on search input', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const searchInput = screen.getByPlaceholderText('Search table...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('sorts data when sortable column header is clicked', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
    
    // Click to sort ascending
    fireEvent.click(nameHeader!);
    
    const rows = screen.getAllByRole('row');
    // Skip header row (index 0)
    expect(rows[1]).toHaveTextContent('Bob Johnson');
    expect(rows[2]).toHaveTextContent('Jane Smith');
    expect(rows[3]).toHaveTextContent('John Doe');
  });

  it('reverses sort when clicking sorted column again', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name').closest('th');
    
    // Click twice to sort descending
    fireEvent.click(nameHeader!);
    fireEvent.click(nameHeader!);
    
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('John Doe');
    expect(rows[2]).toHaveTextContent('Jane Smith');
    expect(rows[3]).toHaveTextContent('Bob Johnson');
  });

  it('shows column filters for filterable columns', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    // Name column should have filter (filterable: true)
    const nameColumn = screen.getByText('Name').closest('th');
    expect(nameColumn?.querySelector('input[placeholder="Filter..."]')).toBeInTheDocument();
    
    // Age column should not have filter (no filterable property)
    const ageColumn = screen.getByText('Age').closest('th');
    expect(ageColumn?.querySelector('input[placeholder="Filter..."]')).not.toBeInTheDocument();
  });

  it('filters data using column filters', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const nameColumn = screen.getByText('Name').closest('th');
    const filterInput = nameColumn?.querySelector('input[placeholder="Filter..."]') as HTMLInputElement;
    
    fireEvent.change(filterInput, { target: { value: 'Jane' } });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('shows "No data found" when no results match filters', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const searchInput = screen.getByPlaceholderText('Search table...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('displays correct row count', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('Showing 3 of 3 rows')).toBeInTheDocument();
  });

  it('displays filtered row count when filters are applied', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const searchInput = screen.getByPlaceholderText('Search table...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    expect(screen.getByText(/Showing 1 of 3 rows/)).toBeInTheDocument();
    expect(screen.getByText(/\(filtered\)/)).toBeInTheDocument();
  });

  it('applies default sort when provided', () => {
    render(
      <EnhancedTable 
        columns={mockColumns} 
        data={mockData} 
        defaultSortKey="age"
        defaultSortDirection="desc"
      />
    );
    
    const rows = screen.getAllByRole('row');
    // Should be sorted by age descending: Bob (35), John (30), Jane (25)
    expect(rows[1]).toHaveTextContent('Bob Johnson');
    expect(rows[2]).toHaveTextContent('John Doe');
    expect(rows[3]).toHaveTextContent('Jane Smith');
  });

  it('handles numeric sorting correctly', () => {
    render(<EnhancedTable columns={mockColumns} data={mockData} />);
    
    const ageHeader = screen.getByText('Age').closest('th');
    fireEvent.click(ageHeader!);
    
    const rows = screen.getAllByRole('row');
    // Should be sorted by age ascending: Jane (25), John (30), Bob (35)
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[2]).toHaveTextContent('John Doe');
    expect(rows[3]).toHaveTextContent('Bob Johnson');
  });
});