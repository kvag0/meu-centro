import { v } from "convex/values";
import { internalMutation, internalQuery, MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Função auxiliar de segurança para obter o usuário logado.
 * É usada em quase todas as queries e mutations para verificar a autenticação.
 * @param ctx - O contexto da query ou mutation (QueryCtx | MutationCtx).
 * @returns O documento do usuário logado da nossa tabela 'users'.
 * @throws Lança um erro se o usuário não estiver autenticado ou não existir no banco de dados.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Usuário não autenticado.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    throw new Error("Usuário não encontrado no banco de dados.");
  }

  return user;
}

// =================================================================
// Funções internas chamadas pelo webhook do Clerk
// =================================================================

// Busca um usuário pelo seu ID do Clerk
export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Cria um novo usuário
export const create = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      tokenIdentifier: `${process.env.CLERK_HOSTNAME}|${args.clerkId}`,
      name: args.name,
      email: args.email,
      role: "member", // Todo novo usuário começa como 'member'
    });
  },
});
