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
    await ctx.db.insert("submissions", {
      name: args.name,
      feedback: args.feedback,
      emoji: args.emoji,
    });
  },
});

export const get = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user || !user.isAdmin) {
      return [];
    }
    return await ctx.db.query("submissions").collect();
  },
});
