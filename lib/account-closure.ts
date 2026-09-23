// Account closure — lifecycle state, the mock account snapshot, and the
// prerequisites the request screen renders.
//
// Reworked 2026-09-15 after engineering review. The first build made the user
// drive the whole liquidation: sell, wait out T+1 settlement, withdraw, then
// come back and confirm. That's days of round trips and a lot of brokerage
// plumbing. Now the user turns off what's still moving money, and submitting
// the request hands the liquidation to our support team — who can also catch
// the stragglers the UI can't see.
//
// What survives is the part the user genuinely has to do: stop anything that
// would re-invest the account while we're closing it, and make sure there's
// somewhere to send the money. Those prerequisites are independent of each
// other, so unlike the old sell → settle → withdraw chain they're all
// actionable at once.
//
// A "cancel your incoming deposit" row lived here until 2026-09-23. Engineering
// can't cancel an in-flight ACH from the app, so the row promised something the
// product can't do. Support catches a deposit that lands mid-closure during
// their review instead.

import { ACCOUNT, HELD_STRATEGIES, usd } from "@/lib/portfolio"

/* -------------------------------- lifecycle -------------------------------- */

// "open" covers both "hasn't started" and "working through the prerequisites" —
// progress is derived from the gates, never stored as a phase.
export type ClosurePhase = "open" | "requested" | "closed"

export type ClosureState = {
  phase: ClosurePhase
  // Account shape, not closure progress. Each of these only exists for accounts
  // that actually have a live auto-investment or no bank on file — the common
  // account sees neither and goes straight to submit.
  hasAutoInvest: boolean
  hasLinkedBank: boolean
  // Prerequisite progress. Each flag is set by the flow that clears that row.
  autoInvestOff: boolean
  // The bank the user linked during closure, when they had none on file.
  bankLabel: string | null
  // Set at the final confirm.
  requestedAt: string | null
  closedAt: string | null
  reason: string | null
}

export const CLOSURE_KEY = "qb-closure"

export const INITIAL_CLOSURE: ClosureState = {
  phase: "open",
  hasAutoInvest: true,
  hasLinkedBank: true,
  autoInvestOff: false,
  bankLabel: null,
  requestedAt: null,
  closedAt: null,
  reason: null,
}

export function readClosure(): ClosureState {
  if (typeof window === "undefined") return INITIAL_CLOSURE
  try {
    const saved = JSON.parse(sessionStorage.getItem(CLOSURE_KEY) ?? "null")
    if (saved && typeof saved === "object") return { ...INITIAL_CLOSURE, ...saved }
  } catch {
    /* fall through to a fresh state */
  }
  return INITIAL_CLOSURE
}

export function writeClosure(next: ClosureState) {
  sessionStorage.setItem(CLOSURE_KEY, JSON.stringify(next))
}

/* ----------------------------- account snapshot ---------------------------- */

// Baseline account, before any closure step has run: the 7 held strategies from
// the dashboard and a live weekly auto-investment.

export const LINKED_BANK = "Chase Checking ••••4831"

export const AUTO_INVEST = {
  amount: 100,
  cadence: "weekly, every Monday",
  nextRun: "Sep 21, 2026",
}

export const POSITIONS_VALUE = HELD_STRATEGIES.reduce((sum, s) => sum + s.value, 0)
export const POSITION_COUNT = HELD_STRATEGIES.length

export type Snapshot = {
  positionsValue: number
  positionCount: number
  // Everything in the account, settled or not. The settled/unsettled split
  // mattered when the user was withdrawing it themselves; support liquidates
  // the whole balance, so one number is the honest one to show.
  cash: number
  total: number
  autoInvest: typeof AUTO_INVEST | null
  payoutBank: string | null
}

export function snapshot(s: ClosureState): Snapshot {
  return {
    positionsValue: POSITIONS_VALUE,
    positionCount: POSITION_COUNT,
    cash: ACCOUNT.buyingPower,
    total: POSITIONS_VALUE + ACCOUNT.buyingPower,
    autoInvest: s.hasAutoInvest && !s.autoInvestOff ? AUTO_INVEST : null,
    payoutBank: s.hasLinkedBank ? LINKED_BANK : s.bankLabel,
  }
}

