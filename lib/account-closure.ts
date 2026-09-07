// Account closure — lifecycle state, the mock account snapshot, and the
// eligibility gates the checklist renders.
//
// The three prerequisites in the brief (no active investments, no in-progress
// transactions, all cash withdrawn) can't be evaluated independently. An
// auto-investment re-buys what the user just sold; sale proceeds sit unsettled
// for a business day before they're withdrawable; a withdrawal takes days to
// clear. So the gates are an ordered chain where each one unlocks the next —
// which is why the UI numbers them and keeps exactly one row actionable.

import { ACCOUNT, HELD_STRATEGIES, usd } from "@/lib/portfolio"

/* -------------------------------- lifecycle -------------------------------- */

// "open" covers both "hasn't started" and "working through the checklist" —
// checklist progress is derived from the gates, never stored as a phase.
export type ClosurePhase = "open" | "requested" | "closed"

export type ClosureState = {
  phase: ClosurePhase
  // Account shape, not closure progress. Gates 0 and 1 only exist for accounts
  // that actually have a deposit in flight or a live auto-investment — most
  // users see a clean three-step list, so the prototype has to be able to show
  // that variant too.
  hasIncomingDeposit: boolean
  hasAutoInvest: boolean
  // Gate progress. Each flag is set by the flow that clears that gate.
  depositCancelled: boolean
  autoInvestOff: boolean
  sold: boolean
  settled: boolean
  withdrawn: boolean
  // Set at the final confirm.
  requestedAt: string | null
  closedAt: string | null
  reason: string | null
}

export const CLOSURE_KEY = "qb-closure"

