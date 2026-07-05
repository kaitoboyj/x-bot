import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import { derivePath as deriveEd25519Path } from "ed25519-hd-key";
// @solana/web3.js is dynamically imported inside handlers to keep it out of the Worker bundle graph
import type { ChainId } from "./chains";

export interface GeneratedWallet {
  chain: ChainId;
  address: string;
  privateKey: string;
  mnemonic: string;
  derivationPath: string;
}

export interface ImportedWallet {
  chain: ChainId;
  address: string;
  privateKey: string;
  mnemonic: string | null;
  derivationPath: string | null;
}

function evmPath() {
  return "m/44'/60'/0'/0/0";
}
function btcPath() {
  return "m/84'/0'/0'/0/0";
}
function solPath() {
  return "m/44'/501'/0'/0'";
}
function tronPath() {
  return "m/44'/195'/0'/0/0";
}
function tonPath() {
  return "m/44'/607'/0'/0'";
}

function isEvm(chain: ChainId) {
  return ["ethereum", "bnb", "polygon", "avalanche", "arbitrum", "base", "optimism"].includes(chain);
}

async function deriveFromMnemonic(chain: ChainId, mnemonic: string): Promise<GeneratedWallet> {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  if (isEvm(chain)) {
    const path = evmPath();
    const hd = HDKey.fromMasterSeed(seed).derive(path);
    if (!hd.privateKey) throw new Error("Failed to derive EVM key");
    const wallet = new ethers.Wallet(Buffer.from(hd.privateKey).toString("hex"));
    return { chain, address: wallet.address, privateKey: wallet.privateKey, mnemonic, derivationPath: path };
  }

  if (chain === "bitcoin") {
    // Dynamic import to avoid loading native modules at module scope
    const bitcoin = await import("bitcoinjs-lib");
    const ecc = await import("tiny-secp256k1");
    bitcoin.initEccLib(ecc as unknown as Parameters<typeof bitcoin.initEccLib>[0]);
    const path = btcPath();
    const hd = HDKey.fromMasterSeed(seed).derive(path);
    if (!hd.privateKey) throw new Error("Failed to derive BTC key");
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(hd.publicKey!),
      network: bitcoin.networks.bitcoin,
    });
    const wif = HDKey.fromMasterSeed(seed).derive(path);
    return {
      chain,
      address: address!,
      privateKey: Buffer.from(wif.privateKey!).toString("hex"),
      mnemonic,
      derivationPath: path,
    };
  }

  if (chain === "solana") {
    const path = solPath();
    const { key } = deriveEd25519Path(path, seed.toString("hex"));
    const nacl = (await import("tweetnacl")).default;
    const bs58 = (await import("bs58")).default;
    const kp = nacl.sign.keyPair.fromSeed(key);
    return {
      chain,
      address: bs58.encode(kp.publicKey),
      privateKey: Buffer.from(kp.secretKey).toString("hex"),
      mnemonic,
      derivationPath: path,
    };
  }


  if (chain === "tron") {
    const path = tronPath();
    const hd = HDKey.fromMasterSeed(seed).derive(path);
    if (!hd.privateKey) throw new Error("Failed to derive Tron key");
    const TronWebImport = await import("tronweb");
    const TronWeb = (TronWebImport as any).TronWeb || (TronWebImport as any).default || TronWebImport;
    const pkHex = Buffer.from(hd.privateKey).toString("hex");
    const address = TronWeb.address.fromPrivateKey(pkHex);
    return { chain, address, privateKey: pkHex, mnemonic, derivationPath: path };
  }

  if (chain === "ton") {
    const { mnemonicToPrivateKey } = await import("@ton/crypto");
    const { WalletContractV4 } = await import("@ton/ton");
    const words = mnemonic.split(" ");
    const key = await mnemonicToPrivateKey(words);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    return {
      chain,
      address: wallet.address.toString({ bounceable: false }),
      privateKey: Buffer.from(key.secretKey).toString("hex"),
      mnemonic,
      derivationPath: tonPath(),
    };
  }

  throw new Error(`Unsupported chain: ${chain}`);
}

