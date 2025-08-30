import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

// Função auxiliar para obter o usuário atual a partir do Clerk
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Usuário não autenticado.");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) =>
      q.eq("clerkId", identity.subject)
    )
    .unique();
  if (!user) {
    throw new Error("Usuário não encontrado no banco de dados.");
  }
  return user;
}

// Query para buscar o usuário atual e verificar se ele é admin
export const getCurrentUserWithAdminRole = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return {
      ...user,
      isAdmin: user.role === "admin",
    };
  },
});

// Query para buscar todos os usuários (somente admins podem chamar)
export const getUsers = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") {
      // Se não for admin, retorna uma lista vazia por segurança
      return [];
    }
    return ctx.db.query("users").collect();
  },
});

// Query para buscar todos os terreiros (somente admins podem chamar)
export const getTerreiros = query({
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (user.role !== "admin") {
            return [];
        }
        return ctx.db.query("terreiros").collect();
    }
})

// Mutation para associar um usuário a um terreiro
export const assignUserToTerreiro = mutation({
  args: {
    userId: v.id("users"),
    terreiroId: v.id("terreiros"),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin") {
      throw new Error("Apenas administradores podem realizar esta ação.");
    }
    await ctx.db.patch(args.userId, { terreiroId: args.terreiroId });
  },
});

// Mutation para mudar o papel de um usuário
export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("admin"), v.literal("member")),
    },
    handler: async (ctx, args) => {
        const admin = await getCurrentUser(ctx);
        if (admin.role !== "admin") {
            throw new Error("Apenas administradores podem realizar esta ação.");
        }
        await ctx.db.patch(args.userId, { role: args.role });
    }
})
