"use client"

// Shared pieces for the settings screens.

import Link from "next/link"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

export function SettingsPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8",
        className
      )}
    >
      {children}
    </div>
  )
}

// `href` navigates; `onClick` steps back within a route that swaps sub-views
// (the closure flow keeps checklist and confirm on one URL).
export function BackLink({
  href,
  label,
  onClick,
}: {
  href?: string
  label: string
  onClick?: () => void
}) {
  const classes =
    "inline-flex w-fit items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        <RiArrowLeftSLine className="size-4" />
        {label}
      </button>
    )
  }

  return (
    <Link href={href ?? "#"} className={classes}>
      <RiArrowLeftSLine className="size-4" />
      {label}
    </Link>
  )
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-[var(--border-secondary)] bg-card shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </div>
  )
}

// One line in a settings card. `href` makes the whole row the hit target.
export function Row({
  label,
  value,
  href,
  description,
  icon: Icon,
}: {
  label: string
  value?: string
  href?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const body = (
    <>
      {Icon && <Icon className="size-4.5 shrink-0 text-muted-foreground" />}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-[#363643]">{label}</span>
        {description && (
          <span className="text-xs leading-5 text-muted-foreground">{description}</span>
        )}
      </span>
      {value && (
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{value}</span>
      )}
      {href && <RiArrowRightSLine className="size-4 shrink-0 text-[#b4b5c5]" />}
    </>
  )

  const classes =
    "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors first:rounded-t-[16px] last:rounded-b-[16px]"

  if (!href) return <div className={classes}>{body}</div>

  return (
    <Link href={href} className={cn(classes, "hover:bg-black/[0.02]")}>
      {body}
    </Link>
  )
}

export function RowGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y divide-[var(--border-secondary)]">{children}</div>
}
