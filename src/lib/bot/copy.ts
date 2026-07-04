export const WELCOME = (username: string) =>
`👋 Hi @${username}!

Welcome to <b>X Trending</b>
Your all-in-one gateway to premium token exposure across the crypto industry's leading discovery platforms.
Whether you're launching a new project, reviving momentum, or scaling community awareness, our services help put your token in front of active traders and investors.

🎯 <b>Available Services</b>
• DexScreener Trending
• CoinGecko Trending
• CoinMarketCap Trending
• DEXTools Trending

🔥 <b>Market Recovery Promotion: 5% OFF All Services</b>

Maximize your project's visibility with trusted trending placements designed to increase exposure where traders are already looking.

⭐ <b>Why Choose X Trending?</b>
✅ Increase Token Visibility
✅ Reach Real Crypto Traders
✅ Improve Project Credibility
✅ Drive Community Growth
✅ Premium Trending Placements
✅ Fast &amp; Reliable Processing

📈 In today's market, visibility is everything. The projects that stay in front of investors are the projects that continue to grow.

Select a service below to view available packages and get your token in front of the crypto community today.`;

export const COINGECKO = `🦎 <b>COINGECKO TRENDING</b>

🚀 Get your token featured on CoinGecko Trending and gain exposure to thousands of crypto traders, investors, and market watchers actively discovering new projects.

📦 <b>Package Options:</b>
• 24 Hours: $1,500
• 2 Days: $2,800
• 1 Week: $9,500

📈 <b>Benefits:</b>
• Increased token visibility
• Higher exposure on CoinGecko
• Reach active crypto investors
• Improve project awareness
• Drive more traffic to your token page

📋 <b>Requirements:</b>
• Token Contract Address
• Project Logo
• Official Website (Optional)
• Social Media Links (Optional)

⚡ Fast Processing
⚡ Reliable Service
⚡ Secure Payments

🦎 Get your project noticed on one of the world's most trusted crypto data platforms.

Select a package below to get started. 🚀`;

export const CMC = `🏆 <b>COINMARKETCAP TRENDING</b>

🚀 Get your token featured on CoinMarketCap Trending and place your project in front of one of the largest crypto audiences in the world.

📦 <b>Package Options:</b>
• 24 Hours: $2,500
• 2 Days: $4,800
• 1 Week: $16,000

📈 <b>Benefits:</b>
• Increased token exposure
• Higher visibility on CoinMarketCap
• Reach active traders and investors
• Strengthen project awareness
• Drive more traffic and community growth

📋 <b>Requirements:</b>
• Token Contract Address
• Project Logo
• Official Website (Optional)
• Social Media Links (Optional)

⚡ Fast Processing
⚡ Reliable Service
⚡ Secure Payments

🏆 Put your project in front of millions of crypto users and maximize your token's visibility.

Select a package below to get started. 🚀`;

export const DEXSCREENER = `🔥 You can order Fixed Trending Listings on the DexScreener Trending leaderboard with extra exposure options.

We offer 2 Different Packages.

🥇 <b>DexScreener Trending Boost</b>

• Guaranteed top listing on the DexScreener Trending leaderboard.

• Increased visibility among active traders and investors.

• Fast campaign activation after payment.

<b>Prices:</b>

🔸4 Hours  $150 USDT

🔸12 Hours $300 USDT

🔸24 Hours $500 USDT

🔸1 Week  $2,000 USDT

🥈 <b>DexScreener Push Mix Boost</b>

Contains everything included in the DexScreener Trending Boost.

➕ Includes DexScreener Token Boosts for additional exposure.

➕ Higher boost counts increase your token's visibility.

➕ 500x Boost unlocks the exclusive Golden Ticker ✨.

<b>Prices:</b>

⚡ 10x Boost — $89.10 USDT

⚡ 30x Boost — $224.10 USDT

⚡ 50x Boost — $359.10 USDT

⚡ 100x Boost — $809.10 USDT

✨ 500x Boost (Golden Ticker) — $3,599.10 USDT

🔥 <b>START DEXSCREENER TRENDING HERE</b>

ℹ️ More Information`;

