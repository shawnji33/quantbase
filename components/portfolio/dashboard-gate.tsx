"use client"

// Decides what the dashboard shows based on account status:
//   review / action  → approval tracker (no portfolio data — §account gating)
//   approved         → real dashboard with a dismissible success banner
//   live             → real dashboard (steady state)
// A requested/completed account closure outranks all of them — there's no
// portfolio left to show, so the closure tracker takes the page over.
// Status is set by finishing onboarding (sessionStorage) and can be flipped
// with the floating review switcher / ?status= param for design review.

import { useCallback, useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { recommendPortfolio } from "@/lib/onboarding"
import { PortfolioOverview } from "@/components/portfolio/overview"
import { ApplicationRejected, ApprovedBanner, PendingApproval } from "@/components/portfolio/pending-approval"
import { AccountClosed } from "@/components/settings/account-closed"
import { ClosureTracker } from "@/components/settings/closure-tracker"
import { useClosure } from "@/components/settings/use-closure"

type Status = "review" | "review-empty" | "action" | "rejected" | "approved" | "live"

const STATUS_KEY = "qb-account-status"
const PORTFOLIO_KEY = "qb-starting-portfolio"
const BANK_KEY = "qb-bank-label"
const FUNDED_KEY = "qb-funded-amount"

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
  // Hide the design-review switcher while Figma's html-to-design capture runs.
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time reads */
    if (window.location.hash.startsWith("#figmacapture")) setCapturing(true)
    const fromUrl = new URLSearchParams(window.location.search).get("status") as Status | null
    const stored = sessionStorage.getItem(STATUS_KEY) as Status | null
    const next = fromUrl ?? stored
    if (next && ["review", "review-empty", "action", "rejected", "approved", "live"].includes(next)) setStatus(next)
    try {
      const saved = JSON.parse(sessionStorage.getItem(PORTFOLIO_KEY) ?? "null")
      if (Array.isArray(saved) && saved.length > 0) setStarting(saved)
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

  const completeClosure = useCallback(() => {
    updateClosure({ phase: "closed", closedAt: new Date().toISOString() })
  }, [updateClosure])

  const cancelClosure = useCallback(() => {
    updateClosure({ phase: "open", requestedAt: null })
  }, [updateClosure])

  function handleFunded(label: string, amount: number) {
    setBankLabel(label)
    setDepositAmount(amount)
    sessionStorage.setItem(BANK_KEY, label)
    sessionStorage.setItem(FUNDED_KEY, String(amount))
  }

  // Closure outranks approval status: a closing account has no portfolio.
  if (closureReady && closure.phase === "closed") {
    return <AccountClosed closedAt={closure.closedAt} />
  }
  if (closureReady && closure.phase === "requested") {
    return (
      <ClosureTracker
        requestedAt={closure.requestedAt}
        onCancel={cancelClosure}
        onComplete={completeClosure}
      />
    )
  }

  return (
    <>
      {status === "rejected" ? (
        <ApplicationRejected />
      ) : status === "review" || status === "review-empty" || status === "action" ? (
        <PendingApproval
          variant={status === "action" ? "action" : "review"}
          startingPortfolio={status === "review-empty" ? [] : starting}
          bankLabel={bankLabel}
          depositAmount={depositAmount}
          onFunded={handleFunded}
        />
      ) : (
        <>
          {status === "approved" && <ApprovedBanner onDismiss={() => change("live")} />}
          <PortfolioOverview />
        </>
      )}

      {/* design-review only: flip account status */}
      {capturing ? null : (
      <div className="glass fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
        <span className="px-2.5 text-xs font-medium text-muted-foreground">Account</span>
        {(
          [
            ["review", "In review"],
            ["review-empty", "No portfolio"],
            ["action", "Action needed"],
            ["rejected", "Rejected"],
            ["approved", "Approved"],
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
