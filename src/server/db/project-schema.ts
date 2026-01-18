import { pgTable, text, boolean, integer, timestamp, index } from "drizzle-orm/pg-core"

export const projects = pgTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    idx: integer("idx").notNull().unique(),
    title: text("title").notNull(),
    desc: text("desc").notNull(),
    featured: boolean("featured").default(false).notNull(),
    showUpd: boolean("show_upd").default(true).notNull(),
    demoBox: text("demo_box"),
    showLive: boolean("show_live").default(false).notNull(),
    gitUrl: text("git_url"),
    demoUrl: text("demo_url"),
    native: boolean("native").default(false).notNull(),
    labels: text("labels").array().default([]).notNull(),
    showCommits: boolean("show_commits").default(false).notNull(),
    showFirst: boolean("show_first").default(false).notNull(),
    showLatest: boolean("show_latest").default(true).notNull(),
    hidden: boolean("hidden").default(false).notNull(),
    defaultOpen: boolean("default_open").default(false).notNull(),
    showIndicator: boolean("show_indicator").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("projects_idx_idx").on(t.idx), index("projects_hidden_idx").on(t.hidden)],
)

export const projectSettings = pgTable("project_settings", {
  id: text("id").primaryKey().default("singleton"),
  showN: integer("show_n").default(6).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type ProjectSettings = typeof projectSettings.$inferSelect
