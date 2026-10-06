"use client"

// The dashboard before anything is invested: from the moment the application
// is submitted until the user starts investing. The review status is a card on
// top of the dashboard rather than a page that replaces it, the same pattern
// the closing banner uses. Waiting shouldn't be a dead end.
//
//   review   → status card (collapsible tracker) + portfolio + deposit
//   action   → amber status card with the upload action, same body
//   approved → green banner instead of the status card, same body
//
// "Performance" here means each picked strategy's own track record. The user
// holds nothing yet, and a blended backtest of their mix would be hypothetical
// performance, which is a compliance call we haven't made. So we show real
// strategy history, labeled as such, and never a combined number.

import { useState } from "react"
import Link from "next/link"
import {
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiBankLine,
  RiCompass3Line,
  RiMoneyDollarCircleLine,
  RiQuestionLine,
  RiSparklingLine,
  RiStockLine,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { strategies, type Strategy } from "@/lib/strategies"
import { ALLOC_COLORS } from "@/lib/portfolio"
import { ReturnValue } from "@/components/portfolio/bits"
import {
  AMBER,
  ApprovalTracker,
  ApprovedBanner,
  FundAccountDialog,
  PortfolioPathRow,
  SUPPORT_EMAIL,
  useDocsReceipt,
  type ApprovedKind,
} from "@/components/portfolio/pending-approval"

export type PreInvestPhase = "review" | "action" | "approved"

const strategyById = new Map(strategies.map((s) => [s.id, s]))

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)"

export function PreInvestDashboard({
  phase,
  startingPortfolio,
  bankLabel,
  depositAmount,
  bannerDismissed,
  onDismissBanner,
  onFunded,
  onStartInvesting,
}: {
  phase: PreInvestPhase
  startingPortfolio: { id: string; weight: number }[]
  bankLabel: string | null
  depositAmount: number | null
  bannerDismissed: boolean
  onDismissBanner: () => void
  onFunded: (bankLabel: string, amount: number) => void
  onStartInvesting: () => void
}) {
  const [fundOpen, setFundOpen] = useState(false)
  const funded = depositAmount !== null && depositAmount > 0
  const hasPortfolio = startingPortfolio.length > 0
  const approved = phase === "approved"

  const approvedKind: ApprovedKind = !hasPortfolio ? "empty" : funded ? "ready" : "fund"

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <h1 className="text-xl font-semibold tracking-tight text-[#363643]">Portfolio</h1>

      {approved ? (
        !bannerDismissed && (
          <ApprovedBanner
            kind={approvedKind}
            depositAmount={depositAmount}
            bankLabel={bankLabel}
            onStartInvesting={onStartInvesting}
            onFund={() => setFundOpen(true)}
            onDismiss={onDismissBanner}
          />
        )
      ) : (
        <ReviewStatusCard variant={phase} />
      )}

      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1fr_360px] xl:items-start">
        {hasPortfolio ? (
          <StartingPortfolioCard portfolio={startingPortfolio} approved={approved} />
        ) : (
          <EmptyPortfolioCard approved={approved} />
        )}

        <div className="flex flex-col gap-4">
          {funded ? (
            <DepositCard amount={depositAmount} bankLabel={bankLabel} approved={approved} />
          ) : (
            <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-base font-semibold text-[#363643]">Fund your account</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {approved
                  ? "Connect a bank and add money to start investing."
                  : "Connect a bank and deposit now, so your money's ready to invest the moment you're approved. Nothing moves until then."}
              </p>
              <Button className="mt-4" onClick={() => setFundOpen(true)}>
                <RiBankLine className="size-4" />
                Connect bank account
              </Button>
            </div>
          )}

          {!approved && (
            <Link
              href="#"
              className="group flex items-center gap-3.5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-black/15"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[#575872]">
                <RiQuestionLine className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#363643]">Questions about approval?</span>
                <span className="block text-sm text-muted-foreground">How verification works and what we check.</span>
              </span>
              <RiArrowRightSLine className="size-4.5 shrink-0 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]" />
            </Link>
          )}
        </div>
      </div>

      <FundAccountDialog
        key={String(fundOpen)} // remount on each open so it always starts at "connect"
        open={fundOpen}
        onOpenChange={setFundOpen}
        approved={approved}
        onFunded={(label, amount) => {
          setFundOpen(false)
          onFunded(label, amount)
        }}
      />
    </div>
  )
}

