import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de Terreiros
  terreiros: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    ownerId: v.id("users"), // ID do usuário dono
  }),

  // Tabela de Usuários (Membros e Admins)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(), // ID do usuário vindo do Clerk
    // ALTERAÇÃO FINAL: Tornando o campo obrigatório novamente
    tokenIdentifier: v.string(), 
    role: v.union(v.literal("admin"), v.literal("member")),
    terreiroId: v.optional(v.id("terreiros")), // ID do terreiro ao qual o membro pertence
  })
  .index("by_clerk_id", ["clerkId"])
  .index("by_token", ["tokenIdentifier"]),

  // Tabela de Eventos
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(), // Armazenado como timestamp
    isPublic: v.boolean(),
    terreiroId: v.id("terreiros"),
  }).index("by_terreiro_id", ["terreiroId"]),

  // Tabela para Receitas de Banhos
  bathRecipes: defineTable({
    name: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.string(),
    terreiroId: v.id("terreiros"),
  }),

  // Tabela para Rituais
  rituals: defineTable({
    name: v.string(),
    description: v.string(),
    terreiroId: v.id("terreiros"),
  }),
  
  // Tabela para Diagnósticos (conecta usuários a banhos/rituais)
  diagnoses: defineTable({
    memberId: v.id("users"),
    adminId: v.id("users"),
    type: v.union(v.literal("bath"), v.literal("ritual"), v.literal("event")),
    // Guarda o ID da receita do banho, do ritual ou do evento
    referenceId: v.string(), 
    status: v.union(v.literal("pending"), v.literal("completed")),
    notes: v.optional(v.string()),
    terreiroId: v.id("terreiros"),
  }).index("by_member_id", ["memberId"]),
});

