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
  RiFlashlightFill,
  RiLockLine,
  RiSearchLine,
} from "@remixicon/react"
import { usePlaidLink } from "react-plaid-link"

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
          description="Look around your dashboard first. You can connect a bank anytime."
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

/* ----------------------------- Plaid Link (sandbox) -------------------------- */
// Real Plaid Link against the sandbox environment. The server mints a
// link_token (app/api/plaid/create-link-token); Link opens over the dialog;
// on success we exchange the public_token per the quickstart. With the
// special sandbox credentials, use a non-OAuth institution such as
// First Platypus Bank (ins_109508) — https://plaid.com/docs/sandbox/test-credentials/
// Falls back to a front-end mock when PLAID_CLIENT_ID/PLAID_SECRET are unset.

// Plaid's actual sandbox test institutions, so the demo mirrors the real thing.
const SANDBOX_BANKS = [
  "First Platypus Bank",
  "First Gingham Credit Union",
  "Tattersall Federal Credit Union",
  "Houndstooth Bank",
]
const BANK_DOT = ["#7046E5", "#4E9BE8", "#5FBF8F", "#E8B84E"]

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Approximation of the woven Plaid knot mark, for the demo intro pane.
function PlaidKnot({ color = "#fff", className = "size-6" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <g transform="rotate(45 12 12)" stroke={color} strokeWidth={2.4} strokeLinecap="round">
        <path d="M4 8.5h16M4 15.5h16M8.5 4v16M15.5 4v16" />
      </g>
    </svg>
  )
}

// Plaid-modal chrome for the demo: wordmark header + 3-segment progress bar.
function PlaidChrome({ step, children }: { step: 1 | 2 | 3; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <PlaidKnot color="#111" className="size-4" />
        <span className="text-xs font-bold tracking-[2px] text-[#111]">PLAID</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-[#00c9e8]" : "bg-black/10")}
          />
        ))}
      </div>
      {children}
    </div>
  )
}

// CSS-styled stand-ins for real institution marks in the demo grid.
const DEMO_INSTITUTIONS: { name: string; logo: React.ReactNode }[] = [
  {
    name: "Chase",
    logo: <span className="text-sm font-extrabold tracking-[1px] text-[#0f5dba]">CHASE</span>,
  },
  {
    name: "Bank of America",
    logo: (
      <span className="text-center text-[10px] leading-tight font-extrabold text-[#e31837]">
        BANK OF
        <br />
        AMERICA
      </span>
    ),
  },
  {
    name: "Wells Fargo",
    logo: (
      <span className="bg-[#d71e28] px-1.5 py-1 font-serif text-[10px] font-bold tracking-wide text-[#ffcd41]">
        WELLS FARGO
      </span>
    ),
  },
  {
    name: "Citibank",
    logo: (
      <span className="text-base text-[#004685]">
        <span className="font-bold">citi</span>bank
      </span>
    ),
  },
  {
    name: "US Bank",
    logo: (
      <span className="text-sm font-extrabold italic text-[#0c2074]">
        usbank<span className="text-[#d9261c]">.</span>
      </span>
    ),
  },
  {
    name: "Capital One",
    logo: (
      <span className="font-serif text-sm font-semibold italic text-[#004977]">
        Capital<span className="text-[#d03027]">One</span>
      </span>
    ),
  },
  {
    name: "PNC",
    logo: (
      <span className="flex items-center gap-1 text-sm font-extrabold text-[#2b2e46]">
        <span className="text-[10px] text-[#f58025]">▲</span>PNC
      </span>
    ),
  },
  {
    name: "USAA",
    logo: <span className="text-sm font-extrabold tracking-wide text-[#12395b]">USAA</span>,
  },
  {
    name: "American Express",
    logo: (
      <span className="bg-[#2e77bc] px-1.5 py-1 text-center text-[7px] leading-tight font-bold text-white">
        AMERICAN
        <br />
        EXPRESS
      </span>
    ),
  },
  {
    name: "TD",
    logo: (
      <span className="rounded-[4px] bg-[#54b848] px-2 py-1 text-sm font-extrabold text-white">
        TD
      </span>
    ),
  },
  {
    name: "Regions",
    logo: (
      <span className="flex items-center gap-1 text-[11px] font-bold tracking-wide text-[#587c1b]">
        <span className="text-[10px] text-[#7cb342]">▲</span>REGIONS
      </span>
    ),
  },
  {
    name: "Navy Federal",
    logo: (
      <span className="text-center text-[10px] leading-tight font-extrabold text-[#003366]">
        NAVY FEDERAL
        <br />
        <span className="text-[8px] font-normal text-[#7a8ba6]">Credit Union</span>
      </span>
    ),
  },
]

