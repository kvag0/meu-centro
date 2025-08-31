import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de Terreiros (Centros)
  terreiros: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    ownerId: v.id("users"),
  }),

  // Tabela de Usuários
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    terreiroId: v.optional(v.id("terreiros")),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_terreiro_id", ["terreiroId"]),

  // Tabela de Eventos
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    isPublic: v.boolean(),
    terreiroId: v.id("terreiros"),
  }).index("by_terreiro_id", ["terreiroId"]),
  
  // Tabela de Receitas de Banhos
  bathRecipes: defineTable({
    title: v.string(),
    ingredients: v.string(),
    description: v.optional(v.string()), // Modo de preparo
    terreiroId: v.id("terreiros"),
  }).index("by_terreiro_id", ["terreiroId"]),

  // Tabela de Rituais
  rituals: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    terreiroId: v.id("terreiros"),
  }).index("by_terreiro_id", ["terreiroId"]),
  
  // Tabela de Diagnósticos (conexão entre usuário e tarefa)
  diagnoses: defineTable({
    memberId: v.id("users"),
    adminId: v.id("users"),
    terreiroId: v.id("terreiros"),
    type: v.union(v.literal("event"), v.literal("bath"), v.literal("ritual")),
    referenceId: v.string(), // ID do evento, banho ou ritual
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed")),
  }).index("by_member_id", ["memberId"]),

  // Tabela de Artigos da Biblioteca
  articles: defineTable({
    title: v.string(),
    content: v.string(), // Conteúdo em Markdown
    // NOVO: Adiciona a categoria do artigo
    category: v.string(), 
    terreiroId: v.id("terreiros"), // No futuro, pode ser um ID de admin global
    authorId: v.id("users"),
  })
    .index("by_terreiro_id", ["terreiroId"])
    // NOVO: Adiciona um índice para buscar por categoria
    .index("by_category", ["category"]),
});
