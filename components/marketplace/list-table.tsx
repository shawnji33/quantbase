import { RiArrowRightLine } from "@remixicon/react"

import type { Strategy } from "@/lib/strategies"
import { fmtPct } from "@/lib/strategies"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkline } from "@/components/sparkline"
import { PartnerBadge, RiskBadge } from "./bits"

/** Concept C — Compact list: a scannable, sortable-feeling table of strategies. */
export function ListTable({ items }: { items: Strategy[] }) {
  return (
    <Card className="overflow-hidden p-0">
      {/* header */}
      <div className="grid grid-cols-[minmax(0,2.4fr)_1fr_0.9fr_1.1fr_1fr_auto] items-center gap-4 border-b bg-muted/40 px-5 py-2.5 text-xs font-medium text-muted-foreground">
        <span>Strategy</span>
        <span>Trend</span>
        <span className="text-right">1Y</span>
        <span className="text-right">Since inception</span>
        <span>Risk</span>
        <span className="sr-only">Action</span>
      </div>

      <div className="divide-y">
        {items.map((s) => (
          <div
            key={s.id}
            className="group grid grid-cols-[minmax(0,2.4fr)_1fr_0.9fr_1.1fr_1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{s.name}</span>
                {s.partner && <PartnerBadge />}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {s.manager} · {s.categories.join(" · ")}
              </p>
            </div>

            <div className="h-8 w-full max-w-28">
              <Sparkline data={s.series} fill={false} strokeWidth={1.75} gradientId={`row-${s.id}`} />
            </div>

            <span className="text-right text-sm font-semibold tabular-nums">
              {fmtPct(s.oneYear)}
            </span>

            <div className="text-right">
              <span className="text-sm font-semibold tabular-nums">
                {fmtPct(s.inceptionReturn)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">'{String(s.inceptionYear).slice(2)}</span>
            </div>

            <RiskBadge risk={s.risk} showValue={false} className="justify-self-start px-1.5" />

            <Button size="sm" variant="outline">
              Invest
              <RiArrowRightLine className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
