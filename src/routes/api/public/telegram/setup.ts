import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        // Auth: pass ?key=<TELEGRAM_BOT_TOKEN> so only the bot owner can register the webhook.
        const key = u.searchParams.get("key");
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken || !key || key !== botToken) {
          return new Response("Unauthorized", { status: 401 });
        }
        const url = u.searchParams.get("url");
        if (!url) return Response.json({ error: "missing url param" }, { status: 400 });
        const { setWebhook, getWebhookInfo } = await import("@/lib/bot/telegram.server");
        const set = await setWebhook(url, process.env.TELEGRAM_WEBHOOK_SECRET);
        const info = await getWebhookInfo();
        return Response.json({ set, info });
      },
    },
  },
});
