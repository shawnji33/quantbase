// Mock data for the portfolio redesign (/portfolio + /portfolio/[id]).
// Every field maps 1:1 to data on the current production page — values are
// taken from the redesign requirements doc / screenshots. No new metrics;
// the only derivation is allocation weight (value ÷ total), permitted by §6.4.

export type Holding = { symbol: string; name: string; weight: number }

export type HeldStrategy = {
  id: string
  name: string
  value: number
  gain: number // $
  returnPct: number // %
  investedSince: string // MM/DD/YYYY, as displayed today
  sinceDate: [number, number, number] // y, m(0-based), d — for series length
  netCashFlow: number
  holdings: Holding[]
  seed: number
}

export const PORTFOLIO = {
  id: "portfolio",
  name: "Quantbase Portfolio",
  value: 4708.28,
  gain: -78.52,
  returnPct: -1.64,
  investedSince: "09/09/2024",
  sinceDate: [2024, 8, 9] as [number, number, number],
  netCashFlow: 4786.8,
  seed: 7,
}

export const HELD_STRATEGIES: HeldStrategy[] = [
  {
    id: "leverage-flagship",
    name: "Quantbase Leverage Flagship",
    value: 1989.29,
    gain: 374.39,
    returnPct: 23.18,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 1614.89,
    holdings: [
      { symbol: "TQQQ", name: "ProShares UltraPro QQQ", weight: 45 },
      { symbol: "UPRO", name: "ProShares UltraPro S&P 500", weight: 30 },
      { symbol: "TMF", name: "Direxion 20+ Yr Treasury Bull 3X", weight: 15 },
      { symbol: "CASH", name: "Cash", weight: 10 },
    ],
    seed: 11,
  },
  {
    id: "crypto-flagship",
    name: "Quantbase Crypto Flagship",
    value: 1061.66,
    gain: -404.81,
    returnPct: -27.61,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 1466.47,
    // near single-holding — edge case §7.4
    holdings: [
      { symbol: "BTC", name: "Bitcoin", weight: 96 },
      { symbol: "CASH", name: "Cash", weight: 4 },
    ],
    seed: 13,
  },
  {
    id: "leveraged-nasdaq-bonds",
    name: "Leveraged NASDAQ and Bonds",
    value: 818.99,
    gain: 39.96,
    returnPct: 5.13,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 779.03,
    holdings: [
      { symbol: "QLD", name: "ProShares Ultra QQQ", weight: 60 },
      { symbol: "TLT", name: "iShares 20+ Yr Treasury", weight: 35 },
      { symbol: "CASH", name: "Cash", weight: 5 },
    ],
    seed: 17,
  },
  {
    id: "daly-active-growth",
    name: "Daly - Active Growth Fund",
    value: 235.93,
    gain: -144.17,
    returnPct: -37.93,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 380.1,
    // long tail of small positions — exercises the "Other" grouping (§7.3)
    holdings: [
      { symbol: "NVDA", name: "NVIDIA", weight: 22 },
      { symbol: "TSLA", name: "Tesla", weight: 18 },
      { symbol: "PLTR", name: "Palantir", weight: 15 },
      { symbol: "SHOP", name: "Shopify", weight: 12 },
      { symbol: "SQ", name: "Block", weight: 10 },
      { symbol: "COIN", name: "Coinbase", weight: 8 },
      { symbol: "RBLX", name: "Roblox", weight: 6 },
      { symbol: "U", name: "Unity", weight: 2.5 },
      { symbol: "AI", name: "C3.ai", weight: 2.5 },
      { symbol: "IONQ", name: "IonQ", weight: 2 },
      { symbol: "DKNG", name: "DraftKings", weight: 2 },
    ],
    seed: 19,
  },
  {
    id: "pelosi-tracker",
    name: "Nancy Pelosi Tracker",
    value: 229.67,
    gain: 29.64,
    returnPct: 14.82,
    investedSince: "06/12/2025", // short history — edge case §7.6
    sinceDate: [2025, 5, 12],
    netCashFlow: 200.02,
    holdings: [
      { symbol: "NVDA", name: "NVIDIA", weight: 30 },
      { symbol: "MSFT", name: "Microsoft", weight: 22 },
      { symbol: "AVGO", name: "Broadcom", weight: 18 },
      { symbol: "PANW", name: "Palo Alto Networks", weight: 12 },
      { symbol: "VST", name: "Vistra", weight: 10 },
      { symbol: "CRWD", name: "CrowdStrike", weight: 8 },
    ],
    seed: 23,
  },
  {
    id: "crisis-flagship",
    name: "Quantbase Crisis Flagship",
    value: 199.58,
    gain: 49.58,
    returnPct: 33.05,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 150.0,
    holdings: [
      { symbol: "GLD", name: "SPDR Gold Shares", weight: 40 },
      { symbol: "VIXY", name: "ProShares VIX Short-Term", weight: 25 },
      { symbol: "TLT", name: "iShares 20+ Yr Treasury", weight: 20 },
      { symbol: "CASH", name: "Cash", weight: 15 },
    ],
    seed: 29,
  },
  {
    id: "leveraged-all-weather",
    name: "Leveraged All Weather Portfolio",
    value: 173.16,
    gain: -5.95,
    returnPct: -3.32,
    investedSince: "09/09/2024",
    sinceDate: [2024, 8, 9],
    netCashFlow: 179.11,
    holdings: [
      { symbol: "TLT", name: "iShares 20+ Yr Treasury", weight: 40 },
      { symbol: "SPY", name: "SPDR S&P 500", weight: 30 },
      { symbol: "IEF", name: "iShares 7–10 Yr Treasury", weight: 15 },
      { symbol: "GLD", name: "SPDR Gold Shares", weight: 7.5 },
      { symbol: "DBC", name: "Invesco Commodity Index", weight: 7.5 },
    ],
    seed: 31,
  },
]

