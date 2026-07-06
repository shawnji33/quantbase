// Shared mock data for the strategy marketplace.
// Deliberately varied inception years + track-record lengths so we can prove the
// "no N/A" data model: young funds and veterans render with the same layout.

export type Category = "Crypto" | "Gov't" | "Meme" | "Partner" | "Quantbase"

export type Strategy = {
  id: string
  name: string
  manager: string
  blurb: string
  partner: boolean
  categories: Category[]
  inceptionYear: number
  oneYear: number // % — always present
  threeYear: number // 3-year cumulative %
  inceptionReturn: number // % since inception — always present
  risk: number // 0–5
  dailyVol: number // daily volatility %
  maxDrawdown: number // worst peak-to-trough %, negative
  minInvest: number
  series: number[] // normalized price series for the sparkline
}

// A few hand-shaped series so the sparklines look like real (different) equity curves.
const rising = [100, 103, 101, 108, 112, 109, 118, 124, 121, 133, 141, 138, 152, 168, 175]
const choppy = [100, 96, 104, 99, 108, 102, 111, 118, 109, 121, 116, 128, 133, 127, 139]
const steady = [100, 102, 105, 107, 110, 113, 116, 119, 123, 127, 131, 135, 140, 145, 151]
const volatile = [100, 118, 92, 130, 108, 145, 121, 160, 133, 175, 150, 190, 168, 205, 188]
const dip = [100, 108, 112, 104, 96, 88, 94, 102, 110, 118, 114, 122, 130, 126, 134]
const down = [100, 97, 99, 94, 91, 93, 88, 90, 85, 87, 83, 86, 81, 84, 79]
const surge = [100, 103, 107, 104, 111, 118, 114, 123, 131, 128, 142, 155, 151, 168, 188]
const wobble = [100, 108, 103, 112, 106, 118, 110, 124, 116, 130, 121, 134, 126, 138, 132]

