# PostgreSQL Docker Management Scripts

This directory contains scripts for managing the PostgreSQL Docker container used in this project.

## Quick Start

```bash
# First-time setup (generates random credentials)
./scripts/manage/docker-psql.sh setup

# Copy connection URL to clipboard
./scripts/manage/docker-psql.sh url

# Check container status
./scripts/manage/docker-psql.sh status
```

## Available Commands

### `docker-psql.sh`

PostgreSQL Docker management script with the following commands:

- **`setup`** - First-time setup with random credentials
- **`url`** - Copy connection URL to clipboard
- **`start`** - Start the PostgreSQL container
- **`stop`** - Stop the PostgreSQL container
- **`clear`** - Clear all database contents (remove all tables)
- **`remove`** - Remove entire container and all data
- **`status`** - Show container status
- **`help`** - Show help message

## Usage Examples

```bash
# Setup for the first time
./scripts/manage/docker-psql.sh setup

# Get connection URL (copies to clipboard)
./scripts/manage/docker-psql.sh url

# Start the container
./scripts/manage/docker-psql.sh start

# Stop the container
./scripts/manage/docker-psql.sh stop

# Clear all data (keeps container)
./scripts/manage/docker-psql.sh clear

# Completely remove everything
./scripts/manage/docker-psql.sh remove

# Check current status
./scripts/manage/docker-psql.sh status
```

## Environment Variables

The script manages a `.env` file in the project root with these variables:

- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Randomly generated password
- `DATABASE_URL` - Full connection URL

## Requirements

- Docker
- Docker Compose
- `openssl` (for generating random passwords)
- Optional: `pbcopy` (macOS), `xclip` (Linux), or `wl-copy` (Wayland) for clipboard support