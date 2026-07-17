"use client"

// Hero stat block — used by both the overview (aggregate) and strategy detail.
// Stats appear here once; donut centers never repeat them (§R2.4, fixes P6).

import { TOOLTIPS, usd } from "@/lib/portfolio"
import { GainValue, Info, ReturnValue, Sk } from "@/components/portfolio/bits"

export function StatsHeader({
  value,
  gain,
  returnPct,
  investedSince,
  netCashFlow,
  loading,
}: {
  value: number
  gain: number
  returnPct: number
  investedSince: string
  netCashFlow: number
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Sk className="h-4 w-24" />
        <Sk className="h-10 w-44" />
        <Sk className="h-4 w-64" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Current value <Info copy={TOOLTIPS.currentValue} />
          </p>
          <p className="text-4xl font-semibold tracking-tight tabular-nums text-[#363643]">
            {usd(value)}
          </p>
        </div>
        <div className="space-y-1 pb-0.5">
          <p className="text-sm text-muted-foreground">Gain</p>
          <GainValue value={gain} className="text-lg" />
        </div>
        <div className="space-y-1 pb-0.5">
          <p className="text-sm text-muted-foreground">Return</p>
          <ReturnValue value={returnPct} className="text-lg" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <p className="text-muted-foreground">
          Invested since <span className="font-medium text-[#47475d]">{investedSince}</span>
        </p>
        <span aria-hidden className="hidden h-3 w-px bg-black/10 sm:block" />
        <p className="text-muted-foreground">
          Net cash flow <span className="font-medium tabular-nums text-[#47475d]">{usd(netCashFlow)}</span>
        </p>
      </div>
    </div>
  )
}
