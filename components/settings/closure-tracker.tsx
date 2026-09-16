"use client"

// Closure requested — the status page for a closure our support team is running.
//
// The user has handed off a real amount of money, so this screen's job is to
// say who has it, where it's going, and when it lands. It borrows the step and
// status grammar from the approval tracker so nothing new gets invented.
//
// Unlike the first build, nothing has been sold at the moment this appears. The
// cancel copy says so rather than implying a rollback we may not be able to
// perform once the desk has started.

import { useEffect, useState } from "react"
import { RiCheckLine, RiMailLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, ClosurePage } from "@/components/settings/bits"
import { CancelClosureDialog } from "@/components/settings/closure-actions"
import { usd } from "@/lib/portfolio"
import {
  CLOSE_DELAY_MS,
  CLOSURE_ETA,
  formatStamp,
  snapshot,
  type ClosureState,
} from "@/lib/account-closure"
import { useDialogParam } from "@/components/settings/use-dialog-param"

type StepState = "done" | "current" | "todo"

export function ClosureTracker({
  state,
  onCancel,
  onComplete,
}: {
  state: ClosureState
  onCancel: () => void
  onComplete: () => void
}) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const dialogParam = useDialogParam()
  const snap = snapshot(state)

  useEffect(() => {
    if (dialogParam !== "cancel-closure") return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time deep link
    setCancelOpen(true)
  }, [dialogParam])

  // The prototype compresses the real multi-day wait so the terminal state is
  // reachable in review. The copy still states the real timing.
  useEffect(() => {
    const t = window.setTimeout(onComplete, CLOSE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [onComplete])

  const steps: { title: string; detail: string; state: StepState }[] = [
    {
      title: "Request received",
      detail: formatStamp(state.requestedAt) || "Just now",
      state: "done",
    },
    {
      title: "We're closing out your investments",
      detail: snap.payoutBank
        ? `Our team is selling your ${snap.positionCount} strategies and sending the money to ${snap.payoutBank}.`
        : `Our team is selling your ${snap.positionCount} strategies and sending the money to your linked bank.`,
      state: "current",
    },
    {
      title: "Account closed",
      detail: `Usually within ${CLOSURE_ETA} from your request.`,
      state: "todo",
    },
  ]

  return (
    <ClosurePage className="max-w-xl py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Closing
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          Your account is closing
        </h1>
        <p className="flex max-w-md items-center gap-2 text-sm leading-6 text-muted-foreground">
          <RiMailLine className="size-4 shrink-0" />
          We&apos;ll email you when your money is on its way, and again when it&apos;s done.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-3.5">
              {/* rail */}
              <div className="flex flex-col items-center">
                {step.state === "done" ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1d7e4f]/12 text-[#1d7e4f]">
                    <RiCheckLine className="size-3.5" />
                  </span>
                ) : step.state === "current" ? (
                  <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative size-2 rounded-full bg-primary" />
                  </span>
                ) : (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-secondary)] bg-[#f5f6f7]" />
                )}
                {i < steps.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-[var(--border-secondary)]" />
                )}
              </div>

              <div className={cn("flex flex-col gap-0.5 pb-5", i === steps.length - 1 && "pb-0")}>
                <p className="flex items-center gap-2 text-sm font-medium text-[#363643]">
                  {step.title}
                  {step.state === "current" && (
                    <span className="text-xs font-medium text-primary">In progress</span>
                  )}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* The balance is still invested and still visible on the dashboard, so
          naming the amount here keeps the two surfaces telling one story. */}
      <Card className="flex items-baseline justify-between gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-[#363643]">Closing out</p>
          <p className="text-xs leading-5 text-muted-foreground">
            {snap.positionCount} strategies plus {usd(snap.cash)} in cash
          </p>
        </div>
        <p className="text-base font-medium tabular-nums text-[#363643]">{usd(snap.total)}</p>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-[#363643]">Changed your mind?</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Cancel and your account stays open. Nothing has been sold yet, though if we&apos;ve
            already started you may end up holding cash instead of strategies.
          </p>
        </div>
        <Button variant="secondary" className="w-fit" onClick={() => setCancelOpen(true)}>
          Cancel closure
        </Button>
      </Card>

      <CancelClosureDialog open={cancelOpen} onOpenChange={setCancelOpen} onConfirm={onCancel} />
    </ClosurePage>
  )
}