export async function generateWallet(chain: ChainId): Promise<GeneratedWallet> {
  if (chain === "ton") {
    // TON uses its own 24-word mnemonic
    const { mnemonicNew, mnemonicToPrivateKey } = await import("@ton/crypto");
    const { WalletContractV4 } = await import("@ton/ton");
    const words = await mnemonicNew(24);
    const key = await mnemonicToPrivateKey(words);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    return {
      chain,
      address: wallet.address.toString({ bounceable: false }),
      privateKey: Buffer.from(key.secretKey).toString("hex"),
      mnemonic: words.join(" "),
      derivationPath: tonPath(),
    };
  }
  const mnemonic = bip39.generateMnemonic(128); // 12 words
  return deriveFromMnemonic(chain, mnemonic);
}

export async function importFromMnemonic(chain: ChainId, mnemonic: string): Promise<GeneratedWallet> {
  const cleaned = mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
  if (chain !== "ton" && !bip39.validateMnemonic(cleaned)) {
    throw new Error("Invalid BIP39 mnemonic");
  }
  return deriveFromMnemonic(chain, cleaned);
}

export async function importFromPrivateKey(chain: ChainId, privateKey: string): Promise<ImportedWallet> {
  const input = privateKey.trim();
  const pk = input.replace(/^0x/, "");

  if (isEvm(chain)) {
    if (!/^[a-fA-F0-9]{64}$/.test(pk)) throw new Error("Invalid EVM private key");
    const w = new ethers.Wallet("0x" + pk);
    return { chain, address: w.address, privateKey: w.privateKey, mnemonic: null, derivationPath: null };
  }
  if (chain === "tron") {
    if (!/^[a-fA-F0-9]{64}$/.test(pk)) throw new Error("Invalid Tron private key");
    const TronWebImport = await import("tronweb");
    const TronWeb = (TronWebImport as any).TronWeb || (TronWebImport as any).default || TronWebImport;
    const address = TronWeb.address.fromPrivateKey(pk);
    if (!address) throw new Error("Invalid Tron private key");
    return { chain, address, privateKey: pk, mnemonic: null, derivationPath: null };
  }
  if (chain === "solana") {
    const nacl = (await import("tweetnacl")).default;
    const bs58 = (await import("bs58")).default;
    let bytes: Buffer;
    if (/^[a-fA-F0-9]+$/.test(pk) && pk.length % 2 === 0) {
      bytes = Buffer.from(pk, "hex");
    } else {
      try {
        bytes = Buffer.from(bs58.decode(input));
      } catch {
        throw new Error("Invalid Solana private key. Use a 32/64-byte hex key or base58 secret key.");
      }
    }
    if (![32, 64].includes(bytes.length)) {
      throw new Error("Invalid Solana private key. Use a 32-byte seed or 64-byte secret key.");
    }
    const kp = bytes.length === 64
      ? nacl.sign.keyPair.fromSecretKey(bytes)
      : nacl.sign.keyPair.fromSeed(bytes);
    return { chain, address: bs58.encode(kp.publicKey), privateKey: Buffer.from(kp.secretKey).toString("hex"), mnemonic: null, derivationPath: null };
  }

  if (chain === "bitcoin") {
    const bitcoin = await import("bitcoinjs-lib");
    const ecc = await import("tiny-secp256k1");
    bitcoin.initEccLib(ecc as unknown as Parameters<typeof bitcoin.initEccLib>[0]);
    const ECPairFactory = (await import("ecpair")).default;
    const ECPair = ECPairFactory(ecc as any);
    let keyPair;
    if (/^[a-fA-F0-9]{64}$/.test(pk)) {
      keyPair = ECPair.fromPrivateKey(Buffer.from(pk, "hex"));
    } else {
      keyPair = ECPair.fromWIF(input, bitcoin.networks.bitcoin);
    }
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network: bitcoin.networks.bitcoin,
    });
    return { chain, address: address!, privateKey: Buffer.from(keyPair.privateKey!).toString("hex"), mnemonic: null, derivationPath: null };
  }
  throw new Error(`Private-key import not supported for ${chain}. Please import via seed phrase.`);
}