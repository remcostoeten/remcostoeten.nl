#!/usr/bin/env fish

echo "Checking databases for tables..."
echo "================================"
echo

# Get database names (skip header line)
set databases (turso db list | tail -n +2 | awk '{print $1}')

for db in $databases
    echo "Database: $db"
    
    # Get tables from database (skip header line)
    set tables (turso db shell "$db" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null | tail -n +2)
    
    if test -z "$tables"
        echo "Status: EMPTY (no tables)"
    else
        echo "Status: NON-EMPTY (tables found)"
        echo "Tables:"
        for table in $tables
            echo "  - $table"
        end
    end
    
    echo
end
