"use client"

// Level 2 — Strategy Detail (§5.3). Breadcrumb + top-mounted switcher restore
// visible cause-and-effect (fixes P1/P3); stats live in the header only
// (fixes P6); Buy/Sell are bound to the strategy in view (§R2.5).

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiArrowLeftSLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HELD_STRATEGIES,
  seriesFor,
  usd,
  type HeldStrategy,
} from "@/lib/portfolio"
import { StatsHeader } from "@/components/portfolio/stats-header"
import { AccountPanel } from "@/components/portfolio/account-panel"
import { AllocationDonut } from "@/components/portfolio/donut"
import { ValueChartCard, useSessionRange } from "@/components/portfolio/value-chart"
import { CardError, Sk } from "@/components/portfolio/bits"

export function StrategyDetail({ strategy }: { strategy: HeldStrategy }) {
  const router = useRouter()
  const [range, setRange] = useSessionRange()

  // Design-review only: ?state=error forces the per-card error state (§7.8).
  const [forcedError, setForcedError] = useState(false)
  useEffect(() => {
    const state = new URLSearchParams(window.location.search).get("state")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time demo-param read
    if (state === "error") setForcedError(true)
  }, [])

  // Brief skeleton on strategy switch — stable card frames, no content flash (§7.7).
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- simulated fetch on switch */
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 400)
    /* eslint-enable react-hooks/set-state-in-effect */
    // Switching strategies resets scroll to the top of the content region (§R3.3).
    document.querySelector("main")?.scrollTo({ top: 0 })
    return () => window.clearTimeout(t)
  }, [strategy.id])

  const series = useMemo(() => seriesFor(strategy), [strategy])
  const empty = strategy.value === 0

  const segments = useMemo(
    () =>
      strategy.holdings.map((h) => ({
        id: h.symbol,
        label: h.symbol,
        sublabel: h.name,
        value: h.weight,
      })),
    [strategy],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      {/* wayfinding (§R2.2) */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
        >
          <RiArrowLeftSLine className="size-4" />
          Quantbase portfolio
        </Link>
      </nav>

      {/* header: switcher-as-title + stats left, account chrome right */}
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[1fr_360px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {/* top-mounted strategy switcher (§R2.3) */}
          <Select value={strategy.id} onValueChange={(id) => router.push(`/portfolio/${id}`)}>
            <SelectTrigger className="w-fit max-w-full gap-2 rounded-lg border-transparent bg-transparent px-2 py-1 !text-xl font-semibold tracking-tight text-[#363643] shadow-none hover:bg-black/[0.04] data-[size=default]:h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {HELD_STRATEGIES.map((s) => (
                <SelectItem key={s.id} value={s.id} textValue={s.name}>
                  <span className="flex w-full items-baseline gap-3">
                    <span className="max-w-xs truncate">{s.name}</span>
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {usd(s.value)}
                    </span>
                  </span>
                </SelectItem>
              ))}
              {empty && (
                <SelectItem value={strategy.id} textValue={strategy.name}>
                  {strategy.name}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <StatsHeader
            value={strategy.value}
            gain={strategy.gain}
            returnPct={strategy.returnPct}
            investedSince={strategy.investedSince}
            netCashFlow={strategy.netCashFlow}
            loading={loading}
          />
        </div>
        <AccountPanel />
      </div>

      {/* holdings + value over time */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[#363643]">Holdings</h2>

          {loading ? (
            <div className="flex flex-col items-center gap-6 py-2">
              <Sk className="size-[220px] rounded-full" />
              <Sk className="h-9 w-full" />
            </div>
          ) : forcedError ? (
            <CardError label="Holdings" onRetry={() => setForcedError(false)} />
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* donut center stays quiet — stats live in the header only (§R2.4) */}
              <AllocationDonut
                segments={segments}
                centerDefault={
                  empty ? undefined : (
                    <p className="text-xs text-muted-foreground">
                      {strategy.holdings.length} holdings
                    </p>
                  )
                }
              />
              {empty && (
                <p className="max-w-56 text-center text-sm text-muted-foreground">
                  Make your first investment to see this strategy&apos;s holdings here.
                </p>
              )}
              {/* strategy-scoped actions (§R2.5); Sell disabled when empty (§7.5) */}
              <div className="grid w-full grid-cols-2 gap-2">
                <Button variant="secondary" className="w-full font-semibold">
                  Buy
                </Button>
                <Button variant="secondary" className="w-full font-semibold" disabled={empty}>
                  Sell
                </Button>
              </div>
            </div>
          )}
        </div>

        <ValueChartCard
          series={series}
          sinceDate={strategy.sinceDate}
          gradientId={`chart-${strategy.id}`}
          range={range}
          onRangeChange={setRange}
          loading={loading}
          error={forcedError}
          onRetry={() => setForcedError(false)}
        />
      </div>
    </div>
  )
}
