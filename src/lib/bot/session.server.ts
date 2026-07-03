import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface BotState {
  screen?: string;
  service?: string;
  packageId?: string;
  priceUsd?: number;
  contractAddress?: string;
  tokenInfo?: any;
  socialLink?: string;
  description?: string;
  supply?: string;
  orderId?: string;
  awaiting?: "contract" | "social" | "description" | "supply" | "import_seed" | "import_pk";
  payChain?: string;
  fasttrackTier?: "standard" | "premium";
  fasttrackPlatform?: "coingecko" | "cmc";
  importChain?: string;
}

export async function loadSession(telegramId: number): Promise<BotState> {
  const { data } = await supabaseAdmin
    .from("bot_sessions")
    .select("state")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  return (data?.state as BotState) ?? {};
}

export async function saveSession(telegramId: number, state: BotState): Promise<void> {
  await supabaseAdmin
    .from("bot_sessions")
    .upsert(
      { telegram_id: telegramId, state: state as any, updated_at: new Date().toISOString() },
      { onConflict: "telegram_id" }
    );
}

export async function clearSession(telegramId: number): Promise<void> {
  await supabaseAdmin.from("bot_sessions").delete().eq("telegram_id", telegramId);
}

export async function upsertUser(user: {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}): Promise<void> {
  await supabaseAdmin.from("bot_users").upsert(
    {
      telegram_id: user.telegram_id,
      username: user.username ?? null,
      first_name: user.first_name ?? null,
      last_name: user.last_name ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "telegram_id" }
  );
}