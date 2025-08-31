import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Busca todos os artigos publicados para a página pública da biblioteca.
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("articles").order("desc").collect();
  },
});

// Busca todos os artigos de um determinado terreiro para o painel de admin.
export const getForTerreiro = query({
  args: { terreiroId: v.id("terreiros") },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    return await ctx.db
      .query("articles")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", args.terreiroId))
      .order("desc")
      .collect();
  },
});

// Cria um novo artigo na biblioteca.
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    // NOVO: Exige a categoria na criação
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (user.role !== "admin" || !user.terreiroId) {
      throw new Error("Apenas administradores podem criar artigos.");
    }

    return await ctx.db.insert("articles", {
      title: args.title,
      content: args.content,
      category: args.category, // Salva a categoria
      terreiroId: user.terreiroId,
      authorId: user._id,
    });
  },
});

// Deleta um artigo da biblioteca.
export const deleteArticle = mutation({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new Error("Artigo não encontrado.");
    }

    if (user.role !== "admin" || user.terreiroId !== article.terreiroId) {
      throw new Error("Você não tem permissão para deletar este artigo.");
    }

    await ctx.db.delete(args.articleId);
  },
});
