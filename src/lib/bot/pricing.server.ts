import { getChain, type ChainId } from "./chains";
import { fetchTokenMetadataFromBackups } from "./onchain.server";

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  chainName: string;
  priceUsd: number | null;
  marketCap: number | null;
  liquidityUsd: number | null;
  fdv: number | null;
  logoUrl: string | null;
  dexUrl: string | null;
  websites: string[];
  socials: { type: string; url: string }[];
  source?: "dexscreener" | "alchemy" | "covalent";
}

export interface ConversionResult {
  amount: number;
  usdPrice: number;
  source: "coingecko" | "fallback";
  warning?: string;
}

const FALLBACK_NATIVE_USD: Record<string, number> = {
  ethereum: 3300,
  binancecoin: 600,
  "matic-network": 0.7,
  "avalanche-2": 35,
  bitcoin: 95000,
  solana: 150,
  tron: 0.12,
  "the-open-network": 5,
};

export async function fetchTokenFromDexScreener(address: string): Promise<TokenInfo | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { pairs?: any[] };
    if (!data.pairs || data.pairs.length === 0) return null;
    // Pick pair with highest liquidity
    const pair = [...data.pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
    const base = pair.baseToken;
    const info = pair.info ?? {};
    return {
      name: base.name,
      symbol: base.symbol,
      address: base.address,
      chainName: pair.chainId,
      priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
      marketCap: pair.marketCap ?? null,
      liquidityUsd: pair.liquidity?.usd ?? null,
      fdv: pair.fdv ?? null,
      logoUrl: info.imageUrl ?? null,
      dexUrl: pair.url ?? null,
      websites: (info.websites ?? []).map((w: any) => w.url).filter(Boolean),
      socials: (info.socials ?? []).map((s: any) => ({ type: s.type, url: s.url })),
      source: "dexscreener",
    };
  } catch (e) {
    console.error("dexscreener error", e);
  }

  const backup = await fetchTokenMetadataFromBackups(address);
  if (!backup) return null;
  return {
    name: backup.name ?? "Unknown Token",
    symbol: backup.symbol ?? "TOKEN",
    address,
    chainName: backup.chainName,
    priceUsd: null,
    marketCap: null,
    liquidityUsd: null,
    fdv: null,
    logoUrl: backup.logoUrl,
    dexUrl: null,
    websites: [],
    socials: [],
    source: backup.source,
  };
}

const priceCache = new Map<string, { at: number; usd: number }>();

export async function getNativeUsdPrice(chain: ChainId): Promise<number> {
  const c = getChain(chain);
  if (!c) throw new Error(`Unknown chain ${chain}`);
  const cached = priceCache.get(c.coingeckoId);
  if (cached && Date.now() - cached.at < 60_000) return cached.usd;
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${c.coingeckoId}&vs_currencies=usd`
  );
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, { usd: number }>;
  const usd = data[c.coingeckoId]?.usd;
  if (!usd) throw new Error(`No price for ${c.coingeckoId}`);
  priceCache.set(c.coingeckoId, { at: Date.now(), usd });
  return usd;
}

export async function convertUsdToCrypto(chain: ChainId, usd: number): Promise<number> {
  const { amount } = await convertUsdToCryptoSafe(chain, usd);
  return amount;
}

export async function convertUsdToCryptoSafe(chain: ChainId, usd: number): Promise<ConversionResult> {
  try {
    const price = await getNativeUsdPrice(chain);
    return { amount: usd / price, usdPrice: price, source: "coingecko" };
  } catch (e) {
    const c = getChain(chain);
    const fallback = c ? FALLBACK_NATIVE_USD[c.coingeckoId] : undefined;
    if (!fallback) throw e;
    return {
      amount: usd / fallback,
      usdPrice: fallback,
      source: "fallback",
      warning: `CoinGecko failed (${(e as Error).message}); used fallback ${c?.symbol ?? chain} price $${fallback}`,
    };
  }
}

export async function getNativeUsdPriceSafe(chain: ChainId): Promise<ConversionResult> {
  return convertUsdToCryptoSafe(chain, 1);
}
  return usd / price;
}