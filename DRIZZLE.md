# Drizzle ORM Setup

This project uses Drizzle ORM with PostgreSQL for database management.

## 📁 Database Structure

```
src/server/db/
├── schema.ts     # Database schema definitions
├── index.ts      # Database connection and exports
└── examples.ts   # Example CRUD operations
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Make sure your PostgreSQL container is running:

```bash
./scripts/manage/docker-psql.sh start
```

### 3. Generate Migrations

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Generate migration files from schema |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes directly to database |
| `npm run db:studio` | Open Drizzle Studio (GUI) |

## 🗄️ Database Schema

### Users Table
- `id` (serial, primary key)
- `username` (varchar(50), unique)
- `email` (varchar(100), unique)
- `createdAt` (timestamp with timezone)
- `isActive` (boolean, default: true)
- `lastLogin` (timestamp with timezone)

### Categories Table
- `id` (serial, primary key)
- `name` (varchar(100), unique)
- `description` (text)
- `createdAt` (timestamp with timezone)

### Posts Table
- `id` (serial, primary key)
- `title` (varchar(200))
- `content` (text)
- `authorId` (integer, foreign key → users.id)
- `categoryId` (integer, foreign key → categories.id)
- `createdAt` (timestamp with timezone)
- `published` (boolean, default: false)
- `updatedAt` (timestamp with timezone)

## 💡 Usage Examples

### Import Database

```typescript
import { db, users, posts, categories } from '@/server/db';
```

### Create Operations

```typescript
// Create a user
const newUser = await db.insert(users).values({
  username: 'john_doe',
  email: 'john@example.com',
}).returning();

// Create a post
const newPost = await db.insert(posts).values({
  title: 'My First Post',
  content: 'Hello, world!',
  authorId: 1,
  published: true,
}).returning();
```

### Read Operations

```typescript
// Get all users
const allUsers = await db.select().from(users);

// Get user by ID
const user = await db.select().from(users)
  .where(eq(users.id, 1));

// Get posts with author info
const postsWithAuthors = await db
  .select({
    id: posts.id,
    title: posts.title,
    author: {
      id: users.id,
      username: users.username,
    },
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id));
```

### Update Operations

```typescript
const updatedUser = await db
  .update(users)
  .set({ username: 'new_username' })
  .where(eq(users.id, 1))
  .returning();
```

### Delete Operations

```typescript
await db.delete(posts).where(eq(posts.id, 1));
```

## 🔍 Advanced Queries

### Using Example Functions

```typescript
import {
  createUser,
  getPostsWithAuthor,
  searchPostsByTitle,
  getUserPostsCount
} from '@/server/db/examples';

// Create a user
const user = await createUser({
  username: 'alice',
  email: 'alice@example.com'
});

// Get posts with author information
const posts = await getPostsWithAuthor();

// Search posts
const searchResults = await searchPostsByTitle('Tutorial');

// Get user's post count
const postCount = await getUserPostsCount(1);
```

### Custom Queries with Conditions

```typescript
import { eq, and, like, desc, asc } from 'drizzle-orm';

// Get published posts by a specific author
const publishedPosts = await db
  .select()
  .from(posts)
  .where(
    and(
      eq(posts.authorId, 1),
      eq(posts.published, true)
    )
  )
  .orderBy(desc(posts.createdAt));

// Search users by username or email
const searchResults = await db
  .select()
  .from(users)
  .where(
    like(users.username, `%search%`)
  );
```

## 🎯 Type Safety

The schema includes TypeScript types and Zod schemas:

```typescript
import {
  User,
  NewUser,
  insertUserSchema,
  selectUserSchema
} from '@/server/db';

// Type inference
const user: User = await getUserById(1);
const newUser: NewUser = { username: 'john', email: 'john@example.com' };

// Zod validation
const validatedUser = insertUserSchema.parse({
  username: 'john',
  email: 'john@example.com'
});
```

## 🗂️ Migrations

### Creating a New Table

1. Add table to `src/server/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration

### Modifying Schema

1. Update schema in `src/server/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply changes

## 🔧 Development

### Drizzle Studio

Open the GUI to explore your database:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:4983` where you can:
- Browse tables and data
- Run queries
- View relationships
- Edit data

### Connection Testing

Test your database connection:

```typescript
import { testConnection } from '@/server/db';

const result = await testConnection();
if (result.success) {
  console.log('Database connected successfully!');
} else {
  console.error('Database connection failed:', result.message);
}
```

## 📊 Environment Configuration

The database connection uses the `DATABASE_URL` from your environment variables:

```bash
# Local development (using Docker)
DATABASE_URL=postgresql://postgres:password@localhost:5434/remcostoeten_db

# Production
DATABASE_URL=postgresql://user:password@host:5432/database
```

Use the Docker management script to get your connection URL:

```bash
./scripts/manage/docker-psql.sh url
```

## 🚨 Best Practices

1. **Always use types** - Leverage TypeScript for type safety
2. **Validate inputs** - Use Zod schemas for validation
3. **Use transactions** - For multiple related operations
4. **Handle errors** - Always wrap database operations in try-catch
5. **Use indexes** - Add indexes to frequently queried columns
6. **Limit results** - Use `LIMIT` for large datasets
7. **Use joins efficiently** - Select only needed columns

## 🐛 Troubleshooting

### Connection Issues

1. Ensure PostgreSQL container is running:
   ```bash
   ./scripts/manage/docker-psql.sh status
   ```

2. Check your DATABASE_URL:
   ```bash
   ./scripts/manage/docker-psql.sh url
   ```

3. Verify database exists and is accessible:
   ```bash
   ./scripts/manage/docker-psql.sh tables
   ```

### Migration Issues

1. Check generated migration files in `drizzle/` directory
2. Ensure database is in a clean state
3. Use `npm run db:push` for development (bypasses migrations)

### Type Errors

1. Ensure you've imported types correctly
2. Check that your schema and database are in sync
3. Regenerate types if needed: `npm run db:generate`