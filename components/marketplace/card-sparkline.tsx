import { RiArrowRightLine } from "@remixicon/react"

import type { Strategy } from "@/lib/strategies"
import { PriceChart } from "@/components/price-chart"
import { Button } from "@/components/ui/button"
import { RiskScore } from "@/components/risk-score"

/** Concept A — matches Figma node 24121:14535. */
export function SparklineCard({
  s,
  actionLabel = "Invest",
  actionDisabled = false,
  onAction,
}: {
  s: Strategy
  actionLabel?: string
  actionDisabled?: boolean
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border border-black/5 bg-[#efefef] p-2 shadow-[0px_1px_6px_0px_rgba(10,13,18,0.03)]">
      {/* title block (on the gray frame) */}
      <div className="flex flex-col gap-1 p-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold capitalize tracking-[0.32px] text-[#363643]">
            {s.name}
          </h3>
          {s.partner && (
            <span className="shrink-0 rounded-full border border-[#d7d7e0] bg-[#f6f6f9] px-2 py-0.5 text-xs font-medium text-[#47475d]">
              Partner funds
            </span>
          )}
        </div>
        <p className="text-sm leading-5 text-[#47475d]">{s.blurb}</p>
      </div>

      {/* inner white card */}
      <div className="flex flex-col gap-3 overflow-hidden rounded-[10px] border border-black/[0.08] bg-[#fdfdfd] p-4">
        <div className="h-[140px] w-full">
          <PriceChart
            data={s.series}
            startYear={s.inceptionYear}
            height={140}
            color="#7046e5"
            gradientId={`spark-${s.id}`}
          />
        </div>

        {/* metrics group — returns + risk, 16px gap */}
        <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-start gap-5">
          <Metric label="1-year return">
            <ReturnValue value={s.oneYear} />
          </Metric>

          <Divider />

          <Metric label="3-year return">
            <MetricValue>{fmt(s.threeYear)}</MetricValue>
          </Metric>

          <Divider />

          <Metric label="Inception">
            <MetricValue>{fmt(s.inceptionReturn)}</MetricValue>
          </Metric>
        </div>

        {/* risk score row */}
        <RiskScore risk={s.risk} />
        </div>
      </div>

      {/* clickable CTA → strategy detail (or a caller-provided action) */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full font-semibold"
        disabled={actionDisabled}
        onClick={onAction}
      >
        {actionLabel}
        {!actionDisabled && <RiArrowRightLine className="size-5" />}
      </Button>
    </div>
  )
}

function fmt(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`
}

function Metric({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
      <p className="text-xs font-medium leading-[18px] whitespace-nowrap text-[#6d6f8a]">
        {label}
      </p>
      {children}
    </div>
  )
}

function MetricValue({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base font-medium leading-6 tabular-nums text-[#47475d]">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-8 w-px shrink-0 self-center bg-black/[0.08]" />
}

function ReturnValue({ value }: { value: number }) {
  const up = value >= 0
  return (
    <p
      className={
        "text-base font-medium leading-6 tabular-nums " +
        (up ? "text-[#1d7e4f]" : "text-[#d92d20]")
      }
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </p>
  )
}
