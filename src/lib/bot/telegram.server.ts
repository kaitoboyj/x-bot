const API = "https://api.telegram.org";

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export type InlineKeyboard = InlineKeyboardButton[][];

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return t;
}

async function call(method: string, body: unknown): Promise<any> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    console.error(`Telegram ${method} failed:`, data);
    throw new Error(`Telegram ${method} failed: ${data.description ?? res.statusText}`);
  }
  return data;
}

export function sendMessage(
  chatId: number | string,
  text: string,
  opts: { reply_markup?: { inline_keyboard: InlineKeyboard }; parse_mode?: "HTML" | "Markdown"; disable_web_page_preview?: boolean } = {}
) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...opts });
}

export function sendPhoto(
  chatId: number | string,
  photo: string,
  opts: { caption?: string; reply_markup?: { inline_keyboard: InlineKeyboard }; parse_mode?: "HTML" | "Markdown" } = {}
) {
  return call("sendPhoto", { chat_id: chatId, photo, parse_mode: "HTML", ...opts });
}

export function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return call("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

export function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string,
  opts: { reply_markup?: { inline_keyboard: InlineKeyboard }; parse_mode?: "HTML" | "Markdown" } = {}
) {
  return call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...opts,
  });
}

export function setWebhook(url: string, secret?: string) {
  const body: Record<string, unknown> = {
    url,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  };
  if (secret) body.secret_token = secret;
  return call("setWebhook", body);
}

export function getWebhookInfo() {
  return call("getWebhookInfo", {});
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}