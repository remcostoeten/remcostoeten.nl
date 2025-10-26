#!/bin/bash

# PostgreSQL Docker Management Script
# Usage: ./scripts/manage/docker-psql.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Container and service names
CONTAINER_NAME="remcostoeten-postgres"
SERVICE_NAME="postgres"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker-compose is available
check_docker() {
    if ! /usr/bin/docker --version &> /dev/null; then
        log_error "Docker is not installed or not available"
        exit 1
    fi

    if ! /usr/bin/docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

# Get docker-compose command (docker-compose or docker compose)
get_compose_cmd() {
    if /usr/bin/docker compose version &> /dev/null; then
        echo "/usr/bin/docker compose"
    else
        echo "docker-compose"
    fi
}

# Generate random credentials
generate_credentials() {
    local db_name="${POSTGRES_DB:-remcostoeten_db}"
    local user="${POSTGRES_USER:-postgres}"
    local password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

    log_info "Generating new database credentials..."

    # Create .env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        cp .env.example "$ENV_FILE"
        log_info "Created .env file from template"
    fi

    # Update .env file with new credentials
    sed -i.tmp "s/^POSTGRES_DB=.*/POSTGRES_DB=$db_name/" "$ENV_FILE"
    sed -i.tmp "s/^POSTGRES_USER=.*/POSTGRES_USER=$user/" "$ENV_FILE"
    sed -i.tmp "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$password/" "$ENV_FILE"
    rm -f "${ENV_FILE}.tmp"

    # Generate connection URL
    local connection_url="postgresql://$user:$password@localhost:5434/$db_name"
    sed -i.tmp "s|^DATABASE_URL=.*|DATABASE_URL=$connection_url|" "$ENV_FILE"
    rm -f "${ENV_FILE}.tmp"

    log_success "Credentials generated and saved to .env file"
    echo "$connection_url"
}

# Get connection URL
get_connection_url() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env file not found. Please run setup first."
        exit 1
    fi

    # Source the .env file
    set -a
    source "$ENV_FILE"
    set +a

    if [ -z "$POSTGRES_PASSWORD" ]; then
        log_error "Database credentials not found. Please run setup first."
        exit 1
    fi

    local connection_url="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5434/${POSTGRES_DB}"
    echo "$connection_url"
}

# Copy connection URL to clipboard
copy_connection_url() {
    local url=$(get_connection_url)

    log_info "Connection URL: $url"

    # Try different clipboard commands
    if command -v pbcopy &> /dev/null; then
        echo "$url" | pbcopy
        log_success "Connection URL copied to clipboard (macOS)"
    elif command -v xclip &> /dev/null; then
        echo "$url" | xclip -selection clipboard
        log_success "Connection URL copied to clipboard (Linux with xclip)"
    elif command -v wl-copy &> /dev/null; then
        echo "$url" | wl-copy
        log_success "Connection URL copied to clipboard (Wayland)"
    else
        log_warning "Could not copy to clipboard. Please install pbcopy, xclip, or wl-copy"
        log_info "Connection URL: $url"
    fi
}

# Check if container is running
is_container_running() {
    /usr/bin/docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Check if container exists
is_container_exists() {
    /usr/bin/docker ps -a --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Start container
start_container() {
    local compose_cmd=$(get_compose_cmd)

    if is_container_running; then
        log_warning "Container is already running"
        return
    fi

    log_info "Starting PostgreSQL container..."
    $compose_cmd -f "$COMPOSE_FILE" up -d

    # Wait for container to be healthy
    log_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if /usr/bin/docker exec "$CONTAINER_NAME" pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-remcostoeten_db}" &>/dev/null; then
            log_success "PostgreSQL is ready!"
            return
        fi
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "Database failed to start within expected time"
    exit 1
}

# Stop container
stop_container() {
    local compose_cmd=$(get_compose_cmd)

    if ! is_container_running; then
        log_warning "Container is not running"
        return
    fi

    log_info "Stopping PostgreSQL container..."
    $compose_cmd -f "$COMPOSE_FILE" stop
    log_success "Container stopped"
}

# Clear database contents (remove all tables)
clear_database() {
    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_warning "This will remove ALL tables and data from the database."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        return
    fi

    log_info "Clearing all database contents..."

    # Get database credentials
    set -a
    source "$ENV_FILE"
    set +a

    # Drop and recreate the database
    /usr/bin/docker exec "$CONTAINER_NAME" psql -U "${POSTGRES_USER:-postgres}" -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-remcostoeten_db};"
    /usr/bin/docker exec "$CONTAINER_NAME" psql -U "${POSTGRES_USER:-postgres}" -d postgres -c "CREATE DATABASE ${POSTGRES_DB:-remcostoeten_db};"

    log_success "Database cleared successfully"
}

