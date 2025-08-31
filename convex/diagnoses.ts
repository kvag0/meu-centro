import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

export const createDiagnosis = mutation({
  args: {
    memberId: v.id("users"),
    type: v.union(v.literal("bath"), v.literal("ritual"), v.literal("event")),
    referenceId: v.string(), 
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx);
    if (admin.role !== "admin" || !admin.terreiroId) {
      throw new Error("Apenas administradores podem criar diagnósticos.");
    }
    await ctx.db.insert("diagnoses", {
      ...args,
      adminId: admin._id,
      terreiroId: admin.terreiroId,
      status: "pending",
    });
  },
});

export const getMyDiagnosesWithDetails = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const diagnoses = await ctx.db
      .query("diagnoses")
      .withIndex("by_member_id", (q) => q.eq("memberId", user._id))
      .order("desc")
      .collect();

    const diagnosesWithDetails = await Promise.all(
      diagnoses.map(async (diag) => {
        let details: Doc<"events"> | Doc<"bathRecipes"> | Doc<"rituals"> | null = null;
        
        if (diag.type === "event") {
          details = await ctx.db.get(diag.referenceId as Id<"events">);
        } else if (diag.type === "bath") {
          details = await ctx.db.get(diag.referenceId as Id<"bathRecipes">);
        } else if (diag.type === "ritual") {
          details = await ctx.db.get(diag.referenceId as Id<"rituals">);
        }

        return {
          ...diag,
          details,
        };
      })
    );

    return diagnosesWithDetails;
  },
});

// NOVO: Permite que um membro atualize o status do seu próprio diagnóstico
export const updateStatus = mutation({
  args: {
    diagnosisId: v.id("diagnoses"),
    status: v.union(v.literal("pending"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const diagnosis = await ctx.db.get(args.diagnosisId);

    if (!diagnosis) {
      throw new Error("Diagnóstico não encontrado.");
    }

    // Verificação de segurança: O usuário só pode modificar o seu próprio diagnóstico
    if (diagnosis.memberId !== user._id) {
      throw new Error("Você não tem permissão para alterar este diagnóstico.");
    }

    await ctx.db.patch(args.diagnosisId, { status: args.status });
  },
});
