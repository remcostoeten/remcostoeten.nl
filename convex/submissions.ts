import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./auth";

export const send = mutation({
  args: {
    name: v.string(),
    feedback: v.string(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[SUBMISSIONS] Receiving submission:", args);
    try {
      const result = await ctx.db.insert("submissions", {
        name: args.name,
        feedback: args.feedback,
        emoji: args.emoji,
      });
      console.log("[SUBMISSIONS] Successfully inserted:", result);
      return result;
    } catch (error) {
      console.error("[SUBMISSIONS] Error inserting:", error);
      throw error;
    }
  },
});

export const get = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    console.log("[SUBMISSIONS] Getting submissions, user:", user ? { isAdmin: user.isAdmin } : "no user");
    // Allow access if user is admin OR if no user (anonymous) - for development
    if (user && !user.isAdmin) {
      console.log("[SUBMISSIONS] User exists but is not admin, returning empty array");
      return [];
    }
    const submissions = await ctx.db.query("submissions").collect();
    console.log("[SUBMISSIONS] Found submissions:", submissions.length);
    return submissions;
  },
});

export const getEmojiCounts = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    console.log("[SUBMISSIONS] Getting emoji counts, user:", user ? { isAdmin: user.isAdmin } : "no user");
    // Allow access if user is admin OR if no user (anonymous) - for development
    if (user && !user.isAdmin) {
      console.log("[SUBMISSIONS] User exists but is not admin, returning empty object");
      return {};
    }
    const submissions = await ctx.db.query("submissions").collect();
    const counts: Record<string, number> = {};
    
    submissions.forEach((submission) => {
      if (submission.emoji) {
        counts[submission.emoji] = (counts[submission.emoji] || 0) + 1;
      }
    });
    
    console.log("[SUBMISSIONS] Emoji counts:", counts);
    return counts;
  },
});
