#!/bin/bash

# Get database names (skip header line)
databases=$(turso db list | tail -n +2 | awk '{print $1}')

echo "Checking databases for tables..."
echo "================================"
echo

for db in $databases; do
    echo "Database: $db"
    
    # Get tables from database (skip header line)
    tables=$(turso db shell "$db" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null | tail -n +2)
    
    if [ -z "$tables" ]; then
        echo "Status: EMPTY (no tables)"
    else
        echo "Status: NON-EMPTY (tables found)"
        echo "Tables:"
        echo "$tables" | while read table; do
            echo "  - $table"
        done
    fi
    
    echo
done
