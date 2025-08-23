import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...(authTables as any),
  siteConfig: defineTable({
    title: v.string(),
    favicon: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.string()),
    bodyBgColor: v.string(),
    bodyFontSize: v.string(),
    bodyFont: v.string(),
    customColors: v.optional(v.object({
      background: v.string(),
      foreground: v.string(),
      card: v.string(),
      secondary: v.string(),
      muted: v.string(),
      mutedForeground: v.string(),
      accent: v.string(),
      border: v.string(),
      highlightFrontend: v.string(),
      highlightProduct: v.string(),
    })),
    seo: v.optional(v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      keywords: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      twitterCard: v.optional(v.string()),
    })),
    cmsTabOrder: v.optional(v.array(v.string())),
    activeTab: v.optional(v.string()),
    designTokens: v.optional(v.any()),
  }),
  
  pageContent: defineTable({
    pageId: v.string(),
    sections: v.array(v.object({
      id: v.string(),
      name: v.optional(v.string()),
      visible: v.optional(v.boolean()),
      locked: v.optional(v.boolean()),
      collapsed: v.optional(v.boolean()),
      direction: v.string(),
      justify: v.string(),
      align: v.string(),
      gap: v.string(),
      padding: v.string(),
      margin: v.optional(v.string()),
      widgets: v.array(v.object({
        id: v.optional(v.string()),
        type: v.string(),
        name: v.optional(v.string()),
        visible: v.optional(v.boolean()),
        locked: v.optional(v.boolean()),
        props: v.any(),
      })),
    })),
  }).index("by_page_id", ["pageId"]),

  submissions: defineTable({
    name: v.string(),
    feedback: v.string(),
    emoji: v.optional(v.string()),
  }),
});
