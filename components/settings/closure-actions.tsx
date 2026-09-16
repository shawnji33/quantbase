"use client"

// The flows that clear a closure prerequisite, plus the cancel-closure confirm.
// Each is transactional and returns the user to the request screen, so they're
// modals rather than pages — the list stays on screen behind them as the thing
// being made progress against.
//
// Sell-all and withdraw-all used to live here. Support liquidates the account
// now, so the user never places those orders themselves; the dialogs are in git
// history (pre-2026-09-15) if a standalone sell flow is ever wanted.

import { useState } from "react"
import { RiLoader4Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usd } from "@/lib/portfolio"
import { AUTO_INVEST, INCOMING_DEPOSIT } from "@/lib/account-closure"

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

function SubmitButton({
  busy,
  label,
  pendingLabel,
  onClick,
}: {
  busy: boolean
  label: string
  pendingLabel: string
  onClick: () => void
}) {
  return (
    <Button onClick={onClick} disabled={busy}>
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
            {`${usd(INCOMING_DEPOSIT.amount)} from ${INCOMING_DEPOSIT.from} is on its way in. We'll stop it before it lands, and the money stays in your bank.`}
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
            {`Your ${usd(AUTO_INVEST.amount)} ${AUTO_INVEST.cadence} investment stops. Without this, it would buy back into strategies while we're closing your account.`}
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
            We&apos;ll stop the closure and your account stays open. If we&apos;ve already started
            selling, we&apos;ll email you about what&apos;s left — anything sold stays as cash.
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
