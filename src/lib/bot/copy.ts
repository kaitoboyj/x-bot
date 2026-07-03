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

export const DEXSCREENER = `📊 <b>DEXSCREENER TRENDING</b>

🚀 Get your token trending on DexScreener — the go-to platform for active DEX traders hunting for the next opportunity.

📦 <b>Package Options:</b>
• 6 Hours: $2,000
• 12 Hours: $3,500
• 24 Hours: $6,000

📈 <b>Benefits:</b>
• Massive DEX trader exposure
• Top-of-page trending placement
• Drive volume &amp; holders
• Ideal for launches and pumps

📋 <b>Requirements:</b>
• Token Contract Address
• Project Logo
• Website / Socials (Optional)

⚡ Fast Processing • Reliable Service • Secure Payments

Select a package below to get started. 🚀`;

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
    { id: "ds_6h", label: "6 Hours — $2,000", priceUsd: 2000 },
    { id: "ds_12h", label: "12 Hours — $3,500", priceUsd: 3500 },
    { id: "ds_24h", label: "24 Hours — $6,000", priceUsd: 6000 },
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