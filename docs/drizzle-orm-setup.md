# Drizzle ORM Setup Guide

## Overview

This project uses Drizzle ORM with SQLite for database management. This guide covers the database schema structure, factory patterns, and CMS integration that has been implemented.

## Database Schema

### 1. Core Tables

The CMS uses a hierarchical content structure with the following tables:

**Files:**
- `src/db/schemas/pages.ts` - Page definitions
- `src/db/schemas/content-blocks.ts` - Block containers
- `src/db/schemas/content-segments.ts` - Individual content pieces
- `src/db/schemas/style-presets.ts` - Reusable styling

**Table Structure:**
```sql
pages: { id, slug, title, description, isPublished, createdAt, updatedAt }
contentBlocks: { id, pageId, blockType, order, createdAt, updatedAt }
contentSegments: { id, blockId, order, text, type, href, target, className, style, metadata, createdAt, updatedAt }
stylePresets: { id, name, type, className, style, createdAt, updatedAt }
```

### 2. Performance Optimizations

**Composite Indexes:**
- `idx_blocks_page_order` - ON content_blocks(page_id, "order")
- `idx_segments_block_order` - ON content_segments(block_id, "order")

These indexes ensure fast page content loading by optimizing queries that fetch ordered content.

## Factory Pattern Implementation

### 1. CMS Factory

**File:** `src/lib/cms/cms-factory.ts`

The factory provides CRUD operations following functional programming principles:

```typescript
// Factory signature
function createCMSFactory(schema: DatabaseSchema) {
  return {
    async create(data: TCreateData): Promise<TResult>,
    async read(id: string): Promise<TResult>,
    async update(id: string, data: TUpdateData): Promise<TResult>,
    async destroy(id: string): Promise<void>
  };
}
```

**Features:**
- Transaction support for atomic operations
- Proper error handling and validation
- Optimized queries using composite indexes
- Type-safe operations with TypeScript

### 2. Usage Example

```typescript
// Create factory instance
const cmsFactory = createCMSFactory(db);

// Read page with all content
const pageContent = await cmsFactory.read("home");

// Update page content atomically
await cmsFactory.update("home", {
  blocks: [
    {
      id: "block-1",
      segments: [
        { id: "seg-1", type: "text", content: "Updated content" }
      ]
    }
  ]
});
```

## Database Commands

### Development Commands

```bash
# Push schema changes to database
bun run db:push

# Pull schema from database
bun run db:pull

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio

# Seed the database
bun run db:seed
```

### Migration Workflow

1. **Make Schema Changes:**
   - Edit files in `src/db/schemas/`
   - Update type definitions if needed

2. **Generate Migration:**
   ```bash
   bun run db:generate
   ```

3. **Review Migration:**
   - Check generated files in `drizzle/` directory
   - Verify SQL statements are correct

4. **Apply Migration:**
   ```bash
   bun run db:migrate
   ```

## Type System

### 1. Database Types

**File:** `src/db/types.ts`

```typescript
// Base entity with timestamps
type TTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type TBaseEntity = {
  id: number;
} & TTimestamps;

// Inferred from Drizzle schema
type TPage = InferSelectModel<typeof pages>;
type TContentBlock = InferSelectModel<typeof contentBlocks>;
type TContentSegment = InferSelectModel<typeof contentSegments>;
```

### 2. CMS Types

**File:** `src/lib/cms/types.ts`

```typescript
// In-memory content structure
type TPageContent = {
  id: string;
  title: string;
  blocks: TBlock[];
};

type TBlock = {
  id: string;
  type: string;
  segments: TSegment[];
};

type TSegment = {
  id: string;
  type: string;
  content: string;
  href?: string;
  target?: string;
  className?: string;
  style?: string;
};
```

## Configuration

### 1. Database Configuration

**File:** `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schemas/*",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db"
  }
});
```

### 2. Environment Variables

Required in `.env.local`:

```env
# Database Configuration
DATABASE_URL="file:local.db"

# For Turso (optional)
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

## Best Practices

### 1. Schema Design

- **Use composite indexes** for queries that filter and order
- **Include timestamps** on all tables for audit trails
- **Proper foreign key constraints** with cascade deletes
- **Normalized structure** to avoid data duplication

### 2. Factory Usage

- **Pure functions only** - no side effects outside function scope
- **Transaction support** for multi-table operations
- **Proper error handling** with descriptive error messages
- **Type safety** throughout the operation chain

### 3. Performance Tips

- **Use indexes wisely** - composite indexes for common query patterns
- **Batch operations** when possible to reduce database round trips
- **Eager loading** for related data to avoid N+1 queries
- **Connection pooling** for production environments

## Troubleshooting

### Common Issues

1. **Migration Conflicts:**
   - Check for schema inconsistencies
   - Verify all imports are correct
   - Ensure proper column types

2. **Performance Issues:**
   - Check if indexes are being used
   - Review query execution plans
   - Consider adding missing indexes

3. **Type Errors:**
   - Regenerate types after schema changes
   - Verify InferSelectModel usage
   - Check for proper type exports

### Debugging Commands

```bash
# Check database schema
bun run db:studio

# Verify migration status
bun run db:migrate

