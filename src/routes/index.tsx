import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "X Trending Bot — Premium Crypto Trending Placements" },
      {
        name: "description",
        content:
          "X Trending Bot: instant DexScreener, DEXTools, CoinMarketCap, and CoinGecko trending placements plus Fast Track listings. Powered by Telegram.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight">X Trending Bot</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Premium trending placements across DexScreener, DEXTools, CoinMarketCap, and CoinGecko —
          plus Fast Track listings. This site hosts the always-on backend for the Telegram bot.
        </p>
        <div className="mt-8 rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold">Status</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bot webhook, wallet generation, and pricing services are running 24/7.
          </p>
        </div>
      </div>
    </div>
  );
}