# Remove entire container and volumes
remove_container() {
    local compose_cmd=$(get_compose_cmd)

    log_warning "This will remove the container and ALL data permanently."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        return
    fi

    log_info "Removing container and volumes..."
    $compose_cmd -f "$COMPOSE_FILE" down -v --remove-orphans
    docker volume rm remcostoeten_postgres_data 2>/dev/null || true
    docker network rm remcostoeten_postgres_network 2>/dev/null || true

    log_success "Container and volumes removed"
}

# Setup (first-time setup)
setup_database() {
    log_info "Setting up PostgreSQL database for the first time..."

    # Generate credentials
    local url=$(generate_credentials)

    # Start the container
    start_container

    log_success "Database setup complete!"
    log_info "Connection URL: $url"
    log_info "Use 'url' command to copy it to clipboard"
}

# Execute SQL command in container
execute_sql() {
    local sql="$1"
    local db_name="${POSTGRES_DB:-remcostoeten_db}"
    local user="${POSTGRES_USER:-postgres}"

    docker exec "$CONTAINER_NAME" psql -U "$user" -d "$db_name" -c "$sql" 2>/dev/null
}

# List all tables in the database
list_tables() {
    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Fetching table list..."

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    # Check if database is ready
    if ! docker exec "$CONTAINER_NAME" pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-remcostoeten_db}" &>/dev/null; then
        log_error "Database is not ready yet. Please wait a moment and try again."
        exit 1
    fi

    echo ""
    echo "Database Tables"
    echo "==============="
    echo ""

    # Get list of tables
    local tables=$(execute_sql "\dt" | awk 'NR >= 3 && NF >= 3 {print $1, $2, $3}' | grep -v '^--' || echo "No tables found")

    if [ "$tables" = "No tables found" ] || [ -z "$tables" ]; then
        echo -e "${YELLOW}No tables found in database.${NC}"
        echo ""
        echo "Database: ${POSTGRES_DB:-remcostoeten_db}"
        echo "Use 'sql \"CREATE TABLE...\"' to create tables or 'import' to add data."
        return
    fi

    # Format table info
    printf "%-25s %-15s %-10s %s\n" "Table Name" "Type" "Owner" "Rows"
    printf "%-25s %-15s %-10s %s\n" "----------" "----" "-----" "----"

    while IFS= read -r line; do
        if [ -n "$line" ]; then
            local table_name=$(echo "$line" | awk '{print $1}')
            local table_type=$(echo "$line" | awk '{print $2}')
            local owner=$(echo "$line" | awk '{print $3}')

            # Get row count
            local row_count=$(execute_sql "SELECT COUNT(*) FROM \"$table_name\"" | awk 'NR==3 {print $1}' 2>/dev/null || echo "0")

            printf "%-25s %-15s %-10s %s\n" "$table_name" "$table_type" "$owner" "$row_count"
        fi
    done <<< "$tables"

    echo ""
    echo -e "${BLUE}Tip: Use 'show [table_name]' to view table contents${NC}"
}

# Show table structure
show_table_structure() {
    local table_name="$1"

    if [ -z "$table_name" ]; then
        log_error "Table name is required. Usage: $0 structure <table_name>"
        exit 1
    fi

    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Showing structure for table: $table_name"

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    echo ""
    echo "Table Structure: $table_name"
    echo "=========================="
    echo ""

    # Get table structure
    local structure=$(execute_sql "\d \"$table_name\"" 2>/dev/null)

    if [ -z "$structure" ]; then
        log_error "Table '$table_name' not found or no access."
        echo ""
        echo "Available tables:"
        list_tables
        exit 1
    fi

    echo "$structure"
}

