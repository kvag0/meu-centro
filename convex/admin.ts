import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

export const getCurrentUserWithAdminRole = query({
  handler: async (ctx) => {
    try {
      const user = await getCurrentUser(ctx);
      return { ...user, isAdmin: user.role === "admin" };
    } catch (error) {
      return null;
    }
  },
});

export const getUsers = query({
  args: {
    terreiroId: v.id("terreiros"),
    // CORREÇÃO: Adicionamos a capacidade de filtrar por 'role'
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") {
      throw new Error("Acesso não autorizado.");
    }

    let query = ctx.db
      .query("users")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", args.terreiroId));

    if (args.role) {
      // Se um 'role' for fornecido, aplicamos o filtro
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    return await query.order("desc").collect();
  },
});

export const getTerreiros = query({
  handler: async (ctx) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") return [];
    return await ctx.db.query("terreiros").collect();
  },
});

export const updateUserRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("member")) },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") throw new Error("Não autorizado");
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const updateUserTerreiro = mutation({
  args: { userId: v.id("users"), terreiroId: v.id("terreiros") },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") throw new Error("Não autorizado");
    await ctx.db.patch(args.userId, { terreiroId: args.terreiroId });
  },
});
