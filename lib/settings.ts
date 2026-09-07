// Settings — section registry, mock account data, and the mutable slice that
// the panels read and write.
//
// Sections are grouped by the task a person came to do ("is my money safe",
// "what happened to my account", "how am I invested"), not by which table the
// field lives in. Each one exposes a `status` line so the nav answers the most
// common visit — checking state — without opening the panel at all.

import { RISK_OPTIONS, type ExperienceMap, type RiskAnswer } from "@/lib/onboarding"

/* -------------------------------- sections -------------------------------- */

export const SECTION_IDS = [
  "account",
  "security",
  "banking",
  "documents",
  "activity",
  "preferences",
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export const SECTIONS: Record<SectionId, { label: string; title: string; blurb: string }> = {
  account: {
    label: "Account",
    title: "Account",
    blurb: "Your name, contact details, and how to close your account.",
  },
  security: {
    label: "Security",
    title: "Security",
    blurb: "Two-factor authentication, password, and where you're signed in.",
  },
  banking: {
    label: "Banking",
    title: "Banking",
    blurb: "The bank account we use for deposits and withdrawals.",
  },
  documents: {
    label: "Documents",
    title: "Documents",
    blurb: "Monthly statements and tax forms.",
  },
  activity: {
    label: "Activity",
    title: "Activity",
    blurb: "Everything that's happened in your account.",
  },
  preferences: {
    label: "Investing",
    title: "Investment preferences",
    blurb: "Your risk tolerance, experience, and how we handle your cash.",
  },
}

/* ------------------------------ mutable state ------------------------------ */

export type SettingsState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  mfaEnabled: boolean
  bankConnected: boolean
  risk: RiskAnswer
  experience: ExperienceMap
  autoRebalance: boolean
  reinvestDividends: boolean
}

export const SETTINGS_KEY = "qb-settings"

export const INITIAL_SETTINGS: SettingsState = {
  firstName: "Logan",
  lastName: "Weaver",
  email: "logan.weaver@email.com",
  phone: "(415) 555-0148",
  street: "1847 Fell Street, Apt 4",
  city: "San Francisco",
  state: "CA",
  zip: "94117",
  mfaEnabled: false,
  bankConnected: true,
  risk: "hold",
  experience: { Stocks: 2, Cryptocurrency: 1, Bonds: 1 },
  autoRebalance: true,
  reinvestDividends: false,
}

export function readSettings(): SettingsState {
  if (typeof window === "undefined") return INITIAL_SETTINGS
  try {
    const saved = JSON.parse(sessionStorage.getItem(SETTINGS_KEY) ?? "null")
    if (saved && typeof saved === "object") return { ...INITIAL_SETTINGS, ...saved }
  } catch {
    /* fall through to defaults */
  }
  return INITIAL_SETTINGS
}

export function writeSettings(next: SettingsState) {
  sessionStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
}

/* --------------------------------- banking -------------------------------- */

// Full numbers live here so the panel can offer a deliberate reveal. They are
// never rendered until the user asks for them.
export const BANK = {
  institution: "Chase",
  nickname: "Chase Checking",
  mask: "4831",
  accountNumber: "000123456784831",
  routingNumber: "021000021",
  type: "Checking",
  connectedOn: "March 14, 2025",
}

export function maskAll(value: string, revealLast = 4) {
  const shown = value.slice(-revealLast)
  return `${"•".repeat(Math.max(value.length - revealLast, 0))}${shown}`
}

/* -------------------------------- security -------------------------------- */

export const PASSWORD_UPDATED = "June 2, 2026"

export const SESSIONS = [
  { id: "s1", device: "Chrome on macOS", where: "San Francisco, CA", when: "Active now", current: true },
  { id: "s2", device: "Quantbase iOS", where: "San Francisco, CA", when: "2 days ago", current: false },
  { id: "s3", device: "Safari on iPhone", where: "Oakland, CA", when: "Sep 1, 2026", current: false },
]

/* -------------------------------- documents ------------------------------- */

export type Doc = { id: string; name: string; date: string; year: number; size: string }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// Monthly statements back to the account's first full month. Generated from a
// fixed anchor so server and client render the same list.
export const STATEMENTS: Doc[] = (() => {
  const out: Doc[] = []
  let y = 2026
  let m = 7 // August 2026 is the last closed month
  for (let i = 0; i < 18; i++) {
    out.push({
      id: `stmt-${y}-${m}`,
      name: `${MONTHS[m]} ${y} statement`,
      date: `${MONTHS[m].slice(0, 3)} 1, ${y}`,
      year: y,
      size: `${(140 + ((i * 37) % 90)) / 100 + 0.6} MB`.replace(/(\d+\.\d)\d*/, "$1"),
    })
    m -= 1
    if (m < 0) {
      m = 11
      y -= 1
    }
  }
  return out
})()