# Show table contents
show_table_contents() {
    local table_name="$1"
    local limit="${2:-20}"  # Default limit to 20 rows

    if [ -z "$table_name" ]; then
        log_error "Table name is required. Usage: $0 show <table_name> [limit]"
        exit 1
    fi

    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Showing contents for table: $table_name (limit: $limit rows)"

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    echo ""
    echo "Table Contents: $table_name"
    echo "=========================="
    echo ""

    # Get row count first
    local total_rows=$(execute_sql "SELECT COUNT(*) FROM \"$table_name\"" | awk 'NR==3 {print $1}' 2>/dev/null || echo "0")

    if [ "$total_rows" = "0" ]; then
        echo -e "${YELLOW}Table is empty.${NC}"
        return
    fi

    # Get table data with limit
    local data=$(execute_sql "SELECT * FROM \"$table_name\" LIMIT $limit" 2>/dev/null)

    if [ -z "$data" ] || [[ "$data" == *"does not exist"* ]]; then
        log_error "Table '$table_name' not found or no access."
        echo ""
        echo "Available tables:"
        list_tables
        exit 1
    fi

    echo "$data"
    echo ""

    if [ "$total_rows" -gt "$limit" ]; then
        echo -e "${BLUE}Showing $limit of $total_rows total rows.${NC}"
        echo -e "${BLUE}Use 'show $table_name [limit]' to see more rows.${NC}"
    else
        echo -e "${GREEN}Showing all $total_rows rows.${NC}"
    fi
}

# Execute custom SQL query
execute_custom_sql() {
    local query="$*"

    if [ -z "$query" ]; then
        log_error "SQL query is required. Usage: $0 sql \"SELECT * FROM table_name;\""
        exit 1
    fi

    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Executing SQL query..."
    echo -e "${BLUE}Query: $query${NC}"
    echo ""

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    # Execute query
    local result=$(execute_sql "$query" 2>&1)

    if [ $? -eq 0 ]; then
        echo "$result"
    else
        log_error "SQL execution failed:"
        echo "$result"
        exit 1
    fi
}

# Import SQL file
import_sql_file() {
    local file_path="$1"

    if [ -z "$file_path" ]; then
        log_error "SQL file path is required. Usage: $0 import <file_path>"
        exit 1
    fi

    if [ ! -f "$file_path" ]; then
        log_error "File not found: $file_path"
        exit 1
    fi

    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Importing SQL file: $file_path"

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    # Copy file to container and execute
    local container_file="/tmp/import_$(basename "$file_path")"
    docker cp "$file_path" "$CONTAINER_NAME:$container_file"

    local db_name="${POSTGRES_DB:-remcostoeten_db}"
    local user="${POSTGRES_USER:-postgres}"

    # Execute SQL file
    docker exec "$CONTAINER_NAME" psql -U "$user" -d "$db_name" -f "$container_file" 2>/dev/null

    if [ $? -eq 0 ]; then
        log_success "SQL file imported successfully"
        # Clean up
        docker exec "$CONTAINER_NAME" rm "$container_file" 2>/dev/null || true
    else
        log_error "Failed to import SQL file"
        # Clean up
        docker exec "$CONTAINER_NAME" rm "$container_file" 2>/dev/null || true
        exit 1
    fi
}

