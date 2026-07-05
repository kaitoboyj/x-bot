import type { ChainId } from "./chains";

export interface BalanceResult {
  amount: number | null;
  source: "alchemy" | "covalent" | null;
  error?: string;
}

export interface BackupTokenMetadata {
  name: string | null;
  symbol: string | null;
  logoUrl: string | null;
  chainName: string;
  source: "alchemy" | "covalent";
}

const ALCHEMY_ENV: Partial<Record<ChainId, string>> = {
  ethereum: "ALCHEMY_ETH_RPC_URL",
  polygon: "ALCHEMY_POLYGON_RPC_URL",
  bnb: "ALCHEMY_BNB_RPC_URL",
  base: "ALCHEMY_BASE_RPC_URL",
  solana: "ALCHEMY_SOLANA_RPC_URL",
};

const COVALENT_CHAIN: Partial<Record<ChainId, string>> = {
  ethereum: "eth-mainnet",
  polygon: "matic-mainnet",
  bnb: "bsc-mainnet",
  base: "base-mainnet",
  arbitrum: "arbitrum-mainnet",
  optimism: "optimism-mainnet",
  avalanche: "avalanche-mainnet",
  solana: "solana-mainnet",
};

const CHAIN_LABEL: Partial<Record<ChainId, string>> = {
  ethereum: "ethereum",
  polygon: "polygon",
  bnb: "bsc",
  base: "base",
  arbitrum: "arbitrum",
  optimism: "optimism",
  avalanche: "avalanche",
  solana: "solana",
};

const NATIVE_DECIMALS: Partial<Record<ChainId, number>> = {
  ethereum: 18,
  polygon: 18,
  bnb: 18,
  base: 18,
  arbitrum: 18,
  optimism: 18,
  avalanche: 18,
  solana: 9,
};

function rpcUrl(chain: ChainId): string | undefined {
  const env = ALCHEMY_ENV[chain];
  return env ? process.env[env] : undefined;
}

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = (await res.json()) as { result?: T; error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `RPC HTTP ${res.status}`);
  return json.result as T;
}

function decimalFromHex(hex: string, decimals: number): number {
  const raw = BigInt(hex);
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  return Number(whole) + Number(fraction) / Number(base);
}

async function fetchAlchemyBalance(chain: ChainId, address: string): Promise<number> {
  const url = rpcUrl(chain);
  if (!url) throw new Error("Alchemy RPC is not configured for this chain");

  if (chain === "solana") {
    const result = await rpc<{ value: number }>(url, "getBalance", [address]);
    return result.value / 1_000_000_000;
  }

  const decimals = NATIVE_DECIMALS[chain];
  if (!decimals) throw new Error("Unsupported Alchemy balance chain");
  const balanceHex = await rpc<string>(url, "eth_getBalance", [address, "latest"]);
  return decimalFromHex(balanceHex, decimals);
}

async function fetchCovalentBalance(chain: ChainId, address: string): Promise<number> {
  const key = process.env.COVALENT_API_KEY;
  const covalentChain = COVALENT_CHAIN[chain];
  if (!key || !covalentChain) throw new Error("Covalent is not configured for this chain");

  const res = await fetch(
    `https://api.covalenthq.com/v1/${covalentChain}/address/${encodeURIComponent(address)}/balances_v2/?key=${encodeURIComponent(key)}`
  );
  const data = (await res.json()) as { data?: { items?: any[] }; error_message?: string };
  if (!res.ok || data.error_message) throw new Error(data.error_message ?? `Covalent HTTP ${res.status}`);
  const native = data.data?.items?.find(
    (item) => item.native_token === true || item.contract_address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  );
  const raw = native?.balance;
  const decimals = Number(native?.contract_decimals ?? NATIVE_DECIMALS[chain] ?? 18);
  if (!raw) return 0;
  return Number(BigInt(raw)) / 10 ** decimals;
}

export async function fetchNativeBalance(chain: ChainId, address: string): Promise<BalanceResult> {
  try {
    return { amount: await fetchAlchemyBalance(chain, address), source: "alchemy" };
  } catch (alchemyError) {
    try {
      return { amount: await fetchCovalentBalance(chain, address), source: "covalent" };
    } catch (covalentError) {
      return {
        amount: null,
        source: null,
        error: `${(alchemyError as Error).message}; ${(covalentError as Error).message}`,
      };
    }
  }
}

export async function fetchTokenMetadataFromBackups(address: string): Promise<BackupTokenMetadata | null> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return null;

  for (const chain of ["ethereum", "polygon", "bnb", "base"] as ChainId[]) {
    const url = rpcUrl(chain);
    if (!url) continue;
    try {
      const result = await rpc<{ name?: string; symbol?: string; logo?: string }>(url, "alchemy_getTokenMetadata", [address]);
      if (result?.name || result?.symbol) {
        return {
          name: result.name ?? null,
          symbol: result.symbol ?? null,
          logoUrl: result.logo ?? null,
          chainName: CHAIN_LABEL[chain] ?? chain,
          source: "alchemy",
        };
      }
    } catch {
      // Try the next configured chain/API.
    }
  }

  const key = process.env.COVALENT_API_KEY;
  if (!key) return null;
  for (const chain of ["ethereum", "polygon", "bnb", "base", "arbitrum", "optimism", "avalanche"] as ChainId[]) {
    const covalentChain = COVALENT_CHAIN[chain];
    if (!covalentChain) continue;
    try {
      const res = await fetch(
        `https://api.covalenthq.com/v1/${covalentChain}/tokens/${encodeURIComponent(address)}/metadata/?key=${encodeURIComponent(key)}`
      );
      const data = (await res.json()) as { data?: { items?: any[] }; error_message?: string };
      if (!res.ok || data.error_message) continue;
      const item = data.data?.items?.[0];
      if (item?.contract_name || item?.contract_ticker_symbol) {
        return {
          name: item.contract_name ?? null,
          symbol: item.contract_ticker_symbol ?? null,
          logoUrl: item.logo_url ?? null,
          chainName: CHAIN_LABEL[chain] ?? chain,
          source: "covalent",
        };
      }
    } catch {
      // Best-effort backup only.
    }
  }

  return null;
}