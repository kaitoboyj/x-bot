import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sendMessage,
  sendPhoto,
  answerCallbackQuery,
  escapeHtml,
} from "./telegram.server";
import { loadSession, saveSession, upsertUser, type BotState } from "./session.server";
import { notifyAdmin, formatUser } from "./notify.server";
import {
  WELCOME,
  COINGECKO,
  CMC,
  DEXSCREENER,
  DEXTOOLS,
  FASTTRACK,
  PACKAGES,
  SERVICE_LABELS,
  FASTTRACK_PACKAGES,
} from "./copy";
import {
  mainMenuKb,
  packageKb,
  yesNoKb,
  skipBackKb,
  paymentActionKb,
  chainsKb,
  walletOptionsKb,
  importChoiceKb,
  fasttrackTierKb,
  fasttrackPlatformKb,
  backToMenuKb,
} from "./keyboards";
import { fetchTokenFromDexScreener, convertUsdToCrypto } from "./pricing.server";
import { generateWallet, importFromMnemonic, importFromPrivateKey } from "./wallets.server";
import { encryptSecret } from "./crypto.server";
import { getChain, type ChainId } from "./chains";

interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TgMessage {
  message_id: number;
  from?: TgUser;
  chat: { id: number };
  text?: string;
}

interface TgCallback {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
}

interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallback;
}

export async function handleUpdate(update: TgUpdate): Promise<void> {
  try {
    if (update.message) await handleMessage(update.message);
    else if (update.callback_query) await handleCallback(update.callback_query);
  } catch (e) {
    console.error("handleUpdate error", e);
    throw e;
  }
}

async function handleMessage(msg: TgMessage): Promise<void> {
  if (!msg.from) return;
  const chatId = msg.chat.id;
  const from = msg.from;
  await upsertUser({
    telegram_id: from.id,
    username: from.username,
    first_name: from.first_name,
    last_name: from.last_name,
  });

  const text = (msg.text ?? "").trim();

  if (text.startsWith("/start")) {
    await saveSession(from.id, { screen: "menu" });
    const uname = from.username ?? from.first_name ?? "there";
    await sendMessage(chatId, WELCOME(uname), { reply_markup: { inline_keyboard: mainMenuKb } });
    await notifyAdmin(`▶️ /start\n${formatUser({ telegram_id: from.id, username: from.username, first_name: from.first_name })}`);
    return;
  }

  if (text === "/menu" || text === "/cancel") {
    await showMenu(chatId, from);
    return;
  }

  const state = await loadSession(from.id);
  if (!state.awaiting) {
    await sendMessage(chatId, "Tap a button below or send /start to open the main menu.", {
      reply_markup: { inline_keyboard: mainMenuKb },
    });
    return;
  }

  switch (state.awaiting) {
    case "contract":
      return handleContractInput(chatId, from, text, state);
    case "social":
      state.socialLink = text;
      state.awaiting = "description";
      await saveSession(from.id, state);
      await sendMessage(chatId, "📝 <b>Project description</b>\nSend a short description of your project.", {
        reply_markup: { inline_keyboard: skipBackKb },
      });
      return;
    case "description":
      state.description = text;
      if (state.service === "fasttrack") {
        state.awaiting = "supply";
        await saveSession(from.id, state);
        await sendMessage(chatId, "🔢 <b>Current total supply</b>\nSend the current supply of your token.", {
          reply_markup: { inline_keyboard: skipBackKb },
        });
        return;
      }
      await finishIntake(chatId, from, state);
      return;
    case "supply":
      state.supply = text;
      await finishIntake(chatId, from, state);
      return;
    case "import_seed":
      return handleImportSeed(chatId, from, text, state);
    case "import_pk":
      return handleImportPk(chatId, from, text, state);
  }
}

