export type ChainId =
  | "ethereum"
  | "bnb"
  | "polygon"
  | "avalanche"
  | "arbitrum"
  | "base"
  | "optimism"
  | "bitcoin"
  | "solana"
  | "tron"
  | "ton";

export interface ChainInfo {
  id: ChainId;
  name: string;
  symbol: string;
  coingeckoId: string;
  emoji: string;
  category: "evm" | "btc" | "sol" | "tron" | "ton";
}

export const CHAINS: ChainInfo[] = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", coingeckoId: "ethereum", emoji: "⟠", category: "evm" },
  { id: "bnb", name: "BNB Chain", symbol: "BNB", coingeckoId: "binancecoin", emoji: "🟡", category: "evm" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", coingeckoId: "matic-network", emoji: "🟣", category: "evm" },
  { id: "avalanche", name: "Avalanche", symbol: "AVAX", coingeckoId: "avalanche-2", emoji: "🔺", category: "evm" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ETH", coingeckoId: "ethereum", emoji: "🔷", category: "evm" },
  { id: "base", name: "Base", symbol: "ETH", coingeckoId: "ethereum", emoji: "🔵", category: "evm" },
  { id: "optimism", name: "Optimism", symbol: "ETH", coingeckoId: "ethereum", emoji: "🔴", category: "evm" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", coingeckoId: "bitcoin", emoji: "₿", category: "btc" },
  { id: "solana", name: "Solana", symbol: "SOL", coingeckoId: "solana", emoji: "◎", category: "sol" },
  { id: "tron", name: "Tron", symbol: "TRX", coingeckoId: "tron", emoji: "🔻", category: "tron" },
  { id: "ton", name: "TON", symbol: "TON", coingeckoId: "the-open-network", emoji: "💎", category: "ton" },
];

export function getChain(id: string): ChainInfo | undefined {
  return CHAINS.find((c) => c.id === id);
}