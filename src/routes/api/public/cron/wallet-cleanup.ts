import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/wallet-cleanup")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("wallets")
          .delete()
          .lt("purge_at", new Date().toISOString())
          .select("id");
        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
        return Response.json({ ok: true, deleted: data?.length ?? 0 });
      },
    },
  },
});