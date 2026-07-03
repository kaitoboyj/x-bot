import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Optional webhook secret: only enforced if TELEGRAM_WEBHOOK_SECRET is set.
        const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (expected) {
          const got = request.headers.get("x-telegram-bot-api-secret-token");
          if (got !== expected) {
            return new Response("Unauthorized", { status: 401 });
          }
        }
        const update = await request.json();
        const { handleUpdate } = await import("@/lib/bot/dispatch.server");
        await handleUpdate(update);
        return Response.json({ ok: true });
      },
      GET: async () => Response.json({ status: "ok" }),
    },
  },
});
