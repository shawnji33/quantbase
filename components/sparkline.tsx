import { cn } from "@/lib/utils"

type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  className?: string
  /** show a gradient fill under the line */
  fill?: boolean
  strokeWidth?: number
  /** unique id so multiple gradients don't collide */
  gradientId: string
}

/**
 * A calm, padded area sparkline. Colors itself green/red by net change so it
 * reads at a glance, and never draws to the very edge (so nothing overlaps it).
 */
export function Sparkline({
  data,
  width = 240,
  height = 72,
  className,
  fill = true,
  strokeWidth = 2,
  gradientId,
}: SparklineProps) {
  const pad = strokeWidth + 1
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const up = data[data.length - 1] >= data[0]
  const stroke = up ? "var(--spark-up)" : "var(--spark-down)"

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      style={
        {
          "--spark-up": "oklch(0.62 0.17 155)",
          "--spark-down": "oklch(0.58 0.2 25)",
        } as React.CSSProperties
      }
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gradientId})`} />}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
