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
  if (service === "dexscreener") return dexScreenerPackageKb();

  const pkgs = PACKAGES[service] ?? [];
  return [
    ...pkgs.map((p) => [{ text: p.label, callback_data: `pkg:${service}:${p.id}` }]),
    [{ text: "⬅ Back to main menu", callback_data: "menu" }],
  ];
}

function dexScreenerPackageKb(): InlineKeyboard {
  const pkg = (id: string) => PACKAGES.dexscreener.find((p) => p.id === id)!;
  return [
    [
      { text: "4 Hours — $150", callback_data: `pkg:dexscreener:${pkg("ds_trending_4h").id}` },
      { text: "12 Hours — $300", callback_data: `pkg:dexscreener:${pkg("ds_trending_12h").id}` },
    ],
    [
      { text: "24 Hours — $500", callback_data: `pkg:dexscreener:${pkg("ds_trending_24h").id}` },
      { text: "1 Week — $2,000", callback_data: `pkg:dexscreener:${pkg("ds_trending_1w").id}` },
    ],
    [{ text: "Dex Boost", callback_data: "noop:dexboost" }],
    [
      { text: "10x — $89.10", callback_data: `pkg:dexscreener:${pkg("ds_boost_10x").id}` },
      { text: "30x — $224.10", callback_data: `pkg:dexscreener:${pkg("ds_boost_30x").id}` },
      { text: "50x — $359.10", callback_data: `pkg:dexscreener:${pkg("ds_boost_50x").id}` },
    ],
    [
      { text: "100x — $809.10", callback_data: `pkg:dexscreener:${pkg("ds_boost_100x").id}` },
      { text: "500x Golden — $3,599.10", callback_data: `pkg:dexscreener:${pkg("ds_boost_500x").id}` },
    ],
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
    CHAINS.map((c) => ({
      text: c.id === "bitcoin" ? `${c.emoji} ${c.name}` : c.name,
      callback_data: `chain:${c.id}`,
    })),
    2
  ),
  [{ text: "Back", callback_data: "back:summary" }],
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