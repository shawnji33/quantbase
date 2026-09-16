"use client"

// Orchestrates the whole closure story on one route, because it is one story
// spread across days: request → confirm → requested → closed. Which screen
// shows is derived from persisted state, not from navigation, so a user who
// leaves mid-request and comes back tomorrow lands exactly where they were.

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { useClosure } from "@/components/settings/use-closure"
import { ClosureRequest } from "@/components/settings/closure-request"
import { ClosureConfirmDialog } from "@/components/settings/closure-confirm"
import { ClosureTracker } from "@/components/settings/closure-tracker"
import { AccountClosed } from "@/components/settings/account-closed"
import {
  INITIAL_CLOSURE,
  LINKED_BANK,
  canClose,
  type ClosureState,
} from "@/lib/account-closure"
import { useDialogParam } from "@/components/settings/use-dialog-param"

/* ----------------------------- review switcher ----------------------------- */
// Same affordance as the dashboard's "Account" switcher: the closure story
// spans days of real time, so the team needs to jump straight to any state.

const ALL_CLEAR = {
  depositCancelled: true,
  autoInvestOff: true,
  bankLabel: LINKED_BANK,
}

const PRESETS = [
  ["start", "Start"],
  ["ready", "Ready"],
  ["requested", "Requested"],
  ["closed", "Closed"],
] as const

type PresetId = (typeof PRESETS)[number][0]

// Which prerequisites this account has at all. Kept separate from lifecycle
// position so a reviewer can walk any shape through any state.
const SHAPES = {
  full: { hasIncomingDeposit: true, hasAutoInvest: true, hasLinkedBank: true },
  clean: { hasIncomingDeposit: false, hasAutoInvest: false, hasLinkedBank: true },
  "no-bank": { hasIncomingDeposit: false, hasAutoInvest: false, hasLinkedBank: false },
} as const

type ShapeId = keyof typeof SHAPES

const SHAPE_LABELS: [ShapeId, string][] = [
  ["full", "Deposit + auto"],
  ["clean", "Nothing to do"],
  ["no-bank", "No bank"],
]

function preset(id: PresetId, shape: ShapeId): ClosureState {
  const now = new Date().toISOString()
  const base = { ...INITIAL_CLOSURE, ...SHAPES[shape] }
  switch (id) {
    case "start":
      return base
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
  return canClose(s) ? "ready" : "start"
}

function activeShape(s: ClosureState): ShapeId {
  if (!s.hasLinkedBank) return "no-bank"
  return s.hasIncomingDeposit || s.hasAutoInvest ? "full" : "clean"
}

/* -------------------------------- component -------------------------------- */

export function CloseAccount() {
  const { state, update, reset, ready } = useClosure()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const dialogParam = useDialogParam()

  // ?dialog=confirm|confirm-reason opens the two-step modal on that step.
  const confirmStep = dialogParam === "confirm-reason" ? ("reason" as const) : ("quiver" as const)

  useEffect(() => {
    if (!dialogParam?.startsWith("confirm")) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time deep link
    setConfirmOpen(true)
  }, [dialogParam])

  useEffect(() => {
    // Hide the review switcher while Figma's html-to-design capture runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hash read
    if (window.location.hash.startsWith("#figmacapture")) setCapturing(true)
  }, [])

  // Deep links for review: ?state=<preset> seeds the lifecycle and
  // ?account=full|clean|no-bank picks which prerequisites exist. Same convention
  // as ?status= on /portfolio. The URL wins over whatever is in storage, so a
  // link always shows what it promises. `?gates=3` is the old spelling of
  // `?account=clean`, kept working because those links are already circulating.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const wanted = params.get("state") as PresetId | null
    const account = params.get("account") as ShapeId | null
    const legacy = params.get("gates") === "3" ? ("clean" as const) : null
    if (!wanted && !account && !legacy) return
    if (wanted && !PRESETS.some(([id]) => id === wanted)) return
    const shape = account && account in SHAPES ? account : (legacy ?? "full")
    reset(preset(wanted ?? "start", shape))
  }, [reset])

  const complete = useCallback(() => {
    update({ phase: "closed", closedAt: new Date().toISOString() })
  }, [update])

  function confirm(reason: string | null) {
    setConfirmOpen(false)
    update({ phase: "requested", requestedAt: new Date().toISOString(), reason })
  }

  // Cancelling restores the account. Nothing the user did on the request screen
  // is undone — their deposit stays cancelled and auto-invest stays off, which
  // is both true and the only thing we could honestly promise.
  function cancelClosure() {
    update({ phase: "open", requestedAt: null })
  }

  function jump(id: PresetId) {
    reset(preset(id, activeShape(state)))
    setConfirmOpen(false)
  }

  // Switches which prerequisites the account has, holding the lifecycle position.
  function setShape(shape: ShapeId) {
    reset(preset(activePreset(state), shape))
    setConfirmOpen(false)
  }

  return (
    <>
      {/* One frame of nothing beats one frame of the wrong screen. */}
      {!ready ? null : state.phase === "closed" ? (
        <AccountClosed closedAt={state.closedAt} />
      ) : state.phase === "requested" ? (
        <ClosureTracker state={state} onCancel={cancelClosure} onComplete={complete} />
      ) : (
        <>
          <ClosureRequest
            state={state}
            update={update}
            onContinue={() => setConfirmOpen(true)}
          />
          <ClosureConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={confirm}
            initialStep={confirmStep}
          />
        </>
      )}

      {/* design-review only: jump to any point in the closure lifecycle, and
          switch which prerequisites the account has */}
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
                  "rounded-full px-3 py-1.5 text-xs font-medium",
            "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
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
            {SHAPE_LABELS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setShape(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium",
            "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
                  activeShape(state) === id
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
