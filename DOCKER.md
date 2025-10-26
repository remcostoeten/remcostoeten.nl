# PostgreSQL Docker Setup

This project includes a Docker Compose setup for PostgreSQL with automated credential management.

## 🚀 Quick Start

1. **Setup database (first time only):**
   ```bash
   ./scripts/manage/docker-psql.sh setup
   ```

2. **Copy connection URL to clipboard:**
   ```bash
   ./scripts/manage/docker-psql.sh url
   ```

3. **Check container status:**
   ```bash
   ./scripts/manage/docker-psql.sh status
   ```

4. **Import sample data (optional):**
   ```bash
   ./scripts/manage/docker-psql.sh import scripts/sample-data.sql
   ```

5. **View database tables:**
   ```bash
   ./scripts/manage/docker-psql.sh tables
   ```

## 📋 Available Commands

### Container Management
| Command | Description |
|---------|-------------|
| `setup` | First-time setup with random credentials |
| `url` | Copy connection URL to clipboard |
| `start` | Start the PostgreSQL container |
| `stop` | Stop the PostgreSQL container |
| `status` | Show container status |
| `clear` | Clear all database contents (remove all tables) |
| `remove` | Remove entire container and all data |
| `help` | Show help message |

### Database Operations
| Command | Description |
|---------|-------------|
| `tables` | List all tables in the database with row counts |
| `show <table>` | Show contents of a table (default 20 rows) |
| `show <table> <n>` | Show contents with custom row limit |
| `structure <table>` | Show table structure/schema |
| `sql "query"` | Execute custom SQL query |
| `import <file>` | Import SQL file into database |
| `export <table>` | Export table to CSV (table_name_export.csv) |
| `export <table> <file>` | Export table to custom CSV file |

## 🔧 Features

- **Automatic credential generation** - Random secure password created on first setup
- **Persistent data** - Database data is stored in Docker volumes
- **Health checks** - Container monitors database readiness
- **Easy management** - Simple script interface for all operations
- **Clipboard support** - One-click connection URL copying
- **Safety measures** - Confirmation prompts for destructive operations

## 📁 File Structure

```
.
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Generated database credentials (auto-created)
├── .env.example               # Environment file template
├── scripts/
│   ├── manage/
│   │   └── docker-psql.sh     # Management script
│   ├── init-db.sql           # Initial database setup
│   └── README.md             # Script documentation
└── DOCKER.md                 # This file
```

## 🔐 Security

- Credentials are automatically generated using cryptographically secure random strings
- The `.env` file is excluded from version control
- Database uses SCRAM-SHA-256 authentication by default

## 🐳 Container Details

- **Image**: `postgres:16-alpine`
- **Port**: `5432:5432` (host:container)
- **Data volume**: `remcostoeten_postgres_data`
- **Network**: `remcostoeten_postgres_network`
- **Restart policy**: `unless-stopped`

## 🗂️ Database Connection

After setup, your connection URL will be:
```
postgresql://postgres:RANDOM_PASSWORD@localhost:5434/remcostoeten_db
```

Use the `url` command to copy this to your clipboard.

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check status
./scripts/manage/docker-psql.sh status

# Check Docker logs
docker logs remcostoeten-postgres
```

### Connection issues
```bash
# Ensure container is running
./scripts/manage/docker-psql.sh start

# Get fresh connection URL
./scripts/manage/docker-psql.sh url
```

### Reset everything
```bash
# Remove container and all data
./scripts/manage/docker-psql.sh remove

# Setup fresh database
./scripts/manage/docker-psql.sh setup
```

## 📚 Advanced Usage

### Custom Database Name
Edit `.env` after setup to change `POSTGRES_DB`:

```bash
# Edit .env file
POSTGRES_DB=my_custom_db

# Restart container
./scripts/manage/docker-psql.sh stop
./scripts/manage/docker-psql.sh start
```

### Access database directly
```bash
# Connect using psql (if installed)
/usr/bin/docker exec -it remcostoeten-postgres psql -U postgres -d remcostoeten_db

# Or using connection URL
psql $(./scripts/manage/docker-psql.sh url 2>/dev/null || echo "get-url-first")
```

### Database operation examples
```bash
# List all tables
./scripts/manage/docker-psql.sh tables

# View table contents (default 20 rows)
./scripts/manage/docker-psql.sh show users

# View table contents with custom limit
./scripts/manage/docker-psql.sh show posts 10

# Show table structure
./scripts/manage/docker-psql.sh structure users

# Execute custom SQL query
./scripts/manage/docker-psql.sh sql "SELECT COUNT(*) FROM users;"

# Import SQL file
./scripts/manage/docker-psql.sh import backup.sql

# Export table to CSV
./scripts/manage/docker-psql.sh export users
./scripts/manage/docker-psql.sh export users users_backup.csv
```

## 🚨 Important Notes

- The setup generates **random credentials** only once
- Credentials are stored in `.env` (never commit this file)
- Database data persists even when container is stopped
- `remove` command permanently deletes all data
- Use `clear` command to reset database without losing container