/* ------------------------------- prerequisites ------------------------------ */

export type GateId = "auto-invest" | "bank"
export type GateStatus = "done" | "todo"
export type GateAction = "turn-off-auto" | "link-bank"

export type Gate = {
  id: GateId
  title: string
  status: GateStatus
  detail: string
  action: GateAction
  actionLabel: string
}

// Only the rows that apply to this account, and every open row is actionable.
// The old flow numbered these because each one unlocked the next; nothing
// unlocks anything now, so numbering them would invent an order that isn't real.
export function gatesFor(state: ClosureState): Gate[] {
  const snap = snapshot(state)
  const gates: Gate[] = []

  if (state.hasAutoInvest) {
    gates.push({
      id: "auto-invest",
      title: "Turn off auto-investments",
      status: snap.autoInvest ? "todo" : "done",
      detail: snap.autoInvest
        ? `${usd(snap.autoInvest.amount)} ${snap.autoInvest.cadence}, next on ${snap.autoInvest.nextRun}`
        : "Turned off. Nothing will be bought automatically.",
      action: "turn-off-auto",
      actionLabel: "Turn off",
    })
  }

  // Only for the account with nothing on file. There's no point asking everyone
  // else to re-confirm a bank they connected during onboarding.
  if (!state.hasLinkedBank) {
    gates.push({
      id: "bank",
      title: "Link a bank account",
      status: state.bankLabel ? "done" : "todo",
      detail: state.bankLabel
        ? `${state.bankLabel}. We'll send your money here.`
        : "We need somewhere to send your money once everything is sold.",
      action: "link-bank",
      actionLabel: "Link bank",
    })
  }

  return gates
}

export function canClose(state: ClosureState): boolean {
  return gatesFor(state).every((g) => g.status === "done")
}

export function gateProgress(state: ClosureState) {
  const gates = gatesFor(state)
  return { done: gates.filter((g) => g.status === "done").length, total: gates.length }
}

/* ---------------------------------- content -------------------------------- */

export const QUIVER_EMAIL = "james@quiverquant.com"
export const SUPPORT_EMAIL = "support@getquantbase.com"

// Sale (same day) + settlement (about a business day) + ACH to the bank (one to
// three). Stated as one range because the user is waiting on the whole thing,
// not on any one leg of it. Ops should confirm the number before launch.
export const CLOSURE_ETA = "3 to 5 business days"

export const CLOSE_REASONS = [
  "Fees are too high",
  "Moving to another app",
  "I'm not using it",
  "Performance wasn't what I expected",
  "Something else",
]

// The free-text bucket. Picking it says nothing on its own, so it's the one
// reason where the detail field is required rather than optional.
export const OTHER_REASON = "Something else"

// A prompt per reason, because "Tell us more" collects nothing. Asking the
// specific follow-up a human would ask is what turns this from a survey
// checkbox into something support can act on.
export const REASON_PROMPTS: Record<string, string> = {
  "Fees are too high": "Which fees, and what were you expecting to pay?",
  "Moving to another app": "Which one, and what made you switch?",
  "I'm not using it": "What would have made it worth using?",
  "Performance wasn't what I expected": "What did you expect, and what did you see?",
  [OTHER_REASON]: "Tell us what happened.",
}

// Reasons are addressable for review links: ?reason=moving-to-another-app.
export function reasonSlug(reason: string) {
  return reason
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function reasonFromSlug(slug: string | null): string | null {
  if (!slug) return null
  const wanted = slug.toLowerCase()
  // "other" is the spelling people reach for when linking the required case.
  if (wanted === "other") return OTHER_REASON
  return CLOSE_REASONS.find((r) => reasonSlug(r) === wanted) ?? null
}

// The prototype compresses the real wait so a reviewer can walk the whole
// lifecycle in one sitting. The copy still states the real timing.
export const CLOSE_DELAY_MS = 9000

export function formatStamp(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
