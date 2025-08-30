import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { internal } from "./_generated/api";

// Função para lidar com as notificações (webhooks) vindas do Clerk
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occurred", { status: 400 });
  }

  // Usamos um switch para lidar com diferentes tipos de eventos do Clerk
  switch (event.type) {
    case "user.created": {
      // Quando um usuário é criado no Clerk, chamamos nossa função interna 'users.create'
      await ctx.runMutation(internal.users.create, {
        clerkId: event.data.id,
        name: `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`,
        email: event.data.email_addresses[0]?.email_address,
      });
      break;
    }
    // TODO: Adicionar lógica para 'user.updated' e 'user.deleted' no futuro
    case "user.updated": {
      // Aqui você poderia adicionar uma lógica para atualizar o nome/email do usuário se ele mudar no Clerk
      console.log("Usuário atualizado:", event.data.id);
      break;
    }
    default: {
      console.log("Evento do Clerk ignorado:", event.type);
    }
  }

  return new Response(null, { status: 200 });
});

// Roteia as requisições HTTP para a função correta
const http = httpRouter();
http.route({
  path: "/clerk-users-webhook", 
  method: "POST",
  handler: handleClerkWebhook,
});

// Função auxiliar para validar a autenticidade do webhook
async function validateRequest(
  req: Request
): Promise<WebhookEvent | undefined> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET não está definido nas variáveis de ambiente");
  }

  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };

  const wh = new Webhook(webhookSecret);
  try {
    const event = wh.verify(payloadString, svixHeaders) as WebhookEvent;
    return event;
  } catch (error) {
    console.error("Erro ao verificar o webhook do Clerk:", error);
    return undefined;
  }
}

export default http;