# Test database connection
bun run db:push --dry-run
```

## Testing the Connection

To verify your Drizzle ORM setup is working correctly, you can create a simple server action that demonstrates creating and fetching a user. This section shows practical examples using the established factory patterns.

### 1. Create User Factory

First, create a user factory following the established patterns:

**File:** `src/lib/user/factories.ts`

```typescript
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import type { TBaseEntity } from "@/db/types";

type TUserEntity = TBaseEntity & {
  email: string;
  name: string | null;
  emailVerified: string | null;
  image: string | null;
};

type TUserCreateInput = {
  email: string;
  name?: string;
  emailVerified?: string;
  image?: string;
};

type TUserUpdateInput = Partial<Pick<TUserEntity, "name" | "emailVerified" | "image">>;

export function createUsersFactory() {
  
  async function create(data: TUserCreateInput): Promise<TUserEntity> {
    const newUser = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name || null,
        emailVerified: data.emailVerified || null,
        image: data.image || null,
      })
      .returning()
      .execute();

    return newUser[0] as TUserEntity;
  }

  async function read(id: number): Promise<TUserEntity | null> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .execute();

    return user[0] as TUserEntity || null;
  }

  async function readByEmail(email: string): Promise<TUserEntity | null> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    return user[0] as TUserEntity || null;
  }

  async function update(id: number, data: TUserUpdateInput): Promise<TUserEntity> {
    const updatedUser = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning()
      .execute();

    return updatedUser[0] as TUserEntity;
  }

  async function destroy(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id)).execute();
  }

  return {
    create,
    read,
    readByEmail,
    update,
    destroy,
  };
}
```

### 2. Create Server Actions

Next, create server actions that utilize the factory:

**File:** `src/lib/user/server-actions.ts`

```typescript
"use server";

import { createUsersFactory } from "./factories";

export async function createUserAction(data: { email: string; name?: string }) {
  const usersFactory = createUsersFactory();
  
  try {
    const existingUser = await usersFactory.readByEmail(data.email);
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const newUser = await usersFactory.create(data);
    return { success: true, data: newUser };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUserAction(id: number) {
  const usersFactory = createUsersFactory();
  
  try {
    const user = await usersFactory.read(id);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

export async function getUserByEmailAction(email: string) {
  const usersFactory = createUsersFactory();
  
  try {
    const user = await usersFactory.readByEmail(email);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}
```

### 3. Test the Connection

Create a simple test script to verify everything works:

**File:** `scripts/test-connection.ts`

```typescript
import { createUserAction, getUserAction, getUserByEmailAction } from "@/lib/user/server-actions";

async function testDatabaseConnection() {
  console.log("🔍 Testing Drizzle ORM connection...");
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = "Test User";
    
    console.log("📝 Creating new user...");
    const createResult = await createUserAction({
      email: testEmail,
      name: testName,
    });
    
    if (!createResult.success) {
      console.error("❌ Failed to create user:", createResult.error);
      return;
    }
    
    console.log("✅ User created successfully:", createResult.data);
    const userId = createResult.data.id;
    
    console.log("🔍 Fetching user by ID...");
    const getUserResult = await getUserAction(userId);
    
    if (!getUserResult.success) {
      console.error("❌ Failed to fetch user:", getUserResult.error);
      return;
    }
    
    console.log("✅ User fetched by ID:", getUserResult.data);
    
    console.log("🔍 Fetching user by email...");
    const getUserByEmailResult = await getUserByEmailAction(testEmail);
    
    if (!getUserByEmailResult.success) {
      console.error("❌ Failed to fetch user by email:", getUserByEmailResult.error);
      return;
    }
    
    console.log("✅ User fetched by email:", getUserByEmailResult.data);
    
    console.log("🎉 All database operations completed successfully!");
    
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
  }
}

testDatabaseConnection();
```

### 4. Run the Connection Test

Execute the test script to verify your setup:

```bash
# Run the connection test
bun run --bun scripts/test-connection.ts

# Or with Node.js
npx tsx scripts/test-connection.ts
```

### 5. Best Practices Demonstrated

**Factory Pattern Benefits:**
- **Reusability:** Same factory can be used across multiple server actions
- **Type Safety:** Strong TypeScript typing throughout the operation chain
- **Separation of Concerns:** Database logic isolated from business logic
- **Pure Functions:** No side effects, predictable behavior

**Error Handling:**
- Consistent error response format across all actions
- Database errors caught and transformed into user-friendly messages
- Validation at the server action level before database operations

**Performance Considerations:**
- Use indexes on frequently queried columns (email in this case)
- Limit results appropriately to avoid memory issues
- Return only necessary data to minimize payload size

**Security Practices:**
- Server actions validate input data before database operations
- No direct database access from client components
- Email uniqueness enforced at both database and application level

### 6. Integration with Components

Use the server actions in your React components:

```typescript
// Example component usage
import { createUserAction } from "@/lib/user/server-actions";

export function UserForm() {
  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    
    const result = await createUserAction({ email, name });
    
    if (result.success) {
      console.log("User created:", result.data);
    } else {
      console.error("Error:", result.error);
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="name" type="text" placeholder="Name" />
      <button type="submit">Create User</button>
    </form>
  );
}
```

This testing approach ensures your Drizzle ORM setup is working correctly while demonstrating the established patterns and best practices used throughout the codebase.

## Next Steps

For production deployment:
1. Set up proper database connection pooling
2. Implement database backup strategies
3. Add monitoring and logging
4. Configure read replicas if needed
5. Set up automated migration deployment
