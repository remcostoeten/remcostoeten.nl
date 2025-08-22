import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSiteConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("siteConfig").first();
    return config || {
      title: "My Portfolio",
      favicon: "",
      metaDescription: "",
      metaKeywords: "",
      bodyBgColor: "bg-[hsl(0_0%_7%)]",
      bodyFontSize: "text-base",
      bodyFont: "font-sans",
      customColors: {
        background: "0 0% 7%",
        foreground: "0 0% 85%",
        card: "0 0% 7%",
        secondary: "0 0% 12%",
        muted: "0 0% 12%",
        mutedForeground: "0 0% 65%",
        accent: "85 100% 75%",
        border: "0 0% 20%",
        highlightFrontend: "85 100% 75%",
        highlightProduct: "85 100% 75%",
      },
      seo: {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
        twitterCard: "",
      }
    };
  },
});

export const updateSiteConfig = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("siteConfig", args);
    }
  },
});

export const getPageContent = query({
  args: { pageId: v.string() },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("pageContent")
      .withIndex("by_page_id", (q) => q.eq("pageId", args.pageId))
      .first();
    
    return content || {
      pageId: args.pageId,
      sections: [],
    };
  },
});

export const updatePageContent = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pageContent")
      .withIndex("by_page_id", (q) => q.eq("pageId", args.pageId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
    } else {
      await ctx.db.insert("pageContent", args);
    }
  },
});

export const importPageData = mutation({
  args: {
    pageData: v.object({
      page: v.object({
        seo: v.optional(v.array(v.object({
          title: v.optional(v.string()),
          description: v.optional(v.string()),
          keywords: v.optional(v.string()),
          ogImage: v.optional(v.string()),
          twitterCard: v.optional(v.string()),
        }))),
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
      }),
    }),
  },
  handler: async (ctx, args) => {
    const { page } = args.pageData;
    
    // Update site config with SEO data if provided
    const existingConfig = await ctx.db.query("siteConfig").first();
    const seoData = page.seo && page.seo.length > 0 ? page.seo[0] : {};
    
    const configUpdate = {
      title: seoData.title || "My Portfolio",
      metaDescription: seoData.description || "",
      metaKeywords: seoData.keywords || "",
      bodyBgColor: "bg-[hsl(0_0%_7%)]",
      bodyFontSize: "text-base",
      bodyFont: "font-sans",
      seo: seoData,
    };

    if (existingConfig) {
      await ctx.db.patch(existingConfig._id, configUpdate);
    } else {
      await ctx.db.insert("siteConfig", configUpdate);
    }
    
    // Update page content
    const existingContent = await ctx.db
      .query("pageContent")
      .withIndex("by_page_id", (q) => q.eq("pageId", "home"))
      .first();
    
    if (existingContent) {
      await ctx.db.patch(existingContent._id, { sections: page.sections });
    } else {
      await ctx.db.insert("pageContent", {
        pageId: "home",
        sections: page.sections,
      });
    }
  },
});
