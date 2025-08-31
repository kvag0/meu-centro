import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/clerk-sdk-node";

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Could not validate request", { status: 400 });
  }

  switch (event.type) {
    case "user.created":
      // CORREÇÃO: Extraímos os dados do evento e os passamos como argumentos.
      await ctx.runMutation(internal.users.store, {
        clerkId: event.data.id,
        email: event.data.email_addresses[0]?.email_address,
        name: `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim(),
      });
      break;
    // Poderíamos adicionar mais casos aqui no futuro, como 'user.updated' ou 'user.deleted'
    default:
      console.log("Ignored Clerk webhook event:", event.type);
  }
  return new Response(null, { status: 200 });
});

async function validateRequest(req: Request): Promise<WebhookEvent | undefined> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
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
    console.error("Clerk webhook verification failed:", error);
    return;
  }
}

const http = httpRouter();
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
