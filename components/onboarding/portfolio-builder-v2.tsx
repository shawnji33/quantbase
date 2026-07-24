"use client"

// DRAFT — portfolio builder v2, for team review only. Lives at /drafts/portfolio
// and is not wired into the production onboarding flow.
// Matched to the team's Figma revision (node 24262:1084):
// header row with Continue up top · donut + stat tiles hero · flat allocation
// list · gray "Add strategies" panel (no search) · "Why we built this for you"
// in the right rail · donut segments with rounded (6px) corners.
// On xl+ the layout opens up Wealthsimple-style: wider container, donut +
// "My portfolio" masthead (stat tiles fold into its subtitle). The page is
// capped to the viewport: hero, allocation header and right rail stay put,
// only the holdings list scrolls (boundary marked by the header's border).

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBuildingLine,
  RiCheckboxCircleFill,
  RiCheckLine,
  RiCloseLine,
  RiCoinsLine,
  RiEqualizer2Line,
  RiFilterOffLine,
  RiScales3Line,
  RiSparklingLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { PriceChart } from "@/components/price-chart"
import { cn } from "@/lib/utils"
import { strategies, riskLabel, fmtPct, type Strategy } from "@/lib/strategies"
import { recommendPortfolio, type IntentPath, type Weighted } from "@/lib/onboarding"
import { OnboardingShell } from "@/components/onboarding/shells"
import { IntentStep } from "@/components/onboarding/steps-about"

const byId = new Map(strategies.map((s) => [s.id, s]))

// Categorical palette anchored on the brand purple.
const COLORS = ["#7046E5", "#4E9BE8", "#5FBF8F", "#E8B84E", "#E86F9A", "#6FD4D4", "#B49CF6", "#8B8FA8"]

const SEEDED = recommendPortfolio("hold", { Stocks: 2, Cryptocurrency: 1 })

// The reasoning behind the seeded recommendation, made legible.
const WHY = [
  {
    icon: RiScales3Line,
    text: "You'd hold through a 30% drop, so strategies up to high risk stayed on the table.",
  },
  {
    icon: RiFilterOffLine,
    text: "Under a year of crypto experience, so crypto-heavy strategies were filtered out.",
  },
  {
    icon: RiSparklingLine,
    text: "The best long-run performers that fit were weighted 40/30/20/10, calmer picks first.",
  },
]

