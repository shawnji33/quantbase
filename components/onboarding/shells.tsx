"use client"

// The onboarding shell: a persistent brand rail on the left (phase progress,
// reassurance copy, live portfolio preview) with steps on the right, centered
// vertically on large screens. Chosen from five explored directions — see the
// "Onboarding flows — Jul 2026" page in the Quantbase Figma file.

import { RiArrowLeftLine, RiCheckLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { strategies } from "@/lib/strategies"
import type { Weighted } from "@/lib/onboarding"

export const PHASES = ["About you", "Portfolio", "Funding", "Identity", "Sign"] as const

export type ShellProps = {
  phaseIdx: number
  phaseFrac: number
  canBack: boolean
  onBack: () => void
  onExit: () => void
  onJumpPhase: (i: number) => void
  allocations: Weighted[]
  dir: 1 | -1
  stepKey: string
  children: React.ReactNode
}

const strategyName = new Map(strategies.map((s) => [s.id, s.name]))

function stepAnim(dir: 1 | -1) {
  return cn(
    "animate-in fade-in duration-300 ease-out",
    dir === 1 ? "slide-in-from-right-6" : "slide-in-from-left-6",
  )
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-semibold",
        dark ? "text-primary-foreground" : "text-[#363643]",
      )}
    >
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-lg",
          dark ? "bg-primary-foreground/15" : "bg-primary",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark-white.png" alt="Quantbase" className="h-3 w-auto" />
      </div>
      Quantbase
    </div>
  )
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <RiArrowLeftLine className="size-4" />
      Back
    </button>
  )
}

const RAIL_QUOTES = [
  "No wrong answers here. This just calibrates what fits you.",
  "Recommendations are a starting point, not a verdict. Adjust anything.",
  "Your money stays in your control. Nothing moves until you say so.",
  "Identity checks are required by regulators. Encrypted end to end.",
  "Almost there. Just three documents and a signature.",
]

export function OnboardingShell(p: ShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[260px_1fr] 2xl:grid-cols-[300px_1fr]">
      {/* rail */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-6 2xl:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 15% 0%, oklch(0.72 0.18 288.5) 0%, transparent 55%), radial-gradient(100% 90% at 100% 100%, oklch(0.35 0.18 288.5) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-10">
          <Logo dark />
          <ol className="flex flex-col gap-4">
            {PHASES.map((phase, i) => {
              const done = i < p.phaseIdx
              const current = i === p.phaseIdx
              return (
                <li key={phase}>
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => p.onJumpPhase(i)}
                    className={cn(
                      "flex items-center gap-3 text-sm transition-opacity",
                      current ? "font-semibold" : "font-medium",
                      done || current ? "opacity-100" : "opacity-40",
                      done && "hover:opacity-80",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border text-[10px]",
                        done
                          ? "border-transparent bg-primary-foreground text-primary"
                          : current
                            ? "border-primary-foreground"
                            : "border-primary-foreground/40",
                      )}
                    >
                      {done ? <RiCheckLine className="size-3" /> : i + 1}
                    </span>
                    {phase}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          {p.allocations.length > 0 && p.phaseIdx >= 1 && (
            <div className="rounded-xl bg-primary-foreground/10 p-4 ring-1 ring-inset ring-primary-foreground/15">
              <p className="mb-2.5 text-[11px] font-medium tracking-wide text-primary-foreground/60">
                Your portfolio so far
              </p>
              <ul className="flex flex-col gap-1.5">
                {p.allocations.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{strategyName.get(a.id)}</span>
                    <span className="tabular-nums text-primary-foreground/70">{a.weight}%</span>
                  </li>
                ))}
                {p.allocations.length > 4 && (
                  <li className="text-xs text-primary-foreground/60">
                    +{p.allocations.length - 4} more
                  </li>
                )}
              </ul>
            </div>
          )}
          <p className="max-w-52 text-sm leading-6 text-primary-foreground/70">
            {RAIL_QUOTES[p.phaseIdx]}
          </p>
        </div>
      </aside>

      {/* content — steps center vertically on larger screens */}
      <div className="flex min-h-svh flex-col bg-[#F5F6F7]">
        <div className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="lg:hidden">
              <Logo />
            </span>
            {p.canBack && <BackButton onBack={p.onBack} />}
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={p.onExit}>
            Save & exit
          </Button>
        </div>
        <main
          key={p.stepKey}
          className={cn("flex flex-1 flex-col lg:justify-center", stepAnim(p.dir))}
        >
          {p.children}
        </main>
      </div>
    </div>
  )
}
