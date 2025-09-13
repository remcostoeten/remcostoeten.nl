# drizzleasy

Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

## Features

- **One-liner setup** - `initializeConnection(url)` replaces complex Drizzle setup
- **Auto-detection** - Reads your drizzle.config.ts automatically
- **Multi-database** - PostgreSQL (Neon, Vercel, Docker), SQLite, Turso
- **Simple syntax** - Natural operators like `age: '>18'` and `name: '*john*'`
- **100% type-safe** - Full TypeScript support with IntelliSense
- **Optimistic updates** - Built-in React hooks for smooth UX
- **Environment switching** - Development/production database configs
- **Connection caching** - Automatic connection reuse for performance

## Installation

```bash
npm install drizzleasy
```

## Quick Start

### Replace 7 lines with 1 line

**Before:**
```typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema, logger: true })
```

**After:**
```typescript
import { initializeConnection } from 'drizzleasy'
export const db = await initializeConnection(process.env.DATABASE_URL!)
```

### Database Support

```typescript
// PostgreSQL (Neon, Vercel, Supabase)
const db = await initializeConnection('postgresql://neon.tech/db')

// Local PostgreSQL (Docker)
const db = await initializeConnection('postgresql://localhost:5432/mydb')

// SQLite (Local file)
const db = await initializeConnection('file:./dev.db')

// Turso (with auth token)
const db = await initializeConnection('libsql://my-db.turso.io', {
  authToken: process.env.TURSO_AUTH_TOKEN
})

// Environment switching
const db = await initializeConnection({
  development: 'file:./dev.db',
  production: process.env.DATABASE_URL!
})

// Multiple databases
const dbs = await initializeConnection({
  main: process.env.DATABASE_URL!,
  analytics: process.env.ANALYTICS_URL!,
  cache: 'file:./cache.db'
})
```

### CRUD Operations

```typescript
import { crud } from 'drizzleasy'

type User = {
  id: string
  name: string
  email: string
  age: number
  status: 'active' | 'inactive'
}

// Read with natural WHERE syntax
const { data: activeUsers } = await crud.read<User>('users')
  .where({ status: 'active' })
  .where({ age: '>18' })
  .where({ name: '*john*' })
  .execute()

// Create
await crud.create<User>('users')({
  name: 'John',
  email: 'john@example.com',
  age: 25,
  status: 'active'
})

// Update
await crud.update<User>('users')('user-123', { status: 'inactive' })

// Delete
await crud.destroy<User>('users')('user-123')
```

## Database Connection

### Auto-Detection
```typescript
// PostgreSQL (Neon, Vercel, Docker)
const db = initializeConnection('postgresql://...')

// SQLite (Local file)
const db = initializeConnection('file:./dev.db')

// Turso (with auth token)
const db = initializeConnection('libsql://...', {
  authToken: process.env.TURSO_AUTH_TOKEN
})
```

### Environment Switching
```typescript
// Automatic environment detection
const db = initializeConnection({
  development: 'file:./dev.db',
  production: process.env.DATABASE_URL!
})

// Multiple databases
const dbs = initializeConnection({
  main: process.env.DATABASE_URL!,
  analytics: process.env.ANALYTICS_URL!,
  cache: 'file:./cache.db'
})
```

## WHERE Syntax

```typescript
// Comparison
{ age: '>18' }           // Greater than
{ price: '<=100' }       // Less than or equal
{ status: '!inactive' }  // Not equal

// String patterns
{ name: '*john*' }       // Contains
{ name: 'john*' }        // Starts with
{ email: '*@gmail.com' } // Ends with

// Arrays (IN)
{ role: ['admin', 'user'] }

// Direct equality
{ status: 'active' }
```

## Documentation

Visit [our documentation](https://crud-builder-docs.vercel.app) for complete guides and examples.

## License

MIT