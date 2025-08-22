import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
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
  }),
  
  pageContent: defineTable({
    pageId: v.string(),
    sections: v.array(v.object({
      id: v.string(),
      direction: v.string(),
      justify: v.string(),
      align: v.string(),
      gap: v.string(),
      padding: v.string(),
      margin: v.optional(v.string()),
      widgets: v.array(v.object({
        type: v.string(),
        props: v.any(),
      })),
    })),
  }).index("by_page_id", ["pageId"]),

  submissions: defineTable({
    name: v.string(),
    feedback: v.string(),
    emoji: v.optional(v.string()),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
