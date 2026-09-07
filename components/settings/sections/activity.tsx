"use client"

// Activity. A date-range filter and pagination instead of an unbounded scroll,
// and no status column: "completed" is the default and repeating it on every
// row is noise. Only pending and failed earn a pill, because only those need
// the reader to do something.

import { useEffect, useMemo, useState } from "react"
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCoinsLine,
  RiShieldKeyholeLine,
  RiStockLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { usd } from "@/lib/portfolio"
import {
  ACTIVITY,
  DATE_RANGES,
  SECTIONS,
  formatActivityDate,
  type ActivityEvent,
  type ActivityKind,
  type DateRangeId,
} from "@/lib/settings"
import { useSettings } from "@/components/settings/settings-context"
import { Card, Panel, PanelHeader, RowSkeleton, StatusPill } from "@/components/settings/settings-ui"
import { Pager } from "@/components/settings/sections/documents"

const PAGE_SIZE = 6

const KIND_ICON: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  deposit: RiArrowDownLine,
  withdrawal: RiArrowUpLine,
  buy: RiStockLine,
  sell: RiStockLine,
  dividend: RiCoinsLine,
  security: RiShieldKeyholeLine,
}

// Money in is green, money out is red, buys and sells are neutral — colouring a
// trade implies it went well or badly, which the transaction itself can't know.
function amountColor(kind: ActivityKind) {
  if (kind === "deposit" || kind === "dividend") return "#1d7e4f"
  if (kind === "withdrawal") return "#d92d20"
  return "#363643"
}

function amountPrefix(kind: ActivityKind) {
  if (kind === "deposit" || kind === "dividend") return "+"
  if (kind === "withdrawal") return "−"
  return ""
}

function Row({ event }: { event: ActivityEvent }) {
  const Icon = KIND_ICON[event.kind]
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-2 text-sm font-medium text-[#363643]">
          <span className="truncate">{event.label}</span>
          {/* Only exceptions get a pill. */}
          {event.status === "pending" && <StatusPill tone="muted">Pending</StatusPill>}
          {event.status === "failed" && <StatusPill tone="warn">Failed</StatusPill>}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {event.detail} · {formatActivityDate(event.daysAgo)}
        </p>
      </div>
      {event.amount !== null && (
        <span
          className="shrink-0 text-sm font-medium tabular-nums"
          style={{ color: amountColor(event.kind) }}
        >
          {amountPrefix(event.kind)}
          {usd(event.amount)}
        </span>
      )}
    </div>
  )
}

export function ActivityPanel() {
  const { slowLoad } = useSettings()
  const [range, setRange] = useState<DateRangeId>("3m")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- simulated fetch */
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), slowLoad ? 2200 : 350)
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => window.clearTimeout(t)
  }, [slowLoad, range])

  const filtered = useMemo(() => {
    const days = DATE_RANGES.find((r) => r.id === range)!.days
    return ACTIVITY.filter((e) => e.daysAgo <= days)
  }, [range])

  const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
  const shown = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Panel>
      <PanelHeader title={SECTIONS.activity.title} blurb={SECTIONS.activity.blurb} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <h3 className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
            Showing
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {DATE_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={range === r.id}
                onClick={() => {
                  setRange(r.id)
                  setPage(0)
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
                  "focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none",
                  range === r.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-[var(--border-secondary)] bg-card text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          {loading ? (
            <RowSkeleton rows={PAGE_SIZE} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#363643]">Nothing in this period</p>
              <p className="text-xs text-muted-foreground">
                Try a longer date range to see older activity.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
                {shown.map((e) => (
                  <Row key={e.id} event={e} />
                ))}
              </div>
              <Pager
                page={page}
                pages={pages}
                onPage={setPage}
                total={filtered.length}
                noun="events"
              />
            </>
          )}
        </Card>
      </div>
    </Panel>
  )
}
