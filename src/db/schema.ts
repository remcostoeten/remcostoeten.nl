import { pgTable, serial, varchar, boolean, timestamp, integer, jsonb, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content").$type<any>().notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pageVersions = pgTable("page_versions", {
  id: serial("id").primaryKey(),
  pageSlug: varchar("page_slug", { length: 255 }).notNull(),
  versionNumber: integer("version_number").notNull(),
  content: jsonb("content").$type<any>().notNull(),
  commitMessage: text("commit_message"),
  author: varchar("author", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
