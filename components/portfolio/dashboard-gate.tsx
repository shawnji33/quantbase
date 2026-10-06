"use client"

// Decides what the dashboard shows based on account status:
//   applied          → one-time "your application is in" page, then review
//   review / action  → pre-invest dashboard with a review status card on top
//   approved         → same pre-invest dashboard with the approved banner
//   live             → real dashboard (steady state, after "Start investing")
//   rejected         → terminal takeover, support only
// "-empty" variants are the same states with no starting portfolio picked.
// A closed account outranks all of them — there's no portfolio left to show, so
// the closed state takes the page over. A *requested* closure does not: support
// hasn't sold anything yet, so the balance is still live and still worth seeing.
// That state gets a persistent banner over the real dashboard instead.
// Status is set by finishing onboarding (sessionStorage) and can be flipped
// with the floating review switcher / ?status= param for design review.

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { recommendPortfolio } from "@/lib/onboarding"
import { PortfolioOverview } from "@/components/portfolio/overview"
import { ApplicationRejected, ReviewIntro } from "@/components/portfolio/pending-approval"
import { PreInvestDashboard } from "@/components/portfolio/pre-invest-dashboard"
import { AccountClosed } from "@/components/settings/account-closed"
import { ClosingBanner } from "@/components/portfolio/closing-banner"
import { snapshot } from "@/lib/account-closure"
import { useClosure } from "@/components/settings/use-closure"

const STATUSES = [
  "applied",
  "review",
  "review-empty",
  "action",
  "rejected",
  "approved",
  "approved-empty",
  "live",
] as const
type Status = (typeof STATUSES)[number]

const STATUS_KEY = "qb-account-status"
const PORTFOLIO_KEY = "qb-starting-portfolio"
const BANK_KEY = "qb-bank-label"
const FUNDED_KEY = "qb-funded-amount"
const BANNER_KEY = "qb-approved-banner-dismissed"

const FALLBACK_PORTFOLIO = recommendPortfolio("hold", { Stocks: 2, Cryptocurrency: 1 })
// Demo values so the pending-deposit card previews via the status switcher
// below without requiring a full onboarding run.
const FALLBACK_BANK_LABEL = "Chase Checking •••• 4831"
const FALLBACK_DEPOSIT_AMOUNT = 500

export function DashboardGate() {
  const { state: closure, update: updateClosure, ready: closureReady } = useClosure()
  const [status, setStatus] = useState<Status>("live")
  const [starting, setStarting] = useState<{ id: string; weight: number }[]>(FALLBACK_PORTFOLIO)
  const [bankLabel, setBankLabel] = useState<string | null>(FALLBACK_BANK_LABEL)
  const [depositAmount, setDepositAmount] = useState<number | null>(FALLBACK_DEPOSIT_AMOUNT)
  // A real session can save an empty portfolio (self-directed, nothing picked).
  const [savedEmpty, setSavedEmpty] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  // Hide the design-review switcher while Figma's html-to-design capture runs.
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time reads */
    if (window.location.hash.startsWith("#figmacapture")) setCapturing(true)
    const fromUrl = new URLSearchParams(window.location.search).get("status") as Status | null
    const stored = sessionStorage.getItem(STATUS_KEY) as Status | null
    const next = fromUrl ?? stored
    if (next && (STATUSES as readonly string[]).includes(next)) setStatus(next)
    setBannerDismissed(sessionStorage.getItem(BANNER_KEY) === "1")
    try {
      const saved = JSON.parse(sessionStorage.getItem(PORTFOLIO_KEY) ?? "null")
      if (Array.isArray(saved) && saved.length > 0) setStarting(saved)
      else if (Array.isArray(saved) && stored) setSavedEmpty(true)
    } catch {
      /* keep fallback */
    }
    // Only trust the real bank/deposit state once a genuine onboarding session
    // exists (STATUS_KEY was set on finish) — that includes a deliberate skip,
    // which should show the "fund your account" prompt, not the demo deposit.
    // Without a real session (direct link, ?status= preview), keep the fallback
    // demo values so the pending-deposit card still previews.
    if (stored) {
      setBankLabel(sessionStorage.getItem(BANK_KEY))
      const storedFunded = sessionStorage.getItem(FUNDED_KEY)
      setDepositAmount(storedFunded ? Number(storedFunded) : null)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  function change(next: Status) {
    setStatus(next)
    sessionStorage.setItem(STATUS_KEY, next)
    // Every fresh approval shows the banner again.
    if (next === "approved" || next === "approved-empty") {
      setBannerDismissed(false)
      sessionStorage.removeItem(BANNER_KEY)
    }
  }

  function dismissBanner() {
    setBannerDismissed(true)
    sessionStorage.setItem(BANNER_KEY, "1")
  }

  // ?closure=requested|closed makes the dashboard takeover linkable without
  // having to walk the checklist first.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("closure")
    if (wanted !== "requested" && wanted !== "closed") return
    const now = new Date().toISOString()
    updateClosure(
      wanted === "closed"
        ? { phase: "closed", closedAt: now }
        : { phase: "requested", requestedAt: now }
    )
  }, [updateClosure])

  function handleFunded(label: string, amount: number) {
    setBankLabel(label)
    setDepositAmount(amount)
    sessionStorage.setItem(BANK_KEY, label)
    sessionStorage.setItem(FUNDED_KEY, String(amount))
  }

  // A closed account has no portfolio to show; a closing one still does.
  if (closureReady && closure.phase === "closed") {
    return <AccountClosed closedAt={closure.closedAt} />
  }
  const closing = closureReady && closure.phase === "requested"

  return (
    <>
      {closing && <ClosingBanner payoutBank={snapshot(closure).payoutBank} />}

      {status === "rejected" ? (
        <ApplicationRejected />
      ) : status === "applied" ? (
        <ReviewIntro onContinue={() => change(savedEmpty ? "review-empty" : "review")} />
      ) : status === "live" ? (
        <PortfolioOverview />
      ) : (
        <PreInvestDashboard
          phase={status === "action" ? "action" : status.startsWith("approved") ? "approved" : "review"}
          startingPortfolio={status.endsWith("-empty") || savedEmpty ? [] : starting}
          bankLabel={bankLabel}
          depositAmount={depositAmount}
          bannerDismissed={bannerDismissed || closing}
          onDismissBanner={dismissBanner}
          onFunded={handleFunded}
          onStartInvesting={() => change("live")}
        />
      )}

      {/* design-review only: flip account status */}
      {capturing ? null : (
      <div className="glass fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
        <span className="px-2.5 text-xs font-medium text-muted-foreground">Account</span>
        {(
          [
            ["applied", "Just applied"],
            ["review", "In review"],
            ["review-empty", "No portfolio"],
            ["action", "Action needed"],
            ["rejected", "Rejected"],
            ["approved", "Approved"],
            ["approved-empty", "Approved, no portfolio"],
            ["live", "Live"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => change(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
              status === id ? "bg-primary text-primary-foreground" : "text-[#47475d] hover:bg-black/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      )}
    </>
  )
}
