"use client"

// Account-approval pieces for the dashboard. After onboarding, the brokerage
// application is under review. The user lands on a one-time "just applied"
// page (ReviewIntro), and from then on the dashboard itself carries the status
// (see pre-invest-dashboard.tsx), so waiting never means staring at a dead end.
//
// Status colors: brand purple = in progress/waiting, amber = action needed,
// green = completion, muted red = terminal rejection only. Never red for
// non-errors.

import { useEffect, useState } from "react"
import Link from "next/link"
import { RiArrowRightLine, RiArrowRightSLine, RiCheckLine, RiCloseLine, RiMailLine, RiUploadCloud2Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { FUNDING_PRESETS } from "@/lib/onboarding"
import { LinkedBankRow, PlaidDialog } from "@/components/onboarding/bank-funding"
import {
  DOCS_KEY,
  formatReceiptTime,
  type DocsReceipt,
} from "@/components/portfolio/verify-documents"

export type ApprovalVariant = "review" | "action"

export const AMBER = "#B45309"
export const SUPPORT_EMAIL = "support@getquantbase.com"

type StepState = "done" | "current" | "action" | "todo"

const STEPS: { title: string; detail: string }[] = [
  { title: "Application submitted", detail: "Your details and signed agreements are in." },
  { title: "Identity verification", detail: "Confirming your identity. This usually takes a few minutes." },
  { title: "Brokerage account approval", detail: "Alpaca Securities reviews and opens your account, usually within 1 business day." },
  { title: "Ready to invest", detail: "Your starting portfolio can go live." },
]

function stepStates(variant: ApprovalVariant, docsSubmitted: boolean): StepState[] {
  if (variant === "action") return ["done", "action", "todo", "todo"]
  // After a document re-submission, identity verification is back in review.
  if (docsSubmitted) return ["done", "current", "todo", "todo"]
  return ["done", "done", "current", "todo"]
}

// Submission receipt from the upload page, so returning users can see their
// documents were received and when.
export function useDocsReceipt(): DocsReceipt | null {
  const [receipt, setReceipt] = useState<DocsReceipt | null>(null)
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DOCS_KEY) ?? "null")
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time read
      if (saved?.at && Array.isArray(saved.docs)) setReceipt(saved)
    } catch {
      /* no receipt */
    }
  }, [])
  return receipt
}

/* ------------------------------ approval tracker ----------------------------- */
// The four-step list. Full-size on the intro page, and folded inside the
// dashboard's status card.

