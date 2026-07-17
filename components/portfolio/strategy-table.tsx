"use client"

// Strategy comparison table (§R1.4): pure comparison + navigation, no longer a
// selection toggle. Rows link to the strategy detail view with a chevron
// affordance. Client-side sorting on Value/Returns (§7.11, zero backend).
// The aggregate is pinned as a distinct total row, not a sibling (§R1.5).

import { useMemo, useState } from "react"
import Link from "next/link"
import { RiArrowDownSLine, RiArrowRightSLine, RiArrowUpSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import {
  HELD_STRATEGIES,
  PORTFOLIO,
  seriesFor,
  sliceRange,
  usd,
  type Range,
} from "@/lib/portfolio"
import { ReturnValue, Sparkline } from "@/components/portfolio/bits"

type SortKey = "name" | "value" | "returnPct"
type SortDir = "asc" | "desc"

export function StrategyTable({ range }: { range: Range }) {
  const [sortKey, setSortKey] = useState<SortKey>("value")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const rows = useMemo(() => {
    const sorted = [...HELD_STRATEGIES].sort((a, b) => {
      const cmp =
        sortKey === "name" ? a.name.localeCompare(b.name) : a[sortKey] - b[sortKey]
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir(key === "name" ? "asc" : "desc")
    }
  }

  const SortIcon = sortDir === "asc" ? RiArrowUpSLine : RiArrowDownSLine

  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--border-secondary)] bg-card shadow-[var(--shadow-card)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-secondary)] text-left text-xs font-medium text-muted-foreground">
            <th className="py-3 pl-5 font-medium">
              <HeaderButton active={sortKey === "name"} onClick={() => toggleSort("name")}>
                Name {sortKey === "name" && <SortIcon className="size-3.5" />}
              </HeaderButton>
            </th>
            <th aria-label="Trend" className="hidden w-24 px-3 sm:table-cell" />
            <th className="w-24 px-3 text-right font-medium">Weight</th>
            <th className="w-32 px-3 text-right font-medium">
              <HeaderButton active={sortKey === "value"} onClick={() => toggleSort("value")} className="ml-auto">
                Value {sortKey === "value" && <SortIcon className="size-3.5" />}
              </HeaderButton>
            </th>
            <th className="w-28 px-3 text-right font-medium">
              <HeaderButton active={sortKey === "returnPct"} onClick={() => toggleSort("returnPct")} className="ml-auto">
                Returns {sortKey === "returnPct" && <SortIcon className="size-3.5" />}
              </HeaderButton>
            </th>
            <th aria-label="Open" className="w-12 pr-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="group border-b border-[var(--border-secondary)] last:border-b-0">
              <td colSpan={6} className="p-0">
                <Link
                  href={`/portfolio/${s.id}`}
                  className="grid grid-cols-[1fr_6rem_8rem_7rem_3rem] items-center transition-colors group-hover:bg-black/[0.025] sm:grid-cols-[1fr_6rem_6rem_8rem_7rem_3rem]"
                >
                  <span className="truncate py-3.5 pl-5 font-medium text-[#363643]">{s.name}</span>
                  <span className="hidden justify-center px-3 sm:flex">
                    <Sparkline data={sliceRange(seriesFor(s), range)} />
                  </span>
                  <span className="px-3 text-right tabular-nums text-muted-foreground">
                    {((s.value / PORTFOLIO.value) * 100).toFixed(1)}%
                  </span>
                  <span className="px-3 text-right font-medium tabular-nums text-[#363643]">
                    {usd(s.value)}
                  </span>
                  <span className="px-3 text-right">
                    <ReturnValue value={s.returnPct} className="text-sm" />
                  </span>
                  <span className="flex justify-end pr-4 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]">
                    <RiArrowRightSLine className="size-4.5" />
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
        {/* pinned aggregate total — the page itself, not a navigable sibling (§R1.5) */}
        <tfoot>
          <tr className="border-t border-[var(--border-secondary)] bg-[#fafafa]">
            <td className="py-3.5 pl-5 text-sm font-semibold text-[#363643]">Total · {PORTFOLIO.name}</td>
            <td className="hidden sm:table-cell" />
            <td className="px-3 text-right tabular-nums text-muted-foreground">100%</td>
            <td className="px-3 text-right font-semibold tabular-nums text-[#363643]">
              {usd(PORTFOLIO.value)}
            </td>
            <td className="px-3 text-right">
              <ReturnValue value={PORTFOLIO.returnPct} className="text-sm" />
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function HeaderButton({
  children,
  onClick,
  active,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-0.5 transition-colors hover:text-foreground",
        active && "text-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}
