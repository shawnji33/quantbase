"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type PriceChartProps = {
  data: number[]
  /** first year of the series, used to spread dates across the points */
  startYear: number
  /** hypothetical amount invested at inception, for the tooltip value */
  baseAmount?: number
  /** exact series window — overrides startYear-based date spreading when set */
  startDate?: Date
  endDate?: Date
  height?: number
  className?: string
  /** fixed line color (e.g. brand). Omit to color green/red by net change. */
  color?: string
  gradientId: string
}

const VBW = 100 // viewBox width (arbitrary; svg stretches to container)

// Catmull-Rom → cubic Bézier for a smooth curve through every point.
function smoothPath(pts: readonly (readonly [number, number])[]) {
  if (pts.length < 2) return ""
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function PriceChart({
  data,
  startYear,
  baseAmount = 10000,
  startDate,
  endDate,
  height = 96,
  className,
  color,
  gradientId,
}: PriceChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null) // cursor fraction 0..1

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pad = 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const up = data[data.length - 1] >= data[0]
  const stroke = color ?? (up ? "oklch(0.62 0.17 155)" : "oklch(0.58 0.2 25)")

  // normalized viewBox points (for the svg path)
  const norm = useMemo(
    () =>
      data.map((v, i) => {
        const x = (i / (data.length - 1)) * VBW
        const y = pad + (1 - (v - min) / range) * (height - pad * 2)
        return [x, y] as const
      }),
    [data, min, range, height],
  )

  const line = useMemo(() => smoothPath(norm), [norm])
  const area = `${line} L${VBW},${height} L0,${height} Z`

  // dates spread evenly from inception → today (client only; not in initial DOM)
  const dates = useMemo(() => {
    const start = (startDate ?? new Date(startYear, 0, 1)).getTime()
    const end = (endDate ?? new Date(2026, 5, 1)).getTime()
    return data.map((_, i) => {
      const t = start + ((end - start) * i) / (data.length - 1)
      return new Date(t).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    })
  }, [data, startYear, startDate, endDate])

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!width) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHover(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)))
  }

  // Continuous: interpolate the dot along the curve at the exact cursor x, while
  // the tooltip value/date snap to the nearest data point.
  const shown = hover !== null
  const frac = hover ?? 0
  const pos = frac * (data.length - 1)
  const i0 = Math.floor(pos)
  const i1 = Math.min(i0 + 1, data.length - 1)
  const idx = Math.round(pos)
  const dotX = frac * width
  const dotY = norm[i0][1] + (norm[i1][1] - norm[i0][1]) * (pos - i0)
  const value = usd.format(baseAmount * (data[idx] / data[0]))

  // tooltip sits beside the dot; flips to the left near the right edge
  const TT_W = 116
  const flip = dotX + 16 + TT_W > width
  const ttLeft = flip ? dotX - 14 : dotX + 14

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
      className={cn("relative touch-none", className)}
      style={{ height }}
    >
      <svg
        viewBox={`0 0 ${VBW} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.2} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* glowing marker dot */}
      <span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,top,opacity] duration-150 ease-out motion-reduce:transition-none"
        style={{
          left: dotX,
          top: dotY,
          width: 18,
          height: 18,
          background: stroke,
          opacity: shown ? 0.28 : 0,
          filter: "blur(1px)",
        }}
      />
      <span
        className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background transition-[left,top,opacity] duration-150 ease-out motion-reduce:transition-none"
        style={{
          left: dotX,
          top: dotY,
          background: stroke,
          opacity: shown ? 1 : 0,
        }}
      />

      {/* glass tooltip beside the dot */}
      <div
        className="pointer-events-none absolute z-10 flex flex-col items-end gap-1 rounded-xl border border-black/[0.08] bg-white/70 px-2 py-1.5 text-right shadow-[0px_4px_8px_rgba(10,13,18,0.1)] backdrop-blur-[6px] transition-[left,top,opacity] duration-150 ease-out motion-reduce:transition-none"
        style={{
          left: ttLeft,
          top: dotY,
          transform: `translateY(-50%) ${flip ? "translateX(-100%)" : ""}`,
          opacity: shown ? 1 : 0,
        }}
      >
        <div className="text-xs font-semibold tabular-nums text-[#363643]">
          {value}
        </div>
        <div className="text-[10px] leading-none text-[#6d6f8a]">{dates[idx]}</div>
      </div>
    </div>
  )
}
