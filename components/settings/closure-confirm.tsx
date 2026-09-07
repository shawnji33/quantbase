"use client"

// Final confirmation. Three things happen here and the order matters: the
// Quiver acknowledgment (the one item carrying legal weight), an optional
// reason, then email-code verification — stronger than typing "CLOSE" for an
// irreversible financial action, and a pattern the app already uses at signup.

import { useEffect, useRef, useState } from "react"
import { RiCheckLine, RiErrorWarningLine, RiFileCopyLine, RiLoader4Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { BackLink, Card, SettingsPage } from "@/components/settings/bits"
import { USER } from "@/components/app-shell"
import { CLOSE_REASONS, QUIVER_EMAIL } from "@/lib/account-closure"

const AMBER = "#B45309"
const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60

export function ClosureConfirm({
  onBack,
  onConfirm,
}: {
  onBack: () => void
  onConfirm: (reason: string | null) => void
}) {
  const [ack, setAck] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [copied, setCopied] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [busy, setBusy] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const codeComplete = code.every((c) => c !== "")
  const canSubmit = ack && codeComplete && !busy

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearInterval(t)
  }, [cooldown])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  function setDigit(i: number, raw: string) {
    const digits = raw.replace(/\D/g, "")
    if (!digits) {
      setCode((c) => c.map((v, j) => (j === i ? "" : v)))
      return
    }
    setCode((c) => {
      const next = [...c]
      digits.split("").forEach((d, k) => {
        if (i + k < CODE_LENGTH) next[i + k] = d
      })
      return next
    })
    inputs.current[Math.min(i + digits.length, CODE_LENGTH - 1)]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(QUIVER_EMAIL)
      setCopied(true)
    } catch {
      /* clipboard unavailable — the address is selectable on the page */
    }
  }

  function submit() {
    if (!canSubmit) return
    setBusy(true)
    window.setTimeout(() => onConfirm(reason), 1100)
  }

  return (
    <SettingsPage>
      <BackLink onClick={onBack} label="Back to checklist" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          Confirm you want to close
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Your balance is $0.00 and nothing is left to sell. Closing removes your Quantbase account
          and your brokerage account at Alpaca.
        </p>
      </div>

      {/* Quiver acknowledgment — shown to everyone, because holdings data can't
          see users who held a Quiver strategy in the past and still pay for it. */}
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#E8B84E]/45 bg-[#E8B84E]/10 p-5">
        <div className="flex items-center gap-2">
          <RiErrorWarningLine className="size-4.5 shrink-0" style={{ color: AMBER }} />
          <h2 className="text-sm font-semibold" style={{ color: AMBER }}>
            Quiver subscriptions
          </h2>
        </div>
        <p className="text-sm leading-6 text-[#47475d]">
          If you were invested in a Quiver strategy, that subscription is billed by Quiver, not
          Quantbase. Closing this account does not cancel it. Email {QUIVER_EMAIL} to cancel your
          Quiver subscription.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`mailto:${QUIVER_EMAIL}?subject=Cancel%20my%20Quiver%20subscription`}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-[#47475d] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)]"
          >
            Email Quiver
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-[#47475d] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)]"
          >
            {copied ? (
              <>
                <RiCheckLine className="size-4 text-[#1d7e4f]" />
                Copied
              </>
            ) : (
              <>
                <RiFileCopyLine className="size-4" />
                {QUIVER_EMAIL}
              </>
            )}
          </button>
        </div>

        <label className="mt-1 flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-[#E8B84E]/45 bg-white/70 px-3.5 py-3">
          <Checkbox
            checked={ack}
            onCheckedChange={(v) => setAck(v === true)}
            className="mt-0.5"
            aria-label="Acknowledge Quiver subscription"
          />
          <span className="text-sm leading-6 text-[#363643]">
            I understand I need to contact Quiver myself to cancel my subscription.
          </span>
        </label>
      </div>

      {/* optional reason */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2 px-1">
          <h2 className="text-sm font-medium text-[#363643]">Why are you closing?</h2>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CLOSE_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(reason === r ? null : r)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                reason === r
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-[var(--border-secondary)] bg-card text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* email verification */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-[#363643]">Confirm it&apos;s you</h2>
          <p className="text-xs leading-5 text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#363643]">{USER.email}</span>.
          </p>
        </div>

        <div className="flex justify-between gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              className={cn(
                "h-12 w-full rounded-lg border bg-card text-center text-lg font-semibold tabular-nums text-[#363643] shadow-[var(--shadow-card)] outline-none transition-all duration-150",
                digit ? "border-primary/40" : "border-[var(--border-secondary)]",
                "focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
              )}
            />
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Didn&apos;t get it?{" "}
          {cooldown > 0 ? (
            <span className="tabular-nums">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => setCooldown(RESEND_COOLDOWN)}
              className="font-medium text-primary hover:underline"
            >
              Resend code
            </button>
          )}
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={submit}
          className="w-full bg-[#d92d20] hover:bg-[#b42318]"
        >
          {busy ? (
            <>
              <RiLoader4Line className="size-4 animate-spin" />
              Closing your account…
            </>
          ) : (
            "Close my account"
          )}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {!ack
            ? "Confirm the Quiver notice above to continue."
            : !codeComplete
              ? "Enter the code we emailed you to continue."
              : "You can still cancel this while it's in progress."}
        </p>
      </div>
    </SettingsPage>
  )
}