/* ------------------------------ review status -------------------------------- */
// One line of status with the full tracker folded underneath. In review there's
// nothing to do, so the tracker starts closed. When documents are needed the
// action is on the card itself, not hidden in the fold.

function ReviewStatusCard({ variant }: { variant: "review" | "action" }) {
  const [open, setOpen] = useState(false)
  const receipt = useDocsReceipt()
  const action = variant === "action"
  const docsInReview = !action && receipt !== null

  const title = action
    ? "We need a few more documents"
    : docsInReview
      ? "We're reviewing your documents"
      : "Your account is in review"
  const body = action
    ? "Your review is paused until we receive them."
    : "Alpaca Securities usually approves new accounts within 1 business day. We'll email you when it's done."

  return (
    <div
      className={cn(
        "rounded-[16px] border bg-card shadow-[var(--shadow-card)]",
        action ? "border-[#E8B84E]/50" : "border-[var(--border-secondary)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3 px-5 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center">
          {action ? (
            <span
              className="flex size-6 items-center justify-center rounded-full bg-[#E8B84E] text-[11px] font-semibold text-white"
              aria-hidden
            >
              !
            </span>
          ) : (
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-3 rounded-full bg-primary" />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1 basis-60">
          <p className="text-sm font-semibold" style={{ color: action ? AMBER : "#363643" }}>
            {title}
          </p>
          <p className="text-sm text-pretty text-[#47475d]">{body}</p>
        </div>
        <div className="flex items-center gap-2">
          {action && (
            <Button size="sm" asChild>
              <Link href="/verify-documents">
                <RiUploadCloud2Line className="size-4" />
                Upload documents
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            aria-controls="review-tracker"
            onClick={() => setOpen((o) => !o)}
            className="text-[#47475d]"
          >
            {open ? "Hide progress" : "View progress"}
            <RiArrowDownSLine
              className={cn(
                "size-4 transition-transform duration-200 motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>

      {/* grid-rows 0fr → 1fr so the height animates without measuring */}
      <div
        id="review-tracker"
        className="grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", transitionTimingFunction: EASE_OUT }}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-secondary)] px-5 py-5">
            <ApprovalTracker variant={variant} receipt={receipt} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------- starting portfolio ----------------------------- */

type ReturnWindow = "1Y" | "all"

function StartingPortfolioCard({
  portfolio,
  approved,
}: {
  portfolio: { id: string; weight: number }[]
  approved: boolean
}) {
  const [win, setWin] = useState<ReturnWindow>("1Y")
  const rows = portfolio
    .map((h) => ({ ...h, s: strategyById.get(h.id) }))
    .filter((r): r is { id: string; weight: number; s: Strategy } => r.s !== undefined)

  return (
    <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <h2 className="text-base font-semibold text-[#363643]">Your starting portfolio</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {approved
              ? "Nothing is invested yet. Here's how each strategy you picked has performed."
              : "Nothing is invested yet. While you wait, here's how each strategy you picked has performed."}
          </p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/edit-portfolio">Edit portfolio</Link>
        </Button>
      </div>

      {/* return window, then the column header */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#363643]">Past returns</p>
        <div
          role="group"
          aria-label="Return period"
          className="grid w-[148px] grid-cols-2 gap-0.5 rounded-md bg-muted p-0.5 text-xs font-medium text-muted-foreground"
        >
          {(
            [
              ["1Y", "1 year"],
              ["all", "All time"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={win === id}
              onClick={() => setWin(id)}
              className={cn(
                "rounded-[5px] py-1 transition-colors duration-150",
                win === id ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-b border-[var(--border-secondary)] pb-2.5 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1">Strategy</span>
        <span className="w-10 text-right">Weight</span>
        <span className="hidden w-24 sm:block" aria-hidden />
        <span className="w-[72px] text-right">Return</span>
      </div>

      <ul className="flex flex-col">
        {rows.map(({ id, weight, s }, i) => (
          <li
            key={id}
            className="flex items-center gap-3 border-b border-[var(--border-secondary)] py-3.5 last:border-b-0"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: ALLOC_COLORS[i % ALLOC_COLORS.length] }}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#363643]">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {s.manager} · since {s.inceptionYear}
                </span>
              </span>
            </span>
            <span className="w-10 text-right text-sm font-medium tabular-nums text-[#363643]">{weight}%</span>
            <span className="hidden w-24 sm:block">
              <Sparkline series={s.series} />
            </span>
            <span className="w-[72px] text-right text-sm">
              <ReturnValue value={win === "1Y" ? s.oneYear : s.inceptionReturn} />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-[var(--border-secondary)] pt-3.5 text-xs leading-5 text-pretty text-muted-foreground">
        These are each strategy&apos;s own past returns, not your account&apos;s, and not a
        combined figure for your mix. Past performance doesn&apos;t guarantee future results.
      </p>
    </div>
  )
}

// Shape-only trend line. The return column carries the number; this just shows
// whether the path there was smooth or rough.
function Sparkline({ series }: { series: number[] }) {
  const w = 96
  const h = 28
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const pts = series
    .map((v, i) => `${((i / (series.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(1)}`)
    .join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden className="block">
      <polyline points={pts} fill="none" stroke="#7046E5" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function EmptyPortfolioCard({ approved }: { approved: boolean }) {
  return (
    <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-base font-semibold text-[#363643]">Your starting portfolio</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {approved
          ? "You haven't picked what to invest in yet. Choose how you'd like to start."
          : "You haven't picked what to invest in yet. Choose how you'd like to start. Your account review continues either way."}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <PortfolioPathRow
          href="/onboarding?step=risk"
          icon={<RiSparklingLine className="size-4.5" />}
          title="Take the quiz"
          body="Answer a few questions and we'll suggest a mix you can edit freely."
        />
        <PortfolioPathRow
          href="/strategies"
          icon={<RiStockLine className="size-4.5" />}
          title="Browse strategies"
          body="See every strategy in the marketplace and how each has performed."
        />
        <PortfolioPathRow
          href="/edit-portfolio?blank=1"
          icon={<RiCompass3Line className="size-4.5" />}
          title="Build your own"
          body="Pick strategies and set your own weights."
        />
      </div>
    </div>
  )
}

/* --------------------------------- deposit ----------------------------------- */

function DepositCard({
  amount,
  bankLabel,
  approved,
}: {
  amount: number
  bankLabel: string | null
  approved: boolean
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-base font-semibold text-[#363643]">
        {approved ? "Your deposit" : "Your pending deposit"}
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {approved
          ? "On its way. Bank transfers usually arrive in 1 to 3 business days."
          : "This transfer is on hold until your account is approved. Nothing moves until then."}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <DepositRow icon={<RiBankLine className="size-4.5" />} title={bankLabel ?? "Linked bank account"} body="Connected account" />
        <DepositRow
          icon={<RiMoneyDollarCircleLine className="size-4.5" />}
          title={`$${amount.toLocaleString()}`}
          body="Transfer amount"
        />
      </div>
      {!approved && (
        <p className="mt-4 border-t border-[var(--border-secondary)] pt-3.5 text-xs leading-5 text-muted-foreground">
          Need to change the amount, bank, or timing?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline underline-offset-2">
            Contact support
          </a>
          . We can edit or cancel it before it&apos;s processed.
        </p>
      )}
    </div>
  )
}

function DepositRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-[var(--border-secondary)] bg-white p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[#575872]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium tabular-nums text-[#363643]">{title}</span>
        <span className="block text-sm text-muted-foreground">{body}</span>
      </span>
    </div>
  )
}
