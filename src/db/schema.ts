import { 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  integer,
  jsonb,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Base timestamps for all tables
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  url: varchar("url", { length: 500 }),
  demoUrl: varchar("demo_url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  technologies: jsonb("technologies").$type<string[]>().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: varchar("status", { length: 50 }).default("completed").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  highlights: jsonb("highlights").$type<string[]>().notNull(),
  metrics: jsonb("metrics").$type<{
    stars?: number;
    forks?: number;
    downloads?: number;
    users?: number;
  }>(),
  isPublished: boolean("is_published").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  ...timestamps,
}, (table) => ({
  featuredIdx: index("projects_featured_idx").on(table.featured),
  statusIdx: index("projects_status_idx").on(table.status),
  publishedIdx: index("projects_published_idx").on(table.isPublished),
}));

// Project images table
export const projectImages = pgTable("project_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }).notNull(),
  caption: text("caption"),
  isHero: boolean("is_hero").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

// Skills table
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  proficiency: integer("proficiency").notNull(), // 1-5 scale
  yearsOfExperience: integer("years_of_experience"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

// Experience table
export const experience = pgTable("experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false).notNull(),
  description: text("description").notNull(),
  achievements: jsonb("achievements").$type<string[]>(),
  technologies: jsonb("technologies").$type<string[]>(),
  sortOrder: integer("sort_order").default(0).notNull(),
  ...timestamps,
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("new").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isRead: boolean("is_read").default(false).notNull(),
  repliedAt: timestamp("replied_at"),
  ...timestamps,
}, (table) => ({
  statusIdx: index("contact_status_idx").on(table.status),
  readIdx: index("contact_read_idx").on(table.isRead),
}));

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // string, number, boolean, object, array
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  ...timestamps,
});

// Analytics events (simple analytics)
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  page: varchar("page", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  sessionId: varchar("session_id", { length: 255 }),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
  timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
  pageIdx: index("analytics_page_idx").on(table.page),
}));

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

// Types for use in application
export type TProject = typeof projects.$inferSelect;
export type TNewProject = typeof projects.$inferInsert;
export type TProjectImage = typeof projectImages.$inferSelect;
export type TNewProjectImage = typeof projectImages.$inferInsert;
export type TSkill = typeof skills.$inferSelect;
export type TNewSkill = typeof skills.$inferInsert;
export type TExperience = typeof experience.$inferSelect;
export type TNewExperience = typeof experience.$inferInsert;
export type TContactSubmission = typeof contactSubmissions.$inferSelect;
export type TNewContactSubmission = typeof contactSubmissions.$inferInsert;
export type TSiteSetting = typeof siteSettings.$inferSelect;
export type TNewSiteSetting = typeof siteSettings.$inferInsert;
export type TAnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type TNewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