export const TAX_DOCS: Doc[] = [
  { id: "tax-2025-1099b", name: "1099-B · 2025", date: "Feb 14, 2026", year: 2025, size: "0.3 MB" },
  { id: "tax-2025-1099div", name: "1099-DIV · 2025", date: "Feb 14, 2026", year: 2025, size: "0.2 MB" },
  { id: "tax-2024-1099b", name: "1099-B · 2024", date: "Feb 11, 2025", year: 2024, size: "0.3 MB" },
]

/* --------------------------------- activity ------------------------------- */

export type ActivityKind = "deposit" | "withdrawal" | "buy" | "sell" | "dividend" | "security"
export type ActivityStatus = "completed" | "pending" | "failed"

export type ActivityEvent = {
  id: string
  kind: ActivityKind
  label: string
  detail: string
  amount: number | null
  status: ActivityStatus
  // Days before the pinned "today" — turned into a date at render time.
  daysAgo: number
}

const KIND_POOL: { kind: ActivityKind; label: string; detail: string; amount: number | null }[] = [
  { kind: "buy", label: "Bought Quantbase Leverage Flagship", detail: "Auto-investment", amount: 100 },
  { kind: "dividend", label: "Dividend received", detail: "Leveraged All Weather Portfolio", amount: 4.12 },
  { kind: "deposit", label: "Deposit from Chase Checking", detail: "ACH transfer", amount: 250 },
  { kind: "buy", label: "Bought Nancy Pelosi Tracker", detail: "One-time order", amount: 200 },
  { kind: "sell", label: "Sold Quantbase Crisis Flagship", detail: "Rebalance", amount: 49.58 },
  { kind: "security", label: "Signed in", detail: "Chrome on macOS · San Francisco", amount: null },
  { kind: "withdrawal", label: "Withdrawal to Chase Checking", detail: "ACH transfer", amount: 75 },
  { kind: "buy", label: "Bought Leveraged NASDAQ and Bonds", detail: "Auto-investment", amount: 100 },
  { kind: "dividend", label: "Dividend received", detail: "Quantbase Leverage Flagship", amount: 2.87 },
  { kind: "security", label: "Password changed", detail: "From account settings", amount: null },
]

export const ACTIVITY: ActivityEvent[] = Array.from({ length: 34 }, (_, i) => {
  const base = KIND_POOL[i % KIND_POOL.length]
  return {
    id: `evt-${i}`,
    kind: base.kind,
    label: base.label,
    detail: base.detail,
    amount: base.amount,
    // Only the newest couple of transfers are still moving.
    status: i === 0 ? "pending" : i === 6 ? "failed" : "completed",
    daysAgo: i * 3 + (i % 4),
  }
})

// Pinned so SSR and the client agree.
const ACTIVITY_TODAY = new Date(2026, 8, 7)

export function activityDate(daysAgo: number) {
  const d = new Date(ACTIVITY_TODAY)
  d.setDate(d.getDate() - daysAgo)
  return d
}

export function formatActivityDate(daysAgo: number) {
  return activityDate(daysAgo).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const DATE_RANGES = [
  { id: "30d", label: "30 days", days: 30 },
  { id: "3m", label: "3 months", days: 90 },
  { id: "1y", label: "12 months", days: 365 },
  { id: "all", label: "All time", days: Infinity },
] as const

export type DateRangeId = (typeof DATE_RANGES)[number]["id"]

/* ------------------------------- risk profile ------------------------------ */

// The settings page shows the answer as a conclusion, not as the question again.
export const RISK_PROFILE: Record<RiskAnswer, { level: string; summary: string }> = {
  "sell-all": { level: "Conservative", summary: "You'd sell before things got worse" },
  "sell-some": { level: "Cautious", summary: "You'd reduce your exposure and wait" },
  hold: { level: "Moderate", summary: "You'd hold through a downturn" },
  "buy-more": { level: "Aggressive", summary: "You'd treat a drop as a discount" },
}

export { RISK_OPTIONS }

/* --------------------------- nav status summaries -------------------------- */

// Answers "is it on / is it connected" straight from the nav, which is what
// most visits are actually for.
export function sectionStatus(id: SectionId, s: SettingsState): string {
  switch (id) {
    case "account":
      return `${s.firstName} ${s.lastName}`
    case "security":
      return s.mfaEnabled ? "Two-factor on" : "Two-factor off"
    case "banking":
      return s.bankConnected ? `${BANK.institution} ••••${BANK.mask}` : "Not connected"
    case "documents":
      return `${STATEMENTS.length} statements · ${TAX_DOCS.length} tax forms`
    case "activity":
      return `Last on ${formatActivityDate(ACTIVITY[0].daysAgo)}`
    case "preferences":
      return RISK_PROFILE[s.risk].level
  }
}

// Whether the status reads as a healthy state, a gap, or neutral information.
export function sectionTone(id: SectionId, s: SettingsState): "good" | "warn" | "muted" {
  if (id === "security") return s.mfaEnabled ? "good" : "warn"
  if (id === "banking") return s.bankConnected ? "good" : "warn"
  return "muted"
}
