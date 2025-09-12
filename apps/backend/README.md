# Backend - Pageviews API

A Hono.js backend service for tracking and retrieving pageview analytics.

## Features

- Track pageviews with detailed metadata
- Retrieve pageviews with filtering and pagination
- Get pageview statistics and analytics
- CORS enabled for frontend integration
- Type-safe with TypeScript and Zod validation

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### Pageviews
- `POST /api/pageviews` - Track a new pageview
- `GET /api/pageviews` - Get pageviews with optional filtering
- `GET /api/pageviews/stats` - Get pageview statistics

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Type check
bun run type-check
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `STORAGE_TYPE` - Storage backend: 'memory' or 'sqlite' (default: memory)
- `DB_PATH` - SQLite database file path (default: ./pageviews.db)

## API Usage Examples

### Track a Pageview
```bash
curl -X POST http://localhost:3001/api/pageviews \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page",
    "title": "Example Page",
    "referrer": "https://google.com"
  }'
```

### Get Pageviews
```bash
curl "http://localhost:3001/api/pageviews?limit=10&offset=0"
```

### Get Statistics
```bash
curl "http://localhost:3001/api/pageviews/stats"
```

## Storage Options

### In-Memory Storage (Default)
- Fast and simple for development
- Data is lost when server restarts
- Limited to 1000 pageviews

### SQLite Storage
- Persistent data storage
- Better performance for large datasets
- Full SQL query capabilities

To use SQLite storage:
```bash
# Set environment variable
export STORAGE_TYPE=sqlite
export DB_PATH=./my-pageviews.db

# Or run with environment variables
STORAGE_TYPE=sqlite DB_PATH=./pageviews.db bun run dev
```
