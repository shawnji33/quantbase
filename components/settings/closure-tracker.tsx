"use client"

// Closure requested. Takes over the dashboard the way PendingApproval does, and
// borrows the same step/status grammar so nothing new gets invented.
//
// The cancel copy is deliberately honest that cancelling restores the account
// but not the portfolio — the investments are already sold. Implying a rollback
// we can't perform is how this becomes a support escalation.

import { useEffect, useState } from "react"
import { RiCheckLine, RiMailLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, ClosurePage } from "@/components/settings/bits"
import { CancelClosureDialog } from "@/components/settings/closure-actions"
import { CLOSE_DELAY_MS, formatStamp } from "@/lib/account-closure"

type StepState = "done" | "current" | "todo"

export function ClosureTracker({
  requestedAt,
  onCancel,
  onComplete,
}: {
  requestedAt: string | null
  onCancel: () => void
  onComplete: () => void
}) {
  const [cancelOpen, setCancelOpen] = useState(false)

  // The prototype compresses the real 1–3 business day wait so the terminal
  // state is reachable in review. The copy still states the real timing.
  useEffect(() => {
    const t = window.setTimeout(onComplete, CLOSE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [onComplete])

  const steps: { title: string; detail: string; state: StepState }[] = [
    {
      title: "Closure requested",
      detail: formatStamp(requestedAt) || "Just now",
      state: "done",
    },
    {
      title: "Final review",
      detail: "We're confirming your balance is settled and closing your brokerage account.",
      state: "current",
    },
    {
      title: "Account closed",
      detail: "Usually within 1 to 3 business days.",
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
          We&apos;ll email you the moment it&apos;s done.
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

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-[#363643]">Changed your mind?</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            Cancel and your account stays open. Your investments are already sold, so you&apos;d be
            starting from cash.
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
