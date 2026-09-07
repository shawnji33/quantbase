"use client"

// Orchestrates the whole closure story on one route, because it is one story
// spread across days: checklist → confirm → requested → closed. Which screen
// shows is derived from persisted state, not from navigation, so a user who
// leaves mid-checklist and comes back tomorrow lands exactly where they were.

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { useClosure } from "@/components/settings/use-closure"
import { ClosureChecklist } from "@/components/settings/closure-checklist"
import { ClosureConfirm } from "@/components/settings/closure-confirm"
import { ClosureTracker } from "@/components/settings/closure-tracker"
import { AccountClosed } from "@/components/settings/account-closed"
import { INITIAL_CLOSURE, type ClosureState } from "@/lib/account-closure"

/* ----------------------------- review switcher ----------------------------- */
// Same affordance as the dashboard's "Account" switcher: the closure story
// spans days of real time, so the team needs to jump straight to any state.

const ALL_CLEAR = {
  depositCancelled: true,
  autoInvestOff: true,
  sold: true,
  settled: true,
  withdrawn: true,
}

const PRESETS = [
  ["start", "Start"],
  ["sell", "Sell"],
  ["settling", "Settling"],
  ["ready", "Ready"],
  ["requested", "Requested"],
  ["closed", "Closed"],
] as const

type PresetId = (typeof PRESETS)[number][0]

// Account shape carries across preset jumps, so the reviewer can walk the whole
// lifecycle in either the 5-gate or the 3-gate variant.
type Shape = Pick<ClosureState, "hasIncomingDeposit" | "hasAutoInvest">

function preset(id: PresetId, shape: Shape): ClosureState {
  const now = new Date().toISOString()
  const base = { ...INITIAL_CLOSURE, ...shape }
  switch (id) {
    case "start":
      return base
    case "sell":
      return { ...base, depositCancelled: true, autoInvestOff: true }
    case "settling":
      return { ...base, depositCancelled: true, autoInvestOff: true, sold: true }
    case "ready":
      return { ...base, ...ALL_CLEAR }
    case "requested":
      return { ...base, ...ALL_CLEAR, phase: "requested", requestedAt: now }
    case "closed":
      return { ...base, ...ALL_CLEAR, phase: "closed", closedAt: now }
  }
}

// Which preset the current state corresponds to, so the switcher shows where
// you are after walking the flow by hand.
function activePreset(s: ClosureState): PresetId {
  if (s.phase === "closed") return "closed"
  if (s.phase === "requested") return "requested"
  if (s.withdrawn) return "ready"
  if (s.sold && !s.settled) return "settling"
  if (s.depositCancelled || s.autoInvestOff) return "sell"
  return "start"
}

/* -------------------------------- component -------------------------------- */

export function CloseAccount() {
  const { state, update, reset, ready } = useClosure()
  const [step, setStep] = useState<"checklist" | "confirm">("checklist")
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    // Hide the review switcher while Figma's html-to-design capture runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hash read
    if (window.location.hash.startsWith("#figmacapture")) setCapturing(true)
  }, [])

  const complete = useCallback(() => {
    update({ phase: "closed", closedAt: new Date().toISOString() })
  }, [update])

  function confirm(reason: string | null) {
    update({ phase: "requested", requestedAt: new Date().toISOString(), reason })
    setStep("checklist")
  }

  // Cancelling restores the account but not the portfolio — the gates stay
  // cleared, which is exactly what the cancel copy promises.
  function cancelClosure() {
    update({ phase: "open", requestedAt: null })
  }

  function jump(id: PresetId) {
    reset(preset(id, { hasIncomingDeposit: state.hasIncomingDeposit, hasAutoInvest: state.hasAutoInvest }))
    setStep("checklist")
  }

  // Switches between the account that has everything (5 gates) and the common
  // case with neither a deposit in flight nor an auto-investment (3 gates).
  function setShape(full: boolean) {
    reset(
      preset(activePreset(state), { hasIncomingDeposit: full, hasAutoInvest: full })
    )
    setStep("checklist")
  }

  return (
    <>
      {/* One frame of nothing beats one frame of the wrong screen. */}
      {!ready ? null : state.phase === "closed" ? (
        <AccountClosed closedAt={state.closedAt} />
      ) : state.phase === "requested" ? (
        <ClosureTracker
          requestedAt={state.requestedAt}
          onCancel={cancelClosure}
          onComplete={complete}
        />
      ) : step === "confirm" ? (
        <ClosureConfirm onBack={() => setStep("checklist")} onConfirm={confirm} />
      ) : (
        <ClosureChecklist
          state={state}
          update={update}
          onContinue={() => setStep("confirm")}
        />
      )}

      {/* design-review only: jump to any point in the closure lifecycle, and
          switch between the 5-gate and 3-gate account shapes */}
      {ready && !capturing && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2">
          <div className="glass flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
            <span className="px-2.5 text-xs font-medium text-muted-foreground">Closure</span>
            {PRESETS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => jump(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  activePreset(state) === id
                    ? "bg-primary text-primary-foreground"
                    : "text-[#47475d] hover:bg-black/5"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="glass flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
            <span className="px-2.5 text-xs font-medium text-muted-foreground">Account</span>
            {(
              [
                [true, "5 gates"],
                [false, "3 gates"],
              ] as const
            ).map(([full, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setShape(full)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  state.hasIncomingDeposit === full
                    ? "bg-primary text-primary-foreground"
                    : "text-[#47475d] hover:bg-black/5"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
