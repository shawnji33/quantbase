"use client"

import { useMemo, useState } from "react"
import { RiSearchLine, RiLayoutGridLine, RiListCheck } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { strategies, CATEGORIES, type Category } from "@/lib/strategies"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SparklineCard } from "./card-sparkline"
import { StatCard } from "./card-stat"
import { ListTable } from "./list-table"

type Variant = "sparkline" | "stat" | "list"
type Sort = "perfInception" | "perf1y" | "titleAsc" | "titleDesc"

const SORT_LABELS: Record<Sort, string> = {
  perfInception: "Performance (Inception)",
  perf1y: "Performance (1-Year)",
  titleAsc: "Title (A-Z)",
  titleDesc: "Title (Z-A)",
}

export function Marketplace({ variant }: { variant: Variant }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Category[]>([])
  const [sort, setSort] = useState<Sort>("perfInception")
  const [view, setView] = useState<"grid" | "list">(
    variant === "list" ? "list" : "grid",
  )

  function toggleCategory(c: (typeof CATEGORIES)[number]) {
    if (c === "All") {
      setSelected([])
      return
    }
    setSelected((prev) =>
      prev.includes(c as Category)
        ? prev.filter((x) => x !== c)
        : [...prev, c as Category],
    )
  }

  function clearAll() {
    setQuery("")
    setSelected([])
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return strategies
      .filter(
        (s) =>
          selected.length === 0 ||
          s.categories.some((c) => selected.includes(c)),
      )
      .filter(
        (s) =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.manager.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        switch (sort) {
          case "perf1y":
            return b.oneYear - a.oneYear
          case "titleAsc":
            return a.name.localeCompare(b.name)
          case "titleDesc":
            return b.name.localeCompare(a.name)
          case "perfInception":
          default:
            return b.inceptionReturn - a.inceptionReturn
        }
      })
  }, [query, selected, sort])

  const showToggle = variant === "list"
  const asList = showToggle && view === "list"

  // Changing sort or filters remounts the results so they animate in.
  const animKey = `${selected.join(",")}|${sort}`

  return (
    <div className="mx-auto w-full max-w-[1344px] px-6 py-8">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Explore strategies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated portfolios you can invest in — {results.length} available.
          </p>
        </div>

        {showToggle && (
          <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={`${v} view`}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-colors",
                  view === v
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "grid" ? (
                  <RiLayoutGridLine className="size-4" />
                ) : (
                  <RiListCheck className="size-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <RiSearchLine className="absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategies…"
            className="h-11 bg-white pl-10 text-sm"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {CATEGORIES.map((c) => {
            const active =
              c === "All" ? selected.length === 0 : selected.includes(c as Category)
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-all duration-150 active:scale-[0.96] motion-reduce:transition-none",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c}
              </button>
            )
          })}
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="h-11! w-full bg-white lg:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* results — re-animates on sort/filter; entering cards fade in on search */}
      {results.length === 0 ? (
        <div className="flex animate-in flex-col items-center gap-4 rounded-xl border border-dashed py-20 text-center duration-300 fade-in">
          <p className="text-sm text-muted-foreground">
            No strategies match your search or filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      ) : asList ? (
        <div
          key={animKey}
          className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
        >
          <ListTable items={results} />
        </div>
      ) : (
        <div key={animKey} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s, i) => (
            <div
              key={s.id}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 motion-reduce:animate-none"
              style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
            >
              {variant === "stat" ? <StatCard s={s} /> : <SparklineCard s={s} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
