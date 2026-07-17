"use client"

// Small shared pieces for the portfolio redesign.

import { RiInformationLine } from "@remixicon/react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { deltaColor, pct, signedUsd } from "@/lib/portfolio"

/* ------------------------------- info tooltip ------------------------------- */

export function Info({ copy }: { copy: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More information"
            className="inline-flex align-middle text-[#b4b5c5] transition-colors hover:text-[#575872]"
          >
            <RiInformationLine className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-60 text-pretty">{copy}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/* ------------------------------ gain / return ------------------------------- */
// Layout is identical for positive and negative values — no shift from the
// sign or arrow (§7.1); near-zero values stay legible (§7.2).

export function GainValue({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-medium tabular-nums", className)} style={{ color: deltaColor(value) }}>
      {signedUsd(value)}
    </span>
  )
}

export function ReturnValue({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 font-medium tabular-nums", className)}
      style={{ color: deltaColor(value) }}
    >
      <span aria-hidden className="text-[0.7em] leading-none">
        {value < 0 ? "▼" : "▲"}
      </span>
      {pct(value)}
    </span>
  )
}

/* --------------------------------- sparkline -------------------------------- */

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return <div className={cn("h-7 w-16", className)} />
  const w = 64
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const negative = data[data.length - 1] < data[0]
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className={cn("shrink-0", className)}>
      <polyline
        points={pts}
        fill="none"
        stroke={negative ? "#d92d20" : "#1d7e4f"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75}
      />
    </svg>
  )
}

/* --------------------------------- skeleton --------------------------------- */

export function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-black/[0.06]", className)} />
}

/* -------------------------------- error card -------------------------------- */
// Per-card fetch failure with retry — the rest of the page stays up (§7.8).

export function CardError({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <p className="text-sm text-muted-foreground">{label} couldn&apos;t load.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-[#47475d] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)]"
      >
        Retry
      </button>
    </div>
  )
}
