"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  RiDashboardLine,
  RiStockLine,
  RiQuestionLine,
  RiNotification3Line,
  RiArrowDownSLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", icon: RiDashboardLine, href: "#" },
  { label: "Strategies", icon: RiStockLine, href: "/strategies/sparkline" },
  { label: "Help center", icon: RiQuestionLine, href: "#" },
]

const VARIANTS = [
  { label: "A · Sparkline-hero", href: "/strategies/sparkline" },
  { label: "B · Stat-forward", href: "/strategies/stat" },
  { label: "C · Compact list", href: "/strategies/list" },
]

export default function StrategiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col bg-[#f5f6f7]">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-[#f5f6f7]/70 px-4 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark-white.png" alt="Quantbase" className="h-3.5 w-auto" />
          </div>
          Quantbase
        </div>
        <div className="flex items-center gap-3">
          <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <RiNotification3Line className="size-5" />
          </button>
          <button className="flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-2 text-sm font-medium transition-colors hover:bg-muted">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
              LW
            </span>
            Logan Weaver
            <RiArrowDownSLine className="size-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* sidebar */}
        <aside className="hidden w-56 shrink-0 border-r bg-[#f5f6f7] p-3 md:block">
          <nav className="flex flex-col gap-1">
            {NAV.map(({ label, icon: Icon, href }) => {
              const active = label === "Strategies"
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4.5" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1">
          {/* variant switcher (design preview only) */}
          <div className="sticky top-14 z-20 flex items-center gap-2 overflow-x-auto border-b border-black/[0.06] bg-[#f5f6f7]/70 px-6 py-2 backdrop-blur-xl backdrop-saturate-150">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Design preview:
            </span>
            {VARIANTS.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  pathname === v.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {v.label}
              </Link>
            ))}
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
