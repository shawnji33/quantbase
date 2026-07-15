"use client"

import { useState } from "react"
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiExternalLinkLine,
  RiEyeLine,
  RiEyeOffLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AGREEMENTS,
  EMPLOYMENT_STATUSES,
  FUNDING_SOURCES,
  INCOME_RANGES,
  NET_WORTH_RANGES,
} from "@/lib/onboarding"
import { ChoiceChip, OptionCard, SecureNote, StepShell, WhyRow } from "@/components/onboarding/ui"

/* --------------------------------- KYC shell -------------------------------- */

const ALPACA_NOTE = (
  <WhyRow>
    We collect this as part of a standard “Know Your Customer” (KYC) process required of all
    brokerages and financial institutions. Your brokerage account is opened with Alpaca Securities
    LLC.{" "}
    <a href="#" className="font-medium text-primary hover:underline">
      Learn more
    </a>
  </WhyRow>
)

function Field({
  id,
  label,
  optional,
  children,
}: {
  id?: string
  label: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
    </div>
  )
}

/* --------------------------------- Personal --------------------------------- */

export function KycPersonalStep({ onContinue }: { onContinue: () => void }) {
  const [first, setFirst] = useState("")
  const [last, setLast] = useState("")
  const [dob, setDob] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")

  const valid = first && last && dob && phone && street && city && state && zip.length === 5

  return (
    <StepShell
      title="About you, officially"
      subtitle="Exactly as they appear on your government ID."
      footer={
        <Button size="lg" className="w-full" disabled={!valid} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      {ALPACA_NOTE}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="k-first" label="Legal first name">
          <Input id="k-first" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
        </Field>
        <Field id="k-middle" label="Legal middle name" optional>
          <Input id="k-middle" autoComplete="additional-name" />
        </Field>
        <Field id="k-last" label="Legal last name">
          <Input id="k-last" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
        </Field>
        <Field id="k-dob" label="Date of birth">
          <Input id="k-dob" placeholder="MM/DD/YYYY" value={dob} onChange={(e) => setDob(formatDob(e.target.value))} inputMode="numeric" />
        </Field>
        <Field id="k-phone" label="Phone number">
          <Input id="k-phone" type="tel" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="k-street" label="Street address">
          <Input id="k-street" value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line1" />
        </Field>
        <Field id="k-street2" label="Street address 2" optional>
          <Input id="k-street2" autoComplete="address-line2" />
        </Field>
        <Field id="k-city" label="City">
          <Input id="k-city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="k-state" label="State">
            <Input id="k-state" placeholder="CA" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} autoComplete="address-level1" />
          </Field>
          <Field id="k-zip" label="ZIP code">
            <Input id="k-zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} autoComplete="postal-code" />
          </Field>
        </div>
        <Field id="k-country" label="Country">
          <Input id="k-country" value="United States" disabled />
        </Field>
      </div>
    </StepShell>
  )
}

