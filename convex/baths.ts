import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { terreiroId: v.id("terreiros") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Não autorizado");
    return await ctx.db
      .query("bathRecipes")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", args.terreiroId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    ingredients: v.string(),
    description: v.string(),
    terreiroId: v.id("terreiros"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Não autorizado");
    await ctx.db.insert("bathRecipes", args);
  },
});

// CORREÇÃO: Renomeado de 'delete' para 'deleteBath' para ser mais específico
export const deleteBath = mutation({
  args: { bathId: v.id("bathRecipes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Não autorizado");
    await ctx.db.delete(args.bathId);
  },
});
