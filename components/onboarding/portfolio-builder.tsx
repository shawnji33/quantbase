"use client"

import { useEffect, useMemo, useState } from "react"
import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiEqualizer2Line,
  RiSearchLine,
  RiSparklingLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { strategies, riskLabel, type Strategy } from "@/lib/strategies"
import type { IntentPath, Weighted } from "@/lib/onboarding"
import { SparklineCard } from "@/components/marketplace/card-sparkline"
import { PartnerBadge, StepShell } from "@/components/onboarding/ui"

const byId = new Map(strategies.map((s) => [s.id, s]))

/* ------------------------------ weight helpers ------------------------------ */

// Rebalance every other holding proportionally so the total stays at 100.
function rebalance(allocs: Weighted[], id: string, nextWeight: number): Weighted[] {
  const w = Math.max(0, Math.min(100, Math.round(nextWeight)))
  const others = allocs.filter((a) => a.id !== id)
  if (others.length === 0) return [{ id, weight: 100 }]

  const otherTotal = 100 - w
  const oldOtherTotal = others.reduce((sum, a) => sum + a.weight, 0)

  let out = allocs.map((a) => {
    if (a.id === id) return { ...a, weight: w }
    const scaled =
      oldOtherTotal === 0 ? otherTotal / others.length : (a.weight / oldOtherTotal) * otherTotal
    return { ...a, weight: scaled }
  })

  // Round to integers and push any drift onto the last non-active holding.
  out = out.map((a) => ({ ...a, weight: Math.round(a.weight) }))
  const drift = 100 - out.reduce((sum, a) => sum + a.weight, 0)
  if (drift !== 0) {
    const target = [...out].reverse().find((a) => a.id !== id && a.weight + drift >= 0)
    if (target) target.weight += drift
    else out[out.length - 1].weight += drift
  }
  return out
}

function addStrategy(allocs: Weighted[], id: string): Weighted[] {
  if (allocs.some((a) => a.id === id)) return allocs
  if (allocs.length === 0) return [{ id, weight: 100 }]
  const incoming = Math.min(20, Math.round(100 / (allocs.length + 1)))
  const scaled = allocs.map((a) => ({ ...a, weight: Math.round((a.weight * (100 - incoming)) / 100) }))
  const total = scaled.reduce((sum, a) => sum + a.weight, 0)
  return [...scaled, { id, weight: 100 - total }]
}

function removeStrategy(allocs: Weighted[], id: string): Weighted[] {
  const rest = allocs.filter((a) => a.id !== id)
  if (rest.length === 0) return []
  const total = rest.reduce((sum, a) => sum + a.weight, 0)
  if (total === 0) return rest.map((a) => ({ ...a, weight: Math.round(100 / rest.length) }))
  const out = rest.map((a) => ({ ...a, weight: Math.round((a.weight / total) * 100) }))
  const drift = 100 - out.reduce((sum, a) => sum + a.weight, 0)
  out[out.length - 1].weight += drift
  return out
}

function equalWeights(allocs: Weighted[]): Weighted[] {
  if (allocs.length === 0) return allocs
  const base = Math.floor(100 / allocs.length)
  return allocs.map((a, i) => ({ ...a, weight: i === 0 ? 100 - base * (allocs.length - 1) : base }))
}

/* ------------------------------ path-aware copy ----------------------------- */

function copyFor(path: IntentPath) {
  switch (path) {
    case "specific":
      return {
        title: "Start with the strategy you came for",
        subtitle: "Find it in the marketplace, then add anything else you like.",
      }
    case "guided":
      return {
        title: "Your recommended starting portfolio",
        subtitle:
          "Built from your answers as a starting point, not a verdict. Adjust, remove, or add anything.",
      }
    case "explore":
      return {
        title: "Build your portfolio",
        subtitle: "Add the strategies you want and set the mix.",
      }
  }
}

/* ------------------------------ Generating step ----------------------------- */
// A short "the system is working for you" moment between the questions and the
// recommendation — checks tick off, then the flow advances on its own.

const GENERATING_LINES = [
  "Analyzing your risk profile",
  `Screening ${strategies.length} strategies`,
  "Balancing your allocation",
]

