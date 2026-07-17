"use client"

// Standalone editor for the saved starting portfolio, reached from the
// dashboard's approval state. The onboarding builder sits centered on its own
// page so there's no confusion about being back in onboarding. The exit
// button saves and returns to the in-review dashboard.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RiCloseLine } from "@remixicon/react"

import { recommendPortfolio, type Weighted } from "@/lib/onboarding"
import { PortfolioStep } from "@/components/onboarding/portfolio-builder"

const PORTFOLIO_KEY = "qb-starting-portfolio"
const FALLBACK = recommendPortfolio("hold", { Stocks: 2, Cryptocurrency: 1 })

export function EditPortfolio() {
  const router = useRouter()
  const [allocations, setAllocations] = useState<Weighted[]>(FALLBACK)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time read */
    const blank = new URLSearchParams(window.location.search).get("blank") === "1"
    try {
      const saved = JSON.parse(sessionStorage.getItem(PORTFOLIO_KEY) ?? "null")
      if (Array.isArray(saved) && saved.length > 0) setAllocations(saved)
      else if (blank) setAllocations([])
    } catch {
      if (blank) setAllocations([])
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  function saveAndExit() {
    sessionStorage.setItem(PORTFOLIO_KEY, JSON.stringify(allocations))
    router.push("/portfolio")
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#F5F6F7] px-6 py-16">
      {/* save & exit, top right */}
      <button
        type="button"
        aria-label="Save and exit"
        onClick={saveAndExit}
        className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#575872] shadow-[var(--shadow-card)] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)]"
      >
        <RiCloseLine className="size-5" />
      </button>

      <div className="w-full max-w-4xl">
        <PortfolioStep
          path="guided"
          allocations={allocations}
          onChange={setAllocations}
          onContinue={saveAndExit}
          continueLabel="Save changes"
        />
      </div>
    </div>
  )
}
