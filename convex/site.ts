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
      },
      designTokens: {
        layout: {
          containerMaxWidth: "1200px",
        },
      },
      cmsTabOrder: ["submissions", "site", "content", "import"],
      activeTab: "submissions"
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
    designTokens: v.optional(v.any()),
    cmsTabOrder: v.optional(v.array(v.string())),
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

export const updateTabOrder = mutation({
  args: {
    tabOrder: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, { cmsTabOrder: args.tabOrder });
    } else {
      await ctx.db.insert("siteConfig", {
        title: "My Portfolio",
        bodyBgColor: "bg-[hsl(0_0%_7%)]",
        bodyFontSize: "text-base",
        bodyFont: "font-sans",
        cmsTabOrder: args.tabOrder,
      });
    }
  },
});

export const updateActiveTab = mutation({
  args: {
    activeTab: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, { activeTab: args.activeTab });
    } else {
      await ctx.db.insert("siteConfig", {
        title: "My Portfolio",
        bodyBgColor: "bg-[hsl(0_0%_7%)]",
        bodyFontSize: "text-base",
        bodyFont: "font-sans",
        activeTab: args.activeTab,
      });
    }
  },
});

export const getPageContent = query({
  args: { pageId: v.string() },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { sections: args.sections });
    } else {
      await ctx.db.insert("pageContent", args);
    }
    
    return await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
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
    
    
    const existingContent = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), "home"))
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

export const updateLayerMeta = mutation({
  args: {
    pageId: v.string(),
    layerId: v.string(),
    layerType: v.union(v.literal("section"), v.literal("widget")),
    data: v.object({
      name: v.optional(v.string()),
      visible: v.optional(v.boolean()),
      locked: v.optional(v.boolean()),
      collapsed: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const pageContent = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (!pageContent) {
      throw new Error(`Page content not found for pageId: ${args.pageId}`);
    }
    
    const updatedSections = pageContent.sections.map((section: any) => {
      if (args.layerType === "section" && section.id === args.layerId) {
        return { ...section, ...args.data };
      }
      
      if (args.layerType === "widget") {
        const updatedWidgets = section.widgets.map((widget: any) => {
          if (widget.id === args.layerId) {
            return { ...widget, ...args.data };
          }
          return widget;
        });
        return { ...section, widgets: updatedWidgets };
      }
      
      return section;
    });
    
    await ctx.db.patch(pageContent._id, { sections: updatedSections });
    
    return await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
  },
});

export const reorderSections = mutation({
  args: {
    pageId: v.string(),
    orderedIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const pageContent = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (!pageContent) {
      throw new Error(`Page content not found for pageId: ${args.pageId}`);
    }
    
    const sectionMap = new Map();
    pageContent.sections.forEach((section: any) => {
      sectionMap.set(section.id, section);
    });
    
    const reorderedSections = args.orderedIds
      .map(id => sectionMap.get(id))
      .filter(Boolean);
    
    await ctx.db.patch(pageContent._id, { sections: reorderedSections });
    
    return await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
  },
});

export const reorderWidgets = mutation({
  args: {
    pageId: v.string(),
    sectionId: v.string(),
    orderedIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const pageContent = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (!pageContent) {
      throw new Error(`Page content not found for pageId: ${args.pageId}`);
    }
    
    const updatedSections = pageContent.sections.map((section: any) => {
      if (section.id === args.sectionId) {
        const widgetMap = new Map();
        section.widgets.forEach((widget: any) => {
          widgetMap.set(widget.id, widget);
        });
        
        const reorderedWidgets = args.orderedIds
          .map(id => widgetMap.get(id))
          .filter(Boolean);
        
        return { ...section, widgets: reorderedWidgets };
      }
      return section;
    });
    
    await ctx.db.patch(pageContent._id, { sections: updatedSections });
    
    return await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
  },
});

export const deleteItems = mutation({
  args: {
    pageId: v.string(),
    itemIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const pageContent = await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
    
    if (!pageContent) {
      throw new Error(`Page content not found for pageId: ${args.pageId}`);
    }
    
    // Create a set of item IDs to delete for faster lookup
    const idsToDelete = new Set(args.itemIds);
    
    // Filter out sections and widgets that should be deleted
    // When a section is deleted, all its widgets are automatically deleted
    const updatedSections = pageContent.sections
      .filter((section: any) => !idsToDelete.has(section.id))
      .map((section: any) => ({
        ...section,
        widgets: section.widgets.filter((widget: any) => !idsToDelete.has(widget.id))
      }));
    
    await ctx.db.patch(pageContent._id, { sections: updatedSections });
    
    return await ctx.db
      .query("pageContent")
      .filter((q) => q.eq(q.field("pageId"), args.pageId))
      .first();
  },
});
