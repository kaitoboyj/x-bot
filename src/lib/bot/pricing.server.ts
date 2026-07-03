import { getChain, type ChainId } from "./chains";

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
}

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
    };
  } catch (e) {
    console.error("dexscreener error", e);
    return null;
  }
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
  const price = await getNativeUsdPrice(chain);
  return usd / price;
}