export const INITIAL_CLOSURE: ClosureState = {
  phase: "open",
  hasIncomingDeposit: true,
  hasAutoInvest: true,
  depositCancelled: false,
  autoInvestOff: false,
  sold: false,
  settled: false,
  withdrawn: false,
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
// the dashboard, a live weekly auto-investment, and an ACH deposit in flight.

export const AUTO_INVEST = {
  amount: 100,
  cadence: "weekly, every Monday",
  nextRun: "Sep 14, 2026",
}

export const INCOMING_DEPOSIT = {
  amount: 250,
  from: "Chase Checking ••••4831",
  arrivesOn: "Sep 9, 2026",
}

export const POSITIONS_VALUE = HELD_STRATEGIES.reduce((sum, s) => sum + s.value, 0)
export const POSITION_COUNT = HELD_STRATEGIES.length

// buyingPower includes unsettled funds; settledCash is the withdrawable slice.
const UNSETTLED_START = ACCOUNT.buyingPower - ACCOUNT.settledCash

export type Snapshot = {
  positionsValue: number
  positionCount: number
  autoInvest: typeof AUTO_INVEST | null
  incomingDeposit: typeof INCOMING_DEPOSIT | null
  settledCash: number
  unsettledCash: number
  totalCash: number
}

export function snapshot(s: ClosureState): Snapshot {
  // Sale proceeds land unsettled, then move into settled cash a business day
  // later — the gap the settlement gate exists to explain.
  let settledCash = ACCOUNT.settledCash
  let unsettledCash = UNSETTLED_START
  if (s.sold) unsettledCash += POSITIONS_VALUE
  if (s.settled) {
    settledCash += unsettledCash
    unsettledCash = 0
  }
  if (s.withdrawn) settledCash = 0

  return {
    positionsValue: s.sold ? 0 : POSITIONS_VALUE,
    positionCount: s.sold ? 0 : POSITION_COUNT,
    autoInvest: s.hasAutoInvest && !s.autoInvestOff ? AUTO_INVEST : null,
    incomingDeposit: s.hasIncomingDeposit && !s.depositCancelled ? INCOMING_DEPOSIT : null,
    settledCash,
    unsettledCash,
    totalCash: settledCash + unsettledCash,
  }
}

/* ----------------------------------- gates --------------------------------- */

export type GateId = "deposit" | "auto-invest" | "positions" | "settlement" | "cash"
export type GateStatus = "done" | "current" | "waiting" | "locked"
export type GateAction = "cancel-deposit" | "turn-off-auto" | "sell" | "withdraw"

export type Gate = {
  id: GateId
  title: string
  status: GateStatus
  detail: string
  action: GateAction | null
  actionLabel: string
}

// What a gate says once it's out of reach. Hand-written per gate — a locked row
// names the thing it's waiting on rather than showing a button nobody can press.
const LOCKED_COPY: Record<GateId, string> = {
  deposit: "Available now",
  "auto-invest": "Available once your deposit is cancelled",
  positions: "Available once nothing new is coming in",
  settlement: "Available after you sell",
  cash: "Available once your trades settle",
}

export function gatesFor(state: ClosureState): Gate[] {
  const snap = snapshot(state)
  const gates: Gate[] = []

  // Gates 0 and 1 are conditional: an account with no deposit in flight and no
  // auto-investment sees a clean three-step list instead of two dead rows.
  if (state.hasIncomingDeposit) {
    gates.push({
      id: "deposit",
      title: "Cancel your incoming deposit",
      status: snap.incomingDeposit ? "locked" : "done",
      detail: snap.incomingDeposit
        ? `${usd(snap.incomingDeposit.amount)} from ${snap.incomingDeposit.from}, arriving ${snap.incomingDeposit.arrivesOn}`
        : "Cancelled. Nothing else is on its way in.",
      action: "cancel-deposit",
      actionLabel: "Cancel deposit",
    })
  }

  if (state.hasAutoInvest) {
    gates.push({
      id: "auto-invest",
      title: "Turn off auto-investments",
      status: snap.autoInvest ? "locked" : "done",
      detail: snap.autoInvest
        ? `${usd(snap.autoInvest.amount)} ${snap.autoInvest.cadence}, next on ${snap.autoInvest.nextRun}`
        : "Turned off. Nothing will be bought automatically.",
      action: "turn-off-auto",
      actionLabel: "Turn off",
    })
  }

  gates.push({
    id: "positions",
    title: "Sell your investments",
    status: snap.positionCount === 0 ? "done" : "locked",
    detail:
      snap.positionCount === 0
        ? "Every position is closed."
        : `${snap.positionCount} strategies worth ${usd(snap.positionsValue)}`,
    action: "sell",
    actionLabel: "Sell all",
  })

  gates.push({
    id: "settlement",
    title: "Wait for trades to settle",
    status: snap.unsettledCash === 0 ? "done" : "locked",
    detail:
      snap.unsettledCash === 0
        ? "Everything has settled."
        : `${usd(snap.unsettledCash)} is settling. Nothing for you to do — we'll email you when it's ready to withdraw, usually the next business day.`,
    action: null,
    actionLabel: "",
  })

  gates.push({
    id: "cash",
    title: "Withdraw your cash",
    status: snap.totalCash === 0 ? "done" : "locked",
    detail:
      snap.totalCash === 0
        ? "Your balance is $0.00."
        : `${usd(snap.settledCash)} ready to send to ${INCOMING_DEPOSIT.from}`,
    action: "withdraw",
    actionLabel: "Withdraw all",
  })

  // Exactly one gate is live: the first unmet one. A gate with no action is
  // time-based, so it waits rather than asking for a click. Everything past it
  // is locked and swaps to copy naming what it's blocked on.
  const open = gates.findIndex((g) => g.status !== "done")
  if (open >= 0) {
    gates[open].status = gates[open].action ? "current" : "waiting"
    for (let i = open + 1; i < gates.length; i++) {
      gates[i].detail = LOCKED_COPY[gates[i].id]
    }
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

export const CLOSE_REASONS = [
  "Fees are too high",
  "Moving to another app",
  "I'm not using it",
  "Performance wasn't what I expected",
  "Something else",
]

// The prototype compresses real-world waits so a reviewer can walk the whole
// flow in one sitting. The copy still states the real timing.
export const SETTLE_DELAY_MS = 7000
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