export function PortfolioBuilderDraft() {
  const router = useRouter()
  const [holdings, setHoldings] = useState<Weighted[]>(SEEDED)
  const [hovered, setHovered] = useState<string | null>(null)

  // in-place drill-ins (push/pop via the shell's step animation):
  // intent ← builder → market. Back from the builder revisits the intent fork.
  const [view, setView] = useState<"intent" | "builder" | "market">("builder")
  const [dir, setDir] = useState<1 | -1>(1)
  const [marketSel, setMarketSel] = useState(strategies[0].id)
  const [intent, setIntent] = useState<IntentPath | null>("guided")

  // toast: enter + timed exit animation pair, finalized on animationend
  const [toast, setToast] = useState<{ key: number; message: string; leaving: boolean } | null>(
    null,
  )
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ key: Date.now(), message, leaving: false })
    toastTimer.current = setTimeout(
      () => setToast((t) => (t ? { ...t, leaving: true } : t)),
      2600,
    )
  }

  const total = holdings.reduce((sum, h) => sum + h.weight, 0)
  const balanced = total === 100

  const largest = holdings.reduce<Weighted | null>(
    (best, h) => (best === null || h.weight > best.weight ? h : best),
    null,
  )

  const colorOf = (id: string) => COLORS[holdings.findIndex((h) => h.id === id) % COLORS.length]

  function setWeight(id: string, weight: number) {
    const w = Math.max(0, Math.min(100, Math.round(weight)))
    setHoldings((hs) => hs.map((h) => (h.id === id ? { ...h, weight: w } : h)))
  }

  function nudge(id: string, delta: number) {
    const h = holdings.find((x) => x.id === id)
    if (h) setWeight(id, h.weight + delta)
  }

  function remove(id: string) {
    setHoldings((hs) => hs.filter((h) => h.id !== id))
  }

  function add(id: string) {
    setHoldings((hs) => (hs.some((h) => h.id === id) ? hs : [...hs, { id, weight: 5 }]))
  }

  function distributeEqually() {
    setHoldings((hs) => {
      if (hs.length === 0) return hs
      const base = Math.floor(100 / hs.length)
      return hs.map((h, i) => ({ ...h, weight: i === 0 ? 100 - base * (hs.length - 1) : base }))
    })
  }

  // "Most invested" — the top performers not already in the portfolio.
  const suggestions = useMemo(() => {
    const inPortfolio = new Set(holdings.map((h) => h.id))
    return strategies
      .filter((s) => !inPortfolio.has(s.id))
      .sort((a, b) => b.oneYear - a.oneYear)
      .slice(0, 4)
  }, [holdings])

  return (
    <OnboardingShell
      phaseIdx={view === "intent" ? 0 : 1}
      phaseFrac={1}
      canBack
      onBack={() => {
        if (view === "market") {
          setDir(-1)
          setView("builder")
        } else if (view === "builder") {
          setDir(-1)
          setView("intent")
        } else {
          router.back()
        }
      }}
      onExit={() => router.push("/login")}
      onJumpPhase={() => {}}
      allocations={holdings}
      dir={dir}
      stepKey={`portfolio-${view}`}
    >
      {view === "intent" ? (
        <IntentStep
          intent={intent}
          onSelect={setIntent}
          onContinue={() => {
            setDir(1)
            setView("builder")
          }}
        />
      ) : view === "market" ? (
        <MarketView
          selected={marketSel}
          onSelect={setMarketSel}
          inPortfolio={new Set(holdings.map((h) => h.id))}
          onToggle={(s) => {
            if (holdings.some((h) => h.id === s.id)) {
              remove(s.id)
              showToast(`${s.name} removed from your portfolio`)
            } else {
              add(s.id)
              showToast(`${s.name} added to your portfolio`)
            }
          }}
        />
      ) : (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-16 xl:h-[calc(100svh-3.5rem)] xl:max-w-[1440px] xl:gap-8 xl:overflow-hidden xl:px-10 xl:pt-10 xl:pb-8">
        {/* header: title + Continue up top */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-[#363643]">
            Build your portfolio
          </h1>
          <Button size="lg" disabled={!balanced || holdings.length === 0}>
            Continue
            <RiArrowRightLine className="size-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch xl:gap-x-10 2xl:gap-x-16">
          {/* ---------- left column ---------- */}
          <div className="flex min-w-0 flex-col gap-6 xl:min-h-0 xl:gap-8">
            {/* hero: donut + stat tiles (xl+: donut + masthead) */}
            <div className="flex flex-col items-center gap-6 md:flex-row xl:gap-10 xl:py-4 2xl:gap-12 2xl:py-6">
              <Donut
                holdings={holdings}
                colorOf={colorOf}
                hovered={hovered}
                onHover={setHovered}
                total={total}
              />
              <div className="hidden min-w-0 flex-1 flex-col gap-2.5 xl:flex">
                <h2 className="text-3xl font-semibold tracking-tight text-[#363643] 2xl:text-4xl">
                  My portfolio
                </h2>
                <p className="text-sm text-muted-foreground">
                  {holdings.length} {holdings.length === 1 ? "strategy" : "strategies"}
                  {largest &&
                    ` · Largest position ${largest.weight}% ${byId.get(largest.id)?.name ?? ""}`}
                </p>
              </div>
              <div className="flex w-full flex-1 flex-col justify-center gap-6 self-stretch xl:hidden">
                <StatCard
                  label="Largest position"
                  value={largest ? `${largest.weight}%` : "—"}
                  sub={largest ? byId.get(largest.id)?.name : undefined}
                />
                <StatCard label="Number of strategies" value={String(holdings.length)} />
              </div>
            </div>

            <hr className="border-t border-[var(--border-secondary)] xl:hidden" />

            {/* allocation header — border marks the scroll boundary on xl */}
            <div className="flex flex-wrap items-center justify-between gap-3 xl:border-b xl:border-[var(--border-secondary)] xl:pb-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-base font-semibold text-[#363643]">Allocation</h2>
                <span className="text-sm text-muted-foreground">
                  {holdings.length} {holdings.length === 1 ? "strategy" : "strategies"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={distributeEqually}>
                  <RiEqualizer2Line className="size-4" />
                  Distribute equally
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setHoldings(SEEDED)}
                >
                  Reset
                </Button>
                <span
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums",
                    balanced ? "bg-[#1d7e4f]/10 text-[#1d7e4f]" : "bg-[#d92d20]/10 text-[#d92d20]",
                  )}
                >
                  Total: {total}%
                </span>
              </div>
            </div>

            {/* rows — the only scrollable region on xl */}
            <div className="-mt-1 flex flex-col gap-3 xl:min-h-0 xl:flex-1 xl:-mx-1 xl:overflow-y-auto xl:px-1 xl:pt-1 xl:pb-4">
              {holdings.map((h) => {
                const s = byId.get(h.id)
                if (!s) return null
                return (
                  <HoldingRow
                    key={h.id}
                    s={s}
                    weight={h.weight}
                    color={colorOf(h.id)}
                    dimmed={hovered !== null && hovered !== h.id}
                    onHover={(on) => setHovered(on ? h.id : null)}
                    onWeight={(w) => setWeight(h.id, w)}
                    onNudge={(d) => nudge(h.id, d)}
                    onRemove={() => remove(h.id)}
                  />
                )
              })}
              {holdings.length === 0 && (
                <div className="flex items-center justify-center rounded-[14px] border border-dashed border-black/10 py-10 text-sm text-muted-foreground">
                  Add a strategy to start building.
                </div>
              )}
            </div>
          </div>

          {/* ---------- right column — fixed in place on xl (page doesn't scroll) ---------- */}
          <div className="flex flex-col gap-6">
            {/* gray "Add strategies" panel */}
            <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--border-secondary)] bg-[#efefef] p-[13px] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2.5 px-1 pt-1">
                <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                  <RiAddLine className="size-4.5" />
                </span>
                <h2 className="text-base font-semibold text-[#363643]">Add strategies</h2>
              </div>

              {/* inner list card */}
              <div className="flex flex-col rounded-[12px] border border-[var(--border-secondary)] bg-[#fcfcfc] p-[5px]">
                <p className="px-[13px] pt-[9px] pb-1 text-xs font-medium text-[#575872]">
                  Most invested
                </p>
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-[10px] px-[13px] py-[11px] transition-colors hover:bg-black/[0.03]"
                  >
                    <div className="flex min-w-0 flex-1 items-baseline gap-2">
                      <p className="truncate text-sm font-medium text-[#363643]">{s.name}</p>
                      <p
                        className={cn(
                          "shrink-0 text-xs whitespace-nowrap",
                          s.oneYear >= 0 ? "text-[#1d7e4f]" : "text-[#d92d20]",
                        )}
                      >
                        {s.oneYear >= 0 ? "+" : ""}
                        {s.oneYear.toFixed(2)}% 1Y
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => add(s.id)}
                      aria-label={`Add ${s.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#575872] transition-colors hover:border-primary/40 hover:bg-primary hover:text-white"
                    >
                      <RiAddLine className="size-4" />
                    </button>
                  </div>
                ))}
                {suggestions.length === 0 && (
                  <p className="px-[13px] py-4 text-center text-sm text-muted-foreground">
                    Everything is in your portfolio.
                  </p>
                )}
              </div>

              {/* marketplace drill-in */}
              <button
                type="button"
                onClick={() => {
                  setDir(1)
                  setView("market")
                }}
                className="group flex items-center justify-between rounded-[12px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-[17px] py-[15px] text-left transition-colors hover:bg-white"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#363643]">Browse marketplace</p>
                  <p className="text-xs text-muted-foreground">View all strategies on Quantbase</p>
                </div>
                <RiArrowRightSLine className="size-5 text-[#71717b] transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* why we built this */}
            <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-[21px] shadow-[var(--shadow-card)]">
              <p className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
                Why we built this for you
              </p>
              <ul className="flex flex-col gap-2.5 pt-3">
                {WHY.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm leading-5 text-[#47475d]">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* add-to-portfolio toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
          <div
            key={toast.key}
            onAnimationEnd={() => {
              if (toast.leaving) setToast(null)
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-full bg-[#363643] py-2.5 pr-5 pl-3.5 text-sm font-medium text-white shadow-[0px_12px_32px_rgba(10,13,18,0.24)]",
              toast.leaving
                ? "animate-out fade-out slide-out-to-bottom-3 fill-mode-forwards duration-200 ease-in"
                : "animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out",
            )}
          >
            <RiCheckboxCircleFill className="size-5 shrink-0 text-[#5fbf8f]" />
            {toast.message}
          </div>
        </div>
      )}
    </OnboardingShell>
  )
}

/* ------------------------------- marketplace -------------------------------- */
// In-place master-detail: strategy list on the left, details on the right.
// Same viewport-capped behavior as the builder on xl — only the panes scroll.

const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function MarketView({
  selected,
  onSelect,
  inPortfolio,
  onToggle,
}: {
  selected: string
  onSelect: (id: string) => void
  inPortfolio: Set<string>
  onToggle: (s: Strategy) => void
}) {
  const s = byId.get(selected) ?? strategies[0]
  const added = inPortfolio.has(s.id)
  const endValue = usdWhole.format((10000 * s.series[s.series.length - 1]) / s.series[0])

  // x-axis year ticks, inception → the series' end (mid-2026)
  const END_YEAR = 2026
  const span = END_YEAR - s.inceptionYear
  const tickCount = Math.min(4, span + 1)
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.round(s.inceptionYear + (span * i) / Math.max(tickCount - 1, 1)),
  )

  const groups: { label: string; items: Strategy[] }[] = [
    { label: "Quantbase strategies", items: strategies.filter((x) => !x.partner) },
    { label: "Partner strategies", items: strategies.filter((x) => x.partner) },
  ]

  const considerations = [
    {
      icon: RiScales3Line,
      text: `${riskLabel(s.risk)} risk (${s.risk.toFixed(1)}/5) — expect daily moves around ±${s.dailyVol.toFixed(1)}%.`,
    },
    {
      icon: RiArrowDownLine,
      text: `Its worst peak-to-trough decline was ${s.maxDrawdown.toFixed(1)}%. Be ready to hold through similar swings.`,
    },
    {
      icon: RiCoinsLine,
      text: `You can start with as little as ${usdWhole.format(s.minInvest)}.`,
    },
    {
      icon: RiBuildingLine,
      text: s.partner
        ? `Managed by ${s.manager}, a partner fund on Quantbase.`
        : "Managed in-house by Quantbase.",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-8 pb-16 xl:h-[calc(100svh-3.5rem)] xl:max-w-[1440px] xl:gap-8 xl:overflow-hidden xl:px-10 xl:pt-10 xl:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#363643]">
          Strategy marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore every strategy on Quantbase and add the ones you like.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-stretch xl:gap-x-10">
        {/* master list */}
        <nav className="flex flex-col gap-5 xl:min-h-0 xl:overflow-y-auto xl:pr-1 xl:pb-4">
          {groups.map((g) => (
            <div key={g.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-xs font-medium text-[#575872]">{g.label}</p>
              {g.items.map((x) => {
                const active = x.id === selected
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => onSelect(x.id)}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "bg-black/[0.05] font-medium text-[#363643]"
                        : "text-[#575872] hover:bg-black/[0.03]",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{x.name}</span>
                    {inPortfolio.has(x.id) && (
                      <RiCheckLine className="size-4 shrink-0 text-[#1d7e4f]" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* detail pane */}
        <div
          key={s.id}
          className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-black/[0.04] bg-[#eeeeef] p-6 shadow-[0px_12px_32px_rgba(10,13,18,0.08)] duration-300 ease-out animate-in fade-in slide-in-from-right-2 xl:max-h-full xl:self-start xl:overflow-y-auto xl:p-8"
        >
          {/* header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-[#363643]">{s.name}</h2>
              <p className="max-w-xl text-sm leading-5 text-muted-foreground">{s.blurb}</p>
              <p className="text-xs text-muted-foreground">
                {s.manager} · {riskLabel(s.risk)} risk · Since {s.inceptionYear}
              </p>
            </div>
            <Button
              size="lg"
              variant={added ? "secondary" : "default"}
              onClick={() => onToggle(s)}
            >
              {added ? (
                <>
                  <RiCheckLine className="size-5" />
                  In portfolio
                </>
              ) : (
                <>
                  <RiAddLine className="size-5" />
                  Add to portfolio
                </>
              )}
            </Button>
          </div>

          {/* chart card */}
          <div className="rounded-[12px] border border-[var(--border-secondary)] bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4">
              <div>
                <p className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
                  Growth of $10,000 since {s.inceptionYear}
                </p>
                <p className="pt-1 text-2xl font-semibold tabular-nums text-[#363643]">
                  {endValue}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm font-medium tabular-nums",
                  s.inceptionReturn >= 0 ? "text-[#1d7e4f]" : "text-[#d92d20]",
                )}
              >
                {fmtPct(s.inceptionReturn)} since inception
              </p>
            </div>
            <PriceChart
              data={s.series}
              startYear={s.inceptionYear}
              height={180}
              gradientId={`market-${s.id}`}
            />
            {/* x-axis timeline */}
            <div className="mt-2 flex items-center justify-between border-t border-[var(--border-secondary)] pt-2 text-[11px] tabular-nums text-muted-foreground">
              {ticks.map((y) => (
                <span key={y}>{y}</span>
              ))}
            </div>
            <p className="pt-3 text-[11px] leading-4 text-muted-foreground">
              Hypothetical growth based on historical performance. Past results are no guarantee
              of future returns.
            </p>
          </div>

          {/* fund details */}
          <div className="rounded-[12px] border border-[var(--border-secondary)] bg-white p-5">
            <p className="pb-4 text-sm font-semibold text-[#363643]">Fund details</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
              <MarketStat label="1-year return" value={fmtPct(s.oneYear)} signed={s.oneYear} />
              <MarketStat label="3-year return" value={fmtPct(s.threeYear)} signed={s.threeYear} />
              <MarketStat
                label="Since inception"
                value={fmtPct(s.inceptionReturn)}
                signed={s.inceptionReturn}
              />
              <MarketStat label="Risk" value={`${riskLabel(s.risk)} · ${s.risk.toFixed(1)}/5`} />
              <MarketStat label="Daily volatility" value={`${s.dailyVol.toFixed(2)}%`} />
              <MarketStat label="Max drawdown" value={`${s.maxDrawdown.toFixed(1)}%`} />
              <MarketStat label="Minimum investment" value={usdWhole.format(s.minInvest)} />
              <MarketStat label="Inception year" value={String(s.inceptionYear)} />
            </dl>
          </div>

          {/* key considerations */}
          <div className="rounded-[12px] border border-[var(--border-secondary)] bg-white p-5">
            <p className="pb-3 text-sm font-semibold text-[#363643]">Key considerations</p>
            <ul className="flex flex-col gap-2.5">
              {considerations.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm leading-5 text-[#47475d]">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function MarketStat({ label, value, signed }: { label: string; value: string; signed?: number }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm font-medium tabular-nums",
          signed === undefined
            ? "text-[#363643]"
            : signed >= 0
              ? "text-[#1d7e4f]"
              : "text-[#d92d20]",
        )}
      >
        {value}
      </dd>
    </div>
  )
}

/* -------------------------------- stat card --------------------------------- */

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[16px] border border-[var(--border-secondary)] bg-card p-[21px] shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium tracking-[0.3px] text-muted-foreground">{label}</p>
      <p className="text-base font-medium text-[#363643]">{value}</p>
      {sub && <p className="text-xs leading-[18px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

/* ---------------------------------- donut ----------------------------------- */
// Filled annular-sector paths with rounded (6px) corners — dash-array strokes
// can't round per-segment corners.

const TAU = Math.PI * 2

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function sectorPath(
  cx: number,
  cy: number,
  ro: number,
  ri: number,
  a0: number,
  a1: number,
  corner: number,
): string {
  const span = a1 - a0
  const rr = Math.min(corner, (ro - ri) / 2)
  const po = Math.min(rr / ro, span / 2)
  const pi = Math.min(rr / ri, span / 2)
  const p = (r: number, a: number) => polar(cx, cy, r, a).map((v) => v.toFixed(2)).join(" ")
  const largeO = span - 2 * po > Math.PI ? 1 : 0
  const largeI = span - 2 * pi > Math.PI ? 1 : 0
  return [
    `M ${p(ro, a0 + po)}`,
    `A ${ro} ${ro} 0 ${largeO} 1 ${p(ro, a1 - po)}`, // outer arc
    `A ${rr} ${rr} 0 0 1 ${p(ro - rr, a1)}`, // corner
    `L ${p(ri + rr, a1)}`, // end edge
    `A ${rr} ${rr} 0 0 1 ${p(ri, a1 - pi)}`, // corner
    `A ${ri} ${ri} 0 ${largeI} 0 ${p(ri, a0 + pi)}`, // inner arc (back)
    `A ${rr} ${rr} 0 0 1 ${p(ri + rr, a0)}`, // corner
    `L ${p(ro - rr, a0)}`, // start edge
    `A ${rr} ${rr} 0 0 1 ${p(ro, a0 + po)}`, // corner
    "Z",
  ].join(" ")
}

function Donut({
  holdings,
  colorOf,
  hovered,
  onHover,
  total,
}: {
  holdings: Weighted[]
  colorOf: (id: string) => string
  hovered: string | null
  onHover: (id: string | null) => void
  total: number
}) {
  const SIZE = 240
  const CX = SIZE / 2
  const RO = 103
  const RI = 73
  const CORNER = 6
  const GAP = 0.045 // radians between segments

  const hoveredHolding = hovered ? holdings.find((h) => h.id === hovered) : null
  const hoveredStrategy = hovered ? byId.get(hovered) : null

  const denom = Math.max(total, 1)
  const visible = holdings.filter((h) => h.weight > 0)
  const gap = visible.length > 1 ? GAP : 0

  const segments: { h: Weighted; a0: number; a1: number }[] = []
  {
    let angle = -Math.PI / 2
    for (const h of visible) {
      const sweep = (h.weight / denom) * TAU
      segments.push({ h, a0: angle + gap / 2, a1: angle + Math.max(sweep - gap / 2, gap) })
      angle += sweep
    }
  }

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Portfolio allocation">
        {/* track */}
        <circle cx={CX} cy={CX} r={(RO + RI) / 2} fill="none" stroke="#eeedf1" strokeWidth={RO - RI} />
        {segments.map(({ h, a0, a1 }) => {
          const active = hovered === h.id
          const grow = active ? 4 : 0
          return (
            <path
              key={h.id}
              d={sectorPath(CX, CX, RO + grow, RI - grow, a0, a1, CORNER)}
              fill={colorOf(h.id)}
              opacity={hovered !== null && !active ? 0.35 : 1}
              onMouseEnter={() => onHover(h.id)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer transition-opacity duration-200 ease-out"
            />
          )
        })}
      </svg>

      {/* center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-10 text-center">
        {hoveredStrategy && hoveredHolding ? (
          <>
            <p className="flex items-center gap-1.5 text-xs leading-4 font-medium text-[#363643]">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colorOf(hoveredStrategy.id) }}
              />
              {hoveredStrategy.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round((hoveredHolding.weight / denom) * 100)}% of portfolio
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold tabular-nums text-[#363643]">{total}%</p>
            <p className="text-xs text-muted-foreground">allocated</p>
          </>
        )}
      </div>
    </div>
  )
}

/* ----------------------------------- row ------------------------------------ */

function HoldingRow({
  s,
  weight,
  color,
  dimmed,
  onHover,
  onWeight,
  onNudge,
  onRemove,
}: {
  s: Strategy
  weight: number
  color: string
  dimmed: boolean
  onHover: (on: boolean) => void
  onWeight: (w: number) => void
  onNudge: (delta: number) => void
  onRemove: () => void
}) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "flex items-center gap-3 rounded-[14px] border border-[var(--border-secondary)] bg-white px-[17px] py-[13px] shadow-[var(--shadow-card)] transition-opacity duration-200",
        dimmed && "opacity-50",
      )}
    >
      <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#363643]">{s.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {s.manager} · {riskLabel(s.risk)} risk
        </p>
      </div>

      {/* stepper — no auto-adjust; the Total gates Continue instead */}
      <div className="flex shrink-0 items-center rounded-[10px] border border-black/10 bg-white p-px">
        <button
          type="button"
          onClick={() => onNudge(-5)}
          aria-label={`Decrease ${s.name} by 5%`}
          className="flex size-8 items-center justify-center rounded-l-[9px] text-base text-[#575872] transition-colors hover:bg-muted disabled:opacity-40"
          disabled={weight <= 0}
        >
          −
        </button>
        <div className="relative border-x border-black/10">
          <input
            value={weight}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/\D/g, ""), 10)
              onWeight(Number.isNaN(n) ? 0 : n)
            }}
            inputMode="numeric"
            aria-label={`${s.name} weight percent`}
            className="h-8 w-[50px] bg-transparent pr-4 text-center text-sm font-medium tabular-nums text-[#363643] outline-none"
          />
          <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-xs text-muted-foreground">
            %
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNudge(5)}
          aria-label={`Increase ${s.name} by 5%`}
          className="flex size-8 items-center justify-center rounded-r-[9px] text-base text-[#575872] transition-colors hover:bg-muted disabled:opacity-40"
          disabled={weight >= 100}
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${s.name}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <RiCloseLine className="size-4" />
      </button>
    </div>
  )
}