// Empty/new strategy — reachable at /portfolio/new-strategy for design review
// of the §7.5 empty state. Not listed in the table.
export const EMPTY_STRATEGY: HeldStrategy = {
  id: "new-strategy",
  name: "Quantbase Dividend Flagship",
  value: 0,
  gain: 0,
  returnPct: 0,
  investedSince: "—",
  sinceDate: [2026, 6, 17],
  netCashFlow: 0,
  holdings: [],
  seed: 37,
}

export function strategyById(id: string): HeldStrategy | null {
  if (id === EMPTY_STRATEGY.id) return EMPTY_STRATEGY
  return HELD_STRATEGIES.find((s) => s.id === id) ?? null
}

/* --------------------------- account-level data ---------------------------- */

export const ACCOUNT = {
  buyingPower: 41.08,
  settledCash: 9.4,
}

export const TOOLTIPS = {
  currentValue: "Market value of holdings plus any cash, as of the latest update.",
  buyingPower: "Cash available to invest, including unsettled funds.",
  settledCash: "Cash from settled trades, available to withdraw.",
}

/* ------------------------------- time series -------------------------------- */

// "Today" is pinned so SSR and client render identical charts.
export const TODAY: [number, number, number] = [2026, 6, 17]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weeksBetween(a: [number, number, number], b: [number, number, number]) {
  const ms = new Date(b[0], b[1], b[2]).getTime() - new Date(a[0], a[1], a[2]).getTime()
  return Math.max(Math.round(ms / (7 * 24 * 3600 * 1000)), 0)
}

// Weekly value series from inception → today, ending exactly at the strategy's
// actual return. Deterministic per seed.
export function seriesFor(s: { seed: number; returnPct: number; sinceDate: [number, number, number]; netCashFlow: number; value: number }): number[] {
  const n = weeksBetween(s.sinceDate, TODAY) + 1
  if (n < 2 || s.value === 0) return []
  const rand = mulberry32(s.seed)
  const vol = 0.028
  const raw: number[] = [1]
  for (let i = 1; i < n; i++) {
    raw.push(raw[i - 1] * (1 + (rand() - 0.5) * 2 * vol))
  }
  // Shear the walk so it ends at the true return, then scale to dollars.
  const target = 1 + s.returnPct / 100
  const drift = target / raw[n - 1]
  const base = s.netCashFlow || s.value / target
  return raw.map((v, i) => base * v * Math.pow(drift, i / (n - 1)))
}

/* ------------------------------- time ranges -------------------------------- */

export const RANGES = ["1W", "1M", "1Q", "YTD", "1Y", "ALL"] as const
export type Range = (typeof RANGES)[number]

// Number of weekly points a range needs (including the endpoint).
export function pointsForRange(range: Range, seriesLength: number): number {
  const ytdWeeks = weeksBetween([TODAY[0], 0, 1], TODAY) + 1
  const map: Record<Range, number> = {
    "1W": 2,
    "1M": 5,
    "1Q": 14,
    YTD: ytdWeeks,
    "1Y": 53,
    ALL: seriesLength,
  }
  return Math.min(map[range], seriesLength)
}

// A range is offered only when the series has more history than the range
// needs (ALL is always offered) — §7.6.
export function rangeAvailable(range: Range, seriesLength: number): boolean {
  if (range === "ALL") return true
  return seriesLength > pointsForRange(range, Number.MAX_SAFE_INTEGER)
}

export function sliceRange(series: number[], range: Range): number[] {
  if (series.length === 0) return series
  return series.slice(-pointsForRange(range, series.length))
}

/* -------------------------------- formatting -------------------------------- */

const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export function usd(n: number) {
  return usdFmt.format(n)
}

export function signedUsd(n: number) {
  return `${n < 0 ? "-" : "+"}${usdFmt.format(Math.abs(n))}`
}

export function pct(n: number) {
  return `${Math.abs(n).toFixed(2)}%`
}

// Semantic color per §6.2 — green for gains, red only for true losses.
export function deltaColor(n: number) {
  return n < 0 ? "#d92d20" : "#1d7e4f"
}

// Neutral allocation palette (donut ring never encodes performance — §6.2).
export const ALLOC_COLORS = [
  "#7046E5",
  "#4E9BE8",
  "#5FBF8F",
  "#E8B84E",
  "#E86F9A",
  "#6FD4D4",
  "#B49CF6",
  "#8B8FA8",
]
