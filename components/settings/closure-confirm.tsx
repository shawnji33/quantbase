"use client"

// Final confirmation, as a three-step modal.
//
// These three asks are unrelated to each other — a legal acknowledgment, an
// optional research question, and an identity check — so stacking them on one
// page made the required parts compete with the optional one. Split into steps,
// each screen has exactly one job and the Quiver notice gets read instead of
// scrolled past.
//
// Modal rather than a page because it's transactional: the user is mid-decision
// and the checklist they're acting on stays visible behind it.

import { useEffect, useRef, useState } from "react"
import { RiArrowLeftSLine, RiErrorWarningLine, RiFileCopyLine, RiCheckLine, RiLoader4Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { USER } from "@/components/app-shell"
import { CLOSE_REASONS, QUIVER_EMAIL } from "@/lib/account-closure"

const AMBER = "#B45309"
const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60

// The free-text bucket. An "other" option with nowhere to write is a survey
// answer that collects nothing.
const OTHER = "Something else"

const STEPS = ["quiver", "reason", "verify"] as const
type Step = (typeof STEPS)[number]

// Same remount-and-slide idiom as the onboarding flow (shells.tsx).
function stepAnim(dir: 1 | -1) {
  return cn(
    "animate-in fade-in duration-300 ease-out",
    dir === 1 ? "slide-in-from-right-6" : "slide-in-from-left-6"
  )
}

export function ClosureConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (reason: string | null) => void
}) {
  const [step, setStep] = useState<Step>("quiver")
  const [dir, setDir] = useState<1 | -1>(1)
  const [ack, setAck] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [detail, setDetail] = useState("")
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [copied, setCopied] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [busy, setBusy] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  // Callback ref, not useRef: Radix mounts the dialog body a tick after `open`
  // flips, so an effect keyed on `open` would measure a null node and leave the
  // first step unmeasured (making step 1 → 2 jump instead of animate).
  const [bodyNode, setBodyNode] = useState<HTMLDivElement | null>(null)
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined)

  const index = STEPS.indexOf(step)
  const codeComplete = code.every((c) => c !== "")

  // Reopening starts clean — a half-filled code from an abandoned attempt
  // shouldn't carry over into a new decision.
  useEffect(() => {
    if (open) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset on close */
    setStep("quiver")
    setDir(1)
    setAck(false)
    setReason(null)
    setDetail("")
    setCode(Array(CODE_LENGTH).fill(""))
    setCooldown(RESEND_COOLDOWN)
    setBusy(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open])

  useEffect(() => {
    if (step !== "verify" || cooldown <= 0) return
    const t = window.setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearInterval(t)
  }, [step, cooldown])

  // The three steps are different heights. Measuring the active one and
  // animating to it beats a fixed min-height, which left the short middle step
  // sitting in a pool of dead space.
  useEffect(() => {
    if (!bodyNode) return
    const sync = () => setBodyHeight(bodyNode.scrollHeight)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(bodyNode)
    return () => ro.disconnect()
  }, [bodyNode, step, reason])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  // Land the caret in the first digit box rather than on the Back button.
  useEffect(() => {
    if (step !== "verify") return
    const t = window.setTimeout(() => inputs.current[0]?.focus(), 80)
    return () => window.clearTimeout(t)
  }, [step])

  function go(next: Step) {
    setDir(STEPS.indexOf(next) > index ? 1 : -1)
    setStep(next)
  }

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
      /* clipboard unavailable — the address is selectable on screen */
    }
  }

  function submit() {
    if (!codeComplete || busy) return
    setBusy(true)
    const answer =
      reason === OTHER && detail.trim() ? `${OTHER}: ${detail.trim()}` : reason
    window.setTimeout(() => onConfirm(answer), 1100)
  }

  const titles: Record<Step, { title: string; description: string }> = {
    quiver: {
      title: "Quiver subscriptions",
      description: "One thing to know before we close your account.",
    },
    reason: {
      title: "Why are you closing?",
      description: "Optional, and it won't change anything about your closure.",
    },
    verify: {
      title: "Confirm it's you",
      description: `We sent a 6-digit code to ${USER.email}.`,
    },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-8">
          <p className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
            Step {index + 1} of {STEPS.length}
          </p>
          <DialogTitle>{titles[step].title}</DialogTitle>
          <DialogDescription>{titles[step].description}</DialogDescription>
        </DialogHeader>

        <div
          style={{ height: bodyHeight }}
          className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        >
          <div key={step} ref={setBodyNode} className={stepAnim(dir)}>
          {step === "quiver" && (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-3 rounded-[12px] border border-[#E8B84E]/45 bg-[#E8B84E]/10 p-4">
                <div className="flex items-center gap-2">
                  <RiErrorWarningLine className="size-4.5 shrink-0" style={{ color: AMBER }} />
                  <p className="text-sm font-semibold" style={{ color: AMBER }}>
                    Closing does not cancel Quiver
                  </p>
                </div>
                <p className="text-sm leading-6 text-[#47475d]">
                  If you were invested in a Quiver strategy, that subscription is billed by Quiver,
                  not Quantbase. Email {QUIVER_EMAIL} to cancel it.
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
                        Copy address
                      </>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-3.5 py-3">
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
          )}

          {step === "reason" && (
            <div className="flex flex-col gap-3">
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

              {reason === OTHER && (
                <textarea
                  autoFocus
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell us what happened, if you want to."
                  className="w-full resize-none rounded-lg border border-[var(--border-secondary)] bg-card px-3.5 py-2.5 text-sm leading-6 text-[#363643] shadow-[var(--shadow-card)] outline-none transition-all duration-150 placeholder:text-[#b4b5c5] focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
                />
              )}
            </div>
          )}

          {step === "verify" && (
            <div className="flex flex-col gap-4">
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

              <p className="rounded-[10px] bg-[#f5f6f7] px-3.5 py-3 text-xs leading-5 text-muted-foreground">
                This closes your Quantbase account and your brokerage account at Alpaca. You can
                still cancel while the closure is in progress.
              </p>
            </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {step === "quiver" ? (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => go(STEPS[index - 1])}
              disabled={busy}
            >
              <RiArrowLeftSLine className="size-4" />
              Back
            </Button>
          )}

          {step === "verify" ? (
            <Button
              onClick={submit}
              disabled={!codeComplete || busy}
              className="bg-[#d92d20] hover:bg-[#b42318]"
            >
              {busy ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  Closing…
                </>
              ) : (
                "Close my account"
              )}
            </Button>
          ) : (
            <Button onClick={() => go(STEPS[index + 1])} disabled={step === "quiver" && !ack}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
