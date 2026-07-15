"use client"

import { useEffect, useState } from "react"
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiBankLine,
  RiCheckboxCircleFill,
  RiEditBoxLine,
  RiEyeLine,
  RiInformationLine,
  RiLoader4Line,
  RiLockLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { FUNDING_PRESETS } from "@/lib/onboarding"
import { SecureNote, StepShell } from "@/components/onboarding/ui"

/* ------------------------------- Bank connect ------------------------------- */
// Each option acts immediately on tap — no select-then-Continue double step.

export function BankStep({
  onLinked,
  onDemo,
}: {
  onLinked: (label: string) => void
  onDemo: () => void
}) {
  const [view, setView] = useState<"options" | "manual">("options")
  const [plaidOpen, setPlaidOpen] = useState(false)

  if (view === "manual") {
    return <ManualBankForm onBack={() => setView("options")} onLinked={onLinked} />
  }

  return (
    <StepShell
      title="Connect a bank or brokerage"
      subtitle="Nothing is transferred until you say so."
      footer={
        <SecureNote>
          Your credentials are never stored by Quantbase. Bank connections use 256-bit, bank-grade
          encryption and are used only to fund your account.
        </SecureNote>
      }
    >
      <div className="flex flex-col gap-3">
        <ActionRow
          onClick={() => setPlaidOpen(true)}
          icon={<RiBankLine className="size-4.5" />}
          title="Transfer from a bank account"
          badge={
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Recommended
            </span>
          }
          description="Connect instantly and securely with Plaid."
        />
        <ActionRow
          onClick={() => setView("manual")}
          icon={<RiEditBoxLine className="size-4.5" />}
          title="Enter bank details manually"
          description="Use your account and routing number instead."
        />
        <ActionRow
          onClick={onDemo}
          icon={<RiEyeLine className="size-4.5" />}
          title="Explore in demo mode"
          description="Look around your dashboard first — you can connect a bank anytime."
        />
      </div>

      <PlaidDialog
        key={String(plaidOpen)} // remount on each open so the mock restarts fresh
        open={plaidOpen}
        onOpenChange={setPlaidOpen}
        onLinked={(label) => {
          setPlaidOpen(false)
          onLinked(label)
        }}
      />
    </StepShell>
  )
}