export const DEXTOOLS = `🛠 <b>DEXTOOLS TRENDING</b>

🚀 Land your token on DEXTools Trending and put it in front of pro DEX traders and analysts worldwide.

📦 <b>Package Options:</b>
• 6 Hours: $1,800
• 12 Hours: $3,200
• 24 Hours: $5,500

📈 <b>Benefits:</b>
• Reach active DEX traders
• Boost visibility &amp; volume
• Strengthen credibility

📋 <b>Requirements:</b>
• Token Contract Address
• Project Logo
• Website / Socials (Optional)

⚡ Fast Processing • Reliable Service • Secure Payments

Select a package below to get started. 🚀`;

export const FASTTRACK = `🔥 <b>FAST TRACK LISTING</b>

Get your token <b>fast-tracked for priority review and listing</b> on leading crypto data platforms. Fast Track Listing helps accelerate the listing process, reducing waiting time so your project can go live sooner.

We offer <b>2 Different Packages.</b>

🥇 <b>Standard Fast Track</b>
• Priority review of your listing submission.
• Faster processing than the standard listing queue.
• Available for <b>CoinMarketCap</b> and <b>CoinGecko</b>.
• Ideal for projects that want to launch quickly.

<b>Prices:</b>
🔸 CoinMarketCap — $350 USDT
🔸 CoinGecko — $350 USDT

🥈 <b>Premium Fast Track</b>
Includes everything in the Standard Fast Track.

➕ Highest priority processing.
➕ Dedicated handling for the fastest possible review.
➕ Best option for projects requiring urgent listing.

<b>Prices:</b>
🔹 CoinMarketCap — $700 USDT
🔹 CoinGecko — $700 USDT

🚀 <b>START YOUR FAST TRACK LISTING — GET LISTED</b>`;

export interface Package {
  id: string;
  label: string;
  priceUsd: number;
}

export const PACKAGES: Record<string, Package[]> = {
  coingecko: [
    { id: "cg_24h", label: "24 Hours — $1,500", priceUsd: 1500 },
    { id: "cg_2d", label: "2 Days — $2,800", priceUsd: 2800 },
    { id: "cg_1w", label: "1 Week — $9,500", priceUsd: 9500 },
  ],
  cmc: [
    { id: "cmc_24h", label: "24 Hours — $2,500", priceUsd: 2500 },
    { id: "cmc_2d", label: "2 Days — $4,800", priceUsd: 4800 },
    { id: "cmc_1w", label: "1 Week — $16,000", priceUsd: 16000 },
  ],
  dexscreener: [
    { id: "ds_trending_4h", label: "4 Hours — $150 USDT", priceUsd: 150 },
    { id: "ds_trending_12h", label: "12 Hours — $300 USDT", priceUsd: 300 },
    { id: "ds_trending_24h", label: "24 Hours — $500 USDT", priceUsd: 500 },
    { id: "ds_trending_1w", label: "1 Week — $2,000 USDT", priceUsd: 2000 },
    { id: "ds_boost_10x", label: "10x Boost — $89.10 USDT", priceUsd: 89.1 },
    { id: "ds_boost_30x", label: "30x Boost — $224.10 USDT", priceUsd: 224.1 },
    { id: "ds_boost_50x", label: "50x Boost — $359.10 USDT", priceUsd: 359.1 },
    { id: "ds_boost_100x", label: "100x Boost — $809.10 USDT", priceUsd: 809.1 },
    { id: "ds_boost_500x", label: "500x Boost (Golden Ticker) — $3,599.10 USDT", priceUsd: 3599.1 },
  ],
  dextools: [
    { id: "dt_6h", label: "6 Hours — $1,800", priceUsd: 1800 },
    { id: "dt_12h", label: "12 Hours — $3,200", priceUsd: 3200 },
    { id: "dt_24h", label: "24 Hours — $5,500", priceUsd: 5500 },
  ],
};

export const SERVICE_LABELS: Record<string, string> = {
  coingecko: "CoinGecko Trending",
  cmc: "CoinMarketCap Trending",
  dexscreener: "DexScreener Trending",
  dextools: "DEXTools Trending",
  fasttrack: "Fast Track Listing",
};

export const FASTTRACK_PACKAGES = {
  standard: 350,
  premium: 700,
};