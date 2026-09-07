"use client"

// Shared layout pieces for the account-closure screens.

import Link from "next/link"
import { RiArrowLeftSLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

export function ClosurePage({
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
