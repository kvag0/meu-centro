import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

// Busca todos os eventos de um terreiro (para admins)
export const get = query({
  args: { terreiroId: v.id("terreiros") },
  handler: async (ctx, args) => {
    // ... (código existente inalterado)
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Acesso não autorizado.");
    }
    return await ctx.db
      .query("events")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", args.terreiroId))
      .order("desc")
      .collect();
  },
});

// CORREÇÃO: Busca todos os eventos marcados como públicos, sem precisar de um terreiroId
export const getPublic = query({
  handler: async (ctx) => {
    const publicEvents = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .collect();
    return publicEvents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    isPublic: v.boolean(),
    terreiroId: v.id("terreiros"),
  },
  handler: async (ctx, args) => {
    // ... (código existente inalterado)
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") {
      throw new Error("Apenas administradores podem criar eventos.");
    }
    await ctx.db.insert("events", args);
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // ... (código existente inalterado)
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") {
      throw new Error("Apenas administradores podem deletar eventos.");
    }
    await ctx.db.delete(args.eventId);
  },
});
