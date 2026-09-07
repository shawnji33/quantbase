"use client"

// Shared panel primitives. Every save surface uses the same three-state
// feedback, and every destructive control routes through the same confirm, so
// the sections stay consistent without each one reinventing them.

import { useState } from "react"
import {
  RiAlertLine,
  RiCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { maskAll } from "@/lib/settings"
import type { ActionStatus } from "@/components/settings/settings-context"

const AMBER = "#B45309"

/* --------------------------------- layout ---------------------------------- */

export function Panel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>
}

// h1 lives on the shell; every panel heading is an h2 beneath it.
export function PanelHeader({
  title,
  blurb,
  status,
}: {
  title: string
  blurb: string
  status?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-xl font-semibold tracking-tight text-[#363643]">{title}</h2>
        {status}
      </div>
      <p className="max-w-lg text-sm leading-6 text-muted-foreground">{blurb}</p>
    </div>
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

export function CardSection({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-sm font-medium text-[#363643]">{title}</h3>
          {description && (
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

/* --------------------------------- status ---------------------------------- */

export function StatusPill({
  tone,
  children,
}: {
  tone: "good" | "warn" | "muted"
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "good" && "bg-[#1d7e4f]/12 text-[#1d7e4f]",
        tone === "warn" && "bg-[#E8B84E]/20",
        tone === "muted" && "bg-black/[0.05] text-muted-foreground"
      )}
      style={tone === "warn" ? { color: AMBER } : undefined}
    >
      {tone === "good" && <RiCheckLine className="size-3.5" />}
      {tone === "warn" && <RiAlertLine className="size-3.5" />}
      {children}
    </span>
  )
}

/* ---------------------------------- fields --------------------------------- */

export function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  error?: string
  autoComplete?: string
  className?: string
}) {
  const id = `f-${label.toLowerCase().replace(/\W+/g, "-")}`
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={`${id}-err`} className="text-xs text-[#d92d20]">
          {error}
        </p>
      )}
    </div>
  )
}

// A value that stays masked until the user asks for it. Used for account and
// routing numbers, which have no reason to sit in plaintext on a page someone
// might screen-share.
export function RevealValue({ label, value }: { label: string; value: string }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm tabular-nums text-[#363643]">
          {shown ? value : maskAll(value)}
        </span>
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Reveal ${label.toLowerCase()}`}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
        >
          {shown ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
        </button>
      </div>
    </div>
  )
}

/* -------------------------------- save bar --------------------------------- */

// Saving, success and failure, designed together. The button is disabled until
// something actually changed, so "Save" never means "nothing happened".
export function SaveBar({
  status,
  dirty,
  onSave,
  label = "Save",
  errorMessage = "We couldn't save your changes. Check your connection and try again.",
}: {
  status: ActionStatus
  dirty: boolean
  onSave: () => void
  label?: string
  errorMessage?: string
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {status === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-[#d92d20]/8 px-3.5 py-2.5 text-xs leading-5 text-[#d92d20]"
        >
          <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={!dirty || status === "working"}>
          {status === "working" ? (
            <>
              <RiLoader4Line className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            label
          )}
        </Button>
        {status === "done" && (
          <span className="flex animate-in items-center gap-1.5 text-sm font-medium text-[#1d7e4f] fade-in duration-200">
            <RiCheckLine className="size-4" />
            Saved
          </span>
        )}
        {status === "idle" && !dirty && (
          <span className="text-xs text-muted-foreground">No changes to save</span>
        )}
      </div>
    </div>
  )
}

/* -------------------------------- skeletons -------------------------------- */

export function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-black/[0.06]", className)} />
}

export function RowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Sk className="size-8 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Sk className="h-3.5 w-1/2" />
            <Sk className="h-3 w-1/3" />
          </div>
          <Sk className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- confirming ------------------------------- */

// Nothing high-stakes happens on a settings page without one of these.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive,
  status,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  status: ActionStatus
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {status === "error" && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-[10px] bg-[#d92d20]/8 px-3.5 py-2.5 text-xs leading-5 text-[#d92d20]"
          >
            <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
            That didn&apos;t go through. Try again in a moment.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={status === "working"}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={status === "working"}
            className={destructive ? "bg-[#d92d20] hover:bg-[#b42318]" : undefined}
          >
            {status === "working" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
