"use client"

// Decides what the dashboard shows based on account status:
//   review / action  → approval tracker (no portfolio data — §account gating)
//   approved         → real dashboard with a dismissible success banner
//   live             → real dashboard (steady state)
// Status is set by finishing onboarding (sessionStorage) and can be flipped
// with the floating review switcher / ?status= param for design review.

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { recommendPortfolio } from "@/lib/onboarding"
import { PortfolioOverview } from "@/components/portfolio/overview"
import { ApprovedBanner, PendingApproval } from "@/components/portfolio/pending-approval"

type Status = "review" | "review-empty" | "action" | "approved" | "live"

const STATUS_KEY = "qb-account-status"
const PORTFOLIO_KEY = "qb-starting-portfolio"

const FALLBACK_PORTFOLIO = recommendPortfolio("hold", { Stocks: 2, Cryptocurrency: 1 })

export function DashboardGate() {
  const [status, setStatus] = useState<Status>("live")
  const [starting, setStarting] = useState<{ id: string; weight: number }[]>(FALLBACK_PORTFOLIO)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time reads */
    const fromUrl = new URLSearchParams(window.location.search).get("status") as Status | null
    const stored = sessionStorage.getItem(STATUS_KEY) as Status | null
    const next = fromUrl ?? stored
    if (next && ["review", "review-empty", "action", "approved", "live"].includes(next)) setStatus(next)
    try {
      const saved = JSON.parse(sessionStorage.getItem(PORTFOLIO_KEY) ?? "null")
      if (Array.isArray(saved) && saved.length > 0) setStarting(saved)
    } catch {
      /* keep fallback */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  function change(next: Status) {
    setStatus(next)
    sessionStorage.setItem(STATUS_KEY, next)
  }

  return (
    <>
      {status === "review" || status === "review-empty" || status === "action" ? (
        <PendingApproval
          variant={status === "action" ? "action" : "review"}
          startingPortfolio={status === "review-empty" ? [] : starting}
        />
      ) : (
        <>
          {status === "approved" && <ApprovedBanner onDismiss={() => change("live")} />}
          <PortfolioOverview />
        </>
      )}

      {/* design-review only: flip account status */}
      <div className="glass fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
        <span className="px-2.5 text-xs font-medium text-muted-foreground">Account</span>
        {(
          [
            ["review", "In review"],
            ["review-empty", "No portfolio"],
            ["action", "Action needed"],
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
    </>
  )
}
