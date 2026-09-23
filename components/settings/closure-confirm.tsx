"use client"

// Final confirmation, as a two-step modal.
//
// These asks are unrelated to each other — a legal acknowledgment and an
// optional research question — so stacking them on one page made the required
// part compete with the optional one. Split into steps, each screen has exactly
// one job and the Quiver notice gets read instead of scrolled past.
//
// The email-code step was dropped in the 2026-09-15 rework. Submitting no longer
// closes anything on its own: it opens a request a person reviews before a
// single share is sold, and the user can cancel the whole thing while it's in
// flight. A code in front of that is friction guarding a reversible step.
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
import {
  CLOSE_REASONS,
  CLOSURE_ETA,
  OTHER_REASON,
  QUIVER_EMAIL,
  REASON_PROMPTS,
} from "@/lib/account-closure"

const AMBER = "#B45309"

const STEPS = ["quiver", "reason"] as const
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
  initialStep = "quiver",
  initialReason = null,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (reason: string | null) => void
  // Review deep links can drop straight onto a later step, and onto a
  // pre-selected reason — the required-detail state is otherwise two clicks
  // deep and impossible to link to.
  initialStep?: Step
  initialReason?: string | null
}) {
  const [step, setStep] = useState<Step>(initialStep)
  const [dir, setDir] = useState<1 | -1>(1)
  const [ack, setAck] = useState(false)
  const [reason, setReason] = useState<string | null>(initialReason)
  const [detail, setDetail] = useState("")
  const [detailError, setDetailError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  // Callback ref, not useRef: Radix mounts the dialog body a tick after `open`
  // flips, so an effect keyed on `open` would measure a null node and leave the
  // first step unmeasured (making step 1 → 2 jump instead of animate).
  const [bodyNode, setBodyNode] = useState<HTMLDivElement | null>(null)
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined)
  const detailRef = useRef<HTMLTextAreaElement | null>(null)

  const index = STEPS.indexOf(step)
  // Every reason takes an optional note. "Something else" is the exception:
  // on its own it tells us nothing, so there the note is the answer.
  const detailRequired = reason === OTHER_REASON
  const detailMissing = detailRequired && !detail.trim()

  // Reopening starts clean — an abandoned attempt shouldn't carry its answers
  // into a new decision.
  useEffect(() => {
    if (open) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset on close */
    setStep(initialStep)
    setDir(1)
    setAck(false)
    setReason(initialReason)
    setDetail("")
    setDetailError(false)
    setBusy(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, initialStep, initialReason])

  // The two steps are different heights. Measuring the active one and
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

  function go(next: Step) {
    setDir(STEPS.indexOf(next) > index ? 1 : -1)
    setStep(next)
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(QUIVER_EMAIL)
      setCopied(true)
    } catch {
      /* clipboard unavailable — the address is selectable on screen */
    }
  }

  function pickReason(r: string) {
    const next = reason === r ? null : r
    setReason(next)
    setDetailError(false)
    // Deselecting drops the note with it — a detail with no reason attached is
    // an orphan. Switching between reasons keeps what was typed; throwing away
    // someone's sentence because they re-tapped a chip is worse than a prompt
    // that no longer matches.
    if (!next) setDetail("")
  }

  // The button stays live and explains itself on press. A submit that is
  // disabled for a reason the user can't see reads as broken, which is the same
  // rule the request screen's locked rows follow.
  function submit() {
    if (busy) return
    if (detailMissing) {
      setDetailError(true)
      detailRef.current?.focus()
      return
    }
    setBusy(true)
    const note = detail.trim()
    const answer = reason ? (note ? `${reason}: ${note}` : reason) : null
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
                    onClick={() => pickReason(r)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium",
                    "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
                      reason === r
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-[var(--border-secondary)] bg-card text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {reason && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="closure-detail"
                    className="text-xs font-medium text-[#47475d]"
                  >
                    {detailRequired ? "What happened?" : "Anything you'd add?"}
                    {!detailRequired && (
                      <span className="font-normal text-muted-foreground"> (optional)</span>
                    )}
                  </label>
                  <textarea
                    id="closure-detail"
                    ref={detailRef}
                    // Only the required field grabs focus. Pulling the caret out
                    // of the chip row every time someone taps a reason makes
                    // changing your mind harder than making it up.
                    autoFocus={detailRequired}
                    value={detail}
                    onChange={(e) => {
                      setDetail(e.target.value)
                      if (detailError) setDetailError(false)
                    }}
                    rows={3}
                    maxLength={500}
                    aria-required={detailRequired}
                    aria-invalid={detailError}
                    aria-describedby={detailError ? "closure-detail-error" : undefined}
                    placeholder={REASON_PROMPTS[reason] ?? "Tell us more."}
                    className={cn(
                      "w-full resize-none rounded-lg border bg-card px-3.5 py-2.5 text-sm leading-6 text-[#363643] shadow-[var(--shadow-card)] outline-none transition-[color,border-color,box-shadow] duration-150 ease-out placeholder:text-[#b4b5c5]",
                      detailError
                        ? "border-[#d92d20] focus:border-[#d92d20] focus:ring-3 focus:ring-[#d92d20]/10"
                        : "border-[var(--border-secondary)] focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
                    )}
                  />
                  {detailError && (
                    <p id="closure-detail-error" className="text-xs leading-5 text-[#d92d20]">
                      Tell us what happened, or pick one of the reasons above.
                    </p>
                  )}
                </div>
              )}

              <p className="rounded-[10px] bg-[#f5f6f7] px-3.5 py-3 text-xs leading-5 text-muted-foreground">
                This sends a closure request to our team. We sell your investments, send the money
                to your linked bank, and close your Quantbase and Alpaca accounts, usually within{" "}
                {CLOSURE_ETA}. You can cancel while it&apos;s in progress.
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

          {step === "reason" ? (
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-[#d92d20] hover:bg-[#b42318]"
            >
              {busy ? (
                <>
                  <RiLoader4Line className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send closure request"
              )}
            </Button>
          ) : (
            <Button onClick={() => go(STEPS[index + 1])} disabled={!ack}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
