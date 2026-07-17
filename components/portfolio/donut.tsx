"use client"

// Allocation donut with rounded (6px) segment corners, shared by the overview
// (allocation across strategies) and strategy detail (holdings). The ring uses
// the neutral allocation palette only — performance never colors the ring
// (§6.2). Slices under MIN_SLICE% are grouped into "Other" (§7.3); a single
// 100% slice renders as a clean full ring (§7.4).

import { useMemo, useState } from "react"

import { ALLOC_COLORS } from "@/lib/portfolio"

export type DonutSegment = {
  id: string
  label: string
  sublabel?: string
  value: number // absolute value (weights derived internally)
}

const TAU = Math.PI * 2
const MIN_SLICE = 3 // % — smaller slices group into "Other"

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function sectorPath(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number, corner: number): string {
  const span = a1 - a0
  const rr = Math.min(corner, (ro - ri) / 2)
  const po = Math.min(rr / ro, span / 2)
  const pi = Math.min(rr / ri, span / 2)
  const p = (r: number, a: number) => polar(cx, cy, r, a).map((v) => v.toFixed(2)).join(" ")
  const largeO = span - 2 * po > Math.PI ? 1 : 0
  const largeI = span - 2 * pi > Math.PI ? 1 : 0
  return [
    `M ${p(ro, a0 + po)}`,
    `A ${ro} ${ro} 0 ${largeO} 1 ${p(ro, a1 - po)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ro - rr, a1)}`,
    `L ${p(ri + rr, a1)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ri, a1 - pi)}`,
    `A ${ri} ${ri} 0 ${largeI} 0 ${p(ri, a0 + pi)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ri + rr, a0)}`,
    `L ${p(ro - rr, a0)}`,
    `A ${rr} ${rr} 0 0 1 ${p(ro, a0 + po)}`,
    "Z",
  ].join(" ")
}

export function AllocationDonut({
  segments,
  size = 220,
  centerDefault,
  hovered: hoveredProp,
  onHover,
}: {
  segments: DonutSegment[]
  size?: number
  /** what the center shows when nothing is hovered */
  centerDefault?: React.ReactNode
  /** controlled hover id (e.g. synced with a legend); omit for internal state */
  hovered?: string | null
  onHover?: (id: string | null) => void
}) {
  const [internalHover, setInternalHover] = useState<string | null>(null)
  const hovered = hoveredProp !== undefined ? hoveredProp : internalHover
  const setHovered = (id: string | null) => {
    setInternalHover(id)
    onHover?.(id)
  }

  const total = segments.reduce((sum, s) => sum + s.value, 0)

  // Group small slices into "Other" so no slice becomes invisible (§7.3).
  const display = useMemo(() => {
    if (total <= 0) return []
    const big = segments.filter((s) => (s.value / total) * 100 >= MIN_SLICE)
    const small = segments.filter((s) => (s.value / total) * 100 < MIN_SLICE)
    const out = [...big]
    if (small.length === 1) out.push(small[0])
    else if (small.length > 1) {
      out.push({
        id: "__other",
        label: "Other",
        sublabel: `${small.length} positions`,
        value: small.reduce((sum, s) => sum + s.value, 0),
      })
    }
    return out
  }, [segments, total])

  const RO = size / 2 - 4
  const RI = RO - 30
  const CORNER = 6
  const CX = size / 2

  const gap = display.length > 1 ? 0.045 : 0
  const arcs = useMemo(() => {
    const out: { seg: DonutSegment; a0: number; a1: number; full: boolean }[] = []
    let angle = -Math.PI / 2
    for (const seg of display) {
      const sweep = (seg.value / total) * TAU
      // A (near-)full circle can't be one sector path — render as ring instead.
      const full = sweep > TAU - 0.02
      out.push({ seg, a0: angle + gap / 2, a1: angle + Math.max(sweep - gap / 2, gap), full })
      angle += sweep
    }
    return out
  }, [display, total, gap])

  const hoveredSeg = display.find((s) => s.id === hovered) ?? null

  // Empty state (§7.5): muted track only, guidance handled by the caller.
  if (total <= 0) {
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={CX} cy={CX} r={(RO + RI) / 2} fill="none" stroke="#eeedf1" strokeWidth={RO - RI} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
          <p className="text-xs text-muted-foreground">No holdings yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Allocation">
        <circle cx={CX} cy={CX} r={(RO + RI) / 2} fill="none" stroke="#eeedf1" strokeWidth={RO - RI} />
        {arcs.map(({ seg, a0, a1, full }, i) => {
          const active = hovered === seg.id
          const grow = active ? 4 : 0
          const color = ALLOC_COLORS[i % ALLOC_COLORS.length]
          const common = {
            fill: color,
            opacity: hovered !== null && !active ? 0.35 : 1,
            onMouseEnter: () => setHovered(seg.id),
            onMouseLeave: () => setHovered(null),
            className: "cursor-pointer transition-opacity duration-200 ease-out",
          }
          return full ? (
            <circle
              key={seg.id}
              cx={CX}
              cy={CX}
              r={(RO + RI) / 2}
              fill="none"
              stroke={color}
              strokeWidth={RO - RI + grow * 2}
              opacity={common.opacity}
              onMouseEnter={common.onMouseEnter}
              onMouseLeave={common.onMouseLeave}
              className={common.className}
            />
          ) : (
            <path key={seg.id} d={sectorPath(CX, CX, RO + grow, RI - grow, a0, a1, CORNER)} {...common} />
          )
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-9 text-center">
        {hoveredSeg ? (
          <>
            <p className="text-sm leading-4 font-medium text-[#363643]">{hoveredSeg.label}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {((hoveredSeg.value / total) * 100).toFixed(1)}% of total
            </p>
          </>
        ) : (
          centerDefault
        )}
      </div>
    </div>
  )
}

export function donutColor(index: number) {
  return ALLOC_COLORS[index % ALLOC_COLORS.length]
}
