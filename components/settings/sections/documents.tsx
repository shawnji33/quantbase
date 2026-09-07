"use client"

// Documents. Tax forms are few and matter most (they're the reason sign-in
// survives account closure), so they're always visible. Statements are a long
// list, so they get a year filter and pagination rather than 18 rows of scroll.

import { useEffect, useMemo, useState } from "react"
import { RiDownloadLine, RiFileTextLine } from "@remixicon/react"

import { cn } from "@/lib/utils"
import { SECTIONS, STATEMENTS, TAX_DOCS, type Doc } from "@/lib/settings"
import { useSettings } from "@/components/settings/settings-context"
import {
  Card,
  Panel,
  PanelHeader,
  RowSkeleton,
} from "@/components/settings/settings-ui"

const PAGE_SIZE = 6

function DocRow({ doc }: { doc: Doc }) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <RiFileTextLine className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-[#363643]">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {doc.date} · {doc.size}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Download ${doc.name}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
      >
        <RiDownloadLine className="size-4" />
      </button>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150",
        "focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-[var(--border-secondary)] bg-card text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]"
      )}
    >
      {children}
    </button>
  )
}

export function Pager({
  page,
  pages,
  onPage,
  total,
  noun,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
  total: number
  noun: string
}) {
  if (total === 0) return null
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--border-secondary)] px-5 py-3">
      <p className="text-xs tabular-nums text-muted-foreground">
        {Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}{" "}
        {noun}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[#47475d] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)] focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages - 1}
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[#47475d] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)] focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function DocumentsPanel() {
  const { slowLoad } = useSettings()
  const years = useMemo(
    () => ["All", ...Array.from(new Set(STATEMENTS.map((s) => String(s.year))))],
    []
  )
  const [year, setYear] = useState("All")
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  // Stands in for the fetch. The review switcher can stretch it so the skeleton
  // is actually reviewable.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- simulated fetch */
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), slowLoad ? 2200 : 350)
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => window.clearTimeout(t)
  }, [slowLoad, year])

  const filtered = useMemo(
    () => (year === "All" ? STATEMENTS : STATEMENTS.filter((s) => String(s.year) === year)),
    [year]
  )
  const pages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
  const shown = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Panel>
      <PanelHeader title={SECTIONS.documents.title} blurb={SECTIONS.documents.blurb} />

      <div className="flex flex-col gap-3">
        <h3 className="px-1 text-xs font-medium tracking-[0.3px] text-muted-foreground">
          Tax documents
        </h3>
        <Card>
          <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
            {TAX_DOCS.map((d) => (
              <DocRow key={d.id} doc={d} />
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <h3 className="text-xs font-medium tracking-[0.3px] text-muted-foreground">
            Monthly statements
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {years.map((y) => (
              <Chip
                key={y}
                active={year === y}
                onClick={() => {
                  setYear(y)
                  setPage(0)
                }}
              >
                {y}
              </Chip>
            ))}
          </div>
        </div>

        <Card>
          {loading ? (
            <RowSkeleton rows={PAGE_SIZE} />
          ) : (
            <>
              <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
                {shown.map((d) => (
                  <DocRow key={d.id} doc={d} />
                ))}
              </div>
              <Pager
                page={page}
                pages={pages}
                onPage={setPage}
                total={filtered.length}
                noun="statements"
              />
            </>
          )}
        </Card>
      </div>
    </Panel>
  )
}