export function GeneratingStep({ onDone }: { onDone: () => void }) {
  const [lit, setLit] = useState(0) // how many lines are done

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const stepMs = reduced ? 120 : 750
    const timers = GENERATING_LINES.map((_, i) =>
      window.setTimeout(() => setLit(i + 1), (i + 1) * stepMs),
    )
    timers.push(window.setTimeout(onDone, GENERATING_LINES.length * stepMs + (reduced ? 100 : 550)))
    return () => timers.forEach((t) => window.clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-6 py-24 text-center">
      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <RiSparklingLine className="size-7 animate-pulse text-primary" />
        <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-primary/10 [animation-duration:1.6s]" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
        Building your portfolio
      </h1>

      <ul className="flex w-full max-w-xs flex-col gap-3 text-left" aria-live="polite">
        {GENERATING_LINES.map((line, i) => {
          const done = lit > i
          const active = lit === i
          return (
            <li
              key={line}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-colors duration-300",
                done ? "text-[#363643]" : active ? "text-[#575872]" : "text-[#b4b5c5]",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  done ? "bg-[#1d7e4f] text-white" : "border border-black/15 bg-white",
                )}
              >
                {done && <RiCheckLine className="size-3 animate-in zoom-in-50 duration-200" />}
              </span>
              {line}
              {active && <span className="ml-auto flex gap-1" aria-hidden>
                <Dot delay="0ms" /><Dot delay="150ms" /><Dot delay="300ms" />
              </span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1 animate-bounce rounded-full bg-[#b4b5c5]"
      style={{ animationDelay: delay, animationDuration: "0.9s" }}
    />
  )
}

/* --------------------------------- Builder --------------------------------- */

export function PortfolioStep({
  path,
  allocations,
  onChange,
  onContinue,
  continueLabel = "Continue",
}: {
  path: IntentPath
  allocations: Weighted[]
  onChange: (a: Weighted[]) => void
  onContinue: () => void
  continueLabel?: string
}) {
  const { title, subtitle } = copyFor(path)
  const total = allocations.reduce((sum, a) => sum + a.weight, 0)
  const canContinue = allocations.length > 0 && total === 100

  return (
    <StepShell
      width="wide"
      title={title}
      subtitle={subtitle}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {allocations.length === 0
              ? "Add at least one strategy to continue."
              : `${allocations.length} ${allocations.length === 1 ? "strategy" : "strategies"} · ${total}% allocated`}
          </p>
          <Button size="lg" disabled={!canContinue} onClick={onContinue}>
            {continueLabel}
            <RiArrowRightLine className="size-5" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AddStrategyDialog
          allocations={allocations}
          onToggle={(id) =>
            onChange(
              allocations.some((a) => a.id === id)
                ? removeStrategy(allocations, id)
                : addStrategy(allocations, id),
            )
          }
          emphasized={allocations.length === 0}
        />
        {allocations.length > 1 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange(equalWeights(allocations))}>
            <RiEqualizer2Line className="size-4" />
            Weight equally
          </Button>
        )}
      </div>

      {allocations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-dashed border-black/10 bg-card/60 px-6 py-14 text-center">
          <p className="text-sm font-medium text-[#363643]">Your portfolio is empty</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Add your first strategy from the marketplace.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {allocations.map((a, i) => {
            const s = byId.get(a.id)
            if (!s) return null
            return (
              <AllocationRow
                key={a.id}
                s={s}
                index={i}
                weight={a.weight}
                onWeight={(w) => onChange(rebalance(allocations, a.id, w))}
                onRemove={() => onChange(removeStrategy(allocations, a.id))}
              />
            )
          })}
        </div>
      )}
    </StepShell>
  )
}

/* ------------------------------ AllocationRow ------------------------------- */

function AllocationRow({
  s,
  index,
  weight,
  onWeight,
  onRemove,
}: {
  s: Strategy
  index: number
  weight: number
  onWeight: (w: number) => void
  onRemove: () => void
}) {
  const up = s.oneYear >= 0
  return (
    <div
      className="flex flex-col gap-3 rounded-[16px] border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)] animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out sm:flex-row sm:items-center sm:gap-5"
      style={{ animationDelay: `${Math.min(index * 90, 450)}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <MiniSparkline data={s.series} negative={s.oneYear < 0} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[#363643]">{s.name}</p>
            {s.partner && <PartnerBadge>Partner</PartnerBadge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {s.manager} · {riskLabel(s.risk)} risk ·{" "}
            <span className={up ? "text-[#1d7e4f]" : "text-[#d92d20]"}>
              {up ? "+" : ""}
              {s.oneYear.toFixed(2)}% 1Y
            </span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:w-72">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={weight}
          onChange={(e) => onWeight(Number(e.target.value))}
          aria-label={`${s.name} allocation`}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <span className="w-11 text-right text-sm font-medium tabular-nums text-[#363643]">
          {weight}%
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${s.name}`}
          className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RiCloseLine className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Tiny non-interactive equity curve; the full interactive chart lives in the
// marketplace card shown inside the add dialog.
function MiniSparkline({ data, negative }: { data: number[]; negative: boolean }) {
  const w = 64
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={negative ? "#d92d20" : "#7046e5"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ----------------------------- AddStrategyDialog ---------------------------- */

function AddStrategyDialog({
  allocations,
  onToggle,
  emphasized,
}: {
  allocations: Weighted[]
  onToggle: (id: string) => void
  emphasized: boolean
}) {
  const [query, setQuery] = useState("")
  const added = useMemo(() => new Set(allocations.map((a) => a.id)), [allocations])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return strategies
    return strategies.filter(
      (s) => s.name.toLowerCase().includes(q) || s.manager.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={emphasized ? "default" : "secondary"} size="default">
          <RiAddLine className="size-4" />
          Add strategy
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[88svh] flex-col gap-5 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Browse strategies</DialogTitle>
          <DialogDescription>
            The full Quantbase marketplace. Tap once to add a strategy, tap again to remove it.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <RiSearchLine className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategies…"
            className="pl-9"
          />
        </div>
        <div className="-mx-2 grid flex-1 grid-cols-1 content-start gap-4 overflow-y-auto px-2 py-1 sm:grid-cols-2">
          {results.map((s) => {
            const inPortfolio = added.has(s.id)
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-[17px] transition-shadow",
                  inPortfolio && "ring-2 ring-primary/35",
                )}
              >
                <SparklineCard
                  s={s}
                  actionLabel={inPortfolio ? "Remove from portfolio" : "Add to portfolio"}
                  onAction={() => onToggle(s.id)}
                />
              </div>
            )
          })}
          {results.length === 0 && (
            <p className={cn("py-10 text-center text-sm text-muted-foreground", "sm:col-span-2")}>
              No strategies match “{query}”.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border-secondary)] pt-4">
          <p className="text-sm text-muted-foreground">
            {added.size} {added.size === 1 ? "strategy" : "strategies"} in your portfolio
          </p>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
