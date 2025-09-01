import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Criar um novo artigo (apenas para administradores)
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Apenas administradores podem criar artigos.");
    }

    if (!user.terreiroId) {
        throw new Error("Administrador não está associado a um terreiro.");
    }

    const articleId = await ctx.db.insert("articles", {
      title: args.title,
      content: args.content,
      category: args.category,
      authorId: user._id,
      terreiroId: user.terreiroId,
    });

    return articleId;
  },
});

// Deletar um artigo (apenas para administradores)
export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") {
      throw new Error("Apenas administradores podem deletar artigos.");
    }
    await ctx.db.delete(args.id);
  },
});

// Buscar todos os artigos de um terreiro (para o painel de admin)
export const getForTerreiro = query({
  args: {
    terreiroId: v.id("terreiros"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("articles")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", args.terreiroId))
      .order("desc")
      .collect();
  },
});

// NOME CORRETO E DEFINITIVO: getAllPublic
export const getAllPublic = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { category } = args;
    const query = ctx.db.query("articles");
    if (category && category !== "Todos") {
      return query.withIndex("by_category", (q) => q.eq("category", category)).order("desc").collect();
    }
    return query.order("desc").collect();
  },
});

// Buscar um único artigo pelo seu ID (público)
export const getById = query({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.articleId);
    },
});