export function ApprovalTracker({
  variant,
  receipt,
}: {
  variant: ApprovalVariant
  receipt: DocsReceipt | null
}) {
  const docsSubmitted = receipt !== null && variant === "review"
  const states = stepStates(variant, docsSubmitted)

  return (
    <ol className="flex flex-col">
      {STEPS.map((step, i) => {
        const state = states[i]
        const last = i === STEPS.length - 1
        return (
          <li key={step.title} className="relative flex gap-3.5 pb-6 last:pb-0">
            {/* connector */}
            {!last && (
              <span
                aria-hidden
                className="absolute top-7 left-[13px] h-[calc(100%-1.9rem)] w-px"
                style={{ backgroundColor: state === "done" ? "#1d7e4f55" : "rgba(0,0,0,0.1)" }}
              />
            )}
            {/* marker */}
            <span
              className={cn(
                "z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                state === "done" && "border-transparent bg-[#1d7e4f] text-white",
                state === "current" && "border-transparent bg-primary text-white",
                state === "action" && "border-transparent bg-[#E8B84E] text-white",
                state === "todo" && "border-black/15 bg-white text-[#b4b5c5]",
              )}
            >
              {state === "done" ? (
                <RiCheckLine className="size-4" />
              ) : state === "current" ? (
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-white" />
                </span>
              ) : state === "action" ? (
                "!"
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "todo" ? "text-[#b4b5c5]" : "text-[#363643]",
                )}
              >
                {step.title}
                {state === "current" && (
                  <span className="ml-2 text-xs font-medium text-primary">In progress</span>
                )}
              </p>
              <p className={cn("text-sm leading-5", state === "todo" ? "text-[#b4b5c5]" : "text-muted-foreground")}>
                {state === "action"
                  ? "To finish verifying your identity, we need a few additional documents."
                  : docsSubmitted && i === 1 && receipt
                    ? `Documents received on ${formatReceiptTime(receipt.at)}. We're reviewing them now, and there's nothing else you need to do.`
                    : step.detail}
              </p>
              {state === "action" && (
                <Button size="sm" className="mt-2.5" asChild>
                  <Link href="/verify-documents">
                    <RiUploadCloud2Line className="size-4" />
                    Upload additional documents
                  </Link>
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------- just applied -------------------------------- */
// Shown once, right after the application is submitted. It confirms the
// submission and says what happens next, then hands off to the dashboard,
// which is where the user comes back to from then on.

export function ReviewIntro({ onContinue }: { onContinue: () => void }) {
  const receipt = useDocsReceipt()

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          In review
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-[#363643]">
          Your application is in
        </h1>
        <p className="flex max-w-md items-center gap-2 text-sm leading-6 text-muted-foreground">
          <RiMailLine className="size-4 shrink-0" />
          We&apos;ll email you the moment your account is approved.
        </p>
      </div>

      <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
        <ApprovalTracker variant="review" receipt={receipt} />
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <Button size="lg" className="w-full sm:w-auto" onClick={onContinue}>
          Go to your dashboard
          <RiArrowRightLine className="size-4" />
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          You can track your review, see how your strategies have performed, and fund your
          account from there.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------- shared rows --------------------------------- */

export function PortfolioPathRow({
  href,
  icon,
  title,
  body,
}: {
  href: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-[var(--border-secondary)] bg-white p-4 transition-all duration-150 hover:border-black/15"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#363643]">{title}</span>
        <span className="block text-sm leading-5 text-muted-foreground">{body}</span>
      </span>
      <RiArrowRightSLine className="size-4.5 shrink-0 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]" />
    </Link>
  )
}

/* --------------------------- fund from the dashboard -------------------------- */
// Two-stage dialog for users who skipped funding during onboarding: connect a
// bank via the same Plaid flow, then pick an amount. Chained so bank-connect
// and amount-picking never show at once.

export function FundAccountDialog({
  open,
  onOpenChange,
  onFunded,
  approved = false,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onFunded: (bankLabel: string, amount: number) => void
  approved?: boolean
}) {
  const [stage, setStage] = useState<"connect" | "amount">("connect")
  const [linkedBank, setLinkedBank] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [custom, setCustom] = useState("")

  function pickPreset(v: number) {
    setAmount(v)
    setCustom("")
  }

  function onCustom(raw: string) {
    const digits = raw.replace(/[^\d]/g, "").slice(0, 7)
    setCustom(digits)
    setAmount(digits ? Number(digits) : null)
  }

  if (stage === "connect") {
    return (
      <PlaidDialog
        key={String(open)} // remount on each open so the mock restarts fresh
        open={open}
        onOpenChange={onOpenChange}
        onLinked={(label) => {
          setLinkedBank(label)
          setStage("amount")
        }}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add your first deposit</DialogTitle>
          <DialogDescription>
            {approved
              ? "Bank transfers usually arrive in 1 to 3 business days."
              : "This transfer won't move until your account is approved. You can change or cancel it anytime before then."}
          </DialogDescription>
        </DialogHeader>
        {linkedBank && <LinkedBankRow label={linkedBank} />}
        <div className="flex flex-wrap gap-2">
          {FUNDING_PRESETS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={amount === v && !custom}
              onClick={() => pickPreset(v)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium tabular-nums transition-all duration-150",
                amount === v && !custom
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-black/10 bg-white text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]",
              )}
            >
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fund-now-amount">Or enter an amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="fund-now-amount"
              inputMode="numeric"
              placeholder="0"
              value={custom}
              onChange={(e) => onCustom(e.target.value)}
              className="pl-7 tabular-nums"
            />
          </div>
        </div>
        <Button
          size="lg"
          className="w-full"
          disabled={!amount}
          onClick={() => linkedBank && amount && onFunded(linkedBank, amount)}
        >
          {amount ? `Deposit $${amount.toLocaleString()}` : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------ rejected state ------------------------------ */

// Terminal state: Alpaca declined the application. There is no re-submission or
// re-application path, so everything actionable (uploads, portfolio, browsing)
// is stripped out — the only route forward is customer support.

const RED = "#B42318"

const REJECTED_STEPS: { title: string; detail: string; state: "done" | "rejected" }[] = [
  { title: "Application submitted", detail: "Your details and signed agreements were received.", state: "done" },
  { title: "Identity verification", detail: "Your identity was confirmed.", state: "done" },
  {
    title: "Brokerage account approval",
    detail:
      "Alpaca Securities, the brokerage partner that reviews and opens Quantbase accounts, was unable to approve your application.",
    state: "rejected",
  },
]

export function ApplicationRejected() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      {/* status header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
          style={{ color: RED, backgroundColor: `${RED}14` }}
        >
          Not approved
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          We couldn&apos;t open your account
        </h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          This decision was made by our brokerage partner and is final. We&apos;re not able to
          accept additional documents or a new application.
        </p>
      </div>

      {/* how the review ended */}
      <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
        <ol className="flex flex-col">
          {REJECTED_STEPS.map((step, i) => {
            const last = i === REJECTED_STEPS.length - 1
            return (
              <li key={step.title} className="relative flex gap-3.5 pb-6 last:pb-0">
                {!last && (
                  <span
                    aria-hidden
                    className="absolute top-7 left-[13px] h-[calc(100%-1.9rem)] w-px"
                    style={{ backgroundColor: "#1d7e4f55" }}
                  />
                )}
                <span
                  className={cn(
                    "z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full border border-transparent text-white",
                    step.state === "done" ? "bg-[#1d7e4f]" : "bg-[#B42318]",
                  )}
                >
                  {step.state === "done" ? <RiCheckLine className="size-4" /> : <RiCloseLine className="size-4" />}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-[#363643]">
                    {step.title}
                    {step.state === "rejected" && (
                      <span className="ml-2 text-xs font-medium" style={{ color: RED }}>
                        Not approved
                      </span>
                    )}
                  </p>
                  <p className="text-sm leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-5 border-t border-[var(--border-secondary)] pt-4 text-xs leading-5 text-muted-foreground">
          No money was moved. Nothing was invested, and you won&apos;t be charged anything.
        </p>
      </div>

      {/* the one path forward: support */}
      <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-base font-semibold text-[#363643]">Talk to our support team</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          If you have questions about this decision, our team is here to help and can explain
          what it means for you.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          <SupportRow
            href={`mailto:${SUPPORT_EMAIL}`}
            icon={<RiMailLine className="size-4.5" />}
            title="Email us"
            body={SUPPORT_EMAIL}
          />
        </div>
      </div>
    </div>
  )
}

function SupportRow({
  href,
  icon,
  title,
  body,
}: {
  href: string
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3.5 rounded-xl border border-[var(--border-secondary)] bg-white p-4 transition-all duration-150 hover:border-black/15"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#363643]">{title}</span>
        <span className="block truncate text-sm leading-5 text-muted-foreground">{body}</span>
      </span>
      <RiArrowRightSLine className="size-4.5 shrink-0 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]" />
    </a>
  )
}

/* ------------------------------ approved banner ------------------------------ */
// The next step depends on what the user already set up, so the banner says
// only what's true for them:
//   ready  → portfolio saved + deposit waiting: one tap to start investing
//   fund   → portfolio saved, no money yet: add money
//   empty  → no portfolio yet: the three ways to pick one sit right below
// It stays until they act or dismiss it.

export type ApprovedKind = "ready" | "fund" | "empty"

export function ApprovedBanner({
  kind,
  depositAmount,
  bankLabel,
  onStartInvesting,
  onFund,
  onDismiss,
}: {
  kind: ApprovedKind
  depositAmount: number | null
  bankLabel: string | null
  onStartInvesting: () => void
  onFund: () => void
  onDismiss: () => void
}) {
  const body =
    kind === "ready"
      ? `You can start investing now. Your $${(depositAmount ?? 0).toLocaleString()} deposit from ${bankLabel ?? "your bank"} is on its way.`
      : kind === "fund"
        ? "You can start investing now. Add money to put your starting portfolio to work."
        : "You can start investing now. Pick a starting portfolio below to begin."

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[#1d7e4f]/25 bg-[#1d7e4f]/[0.07] px-5 py-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d7e4f] text-white">
        <RiCheckLine className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#14532d]">Your account is approved</p>
        <p className="text-sm text-pretty text-[#14532d]/80">{body}</p>
      </div>
      <div className="flex items-center gap-2">
        {kind === "ready" && (
          <Button size="sm" onClick={onStartInvesting}>
            Start investing
          </Button>
        )}
        {kind === "fund" && (
          <Button size="sm" onClick={onFund}>
            Add money
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-[#14532d]/70" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
