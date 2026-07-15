// Shared config + (front-end) recommendation logic for the onboarding flow.
// Everything here is mock — no backend.

import { strategies } from "@/lib/strategies"

/* ---------------------------------- paths --------------------------------- */

export type IntentPath = "specific" | "guided" | "explore"

/* -------------------------------- questions -------------------------------- */

export type RiskAnswer = "sell-all" | "sell-some" | "hold" | "buy-more"

export const RISK_OPTIONS: {
  id: RiskAnswer
  label: string
  description: string
}[] = [
  { id: "sell-all", label: "Sell all of my investments", description: "I'd want out before it got worse" },
  { id: "sell-some", label: "Sell some of my investments", description: "I'd reduce my exposure and wait" },
  { id: "hold", label: "Hold all of my investments", description: "I'd ride it out" },
  { id: "buy-more", label: "Buy more", description: "I'd treat it as a discount" },
]

export const ASSET_TYPES = ["Stocks", "Bonds", "Cryptocurrency", "Options", "Leverage"] as const
export type AssetType = (typeof ASSET_TYPES)[number]

// 0 = none, 1 = <1 yr, 2 = 1–3 yrs, 3 = 3+ yrs
export type ExperienceMap = Partial<Record<AssetType, number>>
export const EXPERIENCE_LEVELS = ["None", "< 1 yr", "1–3 yrs", "3+ yrs"]

export const HEARD_ABOUT = [
  "QuiverQuant",
  "Statis",
  "Austin Hankwitz",
  "Friend or family",
  "Google",
  "RoundlyX",
  "TikTok",
  "Somewhere else",
]

/* ------------------------------ recommendation ----------------------------- */

export type Weighted = { id: string; weight: number }

// Deliberately simple, deterministic scoring so the prototype is explainable:
// the risk answer caps strategy risk; zero crypto experience filters crypto out;
// conservative answers overweight the calmer picks.
export function recommendPortfolio(risk: RiskAnswer, exp: ExperienceMap): Weighted[] {
  const maxRisk = { "sell-all": 2.6, "sell-some": 3.6, hold: 4.3, "buy-more": 5 }[risk]
  const cryptoOk = (exp["Cryptocurrency"] ?? 0) > 0

  const pool = strategies
    .filter((s) => s.risk <= maxRisk)
    .filter((s) => cryptoOk || !s.categories.includes("Crypto"))
    .sort((a, b) => b.inceptionReturn - a.inceptionReturn)
    .slice(0, 4)

  const conservative = risk === "sell-all" || risk === "sell-some"
  pool.sort((a, b) => (conservative ? a.risk - b.risk : b.risk - a.risk))

  return applyWeights(pool.map((s) => s.id))
}

export function applyWeights(ids: string[]): Weighted[] {
  const templates: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [45, 35, 20],
    4: [40, 30, 20, 10],
  }
  const t = templates[Math.min(ids.length, 4)] ?? []
  return ids.slice(0, 4).map((id, i) => ({ id, weight: t[i] ?? 0 }))
}

/* --------------------------------- KYC data -------------------------------- */

export const EMPLOYMENT_STATUSES = ["Employed", "Self-employed", "Student", "Retired", "Not employed"]

export const FUNDING_SOURCES = [
  "Employment income",
  "Savings",
  "Investments",
  "Inheritance",
  "Business income",
  "Other",
]

export const INCOME_RANGES = ["Under $25k", "$25k – $50k", "$50k – $100k", "$100k – $250k", "$250k – $500k", "$500k+"]

export const NET_WORTH_RANGES = ["Under $10k", "$10k – $50k", "$50k – $250k", "$250k – $1M", "$1M+"]

export const AGREEMENTS = [
  {
    id: "advisory",
    title: "Quantbase Investment Advisory Agreement",
    description: "Our advisory relationship, fees, and how strategies are managed.",
  },
  {
    id: "brokerage",
    title: "Alpaca Securities Customer Agreement",
    description: "Your brokerage account is held with Alpaca Securities LLC.",
  },
  {
    id: "terms",
    title: "Terms of Service & Privacy Policy",
    description: "How Quantbase works and how your data is handled.",
  },
]

export const FUNDING_PRESETS = [100, 250, 500, 1000]
