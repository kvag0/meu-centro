import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Função de conveniência para obter o usuário logado de forma segura.
 * Lança um erro se o usuário não estiver autenticado ou não existir no banco de dados.
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

// CORREÇÃO: A função 'store' agora aceita os dados do usuário como argumentos
// vindos diretamente do webhook do Clerk.
export const store = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Se o usuário já existe, não fazemos nada.
      // Poderíamos adicionar lógica de atualização aqui se necessário no futuro.
      return existingUser._id;
    }

    // O tokenIdentifier é construído a partir do issuer URL do Clerk.
    // Certifique-se de que a variável de ambiente está configurada no painel do Convex.
    const tokenIdentifier = `${process.env.CLERK_HOSTNAME}|${args.clerkId}`;

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
      tokenIdentifier: tokenIdentifier,
      role: "member", // Todo novo usuário começa como membro
    });
  },
});

/**
 * Busca os dados do usuário logado atualmente.
 * Usado pelo frontend, por exemplo, no Header.
 */
export const getMe = query({
  handler: async (ctx) => {
    try {
      return await getCurrentUser(ctx);
    } catch {
      // Se getCurrentUser lançar um erro (não logado), retornamos null.
      return null;
    }
  },
});
