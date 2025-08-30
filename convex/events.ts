import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users"; // Reutilizaremos a função de users.ts

// Query para buscar todos os eventos do terreiro do admin logado
export const get = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Se o usuário não tem um terreiro associado, não há eventos para mostrar
    if (!user.terreiroId) {
      return [];
    }

    // Busca todos os eventos que pertencem ao mesmo terreiro do usuário
    return ctx.db
      .query("events")
      .withIndex("by_terreiro_id", (q) => q.eq("terreiroId", user.terreiroId!))
      .collect();
  },
});

// Mutation para criar um novo evento
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    // A data virá do frontend como string no formato ISO (ex: "2024-12-31T23:59:00.000Z")
    // e converteremos para timestamp numérico
    date: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Apenas admins podem criar eventos
    if (user.role !== "admin") {
      throw new Error("Apenas administradores podem criar eventos.");
    }
    if (!user.terreiroId) {
      throw new Error("Administrador não está associado a um terreiro.");
    }

    // Insere o novo evento no banco de dados
    await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      // Converte a data string para um timestamp (número de milissegundos)
      date: new Date(args.date).getTime(),
      isPublic: args.isPublic,
      terreiroId: user.terreiroId,
    });
  },
});

// Mutation para deletar um evento
export const deleteEvent = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);

        if (user.role !== "admin") {
            throw new Error("Apenas administradores podem deletar eventos.");
        }

        // Opcional: verificar se o evento pertence ao terreiro do admin antes de deletar
        const event = await ctx.db.get(args.eventId);
        if (event && event.terreiroId !== user.terreiroId) {
            throw new Error("Você não tem permissão para deletar este evento.");
        }

        await ctx.db.delete(args.eventId);
    }
})
