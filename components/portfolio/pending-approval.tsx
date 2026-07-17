"use client"

// Account-approval pending state for the dashboard. After onboarding, the
// brokerage application is under review — there's no portfolio data worth
// showing, so the dashboard becomes a status tracker instead.
//
// Status colors: brand purple = in progress/waiting, amber = action needed,
// green = completion. Never red for non-errors.

import { useEffect, useState } from "react"
import Link from "next/link"
import { RiArrowRightSLine, RiCheckLine, RiCompass3Line, RiMailLine, RiQuestionLine, RiSparklingLine, RiStockLine, RiUploadCloud2Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { strategies } from "@/lib/strategies"
import { ALLOC_COLORS } from "@/lib/portfolio"
import {
  DOCS_KEY,
  formatReceiptTime,
  type DocsReceipt,
} from "@/components/portfolio/verify-documents"

export type ApprovalVariant = "review" | "action"

const AMBER = "#B45309"

const strategyName = new Map(strategies.map((s) => [s.id, s.name]))

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

export function PendingApproval({
  variant,
  startingPortfolio,
}: {
  variant: ApprovalVariant
  startingPortfolio: { id: string; weight: number }[]
}) {
  // Submission receipt from the upload page, so returning users can see their
  // documents were received and when.
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

  const docsSubmitted = receipt !== null && variant === "review"
  const states = stepStates(variant, docsSubmitted)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      {/* status header */}
      <div className="flex flex-col items-center gap-3 text-center">
        {variant === "review" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            In review
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8B84E]/20 px-3 py-1 text-sm font-medium" style={{ color: AMBER }}>
            Action needed
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          {variant === "review" ? "Your account is being set up" : "One more thing from you"}
        </h1>
        <p className="flex max-w-md items-center gap-2 text-sm leading-6 text-muted-foreground">
          {variant === "review" ? (
            <>
              <RiMailLine className="size-4 shrink-0" />
              We&apos;ll email you the moment your account is approved.
            </>
          ) : (
            "Verification is paused. We need a few more documents from you to continue."
          )}
        </p>
      </div>

      {/* progress tracker */}
      <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
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
      </div>

      {/* starting portfolio: saved mix, or the empty state with both ways to build one */}
      {startingPortfolio.length === 0 ? (
        <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[#363643]">Your starting portfolio</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            You haven&apos;t picked your starting mix yet. There are two ways to build one, and
            your account review continues either way.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            <PortfolioPathRow
              href="/onboarding?step=risk"
              icon={<RiSparklingLine className="size-4.5" />}
              title="Take a quick quiz"
              body="Answer a few questions and we'll suggest a mix you can edit freely."
            />
            <PortfolioPathRow
              href="/edit-portfolio?blank=1"
              icon={<RiCompass3Line className="size-4.5" />}
              title="Build it myself"
              body="Pick strategies from the marketplace and set your own weights."
            />
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#363643]">Your starting portfolio</h2>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/edit-portfolio">Edit portfolio</Link>
            </Button>
          </div>
          <ul className="flex flex-col gap-2.5">
            {startingPortfolio.map((h, i) => (
              <li key={h.id} className="flex items-center gap-2.5 text-sm">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate text-[#47475d]">{strategyName.get(h.id) ?? h.id}</span>
                <span className="font-medium tabular-nums text-[#363643]">{h.weight}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-[var(--border-secondary)] pt-3.5 text-xs leading-5 text-muted-foreground">
            Nothing is invested yet. Once you&apos;re approved, you can put this mix to work in one tap.
          </p>
        </div>
      )}

      {/* while you wait */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <WaitCard
          href="/strategies"
          icon={<RiStockLine className="size-4.5" />}
          title="Browse strategies"
          body="Explore the marketplace while you wait."
        />
        <WaitCard
          href="#"
          icon={<RiQuestionLine className="size-4.5" />}
          title="Questions about approval?"
          body="How verification works and what we check."
        />
      </div>
    </div>
  )
}

function PortfolioPathRow({
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

function WaitCard({
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
      className="group flex items-center gap-3.5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-black/15"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[#575872]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-[#363643]">{title}</span>
        <span className="block text-sm text-muted-foreground">{body}</span>
      </span>
      <RiArrowRightSLine className="size-4.5 shrink-0 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]" />
    </Link>
  )
}

/* ------------------------------ approved banner ------------------------------ */

export function ApprovedBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-6">
      <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[#1d7e4f]/25 bg-[#1d7e4f]/[0.07] px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#1d7e4f] text-white">
          <RiCheckLine className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#14532d]">Your account is approved</p>
          <p className="text-sm text-[#14532d]/80">
            You&apos;re ready to invest. Your starting portfolio is saved and waiting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/strategies">Make your first investment</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-[#14532d]/70" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
