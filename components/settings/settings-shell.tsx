"use client"

// Two-pane settings: nav on the left, detail on the right.
//
// Selection lives in the URL (/settings/security), so back, forward and a
// support link straight to "turn on two-factor" all work. On narrow viewports
// the two panes collapse into a push/pop stack instead of being squeezed side
// by side: /settings is the list, /settings/<id> is the detail with a back
// arrow. Both behaviours are pure CSS, so there's no breakpoint flash.

import Link from "next/link"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBankLine,
  RiEqualizerLine,
  RiFileTextLine,
  RiHistoryLine,
  RiShieldKeyholeLine,
  RiUser3Line,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import { SECTIONS, SECTION_IDS, sectionStatus, sectionTone, type SectionId } from "@/lib/settings"
import { useSettings } from "@/components/settings/settings-context"

const ICONS: Record<SectionId, React.ComponentType<{ className?: string }>> = {
  account: RiUser3Line,
  security: RiShieldKeyholeLine,
  banking: RiBankLine,
  documents: RiFileTextLine,
  activity: RiHistoryLine,
  preferences: RiEqualizerLine,
}

function Nav({ active }: { active: SectionId }) {
  const { settings, ready } = useSettings()

  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-1">
      {SECTION_IDS.map((id) => {
        const Icon = ICONS[id]
        const isActive = id === active
        const tone = sectionTone(id, settings)
        return (
          <Link
            key={id}
            href={`/settings/${id}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
              "focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none",
              isActive ? "bg-primary/10" : "hover:bg-black/[0.035]"
            )}
          >
            <Icon
              className={cn(
                "size-4.5 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-[#363643]"
                )}
              >
                {SECTIONS[id].label}
              </span>
              {/* Most visits are to check state, so the nav answers first. */}
              <span
                className={cn(
                  "truncate text-xs",
                  !ready && "opacity-0",
                  tone === "good" && "text-[#1d7e4f]",
                  tone === "warn" && "text-[#B45309]",
                  tone === "muted" && "text-muted-foreground"
                )}
              >
                {sectionStatus(id, settings)}
              </span>
            </span>
            <RiArrowRightSLine className="size-4 shrink-0 text-[#b4b5c5] md:hidden" />
          </Link>
        )
      })}
    </nav>
  )
}

export function SettingsShell({
  active,
  isIndex = false,
  children,
}: {
  active: SectionId
  isIndex?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <h1
        className={cn(
          "text-xl font-semibold tracking-tight text-[#363643]",
          // On a mobile detail view the visible title is the panel's own h2,
          // but the document still needs its h1.
          !isIndex && "sr-only md:not-sr-only"
        )}
      >
        Settings
      </h1>

      <div className="grid gap-8 md:grid-cols-[236px_minmax(0,1fr)] md:items-start">
        <div className={cn(!isIndex && "hidden md:block")}>
          <Nav active={active} />
        </div>

        <div className={cn("min-w-0", isIndex && "hidden md:block")}>
          {!isIndex && (
            <Link
              href="/settings"
              className="mb-5 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline md:hidden"
            >
              <RiArrowLeftSLine className="size-4" />
              Settings
            </Link>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