# Export table to CSV
export_table_to_csv() {
    local table_name="$1"
    local output_file="${2:-${table_name}_export.csv}"

    if [ -z "$table_name" ]; then
        log_error "Table name is required. Usage: $0 export <table_name> [output_file]"
        exit 1
    fi

    if ! is_container_running; then
        log_error "Container is not running. Please start it first."
        exit 1
    fi

    log_info "Exporting table '$table_name' to '$output_file'"

    # Source environment variables
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a

    local db_name="${POSTGRES_DB:-remcostoeten_db}"
    local user="${POSTGRES_USER:-postgres}"

    # Export to CSV
    docker exec "$CONTAINER_NAME" psql -U "$user" -d "$db_name" -c "\copy \"$table_name\" TO '$output_file' WITH CSV HEADER" 2>/dev/null

    if [ $? -eq 0 ]; then
        # Copy file from container
        docker cp "$CONTAINER_NAME:$output_file" "./$output_file"
        log_success "Table exported to: $output_file"

        # Show file info
        local file_size=$(du -h "./$output_file" | cut -f1)
        local row_count=$(wc -l < "./$output_file")
        echo "File size: $file_size"
        echo "Rows: $row_count (including header)"
    else
        log_error "Failed to export table"
        exit 1
    fi
}

# Show help
show_help() {
    echo "PostgreSQL Docker Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Container Management:"
    echo "  setup              Setup database for the first time (generates credentials)"
    echo "  url                Copy connection URL to clipboard"
    echo "  start              Start the PostgreSQL container"
    echo "  stop               Stop the PostgreSQL container"
    echo "  status             Show container status"
    echo "  clear              Clear all database contents (remove all tables)"
    echo "  remove             Remove entire container and all data"
    echo ""
    echo "Database Operations:"
    echo "  tables             List all tables in the database"
    echo "  show <table>       Show contents of a table (limit 20 rows)"
    echo "  show <table> <n>   Show contents with custom row limit"
    echo "  structure <table>  Show table structure/schema"
    echo "  sql \"<query>\"     Execute custom SQL query"
    echo "  import <file>      Import SQL file into database"
    echo "  export <table>     Export table to CSV (table_name_export.csv)"
    echo "  export <table> <file>  Export table to custom CSV file"
    echo ""
    echo "Examples:"
    echo "  $0 setup                    # First-time setup"
    echo "  $0 tables                   # List all tables"
    echo "  $0 show users               # Show users table (20 rows)"
    echo "  $0 show users 50            # Show users table (50 rows)"
    echo "  $0 structure users          # Show users table schema"
    echo "  $0 sql \"SELECT COUNT(*) FROM users;\"  # Execute SQL"
    echo "  $0 import backup.sql        # Import SQL file"
    echo "  $0 export users             # Export users to CSV"
    echo ""
    echo "All database operations require the container to be running."
}

# Show status
show_status() {
    echo "PostgreSQL Container Status:"
    echo "============================"

    if is_container_running; then
        echo -e "Status: ${GREEN}Running${NC}"

        # Get container info
        local port=$(docker port "$CONTAINER_NAME" 5432/tcp | cut -d: -f2)
        echo "Port: $port"

        # Show if database is ready
        if docker exec "$CONTAINER_NAME" pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-remcostoeten_db}" &>/dev/null; then
            echo -e "Database: ${GREEN}Ready${NC}"
        else
            echo -e "Database: ${YELLOW}Starting...${NC}"
        fi
    elif is_container_exists; then
        echo -e "Status: ${YELLOW}Stopped${NC}"
        echo "Container exists but is not running"
    else
        echo -e "Status: ${RED}Not created${NC}"
        echo "Container does not exist. Run 'setup' first."
    fi

    echo ""
    if [ -f "$ENV_FILE" ]; then
        echo "Configuration file: .env (exists)"
    else
        echo "Configuration file: .env (missing)"
    fi
}

# Main script logic
main() {
    check_docker

    case "${1:-help}" in
        "setup")
            setup_database
            ;;
        "url")
            copy_connection_url
            ;;
        "start")
            start_container
            ;;
        "stop")
            stop_container
            ;;
        "clear")
            clear_database
            ;;
        "remove")
            remove_container
            ;;
        "status")
            show_status
            ;;
        "tables")
            list_tables
            ;;
        "show")
            show_table_contents "$2" "$3"
            ;;
        "structure")
            show_table_structure "$2"
            ;;
        "sql")
            shift
            execute_custom_sql "$@"
            ;;
        "import")
            import_sql_file "$2"
            ;;
        "export")
            export_table_to_csv "$2" "$3"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"