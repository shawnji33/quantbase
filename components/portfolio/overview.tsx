"use client"

// Level 1 — Portfolio Overview (§5.2). Default landing view: the aggregate is
// the hero (fixes P3/P4), account panel is global chrome (fixes P5), and the
// strategy table is a comparison + navigation list (fixes P1/P2).

import { useMemo, useState } from "react"

import {
  HELD_STRATEGIES,
  PORTFOLIO,
  seriesFor,
  usd,
} from "@/lib/portfolio"
import { StatsHeader } from "@/components/portfolio/stats-header"
import { AccountPanel } from "@/components/portfolio/account-panel"
import { AllocationDonut, donutColor } from "@/components/portfolio/donut"
import { ValueChartCard, useSessionRange } from "@/components/portfolio/value-chart"
import { StrategyTable } from "@/components/portfolio/strategy-table"

export function PortfolioOverview() {
  const [range, setRange] = useSessionRange()
  const [hovered, setHovered] = useState<string | null>(null)

  const series = useMemo(() => seriesFor(PORTFOLIO), [])

  const segments = useMemo(
    () =>
      HELD_STRATEGIES.map((s) => ({
        id: s.id,
        label: s.name,
        value: s.value,
      })),
    [],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      {/* hero: aggregate stats + account chrome */}
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1fr_360px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <h1 className="text-xl font-semibold tracking-tight text-[#363643]">Portfolio</h1>
          <StatsHeader
            value={PORTFOLIO.value}
            gain={PORTFOLIO.gain}
            returnPct={PORTFOLIO.returnPct}
            investedSince={PORTFOLIO.investedSince}
            netCashFlow={PORTFOLIO.netCashFlow}
          />
        </div>
        <AccountPanel />
      </div>

      {/* allocation + value over time */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[#363643]">Allocation</h2>
          <div className="flex flex-col items-center gap-6">
            <AllocationDonut
              segments={segments}
              hovered={hovered}
              onHover={setHovered}
              centerDefault={
                <>
                  <p className="text-sm font-medium text-[#363643]">
                    {HELD_STRATEGIES.length} strategies
                  </p>
                  <p className="text-xs text-muted-foreground">across your portfolio</p>
                </>
              }
            />
            {/* legend synced with the ring */}
            <ul className="flex w-full flex-col gap-0.5">
              {segments.map((seg, i) => (
                <li key={seg.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(seg.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-opacity duration-200 ${
                      hovered !== null && hovered !== seg.id ? "opacity-50" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: donutColor(i) }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-[#47475d]">{seg.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {((seg.value / PORTFOLIO.value) * 100).toFixed(1)}%
                    </span>
                    <span className="w-20 text-right text-sm font-medium tabular-nums text-[#363643]">
                      {usd(seg.value)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ValueChartCard
          series={series}
          sinceDate={PORTFOLIO.sinceDate}
          gradientId="portfolio-chart"
          range={range}
          onRangeChange={setRange}
        />
      </div>

      {/* comparison + navigation table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-[#363643]">Your strategies</h2>
          <span className="text-sm text-muted-foreground">{HELD_STRATEGIES.length} held</span>
        </div>
        <StrategyTable range={range} />
      </div>
    </div>
  )
}
