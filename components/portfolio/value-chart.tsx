"use client"

// "Value over time" card: existing PriceChart + the 1W/1M/1Q/YTD/1Y/ALL
// segmented control. The selected range persists for the session and is shared
// across views (§R3.2); ranges longer than available history are disabled
// (§7.6); loading/error/empty states keep the card frame stable (§7.7–7.8).

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import {
  RANGES,
  TODAY,
  rangeAvailable,
  sliceRange,
  type Range,
} from "@/lib/portfolio"
import { PriceChart } from "@/components/price-chart"
import { CardError, Sk } from "@/components/portfolio/bits"

const RANGE_KEY = "qb-portfolio-range"

export function useSessionRange(): [Range, (r: Range) => void] {
  const [range, setRange] = useState<Range>("ALL")
  useEffect(() => {
    const stored = sessionStorage.getItem(RANGE_KEY) as Range | null
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time read
    if (stored && RANGES.includes(stored)) setRange(stored)
  }, [])
  const update = (r: Range) => {
    setRange(r)
    sessionStorage.setItem(RANGE_KEY, r)
  }
  return [range, update]
}

export function ValueChartCard({
  series,
  sinceDate,
  gradientId,
  range,
  onRangeChange,
  loading,
  error,
  onRetry,
}: {
  series: number[]
  sinceDate: [number, number, number]
  gradientId: string
  range: Range
  onRangeChange: (r: Range) => void
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}) {
  const empty = series.length < 2
  const effective = !empty && rangeAvailable(range, series.length) ? range : "ALL"
  const sliced = empty ? [] : sliceRange(series, effective)

  // Window start date for tooltip dates: fraction of full history shown.
  const fullStart = new Date(sinceDate[0], sinceDate[1], sinceDate[2])
  const end = new Date(TODAY[0], TODAY[1], TODAY[2])
  const startMs =
    empty || sliced.length === series.length
      ? fullStart.getTime()
      : end.getTime() - ((sliced.length - 1) / (series.length - 1)) * (end.getTime() - fullStart.getTime())

  return (
    <div className="flex flex-col gap-5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-base font-semibold text-[#363643]">Value over time</h2>

      <div className="min-h-[240px]">
        {loading ? (
          <div className="flex h-[240px] flex-col justify-end gap-2">
            <Sk className="h-[200px] w-full" />
          </div>
        ) : error ? (
          <CardError label="The value chart" onRetry={onRetry ?? (() => {})} />
        ) : empty ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-sm font-medium text-[#363643]">No history yet</p>
            <p className="max-w-56 text-sm text-muted-foreground">
              Your value chart appears after your first investment.
            </p>
          </div>
        ) : (
          <PriceChart
            data={sliced}
            startYear={sinceDate[0]}
            baseAmount={sliced[0]}
            startDate={new Date(startMs)}
            endDate={end}
            height={240}
            color="#7046E5"
            gradientId={gradientId}
          />
        )}
      </div>

      {/* segmented range control */}
      <div className="grid grid-cols-6 gap-1 rounded-lg bg-muted p-1 text-sm font-medium">
        {RANGES.map((r) => {
          const disabled = empty || !rangeAvailable(r, series.length)
          const active = !empty && r === effective
          return (
            <button
              key={r}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onRangeChange(r)}
              className={cn(
                "rounded-md py-1.5 transition-colors duration-200",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
              )}
            >
              {r}
            </button>
          )
        })}
      </div>
    </div>
  )
}