export const strategies: Strategy[] = [
  {
    id: "volatis",
    name: "Volatis Strategy",
    manager: "Statis Fund",
    blurb: "An algorithmic moving-average strategy built on a rotating basket of ETFs.",
    partner: true,
    categories: ["Partner"],
    inceptionYear: 2021,
    oneYear: 49.35,
    threeYear: 124.52,
    inceptionReturn: 174.98,
    risk: 3.82,
    dailyVol: 1.45,
    maxDrawdown: -18.20,
    minInvest: 100,
    series: rising,
  },
  {
    id: "dan-meuser",
    name: "Quiver Dan Meuser Tracker",
    manager: "Quiver Quantitative",
    blurb: "Mirrors the disclosed stock portfolio of Rep. Dan Meuser and his family, rebalancing on new filings.",
    partner: true,
    categories: ["Gov't", "Partner"],
    inceptionYear: 2022,
    oneYear: 19.62,
    threeYear: 78.40,
    inceptionReturn: 98.68,
    risk: 3.19,
    dailyVol: 0.98,
    maxDrawdown: -12.50,
    minInvest: 100,
    series: choppy,
  },
  {
    id: "congress-buys",
    name: "Quiver Congress Buys",
    manager: "Quiver Quantitative",
    blurb: "Automatically invests in the 10 most-purchased stocks by members of Congress and their families.",
    partner: true,
    categories: ["Gov't", "Partner"],
    inceptionYear: 2022,
    oneYear: 19.82,
    threeYear: 72.10,
    inceptionReturn: 92.28,
    risk: 3.09,
    dailyVol: 1.12,
    maxDrawdown: -14.10,
    minInvest: 100,
    series: dip,
  },
  {
    id: "blue-chip",
    name: "Blue-Chip Compounder",
    manager: "Quantbase",
    blurb: "A long-only basket of wide-moat dividend growers held for the long run.",
    partner: false,
    categories: ["Quantbase"],
    inceptionYear: 2015,
    oneYear: 12.4,
    threeYear: 46.80,
    inceptionReturn: 268.5,
    risk: 1.94,
    dailyVol: 0.61,
    maxDrawdown: -8.60,
    minInvest: 50,
    series: steady,
  },
  {
    id: "meme-momentum",
    name: "Meme Momentum Index",
    manager: "Quantbase",
    blurb: "Rides the retail crowd — a momentum basket of the most socially-discussed tickers, rebalanced weekly.",
    partner: false,
    categories: ["Meme", "Quantbase"],
    inceptionYear: 2023,
    oneYear: 71.2,
    threeYear: 88.00,
    inceptionReturn: 96.4,
    risk: 4.51,
    dailyVol: 2.87,
    maxDrawdown: -31.40,
    minInvest: 100,
    series: volatile,
  },
  {
    id: "digital-assets",
    name: "Digital Assets Core",
    manager: "Statis Fund",
    blurb: "A risk-managed allocation across large-cap crypto with volatility targeting.",
    partner: true,
    categories: ["Crypto", "Partner"],
    inceptionYear: 2020,
    oneYear: -8.3,
    threeYear: 61.50,
    inceptionReturn: 143.7,
    risk: 4.88,
    dailyVol: 3.94,
    maxDrawdown: -42.70,
    minInvest: 100,
    series: down,
  },
  {
    id: "pelosi-tracker",
    name: "Quiver Nancy Pelosi Tracker",
    manager: "Quiver Quantitative",
    blurb: "Mirrors the disclosed trades of Rep. Nancy Pelosi and her spouse, rebalanced on each new filing.",
    partner: true,
    categories: ["Gov't", "Partner"],
    inceptionYear: 2021,
    oneYear: 34.1,
    threeYear: 95.20,
    inceptionReturn: 128.4,
    risk: 3.65,
    dailyVol: 1.28,
    maxDrawdown: -16.9,
    minInvest: 100,
    series: surge,
  },
  {
    id: "solana-basket",
    name: "Solana Ecosystem Basket",
    manager: "Statis Fund",
    blurb: "A momentum-weighted basket of top Solana ecosystem tokens with monthly rebalancing.",
    partner: true,
    categories: ["Crypto", "Partner"],
    inceptionYear: 2022,
    oneYear: 58.7,
    threeYear: 55.90,
    inceptionReturn: 62.3,
    risk: 4.72,
    dailyVol: 4.55,
    maxDrawdown: -51.2,
    minInvest: 100,
    series: volatile,
  },
  {
    id: "dividend-aristocrats",
    name: "Dividend Aristocrats",
    manager: "Quantbase",
    blurb: "Holds companies that have raised dividends for 25+ consecutive years, equally weighted.",
    partner: false,
    categories: ["Quantbase"],
    inceptionYear: 2016,
    oneYear: 9.8,
    threeYear: 41.30,
    inceptionReturn: 142.6,
    risk: 1.62,
    dailyVol: 0.54,
    maxDrawdown: -12.3,
    minInvest: 50,
    series: steady,
  },
  {
    id: "wsb-sentiment",
    name: "WallStreetBets Sentiment",
    manager: "Quiver Quantitative",
    blurb: "Tracks the most-mentioned tickers on r/WallStreetBets, weighted by bullish sentiment.",
    partner: true,
    categories: ["Meme", "Partner"],
    inceptionYear: 2023,
    oneYear: 63.4,
    threeYear: 40.10,
    inceptionReturn: 41.8,
    risk: 4.88,
    dailyVol: 3.9,
    maxDrawdown: -38.6,
    minInvest: 100,
    series: choppy,
  },
  {
    id: "ai-robotics",
    name: "AI & Robotics Leaders",
    manager: "Quantbase",
    blurb: "Concentrated exposure to public leaders in automation, robotics, and machine learning.",
    partner: false,
    categories: ["Quantbase"],
    inceptionYear: 2020,
    oneYear: 44.2,
    threeYear: 138.40,
    inceptionReturn: 210.5,
    risk: 4.1,
    dailyVol: 2.35,
    maxDrawdown: -28.7,
    minInvest: 100,
    series: rising,
  },
  {
    id: "insider-signal",
    name: "Insider Buying Signal",
    manager: "Statis Fund",
    blurb: "Buys stocks where corporate insiders are net purchasers based on Form 4 filings.",
    partner: true,
    categories: ["Partner"],
    inceptionYear: 2019,
    oneYear: 21.3,
    threeYear: 71.60,
    inceptionReturn: 156.9,
    risk: 2.9,
    dailyVol: 1.1,
    maxDrawdown: -19.4,
    minInvest: 100,
    series: dip,
  },
  {
    id: "green-energy",
    name: "Green Energy Momentum",
    manager: "Quantbase",
    blurb: "A trend-following allocation across solar, wind, and grid-storage equities.",
    partner: false,
    categories: ["Quantbase"],
    inceptionYear: 2021,
    oneYear: -4.6,
    threeYear: 12.70,
    inceptionReturn: 38.2,
    risk: 4.05,
    dailyVol: 2.6,
    maxDrawdown: -33.1,
    minInvest: 100,
    series: wobble,
  },
]

export const CATEGORIES: (Category | "All")[] = [
  "All",
  "Crypto",
  "Gov't",
  "Meme",
  "Partner",
  "Quantbase",
]

export function fmtPct(n: number) {
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`
}

// Risk 0–5 → a short qualitative label for the badge.
export function riskLabel(risk: number) {
  if (risk < 2) return "Low"
  if (risk < 3.5) return "Moderate"
  if (risk < 4.5) return "High"
  return "Very high"
}
