"use client"

// Security. The two-factor toggle reflects real state and nothing else — it
// doesn't optimistically flip, and the secret is never on screen until the
// person actively starts setup. Turning it off is confirmed, because it's a
// downgrade you shouldn't be able to do by mis-tapping.

import { useEffect, useRef, useState } from "react"
import {
  RiAlertLine,
  RiCheckLine,
  RiComputerLine,
  RiFileCopyLine,
  RiLoader4Line,
  RiSmartphoneLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { PASSWORD_UPDATED, SECTIONS, SESSIONS } from "@/lib/settings"
import { useAsyncAction, useSettings } from "@/components/settings/settings-context"
import {
  Card,
  CardSection,
  ConfirmDialog,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/settings/settings-ui"
import { useDialogParam } from "@/components/settings/use-dialog-param"

// Only generated when setup is actually running.
const MFA_SECRET = "JBSW Y3DP EHPK 3PXP"
const CODE_LENGTH = 6

/* ---------------------------------- QR ------------------------------------- */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A stand-in for the real enrolment QR. Deterministic so it doesn't shimmer
// between renders.
function QrPlaceholder() {
  const n = 21
  const rand = mulberry32(9)
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)

  const cells: React.ReactNode[] = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const on = rand() > 0.5
      if (inFinder(x, y) || !on) continue
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#363643" />)
    }
  }

  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox} y={oy} width="7" height="7" fill="#363643" />
      <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width="3" height="3" fill="#363643" />
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      role="img"
      aria-label="Enrolment QR code for your authenticator app"
      className="size-40 shrink-0 rounded-lg bg-white p-1 ring-1 ring-[var(--border-secondary)]"
      shapeRendering="crispEdges"
    >
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  )
}

/* ------------------------------ MFA setup flow ----------------------------- */

