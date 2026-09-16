"use client"

// The closure request screen.
//
// The user does two things here: clear anything still moving money into the
// account, and read what we're about to do with the balance. The liquidation
// itself is ours — submitting sends an approved request to support, who sell the
// positions, confirm nothing was missed, and close the brokerage account.
//
// That's why the second card exists. Handing a task to someone else is only
// reassuring if the user can see exactly what was handed over, so the summary
// states the balance, the destination, and how long it takes before they commit
// to anything.

import { useEffect, useState } from "react"
import { RiCheckLine, RiTimeLine } from "@remixicon/react"

import { useDialogParam } from "@/components/settings/use-dialog-param"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BackLink, Card, ClosurePage } from "@/components/settings/bits"
import {
  CancelDepositDialog,
  TurnOffAutoDialog,
} from "@/components/settings/closure-actions"
import { PlaidDialog } from "@/components/onboarding/bank-funding"
import { usd } from "@/lib/portfolio"
import {
  CLOSURE_ETA,
  gatesFor,
  snapshot,
  type ClosureState,
  type GateAction,
} from "@/lib/account-closure"

function Marker({ done }: { done: boolean }) {
  if (done)
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1d7e4f]/12 text-[#1d7e4f]">
        <RiCheckLine className="size-3.5" />
      </span>
    )
  return (
    <span className="mt-px flex size-6 shrink-0 items-center justify-center">
      <span className="size-3.5 rounded-full border-[1.5px] border-[#c9cad6]" />
    </span>
  )
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <p className="text-sm text-[#47475d]">{label}</p>
      <p className="text-sm font-medium tabular-nums text-[#363643]">{value}</p>
    </div>
  )
}

export function ClosureRequest({
  state,
  update,
  onContinue,
}: {
  state: ClosureState
  update: (patch: Partial<ClosureState>) => void
  onContinue: () => void
}) {
  const [action, setAction] = useState<GateAction | null>(null)
  const dialogParam = useDialogParam()

  // ?dialog=cancel-deposit|turn-off-auto|link-bank opens that row's modal.
  useEffect(() => {
    const allowed: GateAction[] = ["cancel-deposit", "turn-off-auto", "link-bank"]
    if (!dialogParam || !allowed.includes(dialogParam as GateAction)) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time deep link
    setAction(dialogParam as GateAction)
  }, [dialogParam])

  const gates = gatesFor(state)
  const snap = snapshot(state)
  const done = gates.filter((g) => g.status === "done").length
  const ready = done === gates.length

  return (
    <ClosurePage>
      <BackLink href="/settings/account" label="Account" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          Close your Quantbase account
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          {ready
            ? "Send us the request and our team takes it from there. You don't have to sell anything or move your money yourself."
            : "First turn off anything still moving money into your account. Then send us the request and our team takes it from there."}
        </p>
      </div>

      {gates.length > 0 && (
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
              {gates.map((gate) => (
                <div key={gate.id} className="flex items-start gap-3.5 px-5 py-4">
                  <Marker done={gate.status === "done"} />
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
                  {gate.status === "todo" && (
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
      )}

      <div className="flex flex-col gap-3">
        <p className="px-1 text-xs font-medium tracking-[0.3px] text-muted-foreground">
          What happens when you submit
        </p>

        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-2.5">
            <SummaryRow
              label={`Your investments (${snap.positionCount} ${snap.positionCount === 1 ? "strategy" : "strategies"})`}
              value={usd(snap.positionsValue)}
            />
            <SummaryRow label="Cash" value={usd(snap.cash)} />
            <div className="h-px bg-[var(--border-secondary)]" />
            <SummaryRow
              label="Goes to"
              value={snap.payoutBank ?? <span className="text-muted-foreground">No bank linked</span>}
            />
          </div>

          <p className="text-sm leading-6 text-[#47475d]">
            We sell every position, wait for the trades to settle, and send the full balance to{" "}
            {snap.payoutBank ?? "your linked bank account"}. Someone on our team checks the account
            first, so anything still open gets caught before it closes.
          </p>

          <p className="flex items-start gap-2 rounded-[10px] bg-[#f5f6f7] px-3.5 py-3 text-xs leading-5 text-muted-foreground">
            <RiTimeLine className="mt-0.5 size-4 shrink-0" />
            Most closures finish within {CLOSURE_ETA}. We&apos;ll email you when the money is on its
            way and again when the account is closed.
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" disabled={!ready} onClick={onContinue} className="w-full">
          Continue to close account
        </Button>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">
            Nothing is sold or closed until every step above is done.
          </p>
        )}
      </div>

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
      {/* The same Plaid flow onboarding uses — a payout destination added here
          has to be as real as one added there. Mounted only while it's open:
          react-plaid-link injects Plaid's script as soon as it mounts, and most
          people closing an account already have a bank and never open this. */}
      {action === "link-bank" && (
        <PlaidDialog
          open
          onOpenChange={(v) => !v && setAction(null)}
          onLinked={(label) => {
            update({ bankLabel: label })
            setAction(null)
          }}
        />
      )}
    </ClosurePage>
  )
}
