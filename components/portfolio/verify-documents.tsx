"use client"

// Full-screen document upload for identity verification, reached from the
// dashboard's "Action needed" state. Front-end only: uploads are simulated,
// nothing is transmitted. A submission receipt (which documents, when) is kept
// in sessionStorage so returning users see exactly what happened.

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  RiCheckboxCircleFill,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiUploadCloud2Line,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const DOCS_KEY = "qb-docs-submitted"

type DocSpec = {
  id: string
  title: string
  description: string
  requirements: string[]
}

const DOCS: DocSpec[] = [
  {
    id: "photo-id",
    title: "Photo ID",
    description: "A government-issued ID such as a passport, driver's license, or state ID.",
    requirements: [
      "All four corners visible, no glare",
      "Not expired",
      "JPG, PNG, or PDF · up to 10MB",
    ],
  },
  {
    id: "billing-address",
    title: "Proof of billing address",
    description: "A utility bill or bank statement from the last 3 months.",
    requirements: [
      "Shows your full name and current address",
      "Dated within the last 3 months",
      "JPG, PNG, or PDF · up to 10MB",
    ],
  },
]

export type DocsReceipt = {
  at: string // ISO timestamp
  docs: { id: string; title: string; fileName: string }[]
}

export function formatReceiptTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function VerifyDocuments() {
  const router = useRouter()
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<DocsReceipt | null>(null)

  // Returning users see their submission receipt, not the upload form.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DOCS_KEY) ?? "null")
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time read
      if (saved?.at && Array.isArray(saved.docs)) setReceipt(saved)
    } catch {
      /* no receipt */
    }
  }, [])

  const allUploaded = DOCS.every((d) => files[d.id])

  function submit() {
    if (!allUploaded || submitting) return
    setSubmitting(true)
    window.setTimeout(() => {
      const r: DocsReceipt = {
        at: new Date().toISOString(),
        docs: DOCS.map((d) => ({ id: d.id, title: d.title, fileName: files[d.id]!.name })),
      }
      sessionStorage.setItem(DOCS_KEY, JSON.stringify(r))
      sessionStorage.setItem("qb-account-status", "review")
      setReceipt(r)
      setSubmitting(false)
    }, 1200)
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#F5F6F7] px-6 py-16">
      {/* exit, top right */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.push("/portfolio")}
        className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#575872] shadow-[var(--shadow-card)] transition-colors hover:bg-[color-mix(in_oklch,white,black_3%)]"
      >
        <RiCloseLine className="size-5" />
      </button>

      {receipt ? (
        <SubmittedView receipt={receipt} onDone={() => router.push("/portfolio")} />
      ) : (
        <div className="flex w-full max-w-xl flex-col gap-7">
          <div className="space-y-2.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
              Upload additional documents
            </h1>
            <p className="mx-auto max-w-md text-sm leading-6 text-pretty text-muted-foreground">
              To finish verifying your identity, we need the two documents below. Your files are
              encrypted and shared only with Alpaca Securities.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {DOCS.map((doc) => (
              <DropZone
                key={doc.id}
                doc={doc}
                file={files[doc.id] ?? null}
                onFile={(f) => setFiles((prev) => ({ ...prev, [doc.id]: f }))}
              />
            ))}
          </div>

          <Button size="lg" className="w-full" disabled={!allUploaded || submitting} onClick={submit}>
            {submitting ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit documents"
            )}
          </Button>
          <p className="-mt-3 text-center text-xs text-muted-foreground">
            We&apos;ll review them within 1 business day and email you either way.
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ submitted view ------------------------------- */
// Shown right after submitting, and again on any return visit: what was
// received, when, and that nothing else is needed.

function SubmittedView({ receipt, onDone }: { receipt: DocsReceipt; onDone: () => void }) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-7 text-center animate-in fade-in zoom-in-95 duration-300">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#1d7e4f] text-white">
        <RiCheckLine className="size-7" />
      </span>

      <div className="space-y-2.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#363643]">
          Documents received
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-pretty text-muted-foreground">
          Submitted on {formatReceiptTime(receipt.at)}. Your verification is back in review and
          there&apos;s nothing else you need to do. We&apos;ll email you within 1 business day.
        </p>
      </div>

      <div className="w-full rounded-[16px] border border-[var(--border-secondary)] bg-card p-2 shadow-[var(--shadow-card)]">
        {receipt.docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-[10px] px-3.5 py-3">
            <RiCheckboxCircleFill className="size-4.5 shrink-0 text-[#1d7e4f]" />
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#363643]">
              {d.title}
            </span>
            <span className="max-w-40 truncate text-xs text-muted-foreground">{d.fileName}</span>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full max-w-xs" onClick={onDone}>
        Back to dashboard
      </Button>
    </div>
  )
}

/* --------------------------------- drop zone --------------------------------- */

function DropZone({
  doc,
  file,
  onFile,
}: {
  doc: DocSpec
  file: File | null
  onFile: (f: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0) // 0..100, simulated upload

  const uploading = file !== null && progress < 100

  // Simulate the upload whenever a new file lands.
  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on remove
      setProgress(0)
      return
    }
     
    setProgress(4)
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        const next = p + 10 + Math.random() * 14
        return next >= 100 ? 100 : next
      })
    }, 110)
    return () => window.clearInterval(t)
  }, [file])

  function pick(list: FileList | null) {
    const f = list?.[0]
    if (f) onFile(f)
  }

  const done = file !== null && progress >= 100

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        pick(e.dataTransfer.files)
      }}
      className={cn(
        "rounded-[16px] border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-150",
        dragging
          ? "border-primary/60 ring-3 ring-primary/10"
          : done
            ? "border-[#1d7e4f]/40"
            : "border-dashed border-black/15",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />

      <p className="text-sm font-medium text-[#363643]">{doc.title}</p>
      <p className="text-sm leading-5 text-muted-foreground">{doc.description}</p>

      {file ? (
        <div className="mt-5 rounded-lg bg-muted/60 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            {uploading ? (
              <RiLoader4Line className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              <RiCheckboxCircleFill className="size-4 shrink-0 text-[#1d7e4f]" />
            )}
            <p className="min-w-0 flex-1 truncate text-sm text-[#47475d]">{file.name}</p>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {uploading ? `${Math.round(progress)}%` : `${(file.size / 1024 / 1024).toFixed(1)}MB`}
            </span>
            <button
              type="button"
              aria-label={`Remove ${doc.title}`}
              onClick={() => onFile(null)}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>
          {/* upload progress */}
          <div
            className={cn(
              "overflow-hidden rounded-full bg-black/[0.06] transition-all duration-300",
              uploading ? "mt-2 h-1 opacity-100" : "mt-0 h-0 opacity-0",
            )}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
          >
            <RiUploadCloud2Line className="size-5 text-[#575872]" />
            <span className="text-sm font-medium text-[#47475d]">
              Drag a file here or <span className="text-primary">browse</span>
            </span>
          </button>
          <ul className="mt-3 flex flex-col gap-1">
            {doc.requirements.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-xs leading-4 text-muted-foreground">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-[#b4b5c5]" />
                {r}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
