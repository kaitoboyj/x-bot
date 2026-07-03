import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/telegram/setup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const key = u.searchParams.get("key");
        if (!key || key !== process.env.TELEGRAM_WEBHOOK_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }
        const url = u.searchParams.get("url");
        if (!url) return Response.json({ error: "missing url param" }, { status: 400 });
        const { setWebhook, getWebhookInfo } = await import("@/lib/bot/telegram.server");
        const set = await setWebhook(url, process.env.TELEGRAM_WEBHOOK_SECRET!);
        const info = await getWebhookInfo();
        return Response.json({ set, info });
      },
    },
  },
});