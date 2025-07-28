import { 
  pgTable, 
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

type TTimestamps = {
  createdAt: ReturnType<typeof timestamp>;
  updatedAt: ReturnType<typeof timestamp>;
};

type TBaseEntity = {
  id: number;
} & TTimestamps;

function createTimestamps(): TTimestamps {
  return {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  };
}

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  url: varchar("url", { length: 500 }),
  githubUrl: varchar("github_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  technologies: jsonb("technologies").$type<string[]>().notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  ...createTimestamps(),
}, (table) => ({
  statusIdx: index("projects_status_idx").on(table.status),
}));

// export const projectImages = pgTable("project_images", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
//   url: varchar("url", { length: 500 }).notNull(),
//   alt: varchar("alt", { length: 255 }).notNull(),
//   caption: text("caption"),
//   isHero: boolean("is_hero").default(false).notNull(),
//   sortOrder: integer("sort_order").default(0).notNull(),
//   ...createTimestamps(),
// });

// export const skills = pgTable("skills", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: varchar("name", { length: 100 }).notNull().unique(),
//   category: varchar("category", { length: 50 }).notNull(),
//   proficiency: integer("proficiency").notNull(),
//   yearsOfExperience: integer("years_of_experience"),
//   isActive: boolean("is_active").default(true).notNull(),
//   sortOrder: integer("sort_order").default(0).notNull(),
//   ...createTimestamps(),
// });

// export const experience = pgTable("experience", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   title: varchar("title", { length: 255 }).notNull(),
//   company: varchar("company", { length: 255 }).notNull(),
//   location: varchar("location", { length: 255 }),
//   startDate: timestamp("start_date").notNull(),
//   endDate: timestamp("end_date"),
//   isCurrent: boolean("is_current").default(false).notNull(),
//   description: text("description").notNull(),
//   achievements: jsonb("achievements").$type<string[]>().notNull(),
//   technologies: jsonb("technologies").$type<string[]>().notNull(),
//   sortOrder: integer("sort_order").default(0).notNull(),
//   ...createTimestamps(),
// });

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
  ...createTimestamps(),
}, (table) => ({
  statusIdx: index("contact_status_idx").on(table.status),
  readIdx: index("contact_read_idx").on(table.isRead),
}));

// export const siteSettings = pgTable("site_settings", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   key: varchar("key", { length: 100 }).notNull().unique(),
//   value: jsonb("value").notNull(),
//   type: varchar("type", { length: 50 }).notNull(),
//   description: text("description"),
//   isPublic: boolean("is_public").default(false).notNull(),
//   ...createTimestamps(),
// });

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  page: varchar("page", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  sessionId: varchar("session_id", { length: 255 }),
  userId: varchar("user_id", { length: 255 }),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  city: varchar("city", { length: 100 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
}, (table) => ({
  eventTypeIdx: index("analytics_event_type_idx").on(table.eventType),
  timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
  pageIdx: index("analytics_page_idx").on(table.page),
  userIdIdx: index("analytics_user_id_idx").on(table.userId),
}));

export const adminUser = pgTable("admin_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  ...createTimestamps(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => adminUser.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  ...createTimestamps(),
}, (table) => ({
  tokenIdx: index("admin_sessions_token_idx").on(table.token),
  expiresIdx: index("admin_sessions_expires_idx").on(table.expiresAt),
}));

// export const adminActivityLog = pgTable("admin_activity_log", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   userId: uuid("user_id").references(() => adminUser.id, { onDelete: "cascade" }).notNull(),
//   action: varchar("action", { length: 100 }).notNull(),
//   module: varchar("module", { length: 50 }).notNull(),
//   details: jsonb("details"),
//   ipAddress: varchar("ip_address", { length: 45 }),
//   timestamp: timestamp("timestamp").defaultNow().notNull(),
// }, (table) => ({
//   userIdx: index("admin_activity_user_idx").on(table.userId),
//   moduleIdx: index("admin_activity_module_idx").on(table.module),
//   timestampIdx: index("admin_activity_timestamp_idx").on(table.timestamp),
// }));

// Commented out relations since the related tables are commented out
// export const projectsRelations = relations(projects, ({ many }) => ({
//   images: many(projectImages),
// }));

// export const projectImagesRelations = relations(projectImages, ({ one }) => ({
//   project: one(projects, {
//     fields: [projectImages.projectId],
//     references: [projects.id],
//   }),
// }));

export type TProject = typeof projects.$inferSelect;
export type TNewProject = typeof projects.$inferInsert;
// export type TProjectImage = typeof projectImages.$inferSelect;
// export type TNewProjectImage = typeof projectImages.$inferInsert;
// export type TSkill = typeof skills.$inferSelect;
// export type TNewSkill = typeof skills.$inferInsert;
// export type TExperience = typeof experience.$inferSelect;
// export type TNewExperience = typeof experience.$inferInsert;
export type TContactSubmission = typeof contactSubmissions.$inferSelect;
export type TNewContactSubmission = typeof contactSubmissions.$inferInsert;
// export type TSiteSetting = typeof siteSettings.$inferSelect;
// export type TNewSiteSetting = typeof siteSettings.$inferInsert;
export type TAnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type TNewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type TAdminUser = typeof adminUser.$inferSelect;
export type TNewAdminUser = typeof adminUser.$inferInsert;
export type TAdminSession = typeof adminSessions.$inferSelect;
export type TNewAdminSession = typeof adminSessions.$inferInsert;
