import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { riskLabel, fmtPct } from "@/lib/strategies"

export function PartnerBadge() {
  return (
    <Badge variant="secondary" className="shrink-0 font-medium">
      Partner fund
    </Badge>
  )
}

const RISK_STYLES: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  High: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Very high": "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function RiskBadge({
  risk,
  showValue = true,
  className,
}: {
  risk: number
  showValue?: boolean
  className?: string
}) {
  const label = riskLabel(risk)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        RISK_STYLES[label],
        className,
      )}
    >
      {label} risk
      {showValue && <span className="opacity-60">{risk.toFixed(1)}</span>}
    </span>
  )
}

export function ReturnText({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "tabular-nums",
        up
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
        className,
      )}
    >
      {fmtPct(value)}
    </span>
  )
}
