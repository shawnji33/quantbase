"use client"

// The flows that clear a closure gate. Each is transactional and returns the
// user to the checklist, so they're modals rather than pages — the checklist
// stays on screen behind them as the thing being made progress against.

import { useState } from "react"
import { RiBankLine, RiErrorWarningLine, RiLoader4Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HELD_STRATEGIES, usd } from "@/lib/portfolio"
import { AUTO_INVEST, INCOMING_DEPOSIT } from "@/lib/account-closure"

const AMBER = "#B45309"

/* ------------------------------ shared plumbing ---------------------------- */

// Every action simulates a round trip so the button has a real pending state.
function useSubmit(onDone: () => void) {
  const [busy, setBusy] = useState(false)

  function run() {
    if (busy) return
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      onDone()
    }, 900)
  }

  return { busy, run }
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="flex gap-2 rounded-[10px] bg-[#E8B84E]/15 px-3.5 py-3 text-xs leading-5"
      style={{ color: AMBER }}
    >
      <RiErrorWarningLine className="size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

function SubmitButton({
  busy,
  label,
  pendingLabel,
  onClick,
  destructive,
}: {
  busy: boolean
  label: string
  pendingLabel: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      disabled={busy}
      className={destructive ? "bg-[#d92d20] hover:bg-[#b42318]" : undefined}
    >
      {busy ? (
        <>
          <RiLoader4Line className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}

/* --------------------------------- sell all -------------------------------- */

export function SellAllDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  const { busy, run } = useSubmit(() => {
    onOpenChange(false)
    onConfirm()
  })

  const total = HELD_STRATEGIES.reduce((sum, s) => sum + s.value, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell everything</DialogTitle>
          <DialogDescription>
            We&apos;ll place market orders for all {HELD_STRATEGIES.length} strategies. Selling is
            required before your account can close.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] p-2">
          {HELD_STRATEGIES.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-2 py-1.5">
              <span className="min-w-0 flex-1 truncate text-sm text-[#47475d]">{s.name}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-[#363643]">
                {usd(s.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-baseline justify-between border-t border-[var(--border-secondary)] pt-3">
          <span className="text-sm text-muted-foreground">Estimated proceeds</span>
          <span className="text-base font-medium tabular-nums text-[#363643]">{usd(total)}</span>
        </div>

        <Note>
          Market orders execute at the next market open, so the final amount depends on prices
          then. Proceeds take about one business day to settle before you can withdraw them.
        </Note>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Not yet
          </Button>
          <SubmitButton
            busy={busy}
            onClick={run}
            label="Sell everything"
            pendingLabel="Placing orders…"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------- withdraw all ------------------------------ */

export function WithdrawAllDialog({
  open,
  onOpenChange,
  onConfirm,
  amount,
  bank,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
  amount: number
  bank: string
}) {
  const { busy, run } = useSubmit(() => {
    onOpenChange(false)
    onConfirm()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw your cash</DialogTitle>
          <DialogDescription>
            Closing needs a zero balance, so this sends everything.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-lg font-medium tabular-nums text-[#363643]">{usd(amount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border-secondary)] pt-3">
            <span className="text-sm text-muted-foreground">To</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#363643]">
              <RiBankLine className="size-4 text-muted-foreground" />
              {bank}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border-secondary)] pt-3">
            <span className="text-sm text-muted-foreground">Arrives</span>
            <span className="text-sm font-medium text-[#363643]">In 1 to 3 business days</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <SubmitButton
            busy={busy}
            onClick={run}
            label={`Withdraw ${usd(amount)}`}
            pendingLabel="Sending…"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------- deposit / auto-invest ------------------------- */

export function CancelDepositDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  const { busy, run } = useSubmit(() => {
    onOpenChange(false)
    onConfirm()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel this deposit?</DialogTitle>
          <DialogDescription>
            {usd(INCOMING_DEPOSIT.amount)} from {INCOMING_DEPOSIT.from} is on its way in. We&apos;ll
            stop it before it lands, and the money stays in your bank.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Keep it
          </Button>
          <SubmitButton
            busy={busy}
            onClick={run}
            label="Cancel deposit"
            pendingLabel="Cancelling…"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TurnOffAutoDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  const { busy, run } = useSubmit(() => {
    onOpenChange(false)
    onConfirm()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Turn off auto-investments?</DialogTitle>
          <DialogDescription>
            Your {usd(AUTO_INVEST.amount)} {AUTO_INVEST.cadence} investment stops. Without this,
            we&apos;d buy back into strategies right after you sell them.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Leave it on
          </Button>
          <SubmitButton busy={busy} onClick={run} label="Turn off" pendingLabel="Turning off…" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------ cancel closure ----------------------------- */

export function CancelClosureDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  const { busy, run } = useSubmit(() => {
    onOpenChange(false)
    onConfirm()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keep your account open?</DialogTitle>
          <DialogDescription>
            We&apos;ll stop the closure and your account stays open. Your investments are already
            sold, so you&apos;d be starting from cash.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
            Continue closing
          </Button>
          <SubmitButton
            busy={busy}
            onClick={run}
            label="Keep my account"
            pendingLabel="Cancelling…"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
