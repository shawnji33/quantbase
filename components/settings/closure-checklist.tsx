"use client"

// The closure readiness checklist.
//
// The gates are a dependency chain, so this renders as a numbered sequence with
// exactly one row actionable at a time. Rows further down say what they're
// waiting on instead of showing a disabled button — a control the user can
// never press reads as broken. The settlement row is the one nobody expects:
// it's time, not action, so it says so out loud.

import { useEffect, useState } from "react"
import { RiCheckLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BackLink, Card, SettingsPage } from "@/components/settings/bits"
import {
  CancelDepositDialog,
  SellAllDialog,
  TurnOffAutoDialog,
  WithdrawAllDialog,
} from "@/components/settings/closure-actions"
import {
  INCOMING_DEPOSIT,
  SETTLE_DELAY_MS,
  gatesFor,
  snapshot,
  type ClosureState,
  type GateAction,
  type GateStatus,
} from "@/lib/account-closure"

function Marker({ n, status }: { n: number; status: GateStatus }) {
  if (status === "done")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1d7e4f]/12 text-[#1d7e4f]">
        <RiCheckLine className="size-3.5" />
      </span>
    )
  if (status === "waiting")
    return (
      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative size-2 rounded-full bg-primary" />
      </span>
    )
  if (status === "current")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium tabular-nums text-primary-foreground">
        {n}
      </span>
    )
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-secondary)] bg-[#f5f6f7] text-xs font-medium tabular-nums text-[#b4b5c5]">
      {n}
    </span>
  )
}

export function ClosureChecklist({
  state,
  update,
  onContinue,
}: {
  state: ClosureState
  update: (patch: Partial<ClosureState>) => void
  onContinue: () => void
}) {
  const [action, setAction] = useState<GateAction | null>(null)

  const gates = gatesFor(state)
  const snap = snapshot(state)
  const done = gates.filter((g) => g.status === "done").length
  const ready = done === gates.length

  // Settlement is the one gate the user can't act on. The prototype compresses
  // the real T+1 wait so the state is reviewable, and the copy states the real
  // timing.
  useEffect(() => {
    if (!state.sold || state.settled) return
    const t = window.setTimeout(() => update({ settled: true }), SETTLE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [state.sold, state.settled, update])

  return (
    <SettingsPage>
      <BackLink href="/settings/account" label="Account" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          {ready ? "You're ready to close" : "Close your Quantbase account"}
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          {ready
            ? "Everything is cleared and your balance is $0.00. One last confirmation and we'll start closing your account."
            : "A few things have to happen before we can close it. We'll walk you through them in order, and you can leave and come back at any point."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
            Before you close
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {done} of {gates.length} done
          </p>
        </div>

        <Card>
          <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
            {gates.map((gate, i) => (
              <div
                key={gate.id}
                className={cn(
                  "flex items-start gap-3.5 px-5 py-4 transition-opacity duration-200",
                  gate.status === "locked" && "opacity-55"
                )}
              >
                <Marker n={i + 1} status={gate.status} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium text-[#363643]",
                      gate.status === "done" && "text-[#47475d]"
                    )}
                  >
                    {gate.title}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">{gate.detail}</p>
                </div>
                {gate.status === "current" && gate.action && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => setAction(gate.action)}
                  >
                    {gate.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" disabled={!ready} onClick={onContinue} className="w-full">
          Continue to close account
        </Button>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">
            Nothing closes until every step above is done.
          </p>
        )}
      </div>

      <SellAllDialog
        open={action === "sell"}
        onOpenChange={(v) => !v && setAction(null)}
        onConfirm={() => update({ sold: true })}
      />
      <WithdrawAllDialog
        open={action === "withdraw"}
        onOpenChange={(v) => !v && setAction(null)}
        onConfirm={() => update({ withdrawn: true })}
        amount={snap.settledCash}
        bank={INCOMING_DEPOSIT.from}
      />
      <CancelDepositDialog
        open={action === "cancel-deposit"}
        onOpenChange={(v) => !v && setAction(null)}
        onConfirm={() => update({ depositCancelled: true })}
      />
      <TurnOffAutoDialog
        open={action === "turn-off-auto"}
        onOpenChange={(v) => !v && setAction(null)}
        onConfirm={() => update({ autoInvestOff: true })}
      />
    </SettingsPage>
  )
}
