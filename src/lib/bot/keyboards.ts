import type { InlineKeyboard } from "./telegram.server";
import { PACKAGES } from "./copy";
import { CHAINS } from "./chains";

export const mainMenuKb: InlineKeyboard = [
  [{ text: "📊 DexScreener Trending", callback_data: "svc:dexscreener" }],
  [{ text: "🛠 DEXTools Trending", callback_data: "svc:dextools" }],
  [{ text: "🏆 CoinMarketCap Trending", callback_data: "svc:cmc" }],
  [{ text: "🦎 CoinGecko Trending", callback_data: "svc:coingecko" }],
  [{ text: "🔥 Fast Track Listing CG & CMC", callback_data: "svc:fasttrack" }],
];

export function packageKb(service: string): InlineKeyboard {
  const pkgs = PACKAGES[service] ?? [];
  return [
    ...pkgs.map((p) => [{ text: p.label, callback_data: `pkg:${service}:${p.id}` }]),
    [{ text: "⬅ Back to main menu", callback_data: "menu" }],
  ];
}

export const yesNoKb: InlineKeyboard = [
  [
    { text: "✅ Yes", callback_data: "confirm:yes" },
    { text: "❌ No", callback_data: "menu" },
  ],
];

export const skipBackKb: InlineKeyboard = [
  [{ text: "⏭ Skip", callback_data: "skip" }],
  [{ text: "⬅ Back to main menu", callback_data: "menu" }],
];

export const paymentActionKb: InlineKeyboard = [
  [{ text: "💳 Choose payment method", callback_data: "pay:choose" }],
  [{ text: "❌ Cancel", callback_data: "menu" }],
];

export const chainsKb: InlineKeyboard = [
  ...chunk(
    CHAINS.map((c) => ({ text: `${c.emoji} ${c.name}`, callback_data: `chain:${c.id}` })),
    2
  ),
  [{ text: "⬅ Back", callback_data: "back:summary" }],
];

export function walletOptionsKb(chain: string): InlineKeyboard {
  return [
    [{ text: "🆕 Generate new wallet", callback_data: `wallet:new:${chain}` }],
    [{ text: "📥 Import existing wallet", callback_data: `wallet:import:${chain}` }],
    [{ text: "⬅ Back", callback_data: "pay:choose" }],
  ];
}

export const importChoiceKb = (chain: string): InlineKeyboard => [
  [{ text: "🔑 Import via Seed Phrase", callback_data: `import:seed:${chain}` }],
  [{ text: "🗝 Import via Private Key", callback_data: `import:pk:${chain}` }],
  [{ text: "⬅ Back", callback_data: `chain:${chain}` }],
];

export const fasttrackTierKb: InlineKeyboard = [
  [{ text: "🥇 Standard Fast Track", callback_data: "ft:tier:standard" }],
  [{ text: "🥈 Premium Fast Track", callback_data: "ft:tier:premium" }],
  [{ text: "⬅ Back to main menu", callback_data: "menu" }],
];

export const fasttrackPlatformKb = (tier: string): InlineKeyboard => [
  [{ text: "🦎 CoinGecko", callback_data: `ft:plat:${tier}:coingecko` }],
  [{ text: "🏆 CoinMarketCap", callback_data: `ft:plat:${tier}:cmc` }],
  [{ text: "⬅ Back", callback_data: "svc:fasttrack" }],
];

export const backToMenuKb: InlineKeyboard = [
  [{ text: "⬅ Back to main menu", callback_data: "menu" }],
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}