import { sendMessage } from "./telegram.server";

export async function notifyAdmin(text: string): Promise<void> {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId) return;
  try {
    await sendMessage(chatId, `🔔 <b>Bot Activity</b>\n${text}`);
  } catch (e) {
    console.error("notifyAdmin failed", e);
  }
}

export function formatUser(u: { telegram_id: number; username?: string | null; first_name?: string | null }): string {
  const name = u.first_name ?? "";
  const uname = u.username ? `@${u.username}` : "(no username)";
  return `${name} ${uname} [${u.telegram_id}]`.trim();
}