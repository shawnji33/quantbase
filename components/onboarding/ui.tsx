"use client"

import { RiCheckLine, RiShieldCheckLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

/* -------------------------------- StepShell -------------------------------- */
// Standard step layout: eyebrow → title → subtitle → body → footer.

export function StepShell({
  title,
  subtitle,
  children,
  footer,
  width = "narrow",
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  width?: "narrow" | "wide"
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-7 px-6 pt-6 pb-16 sm:pt-8",
        width === "narrow" ? "max-w-lg" : "max-w-3xl",
      )}
    >
      <div className="space-y-2.5">
        <h1 className="text-2xl font-semibold tracking-tight text-pretty text-[#363643]">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-prose text-sm leading-6 text-pretty text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex flex-col gap-5">{children}</div>}
      {footer && <div className="flex flex-col gap-2.5">{footer}</div>}
    </div>
  )
}

/* -------------------------------- OptionCard ------------------------------- */
// Selectable card used for single-choice questions and the intent fork.

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean
  onSelect: () => void
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3.5 rounded-xl border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all duration-150 ease-out",
        selected
          ? "border-primary/60 ring-3 ring-primary/10"
          : "border-[var(--border-secondary)] hover:border-black/15",
      )}
    >
      {icon && (
        <div
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            selected ? "bg-primary/10 text-primary" : "bg-muted text-[#575872]",
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm leading-5 font-medium text-[#363643]">{title}</p>
          {badge}
        </div>
        {description && <p className="text-sm leading-5 text-muted-foreground">{description}</p>}
      </div>
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-150",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-black/15 bg-white",
        )}
      >
        {selected && <RiCheckLine className="size-3.5" />}
      </span>
    </button>
  )
}

/* -------------------------------- ChoiceChip -------------------------------- */

export function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-150 ease-out",
        selected
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-black/10 bg-white text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]",
      )}
    >
      {children}
    </button>
  )
}

/* -------------------------------- SecureNote -------------------------------- */

export function SecureNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
      <RiShieldCheckLine className="mt-0.5 size-4 shrink-0 text-[#575872]" />
      <span>{children}</span>
    </div>
  )
}

/* ---------------------------------- WhyRow --------------------------------- */
// "Why we ask" microcopy under sensitive fields.

export function WhyRow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>
}

/* --------------------------------- PartnerBadge ----------------------------- */

export function PartnerBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full border border-[#d7d7e0] bg-[#f6f6f9] px-2 py-0.5 text-xs font-medium text-[#47475d]">
      {children}
    </span>
  )
}
