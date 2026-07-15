"use client"

import { useState } from "react"
import {
  RiArrowRightLine,
  RiCompass3Line,
  RiFocus3Line,
  RiMailLine,
  RiSparklingLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ASSET_TYPES,
  EXPERIENCE_LEVELS,
  HEARD_ABOUT,
  RISK_OPTIONS,
  type AssetType,
  type ExperienceMap,
  type IntentPath,
  type RiskAnswer,
} from "@/lib/onboarding"
import { ChoiceChip, OptionCard, StepShell } from "@/components/onboarding/ui"

/* --------------------------------- Welcome --------------------------------- */

export function WelcomeStep({
  name,
  onContinue,
}: {
  name: string
  onContinue: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-black/10 bg-primary shadow-[0px_8px_24px_rgba(112,70,229,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark-white.png" alt="Quantbase" className="h-7 w-auto" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[#363643]">
          {name ? `${name}, let's get started` : "Let's get started"}
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
          A few quick questions to make sure our strategies are a fit for you — it takes about
          two minutes.
        </p>
      </div>

      <Button size="lg" className="w-full max-w-xs" onClick={onContinue}>
        Get started
        <RiArrowRightLine className="size-5" />
      </Button>
    </div>
  )
}

/* ------------------------------- Eligibility -------------------------------- */

export function EligibilityStep({
  onEligible,
  onIneligible,
}: {
  onEligible: () => void
  onIneligible: () => void
}) {
  const [residency, setResidency] = useState<"us" | "non-us" | null>(null)

  return (
    <StepShell
      title="First — are you a U.S. resident?"
      subtitle="Quantbase is currently available to U.S. residents only."
      footer={
        <Button
          size="lg"
          className="w-full"
          disabled={!residency}
          onClick={() => (residency === "us" ? onEligible() : onIneligible())}
        >
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-3">
        <OptionCard
          selected={residency === "us"}
          onSelect={() => setResidency("us")}
          title="Yes, I live in the United States"
        />
        <OptionCard
          selected={residency === "non-us"}
          onSelect={() => setResidency("non-us")}
          title="No, I live outside the United States"
        />
      </div>
    </StepShell>
  )
}

export function WaitlistStep({ onBack }: { onBack: () => void }) {
  const [joined, setJoined] = useState(false)

  return (
    <StepShell
      title="Quantbase isn't available outside the U.S. yet"
      subtitle="Only U.S. residents can register right now. Leave your email and we'll let you know when that changes."
      footer={
        <Button variant="secondary" size="lg" className="w-full" onClick={onBack}>
          Go back
        </Button>
      }
    >
      {joined ? (
        <div className="rounded-xl border border-[var(--border-secondary)] bg-card p-5 text-sm text-[#47475d] shadow-[var(--shadow-card)]">
          You&apos;re on the list — we&apos;ll email you when Quantbase opens up in your country.
        </div>
      ) : (
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault()
            setJoined(true)
          }}
        >
          <RiMailLine className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground" />
          <Input
            type="email"
            required
            placeholder="you@example.com"
            className="h-13 rounded-full pr-36 pl-10"
          />
          <Button type="submit" className="absolute top-1/2 right-1.5 -translate-y-1/2">
            Join waitlist
          </Button>
        </form>
      )}
    </StepShell>
  )
}

/* ------------------------------- Intent fork -------------------------------- */

export function IntentStep({
  intent,
  onSelect,
  onContinue,
}: {
  intent: IntentPath | null
  onSelect: (i: IntentPath) => void
  onContinue: () => void
}) {
  return (
    <StepShell
      title="What brings you to Quantbase?"
      subtitle="We'll shape your setup around it."
      footer={
        <Button size="lg" className="w-full" disabled={!intent} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-3">
        <OptionCard
          selected={intent === "specific"}
          onSelect={() => onSelect("specific")}
          icon={<RiFocus3Line className="size-4.5" />}
          title="A specific strategy"
          description="You already have a strategy in mind — jump straight to it."
        />
        <OptionCard
          selected={intent === "guided"}
          onSelect={() => onSelect("guided")}
          icon={<RiSparklingLine className="size-4.5" />}
          title="Build me a starting portfolio"
          description="Answer two quick questions and we'll suggest an allocation you can edit freely."
        />
        <OptionCard
          selected={intent === "explore"}
          onSelect={() => onSelect("explore")}
          icon={<RiCompass3Line className="size-4.5" />}
          title="I'll build my own"
          description="Browse the full marketplace and pick strategies yourself — no hand-holding."
        />
      </div>
    </StepShell>
  )
}

/* ------------------------------ Risk tolerance ------------------------------ */

export function RiskStep({
  value,
  novice,
  onSelect,
  onContinue,
}: {
  value: RiskAnswer | null
  novice: boolean
  onSelect: (v: RiskAnswer) => void
  onContinue: () => void
}) {
  return (
    <StepShell
      title="If your portfolio lost 30% in three months, what would you do?"
      subtitle={
        novice
          ? "From September to November 2008, U.S. stocks lost over 31% — drops like this happen. There's no wrong answer."
          : "There's no wrong answer — this calibrates which strategies fit you."
      }
      footer={
        <Button size="lg" className="w-full" disabled={!value} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-3">
        {RISK_OPTIONS.map((o) => (
          <OptionCard
            key={o.id}
            selected={value === o.id}
            onSelect={() => onSelect(o.id)}
            title={o.label}
            description={o.description}
          />
        ))}
      </div>
    </StepShell>
  )
}

/* ------------------------------- Experience --------------------------------- */

export function ExperienceStep({
  value,
  onChange,
  onContinue,
}: {
  value: ExperienceMap
  onChange: (v: ExperienceMap) => void
  onContinue: () => void
}) {
  const complete = ASSET_TYPES.every((t) => value[t] !== undefined)

  return (
    <StepShell
      title="What have you invested in before?"
      subtitle="Strategies have different complexities — this helps us match you."
      footer={
        <Button size="lg" className="w-full" disabled={!complete} onClick={onContinue}>
          Continue
          <RiArrowRightLine className="size-5" />
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {ASSET_TYPES.map((t) => (
          <ExperienceRow
            key={t}
            label={t}
            value={value[t]}
            onChange={(lvl) => onChange({ ...value, [t]: lvl })}
          />
        ))}
      </div>
    </StepShell>
  )
}

function ExperienceRow({
  label,
  value,
  onChange,
}: {
  label: AssetType
  value: number | undefined
  onChange: (lvl: number) => void
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--border-secondary)] bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-[#363643]">{label}</p>
      <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
        {EXPERIENCE_LEVELS.map((lvl, i) => (
          <button
            key={lvl}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150",
              value === i
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {lvl}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------- Heard about -------------------------------- */
// Deliberately last — attribution shouldn't be a gate. Skipped entirely for
// partner-referred users (we already know).

export function HeardStep({
  onContinue,
  onSkip,
}: {
  onContinue: () => void
  onSkip: () => void
}) {
  const [choice, setChoice] = useState<string | null>(null)

  return (
    <StepShell
      title="How did you hear about Quantbase?"
      subtitle="Optional — it helps us know where to say thanks."
      footer={
        <>
          <Button size="lg" className="w-full" disabled={!choice} onClick={onContinue}>
            Finish
            <RiArrowRightLine className="size-5" />
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground" onClick={onSkip}>
            Skip
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {HEARD_ABOUT.map((h) => (
          <ChoiceChip key={h} selected={choice === h} onClick={() => setChoice(h)}>
            {h}
          </ChoiceChip>
        ))}
      </div>
    </StepShell>
  )
}
