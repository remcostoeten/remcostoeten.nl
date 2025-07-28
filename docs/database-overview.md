# Database Overview

## Overview Diagram

![Database Diagram](../assets/database-diagram.png)

## Connection
The database connection is established using the `drizzle-orm` and `postgres-js` packages. The connection is defined in `connection.ts`:

```typescript
function createDatabaseConnection(config: TDatabaseConfig) {
  const client = postgres(config.url, {
    max: config.max || 10,
    idle_timeout: config.idle_timeout || 20,
    connect_timeout: config.connect_timeout || 10,
  });
  
  return drizzle(client, { schema });
}
```

The connection parameters are managed through environment variables as specified in the `dotenv` configuration.

## Schema
The database schema is defined using the `drizzle-orm/pg-core` module. Example of a schema definition:

```typescript
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  technologies: jsonb("technologies").$type<string[]>().notNull(),
  ...createTimestamps(),
});
```

## Migrations
Migrations are handled by Drizzle ORM and are configured in `drizzle.config.ts`. The schema for migrations is set to output in `src/db/migrations`:

```typescript
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

## Factories
Factories are used to manage database operations in a modular, reusable way. Each factory is an async function that handles CRUD operations uniquely per entity. For example, the `ProjectsFactory` looks like:

```typescript
function createProjectsFactory() {
  async function getAllProjects(limit = 50) {
    return await db.select().from(projects).limit(limit);
  }

  return {
    getAllProjects,
    ...otherMethods
  }
}
```

Factories ensure separation of concerns, allowing business logic to remain independent of direct database interactions.

## Data Flow
The data flow is conducted via API routes established in the source directories, like:

### Project API
Defined in `src/routes/api/projects/index.ts`:

```typescript
export async function GET(event: APIEvent) {
  const projects = await projectsFactory.getAllProjects();
  return json({ success: true, data: projects });
}
```

This structure remains consistent across other factory interactions, promoting reuse and efficient data handling.

---

This document should serve as a guide for onboarding new team members, highlighting key areas of database setup, schema management, and data handling. For further details, refer to the relevant source files.
