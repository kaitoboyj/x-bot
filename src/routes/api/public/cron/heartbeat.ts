import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/heartbeat")({
  server: {
    handlers: {
      POST: async () => {
        const { sendMessage } = await import("@/lib/bot/telegram.server");
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        if (!chatId) return Response.json({ ok: false, reason: "no chat id" });
        try {
          await sendMessage(chatId, "👋 hi — X Trending bot is online and ready.");
          return Response.json({ ok: true });
        } catch (e) {
          return Response.json({ ok: false, error: String(e) }, { status: 500 });
        }
      },
    },
  },
});