function MfaSetupDialog({
  open,
  onOpenChange,
  onEnabled,
  initialStep = "scan",
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onEnabled: () => void
  initialStep?: "scan" | "verify"
}) {
  const [step, setStep] = useState<"scan" | "verify">(initialStep)
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [copied, setCopied] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const { status, run, reset } = useAsyncAction()

  const complete = code.every((c) => c !== "")

  useEffect(() => {
    if (open) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset on close */
    setStep(initialStep)
    setCode(Array(CODE_LENGTH).fill(""))
    setCopied(false)
    reset()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, reset, initialStep])

  useEffect(() => {
    if (step !== "verify") return
    const t = window.setTimeout(() => inputs.current[0]?.focus(), 80)
    return () => window.clearTimeout(t)
  }, [step])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "scan" ? "Set up two-factor" : "Enter the code"}
          </DialogTitle>
          <DialogDescription>
            {step === "scan"
              ? "Scan this with Google Authenticator, 1Password, or any authenticator app."
              : "Enter the 6-digit code your authenticator app is showing."}
          </DialogDescription>
        </DialogHeader>

        {step === "scan" ? (
          <div className="flex flex-col items-center gap-4">
            <QrPlaceholder />
            <div className="flex w-full flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">Can&apos;t scan? Enter this key:</p>
              <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-3.5 py-2.5">
                <span className="flex-1 font-mono text-sm tracking-wide text-[#363643]">
                  {MFA_SECRET}
                </span>
                <button
                  type="button"
                  aria-label="Copy setup key"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(MFA_SECRET.replace(/\s/g, ""))
                      setCopied(true)
                    } catch {
                      /* clipboard unavailable — the key is selectable */
                    }
                  }}
                  className="relative flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 ease-out before:absolute before:-inset-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {copied ? (
                    <RiCheckLine className="size-4 text-[#1d7e4f]" />
                  ) : (
                    <RiFileCopyLine className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  value={digit}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus()
                  }}
                  onFocus={(e) => e.target.select()}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    "h-12 w-full rounded-lg border bg-card text-center text-lg font-semibold tabular-nums text-[#363643] shadow-[var(--shadow-card)] outline-none transition-[color,border-color,box-shadow] duration-150 ease-out",
                    digit ? "border-primary/40" : "border-[var(--border-secondary)]",
                    "focus:border-primary/60 focus:ring-3 focus:ring-primary/10"
                  )}
                />
              ))}
            </div>
            {status === "error" && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-[10px] bg-[#d92d20]/8 px-3.5 py-2.5 text-xs leading-5 text-[#d92d20]"
              >
                <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
                That code didn&apos;t match. Check your app and try again.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "scan" ? (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("verify")}>Continue</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep("scan")} disabled={status === "working"}>
                Back
              </Button>
              <Button
                disabled={!complete || status === "working"}
                onClick={() =>
                  run(() => {
                    onEnabled()
                    onOpenChange(false)
                  })
                }
              >
                {status === "working" ? (
                  <>
                    <RiLoader4Line className="size-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------- panel ----------------------------------- */

export function SecurityPanel() {
  const { settings, update } = useSettings()
  const [setupOpen, setSetupOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [signedOut, setSignedOut] = useState<string[]>([])
  const [signingOut, setSigningOut] = useState<string | null>(null)

  const disable = useAsyncAction()
  const reset = useAsyncAction()
  const dialogParam = useDialogParam()

  // ?dialog=mfa-setup|mfa-verify|mfa-disable
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time deep link */
    if (dialogParam === "mfa-setup" || dialogParam === "mfa-verify") setSetupOpen(true)
    if (dialogParam === "mfa-disable") setDisableOpen(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [dialogParam])

  const mfa = settings.mfaEnabled

  function signOut(id: string) {
    setSigningOut(id)
    window.setTimeout(() => {
      setSignedOut((s) => [...s, id])
      setSigningOut(null)
    }, 700)
  }

  return (
    <Panel>
      <PanelHeader
        title={SECTIONS.security.title}
        blurb={SECTIONS.security.blurb}
        status={
          <StatusPill tone={mfa ? "good" : "warn"}>
            {mfa ? "Two-factor on" : "Two-factor off"}
          </StatusPill>
        }
      />

      <Card>
        <CardSection
          title="Two-factor authentication"
          description={
            mfa
              ? "You'll enter a code from your authenticator app when you sign in."
              : "Add a code from an authenticator app on top of your password."
          }
          action={
            <Switch
              checked={mfa}
              // Never flips optimistically: the switch shows what's true, and
              // the dialog decides whether it changes.
              onCheckedChange={(next) => (next ? setSetupOpen(true) : setDisableOpen(true))}
              aria-label="Two-factor authentication"
            />
          }
        />

        <div className="border-t border-[var(--border-secondary)]" />

        <CardSection
          title="Password"
          description={`Last changed ${PASSWORD_UPDATED}.`}
          action={
            <div className="flex shrink-0 items-center gap-2.5">
              {reset.status === "done" && (
                <span className="flex animate-in items-center gap-1.5 text-xs font-medium text-[#1d7e4f] fade-in duration-200">
                  <RiCheckLine className="size-3.5" />
                  Link sent
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                disabled={reset.status === "working"}
                onClick={() => reset.run()}
              >
                {reset.status === "working" ? (
                  <>
                    <RiLoader4Line className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </div>
          }
        >
          {reset.status === "error" && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[10px] bg-[#d92d20]/8 px-3.5 py-2.5 text-xs leading-5 text-[#d92d20]"
            >
              <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
              We couldn&apos;t send the link. Try again in a moment.
            </p>
          )}
        </CardSection>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="px-1 text-xs font-medium tracking-[0.3px] text-muted-foreground">
          Where you&apos;re signed in
        </h3>
        <Card>
          <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
            {SESSIONS.map((s) => {
              const gone = signedOut.includes(s.id)
              const Icon = s.device.includes("iOS") || s.device.includes("iPhone") ? RiSmartphoneLine : RiComputerLine
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3.5 px-5 py-4 transition-opacity duration-200",
                    gone && "opacity-45"
                  )}
                >
                  <Icon className="size-4.5 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-medium text-[#363643]">{s.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.where} · {gone ? "Signed out" : s.when}
                    </p>
                  </div>
                  {s.current ? (
                    <StatusPill tone="good">This device</StatusPill>
                  ) : gone ? null : (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={signingOut === s.id}
                      onClick={() => signOut(s.id)}
                    >
                      {signingOut === s.id ? (
                        <RiLoader4Line className="size-4 animate-spin" />
                      ) : (
                        "Sign out"
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <MfaSetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        onEnabled={() => update({ mfaEnabled: true })}
        initialStep={dialogParam === "mfa-verify" ? "verify" : "scan"}
      />

      <ConfirmDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title="Turn off two-factor?"
        description="Your account will be protected by your password alone. You can turn it back on at any time."
        confirmLabel="Turn off"
        cancelLabel="Keep it on"
        destructive
        status={disable.status}
        onConfirm={() =>
          disable.run(() => {
            update({ mfaEnabled: false })
            setDisableOpen(false)
          })
        }
      />
    </Panel>
  )
}