async function handleCallback(cb: TgCallback): Promise<void> {
  const from = cb.from;
  const chatId = cb.message?.chat.id ?? from.id;
  const data = cb.data ?? "";
  await answerCallbackQuery(cb.id).catch((e) => console.error("answerCallbackQuery failed", e));
  await upsertUser({
    telegram_id: from.id,
    username: from.username,
    first_name: from.first_name,
    last_name: from.last_name,
  });
  const state = await loadSession(from.id);

  await notifyAdmin(`🖱 <b>${escapeHtml(data)}</b>\n${formatUser({ telegram_id: from.id, username: from.username, first_name: from.first_name })}`);

  if (data.startsWith("noop:")) return;

  if (data === "menu") return showMenu(chatId, from);

  if (data.startsWith("svc:")) {
    const svc = data.split(":")[1];
    state.service = svc;
    state.screen = "service";
    await saveSession(from.id, state);
    if (svc === "fasttrack") {
      await sendMessage(chatId, FASTTRACK, { reply_markup: { inline_keyboard: fasttrackTierKb } });
    } else {
      const copy = { coingecko: COINGECKO, cmc: CMC, dexscreener: DEXSCREENER, dextools: DEXTOOLS }[svc as "coingecko"];
      await sendMessage(chatId, copy ?? "Service not found", {
        reply_markup: { inline_keyboard: packageKb(svc) },
      });
    }
    return;
  }

  if (data.startsWith("pkg:")) {
    const [, svc, pkgId] = data.split(":");
    const pkg = PACKAGES[svc]?.find((p) => p.id === pkgId);
    if (!pkg) return;
    state.service = svc;
    state.packageId = pkg.id;
    state.priceUsd = pkg.priceUsd;
    state.awaiting = "contract";
    state.screen = "contract";
    await saveSession(from.id, state);
    await sendMessage(chatId, `📥 <b>${pkg.label}</b>\nPlease send your <b>token contract address</b>.`, {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
    return;
  }

  if (data.startsWith("ft:tier:")) {
    const tier = data.split(":")[2] as "standard" | "premium";
    state.service = "fasttrack";
    state.fasttrackTier = tier;
    await saveSession(from.id, state);
    await sendMessage(chatId, `🎯 Select the platform for your <b>${tier === "standard" ? "Standard" : "Premium"} Fast Track</b>:`, {
      reply_markup: { inline_keyboard: fasttrackPlatformKb(tier) },
    });
    return;
  }

  if (data.startsWith("ft:plat:")) {
    const [, , tier, plat] = data.split(":");
    state.service = "fasttrack";
    state.fasttrackTier = tier as "standard" | "premium";
    state.fasttrackPlatform = plat as "coingecko" | "cmc";
    state.priceUsd = FASTTRACK_PACKAGES[tier as "standard" | "premium"];
    state.packageId = `ft_${tier}_${plat}`;
    state.awaiting = "contract";
    state.screen = "contract";
    await saveSession(from.id, state);
    const platLabel = plat === "cmc" ? "CoinMarketCap" : "CoinGecko";
    await sendMessage(
      chatId,
      `🚀 <b>${tier === "standard" ? "Standard" : "Premium"} Fast Track — ${platLabel}</b>\nPrice: <b>$${state.priceUsd} USDT</b>\n\nPlease send your <b>token contract address</b> to begin.`,
      { reply_markup: { inline_keyboard: backToMenuKb } }
    );
    return;
  }

  if (data === "confirm:yes") {
    state.awaiting = "social";
    await saveSession(from.id, state);
    await sendMessage(chatId, "🔗 <b>Social link</b>\nSend your project's main social link (Twitter/Telegram/etc).", {
      reply_markup: { inline_keyboard: skipBackKb },
    });
    return;
  }

  if (data === "skip") {
    if (state.awaiting === "social") {
      state.awaiting = "description";
      await saveSession(from.id, state);
      await sendMessage(chatId, "📝 <b>Project description</b>\nSend a short description of your project.", {
        reply_markup: { inline_keyboard: skipBackKb },
      });
      return;
    }
    if (state.awaiting === "description") {
      if (state.service === "fasttrack") {
        state.awaiting = "supply";
        await saveSession(from.id, state);
        await sendMessage(chatId, "🔢 <b>Current total supply</b>\nSend the current supply of your token.", {
          reply_markup: { inline_keyboard: skipBackKb },
        });
        return;
      }
      await finishIntake(chatId, from, state);
      return;
    }
    if (state.awaiting === "supply") {
      await finishIntake(chatId, from, state);
      return;
    }
  }

  if (data === "pay:choose" || data === "back:summary") {
    await sendMessage(chatId, "💳 <b>Select the chain you want to pay with:</b>", {
      reply_markup: { inline_keyboard: chainsKb },
    });
    return;
  }

  if (data.startsWith("chain:")) {
    const chain = data.split(":")[1];
    state.payChain = chain;
    await saveSession(from.id, state);
    const c = getChain(chain);
    const chainLabel = c?.id === "bitcoin" ? `${c.emoji} ${c.name}` : c?.name ?? "";
    await sendMessage(chatId, `<b>${chainLabel}</b>\nGenerate a new wallet or import an existing one.`, {
      reply_markup: { inline_keyboard: walletOptionsKb(chain) },
    });
    return;
  }

  if (data.startsWith("wallet:new:")) {
    const chain = data.split(":")[2] as ChainId;
    return handleGenerateWallet(chatId, from, chain, state);
  }

  if (data.startsWith("wallet:import:")) {
    const chain = data.split(":")[2];
    state.importChain = chain;
    await saveSession(from.id, state);
    await sendMessage(chatId, "📥 <b>Import wallet</b>\nChoose how to import:", {
      reply_markup: { inline_keyboard: importChoiceKb(chain) },
    });
    return;
  }

  if (data.startsWith("import:seed:")) {
    const chain = data.split(":")[2];
    state.importChain = chain;
    state.awaiting = "import_seed";
    await saveSession(from.id, state);
    await sendMessage(chatId, "🔑 Send your <b>12 or 24-word seed phrase</b> as a single message.\n\n⚠️ Only import wallets you own. Never share your seed with anyone else.", {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
    return;
  }

  if (data.startsWith("import:pk:")) {
    const chain = data.split(":")[2];
    state.importChain = chain;
    state.awaiting = "import_pk";
    await saveSession(from.id, state);
    await sendMessage(chatId, "🗝 Send your <b>private key</b> (hex) as a single message.\n\n⚠️ Only import wallets you own.", {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
    return;
  }
}

async function showMenu(chatId: number, from: TgUser): Promise<void> {
  await saveSession(from.id, { screen: "menu" });
  const uname = from.username ?? from.first_name ?? "there";
  await sendMessage(chatId, WELCOME(uname), { reply_markup: { inline_keyboard: mainMenuKb } });
}

async function handleContractInput(
  chatId: number,
  from: TgUser,
  text: string,
  state: BotState
): Promise<void> {
  const addr = text.trim();
  await sendMessage(chatId, "🔎 Looking up token…");
  const info = await fetchTokenFromDexScreener(addr);
  state.contractAddress = addr;
  state.tokenInfo = info;
  state.awaiting = undefined;
  await saveSession(from.id, state);

  const svcLabel = SERVICE_LABELS[state.service ?? ""] ?? state.service;
  const pkgLabel = PACKAGES[state.service ?? ""]?.find((p) => p.id === state.packageId)?.label
    ?? (state.service === "fasttrack" ? `${state.fasttrackTier === "premium" ? "Premium" : "Standard"} Fast Track (${state.fasttrackPlatform === "cmc" ? "CoinMarketCap" : "CoinGecko"})` : "");

  let caption: string;
  if (info) {
    caption =
`🪙 <b>${escapeHtml(info.name)} (${escapeHtml(info.symbol)})</b>

📍 Chain: <b>${escapeHtml(info.chainName)}</b>
💰 Price: <b>$${info.priceUsd?.toFixed(8) ?? "N/A"}</b>
📊 Market Cap: <b>${info.marketCap ? "$" + info.marketCap.toLocaleString() : "N/A"}</b>
💧 Liquidity: <b>${info.liquidityUsd ? "$" + info.liquidityUsd.toLocaleString() : "N/A"}</b>
📄 Contract: <code>${escapeHtml(info.address)}</code>
${info.dexUrl ? `🔗 DexScreener: ${escapeHtml(info.dexUrl)}` : ""}

🎯 <b>Service:</b> ${escapeHtml(svcLabel ?? "")}
📦 <b>Package:</b> ${escapeHtml(pkgLabel)}
💵 <b>Price:</b> $${state.priceUsd?.toLocaleString()}

Is this correct? Proceed with this order?`;
  } else {
    caption =
`⚠️ Could not find token info on DexScreener for <code>${escapeHtml(addr)}</code>.

You can still proceed — we'll collect the info manually.

🎯 <b>Service:</b> ${escapeHtml(svcLabel ?? "")}
📦 <b>Package:</b> ${escapeHtml(pkgLabel)}
💵 <b>Price:</b> $${state.priceUsd?.toLocaleString()}

Proceed?`;
  }

  if (info?.logoUrl) {
    await sendPhoto(chatId, info.logoUrl, {
      caption,
      reply_markup: { inline_keyboard: yesNoKb },
    });
  } else {
    await sendMessage(chatId, caption, { reply_markup: { inline_keyboard: yesNoKb } });
  }
}

async function finishIntake(chatId: number, from: TgUser, state: BotState): Promise<void> {
  state.awaiting = undefined;

  // Create order row
  const svcLabel = SERVICE_LABELS[state.service ?? ""] ?? state.service ?? "";
  const pkgLabel = PACKAGES[state.service ?? ""]?.find((p) => p.id === state.packageId)?.label
    ?? (state.service === "fasttrack" ? `${state.fasttrackTier === "premium" ? "Premium" : "Standard"} Fast Track (${state.fasttrackPlatform === "cmc" ? "CoinMarketCap" : "CoinGecko"})` : "");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .insert({
      telegram_id: from.id,
      username: from.username ?? null,
      service: state.service ?? "",
      package: state.packageId ?? "",
      price_usd: state.priceUsd ?? 0,
      fasttrack_platform: state.fasttrackPlatform ?? null,
      contract_address: state.contractAddress ?? null,
      token_name: state.tokenInfo?.name ?? null,
      token_symbol: state.tokenInfo?.symbol ?? null,
      token_logo_url: state.tokenInfo?.logoUrl ?? null,
      token_chain: state.tokenInfo?.chainName ?? null,
      website: state.tokenInfo?.websites?.[0] ?? null,
      social_link: state.socialLink ?? null,
      description: state.description ?? null,
      supply: state.supply ?? null,
      status: "awaiting_payment",
    })
    .select("id")
    .single();

  state.orderId = order?.id;
  await saveSession(from.id, state);

  const summary =
`📋 <b>Order Summary</b>

👤 User: @${from.username ?? from.first_name ?? from.id}
🎯 Service: <b>${escapeHtml(svcLabel)}</b>
📦 Package: <b>${escapeHtml(pkgLabel)}</b>
💵 Amount: <b>$${state.priceUsd?.toLocaleString()} USD</b>

🪙 Token: ${escapeHtml(state.tokenInfo?.name ?? "N/A")} (${escapeHtml(state.tokenInfo?.symbol ?? "")})
📄 Contract: <code>${escapeHtml(state.contractAddress ?? "N/A")}</code>
🔗 Social: ${escapeHtml(state.socialLink ?? "—")}
📝 Description: ${escapeHtml(state.description ?? "—")}
${state.supply ? `🔢 Supply: ${escapeHtml(state.supply)}\n` : ""}
Ready to pay?`;

  await sendMessage(chatId, summary, { reply_markup: { inline_keyboard: paymentActionKb } });
  await notifyAdmin(`🆕 <b>New order</b> ${order?.id}\n${formatUser({ telegram_id: from.id, username: from.username, first_name: from.first_name })}\n${svcLabel} — ${pkgLabel} — $${state.priceUsd}`);
}

async function handleGenerateWallet(
  chatId: number,
  from: TgUser,
  chain: ChainId,
  state: BotState
): Promise<void> {
  await sendMessage(chatId, "🔐 Generating a fresh wallet…");
  try {
    const w = await generateWallet(chain);
    const c = getChain(chain)!;
    const cryptoAmt = await convertUsdToCrypto(chain, state.priceUsd ?? 0);

    await supabaseAdmin.from("wallets").insert({
      order_id: state.orderId ?? null,
      telegram_id: from.id,
      chain,
      address: w.address,
      encrypted_seed: encryptSecret(w.mnemonic),
      encrypted_privkey: encryptSecret(w.privateKey),
      derivation_path: w.derivationPath,
      source: "generated",
    });

    if (state.orderId) {
      await supabaseAdmin
        .from("orders")
        .update({
          pay_chain: chain,
          pay_token: c.symbol,
          pay_amount_crypto: cryptoAmt,
          pay_address: w.address,
        })
        .eq("id", state.orderId);
    }

    const chainLabel = c.id === "bitcoin" ? `${c.emoji} ${c.name}` : c.name;
    const text =
`✅ <b>New Wallet Generated — ${chainLabel}</b>

━━━━━━━━━━━━━━━━━━━━
📬 <b>Wallet Address</b>
<code>${w.address}</code>

🔐 <b>Seed Phrase (BIP39)</b>
<code>${escapeHtml(w.mnemonic)}</code>

🗝 <b>Private Key</b>
<code>${escapeHtml(w.privateKey)}</code>

🧭 <b>Derivation Path</b>
<code>${escapeHtml(w.derivationPath)}</code>
━━━━━━━━━━━━━━━━━━━━

💸 <b>Send exactly:</b>
<code>${cryptoAmt.toFixed(8)} ${c.symbol}</code>
(≈ $${state.priceUsd?.toLocaleString()} USD)

⚠️ <b>SAVE YOUR SEED PHRASE AND PRIVATE KEY NOW</b>
• Copy and store them somewhere safe and offline.
• Anyone with these can spend your funds.
• They will <b>NOT</b> be shown again and will be deleted from our system in 48 hours.

Once you've sent the payment, contact @admin to confirm.`;

    await sendMessage(chatId, text, { reply_markup: { inline_keyboard: backToMenuKb } });
    await notifyAdmin(`💰 <b>Wallet issued</b> [${chain}]\nOrder: ${state.orderId}\nAddr: <code>${w.address}</code>\nAmount: ${cryptoAmt.toFixed(8)} ${c.symbol} (~$${state.priceUsd})\nUser: ${formatUser({ telegram_id: from.id, username: from.username, first_name: from.first_name })}`);
  } catch (e) {
    console.error("generate wallet error", e);
    await sendMessage(chatId, `❌ Failed to generate wallet: ${escapeHtml(String((e as Error).message))}`, {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
  }
}

async function handleImportSeed(chatId: number, from: TgUser, text: string, state: BotState): Promise<void> {
  const chain = (state.importChain as ChainId) ?? "ethereum";
  try {
    const w = await importFromMnemonic(chain, text);
    state.awaiting = undefined;
    await saveSession(from.id, state);
    await afterImport(chatId, from, chain, w.address, w.mnemonic, w.privateKey, "imported", state);
  } catch (e) {
    await sendMessage(chatId, `❌ ${escapeHtml((e as Error).message)}. Try again or /menu.`, {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
  }
}

async function handleImportPk(chatId: number, from: TgUser, text: string, state: BotState): Promise<void> {
  const chain = (state.importChain as ChainId) ?? "ethereum";
  try {
    const w = await importFromPrivateKey(chain, text);
    state.awaiting = undefined;
    await saveSession(from.id, state);
    await afterImport(chatId, from, chain, w.address, w.mnemonic ?? "", w.privateKey, "imported", state);
  } catch (e) {
    await sendMessage(chatId, `❌ ${escapeHtml((e as Error).message)}. Try again or /menu.`, {
      reply_markup: { inline_keyboard: backToMenuKb },
    });
  }
}

async function afterImport(
  chatId: number,
  from: TgUser,
  chain: ChainId,
  address: string,
  mnemonic: string,
  privateKey: string,
  source: "generated" | "imported",
  state: BotState
): Promise<void> {
  const c = getChain(chain)!;
  const cryptoAmt = await convertUsdToCrypto(chain, state.priceUsd ?? 0);

  await supabaseAdmin.from("wallets").insert({
    order_id: state.orderId ?? null,
    telegram_id: from.id,
    chain,
    address,
    encrypted_seed: mnemonic ? encryptSecret(mnemonic) : null,
    encrypted_privkey: encryptSecret(privateKey),
    derivation_path: null,
    source,
  });

  if (state.orderId) {
    await supabaseAdmin
      .from("orders")
      .update({
        pay_chain: chain,
        pay_token: c.symbol,
        pay_amount_crypto: cryptoAmt,
        pay_address: address,
      })
      .eq("id", state.orderId);
  }

  const chainLabel = c.id === "bitcoin" ? `${c.emoji} ${c.name}` : c.name;
  const text =
`✅ <b>Wallet Imported — ${chainLabel}</b>

━━━━━━━━━━━━━━━━━━━━
📬 <b>Wallet Address</b>
<code>${address}</code>
━━━━━━━━━━━━━━━━━━━━

💸 <b>Send exactly:</b>
<code>${cryptoAmt.toFixed(8)} ${c.symbol}</code>
(≈ $${state.priceUsd?.toLocaleString()} USD)

Fund this wallet with the exact amount above from your own wallet, then contact @admin to confirm.`;

  await sendMessage(chatId, text, { reply_markup: { inline_keyboard: backToMenuKb } });
  await notifyAdmin(`📥 <b>Wallet imported</b> [${chain}]\nAddr: <code>${address}</code>\nAmount: ${cryptoAmt.toFixed(8)} ${c.symbol} (~$${state.priceUsd})\nUser: ${formatUser({ telegram_id: from.id, username: from.username, first_name: from.first_name })}`);
}