import { db } from './index';
import { users, posts, categories } from './schema';
import { eq, desc, and, like } from 'drizzle-orm';

// Example CRUD operations

// Create a new user
export async function createUser(data: { username: string; email: string }) {
  const [user] = await db.insert(users).values({
    username: data.username,
    email: data.email,
  }).returning();
  return user;
}

// Get all users
export async function getAllUsers() {
  return await db.select().from(users);
}

// Get user by ID
export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// Create a new post
export async function createPost(data: {
  title: string;
  content?: string;
  authorId: number;
  categoryId?: number;
  published?: boolean;
}) {
  const [post] = await db.insert(posts).values({
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    categoryId: data.categoryId,
    published: data.published ?? false,
    updatedAt: new Date(),
  }).returning();
  return post;
}

// Get posts with author information
export async function getPostsWithAuthor() {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));

  return result;
}

// Get published posts
export async function getPublishedPosts() {
  return await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));
}

// Search posts by title
export async function searchPostsByTitle(searchTerm: string) {
  return await db
    .select()
    .from(posts)
    .where(like(posts.title, `%${searchTerm}%`))
    .orderBy(desc(posts.createdAt));
}

// Update user
export async function updateUser(id: number, data: Partial<{ username: string; email: string; isActive: boolean }>) {
  const [user] = await db
    .update(users)
    .set({ ...data, lastLogin: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

// Delete post
export async function deletePost(id: number) {
  await db.delete(posts).where(eq(posts.id, id));
}

// Get user's posts count
export async function getUserPostsCount(userId: number) {
  const [result] = await db
    .select({ count: posts.id })
    .from(posts)
    .where(eq(posts.authorId, userId));

  return result?.count || 0;
}

// Create a category
export async function createCategory(data: { name: string; description?: string }) {
  const [category] = await db.insert(categories).values(data).returning();
  return category;
}

// Get all categories
export async function getAllCategories() {
  return await db.select().from(categories);
}