function formatDob(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/* ----------------------------------- SSN ------------------------------------ */

export function KycSsnStep({ onContinue }: { onContinue: () => void }) {
  const [ssn, setSsn] = useState("")
  const [show, setShow] = useState(false)
  const digits = ssn.replace(/\D/g, "")

  return (
    <StepShell
      title="Your Social Security number"
      subtitle="Required by federal law to verify your identity."
      footer={
        <Button size="lg" className="w-full" disabled={digits.length !== 9} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <Field id="k-ssn" label="Social Security number">
        <div className="relative">
          <Input
            id="k-ssn"
            type={show ? "text" : "password"}
            inputMode="numeric"
            placeholder="###-##-####"
            value={show ? formatSsn(digits) : ssn}
            onChange={(e) => setSsn(formatSsn(e.target.value))}
            className="pr-10 tabular-nums"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide SSN" : "Show SSN"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
          </button>
        </div>
      </Field>
      <SecureNote>
        Encrypted in transit and at rest. Quantbase never sells your data, and your SSN is shared
        only with Alpaca Securities to open your brokerage account — never with anyone else.
      </SecureNote>
      {ALPACA_NOTE}
    </StepShell>
  )
}

function formatSsn(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 9)
  if (d.length <= 3) return d
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
}

/* -------------------------------- Employment -------------------------------- */

export function KycEmploymentStep({ onContinue }: { onContinue: () => void }) {
  const [status, setStatus] = useState<string | null>(null)
  const [employer, setEmployer] = useState("")
  const [position, setPosition] = useState("")

  const needsEmployer = status === "Employed" || status === "Self-employed"
  const valid = status && (!needsEmployer || (employer && position))

  return (
    <StepShell
      title="Your employment"
      subtitle="Standard KYC — it doesn't affect what you can invest in."
      footer={
        <Button size="lg" className="w-full" disabled={!valid} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <Field label="Employment status">
        <Select value={status ?? undefined} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {needsEmployer && (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-200 sm:grid-cols-2">
          <Field id="k-employer" label="Employer name">
            <Input id="k-employer" value={employer} onChange={(e) => setEmployer(e.target.value)} />
          </Field>
          <Field id="k-position" label="Position">
            <Input id="k-position" value={position} onChange={(e) => setPosition(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="k-employer-addr" label="Employer address" optional>
              <Input id="k-employer-addr" placeholder="Street, city, state" />
            </Field>
          </div>
        </div>
      )}
    </StepShell>
  )
}

/* --------------------------------- Financial -------------------------------- */

export function KycFinancialStep({ onContinue }: { onContinue: () => void }) {
  const [source, setSource] = useState<string | null>(null)
  const [income, setIncome] = useState<string | null>(null)
  const [netWorth, setNetWorth] = useState<string | null>(null)

  return (
    <StepShell
      title="Your financial picture"
      subtitle="Rough ranges are all that's needed."
      footer={
        <Button size="lg" className="w-full" disabled={!source || !income || !netWorth} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <Field label="Primary funding source">
        <div className="flex flex-wrap gap-2">
          {FUNDING_SOURCES.map((s) => (
            <ChoiceChip key={s} selected={source === s} onClick={() => setSource(s)}>
              {s}
            </ChoiceChip>
          ))}
        </div>
      </Field>
      <Field label="Annual income">
        <div className="flex flex-wrap gap-2">
          {INCOME_RANGES.map((r) => (
            <ChoiceChip key={r} selected={income === r} onClick={() => setIncome(r)}>
              {r}
            </ChoiceChip>
          ))}
        </div>
      </Field>
      <Field label="Liquid net worth">
        <div className="flex flex-wrap gap-2">
          {NET_WORTH_RANGES.map((r) => (
            <ChoiceChip key={r} selected={netWorth === r} onClick={() => setNetWorth(r)}>
              {r}
            </ChoiceChip>
          ))}
        </div>
      </Field>
    </StepShell>
  )
}

/* -------------------------------- Affiliations ------------------------------- */

export function KycAffiliationsStep({ onContinue }: { onContinue: () => void }) {
  const [answer, setAnswer] = useState<"yes" | "none" | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [approved, setApproved] = useState(false)

  const canContinue = answer === "none" || (answer === "yes" && approved)

  return (
    <StepShell
      title="Declare any affiliations"
      subtitle={
        <>
          This is uncommon — most people select “none.” Let us know if you (or an immediate family
          member) are currently or formerly: a politically exposed person or public official;
          affiliated with or employed by a stock exchange, regulatory body, FINRA, a member firm of
          an exchange, or a municipal securities broker-dealer; or an officer or 10%-or-greater
          shareholder of a publicly traded company.
        </>
      }
      footer={
        <Button size="lg" className="w-full" disabled={!canContinue} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-3">
        <OptionCard
          selected={answer === "yes"}
          onSelect={() => {
            setAnswer("yes")
            if (!approved) setModalOpen(true)
          }}
          title="Yes, the above applies to me"
          description={approved ? "Compliance approval confirmed." : "We'll ask you to confirm compliance approval."}
        />
        <OptionCard
          selected={answer === "none"}
          onSelect={() => setAnswer("none")}
          title="None of the above apply to me"
        />
      </div>

      <Dialog
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o)
          // Cancelling clears the "yes" selection but keeps them in the flow.
          if (!o && !approved) setAnswer(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm approval from your compliance team</DialogTitle>
            <DialogDescription>
              Please confirm that you have received approval from your compliance team to open a
              managed non-discretionary account with Quantbase. If you have any questions, reach
              out to{" "}
              <a href="mailto:support@getquantbase.com" className="font-medium text-primary hover:underline">
                support@getquantbase.com
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setAnswer(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setApproved(true)
                setModalOpen(false)
              }}
            >
              I&apos;ve gotten approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StepShell>
  )
}

/* --------------------------------- Agreements -------------------------------- */

export function AgreementsStep({ onSubmit }: { onSubmit: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signature, setSignature] = useState("")

  const allChecked = AGREEMENTS.every((a) => checked[a.id])
  const valid = allChecked && signature.trim().length > 2

  return (
    <StepShell
      title="Sign your agreements"
      subtitle="Typing your legal name acts as your electronic signature."
      footer={
        <Button size="lg" className="w-full" disabled={!valid} onClick={onSubmit}>
          Sign and submit
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {AGREEMENTS.map((a) => (
          <label
            key={a.id}
            className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-black/15"
          >
            <Checkbox
              checked={!!checked[a.id]}
              onCheckedChange={(v) => setChecked((c) => ({ ...c, [a.id]: v === true }))}
              className="mt-0.5"
            />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#363643]">
                {a.title}
                <a href="#" aria-label={`Open ${a.title}`} className="text-muted-foreground hover:text-foreground">
                  <RiExternalLinkLine className="size-3.5" />
                </a>
              </span>
              <span className="block text-sm leading-5 text-muted-foreground">{a.description}</span>
            </span>
          </label>
        ))}
      </div>

      <Field id="signature" label="Signature — type your full legal name">
        <Input
          id="signature"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Your full legal name"
        />
        <div className="flex h-16 items-center rounded-xl border border-dashed border-black/10 bg-card px-4">
          {signature.trim() ? (
            <span className="font-serif text-2xl italic text-[#363643]">{signature}</span>
          ) : (
            <span className="text-sm text-[#b4b5c5]">Your signature will appear here</span>
          )}
        </div>
      </Field>
    </StepShell>
  )
}

/* ------------------------------------ Done ----------------------------------- */

export function DoneStep({
  name,
  strategyCount,
  funded,
  demo,
  onFinish,
}: {
  name: string
  strategyCount: number
  funded: number | null
  demo: boolean
  onFinish: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-6 py-16 text-center">
      <RiCheckboxCircleFill className="size-14 text-[#1d7e4f] animate-in zoom-in-50 fade-in duration-300" />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[#363643]">
          {name ? `Welcome to Quantbase, ${name}` : "Welcome to Quantbase"}
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
          {demo
            ? "You're in demo mode — finish connecting your account whenever you're ready."
            : "We'll email you when your brokerage application is approved — usually within a day."}
        </p>
      </div>

      {!demo && (
        <div className="flex w-full flex-col gap-2 text-left">
          <SummaryRow label="Portfolio" value={`${strategyCount} ${strategyCount === 1 ? "strategy" : "strategies"} selected`} />
          <SummaryRow label="First deposit" value={funded ? `$${funded.toLocaleString()}` : "Skipped — fund anytime"} />
          <SummaryRow label="Identity" value="Submitted to Alpaca Securities" />
        </div>
      )}

      <Button size="lg" className="w-full max-w-xs" onClick={onFinish}>
        {demo ? "Explore in demo mode" : "Go to your dashboard"}
        <RiArrowRightLine className="size-5" />
      </Button>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-secondary)] bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-[#363643]">{value}</span>
    </div>
  )
}
