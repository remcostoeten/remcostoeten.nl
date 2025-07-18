#!/bin/bash

# Speed Comparison Script
# Usage: ./speed_compare.sh "<command1>" "<command2>" [iterations]

# Default number of iterations if not specified
ITERATIONS=${3:-5}

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate input
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: At least two commands are required.${NC}"
    echo "Usage: $0 \"<command1>\" \"<command2>\" [iterations]"
    exit 1
fi

# Function to run benchmark
run_benchmark() {
    local command="$1"
    local iterations=$2
    local total_time=0

    echo -e "${YELLOW}Benchmarking: $command${NC}"
    
    for ((i=1; i<=iterations; i++)); do
        # Use time with -p for POSIX format (real, user, sys time)
        # Redirect error output to capture time measurements
        local start=$(date +%s.%N)
        eval "$command" >/dev/null 2>&1
        local end=$(date +%s.%N)
        
        # Calculate runtime
        local runtime=$(echo "$end - $start" | bc)
        total_time=$(echo "$total_time + $runtime" | bc)
        
        echo "  Iteration $i: $runtime seconds"
    done

    # Calculate average
    local avg_time=$(echo "scale=4; $total_time / $iterations" | bc)
    echo -e "${GREEN}Average Time: $avg_time seconds${NC}"
    
    return 0
}

# Run benchmarks for each command
echo -e "${YELLOW}Speed Comparison (${ITERATIONS} iterations)${NC}"
echo "----------------------------"

# First command
run_benchmark "$1" "$ITERATIONS"
echo

# Second command
run_benchmark "$2" "$ITERATIONS"