function ActionRow({
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  badge?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-xl border border-[var(--border-secondary)] bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all duration-150 ease-out hover:border-black/15"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[#575872]">
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-[#363643]">{title}</p>
          {badge}
        </div>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <RiArrowRightSLine className="size-5 shrink-0 text-[#b4b5c5] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#575872]" />
    </button>
  )
}

/* ------------------------------- Plaid (mock) ------------------------------- */

const INSTITUTIONS = ["Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One", "U.S. Bank"]

function PlaidDialog({
  open,
  onOpenChange,
  onLinked,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onLinked: (label: string) => void
}) {
  const [stage, setStage] = useState<"pick" | "connecting" | "linked">("pick")
  const [bank, setBank] = useState<string | null>(null)

  // Once linked, continue automatically — no extra button press.
  useEffect(() => {
    if (stage !== "linked" || !open) return
    const t = window.setTimeout(() => onLinked(`${bank} Checking •••• 4831`), 1100)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, open])

  function pick(name: string) {
    setBank(name)
    setStage("connecting")
    window.setTimeout(() => setStage("linked"), 1400)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiLockLine className="size-4 text-muted-foreground" />
            Link with Plaid
          </DialogTitle>
          <DialogDescription>
            Quantbase uses Plaid to connect your account. This is a front-end mock of the Plaid
            Link flow.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="grid grid-cols-2 gap-2">
            {INSTITUTIONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => pick(name)}
                className="rounded-lg border border-[var(--border-secondary)] bg-card px-3 py-3.5 text-sm font-medium text-[#363643] transition-all hover:border-black/15 hover:bg-muted/40"
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {stage === "connecting" && (
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
            <RiLoader4Line className="size-6 animate-spin text-primary" />
            Connecting to {bank}…
          </div>
        )}

        {stage === "linked" && (
          <div className="flex flex-col items-center gap-2 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <RiCheckboxCircleFill className="size-9 text-[#1d7e4f]" />
            <p className="text-sm font-medium text-[#363643]">{bank} connected</p>
            <p className="text-sm text-muted-foreground">Checking •••• 4831 · continuing…</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ----------------------------- Manual bank form ----------------------------- */

function ManualBankForm({
  onBack,
  onLinked,
}: {
  onBack: () => void
  onLinked: (label: string) => void
}) {
  const [routing, setRouting] = useState("")
  const [account, setAccount] = useState("")
  const [nickname, setNickname] = useState("")
  const [type, setType] = useState("checking")

  const valid = routing.length === 9 && account.length >= 6

  return (
    <StepShell
      title="Enter your account and routing number"
      subtitle="Secured with 256-bit, bank-grade encryption."
      footer={
        <>
          <Button
            size="lg"
            className="w-full"
            disabled={!valid}
            onClick={() => onLinked(`${nickname || "Bank account"} •••• ${account.slice(-4)}`)}
          >
            Link account
            <RiArrowRightLine className="size-5" />
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={onBack}>
            Back to connection options
          </Button>
        </>
      }
    >
      <VoidedCheck />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="routing">Routing number</Label>
          <Input
            id="routing"
            inputMode="numeric"
            placeholder="9 digits"
            value={routing}
            onChange={(e) => setRouting(e.target.value.replace(/\D/g, "").slice(0, 9))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Account number</Label>
          <Input
            id="account"
            inputMode="numeric"
            placeholder="6–17 digits"
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 17))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname">Account nickname</Label>
          <Input
            id="nickname"
            placeholder="e.g. Everyday checking"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Account type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </StepShell>
  )
}

// Simple voided-check illustration showing where each number lives.
function VoidedCheck() {
  return (
    <div className="rounded-xl border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)]">
      <svg viewBox="0 0 360 150" className="w-full" role="img" aria-label="Where to find your routing and account numbers on a check">
        <rect x="1" y="1" width="358" height="120" rx="8" fill="#fbfbfd" stroke="#e3e3ec" />
        <rect x="16" y="14" width="90" height="7" rx="3.5" fill="#e3e3ec" />
        <rect x="16" y="27" width="60" height="5" rx="2.5" fill="#ededf3" />
        <rect x="252" y="14" width="52" height="7" rx="3.5" fill="#e3e3ec" />
        <rect x="16" y="52" width="200" height="6" rx="3" fill="#ededf3" />
        <rect x="16" y="68" width="260" height="6" rx="3" fill="#ededf3" />
        <text x="180" y="52" fontSize="26" fontStyle="italic" fill="#d7d7e0" fontFamily="serif" transform="rotate(-6 180 52)">
          VOID
        </text>
        {/* MICR line */}
        <rect x="12" y="94" width="86" height="20" rx="4" fill="rgba(112,70,229,0.10)" stroke="#7046e5" strokeDasharray="3 3" />
        <text x="20" y="108" fontSize="12" fontFamily="monospace" fill="#47475d">⑆123456789⑆</text>
        <rect x="106" y="94" width="96" height="20" rx="4" fill="rgba(29,126,79,0.08)" stroke="#1d7e4f" strokeDasharray="3 3" />
        <text x="114" y="108" fontSize="12" fontFamily="monospace" fill="#47475d">0012345678⑈</text>
        <text x="210" y="108" fontSize="12" fontFamily="monospace" fill="#b4b5c5">1234</text>
        {/* labels */}
        <text x="24" y="140" fontSize="11" fill="#7046e5" fontWeight="500">Routing number</text>
        <text x="118" y="140" fontSize="11" fill="#1d7e4f" fontWeight="500">Account number</text>
      </svg>
    </div>
  )
}

/* ------------------------------ Funding variants ---------------------------- */

export type FundingVariant = "a" | "b" | "c"

export function FundingStep({
  bankLabel,
  variant,
  onVariantChange,
  onContinue,
}: {
  bankLabel: string | null
  variant: FundingVariant
  onVariantChange: (v: FundingVariant) => void
  onContinue: (amount: number | null) => void
}) {
  const [amount, setAmount] = useState<number | null>(null)
  const [custom, setCustom] = useState("")

  function pickPreset(v: number) {
    setAmount(v)
    setCustom("")
  }

  function onCustom(raw: string) {
    const digits = raw.replace(/[^\d]/g, "").slice(0, 7)
    setCustom(digits)
    setAmount(digits ? Number(digits) : null)
  }

  const guidance = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline">
            <RiInformationLine className="size-3.5" />
            How much should I start with?
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-pretty">
          As a rule of thumb, clients often start with 10–25% of their investable assets depending
          on how close they are to retirement — but any amount works, and you can add or withdraw
          anytime.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <>
      {variant === "a" && (
        <StepShell
              title="Add your first deposit"
          subtitle="Start with any amount — add more or withdraw anytime."
          footer={
            <>
              <Button size="lg" className="w-full" disabled={!amount} onClick={() => onContinue(amount)}>
                {amount ? `Deposit $${amount.toLocaleString()}` : "Continue"}
                <RiArrowRightLine className="size-5" />
              </Button>
              <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={() => onContinue(null)}>
                Skip for now — fund anytime
              </Button>
            </>
          }
        >
          {bankLabel && <LinkedBankRow label={bankLabel} />}
          <div className="flex flex-wrap gap-2">
            {FUNDING_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={amount === v && !custom}
                onClick={() => pickPreset(v)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium tabular-nums transition-all duration-150",
                  amount === v && !custom
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-black/10 bg-white text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]",
                )}
              >
                ${v.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter an amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
              <Input
                id="custom-amount"
                inputMode="numeric"
                placeholder="0"
                value={custom}
                onChange={(e) => onCustom(e.target.value)}
                className="pl-7 tabular-nums"
              />
            </div>
          </div>
          {guidance}
        </StepShell>
      )}

      {variant === "b" && (
        <StepShell
              title="You're set — fund when you're ready"
          subtitle="No deposit needed today — we'll ask when you make your first investment."
          footer={
            <Button size="lg" className="w-full" onClick={() => onContinue(null)}>
              Continue
              <RiArrowRightLine className="size-5" />
            </Button>
          }
        >
          {bankLabel && <LinkedBankRow label={bankLabel} />}
          <div className="rounded-[16px] border border-[var(--border-secondary)] bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
              How funding will work
            </p>
            <ol className="flex flex-col gap-2.5 text-sm text-[#47475d]">
              <li className="flex gap-2.5"><StepDot n={1} /> Pick a strategy and tap Invest</li>
              <li className="flex gap-2.5"><StepDot n={2} /> Choose the amount that feels right</li>
              <li className="flex gap-2.5"><StepDot n={3} /> We transfer it from your linked bank — that&apos;s it</li>
            </ol>
          </div>
          {guidance}
        </StepShell>
      )}

      {variant === "c" && (
        <StepShell
              title="Fund your account"
          subtitle="Choose an amount that feels comfortable — the minimum is $1."
          footer={
            <Button size="lg" className="w-full" disabled={!amount || amount < 1} onClick={() => onContinue(amount)}>
              {amount ? `Deposit $${amount.toLocaleString()}` : "Continue"}
              <RiArrowRightLine className="size-5" />
            </Button>
          }
        >
          {bankLabel && <LinkedBankRow label={bankLabel} />}
          <div className="space-y-2">
            <Label htmlFor="req-amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">$</span>
              <Input
                id="req-amount"
                inputMode="numeric"
                placeholder="0"
                value={custom}
                onChange={(e) => onCustom(e.target.value)}
                className="pl-7 tabular-nums"
              />
            </div>
          </div>
          {guidance}
        </StepShell>
      )}

      {/* Design-review only: compare the three funding treatments live. */}
      <div className="glass fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
        <span className="px-2.5 text-xs font-medium text-muted-foreground">Design review</span>
        {(
          [
            ["a", "A · Skippable"],
            ["b", "B · Defer"],
            ["c", "C · Required"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => onVariantChange(v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
              variant === v ? "bg-primary text-primary-foreground" : "text-[#47475d] hover:bg-black/5",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  )
}

function LinkedBankRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-secondary)] bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-[#575872]">
        <RiBankLine className="size-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#363643]">{label}</p>
        <p className="text-xs text-muted-foreground">Linked and ready</p>
      </div>
      <RiCheckboxCircleFill className="size-5 shrink-0 text-[#1d7e4f]" />
    </div>
  )
}

function StepDot({ n }: { n: number }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
      {n}
    </span>
  )
}