function PlaidDialog({
  open,
  onOpenChange,
  onLinked,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onLinked: (label: string) => void
}) {
  const [stage, setStage] = useState<
    "init" | "ready" | "no-keys" | "mock-connecting" | "linked"
  >("init")
  const [token, setToken] = useState<string | null>(null)
  const [label, setLabel] = useState<string | null>(null)

  // Keyless demo — simulates the Link sandbox journey step by step.
  const [mockStage, setMockStage] = useState<"phone" | "inst" | "creds" | "accounts">("phone")
  const [mockBank, setMockBank] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [phone, setPhone] = useState("")
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [credError, setCredError] = useState(false)
  const [account, setAccount] = useState<"checking" | "saving">("checking")

  // Mint a sandbox link_token when the dialog opens.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch("/api/plaid/create-link-token", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.link_token) {
          setToken(d.link_token)
          setStage("ready")
        } else {
          setStage("no-keys")
        }
      })
      .catch(() => {
        if (!cancelled) setStage("no-keys")
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const { open: openLink, ready } = usePlaidLink({
    token,
    onSuccess: (publicToken, metadata) => {
      const inst = metadata.institution?.name ?? "Bank"
      const acct = metadata.accounts[0]
      setLabel(
        acct
          ? `${inst} ${cap(acct.subtype ?? "account")} •••• ${acct.mask ?? "0000"}`
          : inst,
      )
      setStage("linked")
      // Complete the quickstart loop; the sandbox access token isn't stored.
      fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: publicToken }),
      }).catch(() => {})
    },
  })

  // Once linked, continue automatically — no extra button press.
  useEffect(() => {
    if (stage !== "linked" || !open || !label) return
    const t = window.setTimeout(() => onLinked(label), 1100)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, open, label])

  function submitCreds() {
    // Same rule as the real sandbox: only user_good / pass_good gets through.
    if (user === "user_good" && pass === "pass_good") {
      setCredError(false)
      setMockStage("accounts")
    } else {
      setCredError(true)
    }
  }

  function confirmAccount() {
    setLabel(
      `${mockBank} ${account === "checking" ? "Checking •••• 0000" : "Saving •••• 1111"}`,
    )
    setStage("mock-connecting")
    window.setTimeout(() => setStage("linked"), 1200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", stage === "no-keys" && "sm:max-w-[380px]")}>
        {/* the demo pane carries Plaid's own chrome, so hide our header there */}
        <DialogHeader className={stage === "no-keys" ? "sr-only" : undefined}>
          <DialogTitle className="flex items-center gap-2">
            <RiLockLine className="size-4 text-muted-foreground" />
            Link with Plaid
          </DialogTitle>
          <DialogDescription>
            Quantbase uses Plaid to connect your account securely. Running in the Plaid sandbox —
            no real bank data is involved.
          </DialogDescription>
        </DialogHeader>

        {stage === "init" && (
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
            <RiLoader4Line className="size-6 animate-spin text-primary" />
            Preparing Plaid Link…
          </div>
        )}

        {stage === "ready" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-[var(--border-secondary)] bg-muted/50 p-4 text-sm leading-6 text-[#47475d]">
              <p className="pb-1 font-medium text-[#363643]">Sandbox test login</p>
              In Plaid Link, choose{" "}
              <span className="font-medium text-[#363643]">First Platypus Bank</span> and sign in
              with{" "}
              <code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-xs">
                user_good
              </code>{" "}
              /{" "}
              <code className="rounded bg-black/[0.06] px-1.5 py-0.5 font-mono text-xs">
                pass_good
              </code>
              .
            </div>
            <Button size="lg" className="w-full" disabled={!ready} onClick={() => openLink()}>
              Open Plaid Link
              <RiArrowRightLine className="size-5" />
            </Button>
          </div>
        )}

        {stage === "no-keys" && (
          <div className="flex flex-col gap-4">
            {mockStage === "phone" && (
              <div className="flex flex-col items-center gap-5 pt-4 text-center">
                <div className="flex items-center">
                  <span className="z-10 flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#43c6f5] to-[#3d7de0] shadow-sm">
                    <PlaidKnot />
                  </span>
                  <span className="-ml-2 flex size-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#4e9be8] to-[#2dd4bf] shadow-sm">
                    <RiBankLine className="size-6 text-white" />
                  </span>
                </div>
                <p className="max-w-72 text-lg leading-6 font-semibold text-balance text-[#363643]">
                  Quantbase uses Plaid to connect your account
                </p>
                <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border-secondary)] bg-card px-3.5 shadow-[var(--shadow-card)]">
                  <span className="text-sm" aria-hidden>
                    🇺🇸
                  </span>
                  <span className="text-sm text-[#575872]">+1</span>
                  <Input
                    inputMode="tel"
                    placeholder="Phone"
                    aria-label="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <p className="flex items-start gap-2 text-left text-xs leading-5 text-muted-foreground">
                  <RiFlashlightFill className="mt-0.5 size-3.5 shrink-0 text-[#4e9be8]" />
                  <span>
                    Use your phone number to log in or sign up with Plaid to go faster next time.{" "}
                    <span className="underline">Learn more</span>
                  </span>
                </p>
                <p className="pt-2 text-xs leading-5 text-muted-foreground">
                  <span className="underline">Terms</span> apply. By continuing, you agree to
                  Plaid&apos;s <span className="underline">Privacy Policy</span> and to receive
                  updates on plaid.com
                </p>
                <Button
                  size="lg"
                  className={cn(
                    "w-full",
                    phone.length < 10 && "bg-[#6f6f73] text-white hover:bg-[#5f5f63]",
                  )}
                  onClick={() => setMockStage("inst")}
                >
                  Continue
                </Button>
                <button
                  type="button"
                  onClick={() => setMockStage("inst")}
                  className="pb-1 text-sm font-semibold text-[#363643]"
                >
                  Continue without phone number
                </button>
              </div>
            )}

            {mockStage === "inst" && (
              <PlaidChrome step={1}>
                <p className="text-center text-lg font-semibold text-[#111]">
                  Select your institution
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-black/20 px-3">
                  <RiSearchLine className="size-4 shrink-0 text-[#575872]" />
                  <Input
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="-mr-1 grid max-h-[340px] grid-cols-2 gap-3 overflow-y-auto pr-1 pb-1">
                  {DEMO_INSTITUTIONS.filter((b) =>
                    b.name.toLowerCase().includes(query.toLowerCase()),
                  ).map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      aria-label={b.name}
                      onClick={() => {
                        setMockBank(b.name)
                        setMockStage("creds")
                      }}
                      className="flex h-16 items-center justify-center rounded-lg border border-[var(--border-secondary)] bg-white transition-all hover:border-black/25"
                    >
                      {b.logo}
                    </button>
                  ))}
                  {/* sandbox test institutions surface via search, like the real thing */}
                  {query.length > 0 &&
                    SANDBOX_BANKS.filter((name) =>
                      name.toLowerCase().includes(query.toLowerCase()),
                    ).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setMockBank(name)
                          setMockStage("creds")
                        }}
                        className="col-span-2 flex items-center gap-3 rounded-lg border border-[var(--border-secondary)] bg-white px-3 py-2.5 text-left text-sm font-medium text-[#363643] transition-all hover:border-black/25"
                      >
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              BANK_DOT[SANDBOX_BANKS.indexOf(name) % BANK_DOT.length],
                          }}
                        >
                          {name.charAt(0)}
                        </span>
                        {name}
                      </button>
                    ))}
                </div>
              </PlaidChrome>
            )}

            {mockStage === "creds" && (
              <PlaidChrome step={2}>
                <p className="text-center text-lg font-semibold text-[#111]">
                  Sign in to {mockBank}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="plaid-user">Username</Label>
                  <Input
                    id="plaid-user"
                    placeholder="user_good"
                    autoComplete="off"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plaid-pass">Password</Label>
                  <Input
                    id="plaid-pass"
                    type="password"
                    placeholder="pass_good"
                    autoComplete="off"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitCreds()}
                  />
                </div>
                {credError && (
                  <p className="text-xs text-[#d92d20]">
                    Invalid credentials. In the sandbox, use user_good / pass_good.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Test login: user_good / pass_good — same as the real Plaid sandbox.
                </p>
                <Button size="lg" className="w-full" onClick={submitCreds}>
                  Submit
                </Button>
              </PlaidChrome>
            )}

            {mockStage === "accounts" && (
              <PlaidChrome step={3}>
                <p className="text-center text-lg font-semibold text-[#111]">
                  Select an account to link
                </p>
                {(
                  [
                    ["checking", "Plaid Checking", "•••• 0000", "$110.00"],
                    ["saving", "Plaid Saving", "•••• 1111", "$210.01"],
                  ] as const
                ).map(([id, name, mask, bal]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAccount(id)}
                    aria-pressed={account === id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      account === id
                        ? "border-primary/60 bg-primary/5"
                        : "border-[var(--border-secondary)] bg-card hover:border-black/15",
                    )}
                  >
                    <span className="font-medium text-[#363643]">
                      {name} <span className="font-normal text-muted-foreground">{mask}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">{bal}</span>
                  </button>
                ))}
                <Button size="lg" className="w-full" onClick={confirmAccount}>
                  Continue
                  <RiArrowRightLine className="size-5" />
                </Button>
              </PlaidChrome>
            )}
          </div>
        )}

        {stage === "mock-connecting" && (
          <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
            <RiLoader4Line className="size-6 animate-spin text-primary" />
            Connecting…
          </div>
        )}

        {stage === "linked" && (
          <div className="flex flex-col items-center gap-2 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <RiCheckboxCircleFill className="size-9 text-[#1d7e4f]" />
            <p className="text-sm font-medium text-[#363643]">Bank connected</p>
            <p className="text-sm text-muted-foreground">{label} · continuing…</p>
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
          on how close they are to retirement. Any amount works, and you can add or withdraw
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
          subtitle="Start with any amount. You can add more or withdraw anytime."
          footer={
            <>
              <Button size="lg" className="w-full" disabled={!amount} onClick={() => onContinue(amount)}>
                {amount ? `Deposit $${amount.toLocaleString()}` : "Continue"}
                <RiArrowRightLine className="size-5" />
              </Button>
              <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={() => onContinue(null)}>
                Skip for now, fund anytime
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
              title="You're set. Fund when you're ready"
          subtitle="No deposit needed today. We'll ask when you make your first investment."
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
              <li className="flex gap-2.5"><StepDot n={3} /> We transfer it from your linked bank, and that&apos;s it</li>
            </ol>
          </div>
          {guidance}
        </StepShell>
      )}

      {variant === "c" && (
        <StepShell
              title="Fund your account"
          subtitle="Choose an amount that feels comfortable. The minimum is just $1."
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
