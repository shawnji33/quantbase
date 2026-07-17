"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  recommendPortfolio,
  type ExperienceMap,
  type IntentPath,
  type RiskAnswer,
  type Weighted,
} from "@/lib/onboarding"
import {
  EligibilityStep,
  ExperienceStep,
  HeardStep,
  IntentStep,
  RiskStep,
  WaitlistStep,
  WelcomeStep,
} from "@/components/onboarding/steps-about"
import { GeneratingStep, PortfolioStep } from "@/components/onboarding/portfolio-builder"
import { BankStep, FundingStep, type FundingVariant } from "@/components/onboarding/bank-funding"
import {
  AgreementsStep,
  DoneStep,
  KycAffiliationsStep,
  KycEmploymentStep,
  KycFinancialStep,
  KycPersonalStep,
  KycSsnStep,
} from "@/components/onboarding/kyc"
import { OnboardingShell } from "@/components/onboarding/shells"

type StepId =
  | "welcome"
  | "eligibility"
  | "waitlist"
  | "intent"
  | "risk"
  | "experience"
  | "generating"
  | "portfolio"
  | "bank"
  | "funding"
  | "kyc-personal"
  | "kyc-ssn"
  | "kyc-employment"
  | "kyc-financial"
  | "kyc-affiliations"
  | "agreements"
  | "heard"
  | "done"

// step → [phase index, progress within phase 0..1]
const PHASE_MAP: Record<StepId, [number, number]> = {
  welcome: [0, 0.1],
  eligibility: [0, 0.35],
  waitlist: [0, 0.35],
  intent: [0, 0.6],
  risk: [0, 0.8],
  experience: [0, 1],
  generating: [1, 0.4],
  portfolio: [1, 1],
  bank: [2, 0.5],
  funding: [2, 1],
  "kyc-personal": [3, 0.2],
  "kyc-ssn": [3, 0.4],
  "kyc-employment": [3, 0.6],
  "kyc-financial": [3, 0.8],
  "kyc-affiliations": [3, 1],
  agreements: [4, 0.5],
  heard: [4, 0.85],
  done: [4, 1],
}

// First step of each phase, used when jumping back from a shell's phase list.
const PHASE_ENTRY: StepId[] = ["intent", "portfolio", "bank", "kyc-personal", "agreements"]

export function OnboardingFlow() {
  const router = useRouter()

  // Signup context, carried over from the login page (or query params for demos).
  const [name, setName] = useState("")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const storedName = params.get("name") ?? sessionStorage.getItem("qb-first-name")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time read
    if (storedName) setName(storedName)
  }, [])

  // Navigation with a history stack so Back always works.
  const [step, setStep] = useState<StepId>("welcome")
  const [history, setHistory] = useState<StepId[]>([])
  const [dir, setDir] = useState<1 | -1>(1)

  function go(next: StepId) {
    setHistory((h) => [...h, step])
    setDir(1)
    setStep(next)
  }

  function goReplace(next: StepId) {
    setDir(1)
    setStep(next)
  }

  function back() {
    setHistory((h) => {
      if (h.length === 0) return h
      setDir(-1)
      setStep(h[h.length - 1])
      return h.slice(0, -1)
    })
  }

  // Collected answers (lifted so Back preserves everything).
  const [intent, setIntent] = useState<IntentPath | null>(null)
  const [risk, setRisk] = useState<RiskAnswer | null>(null)
  const [experience, setExperience] = useState<ExperienceMap>({})
  const [allocations, setAllocations] = useState<Weighted[]>([])
  const [seededFor, setSeededFor] = useState<string | null>(null)
  const [bankLabel, setBankLabel] = useState<string | null>(null)
  const [demo, setDemo] = useState(false)
  const [funded, setFunded] = useState<number | null>(null)
  const [fundingVariant, setFundingVariant] = useState<FundingVariant>("a")

  // Dev/design-review deep links: /onboarding?step=funding&fund=b&shell=rail
  // jumps straight to a step with sensible state seeded. Capture tooling only.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const target = params.get("step") as StepId | null
    if (!target || !(target in PHASE_MAP)) return
    /* eslint-disable react-hooks/set-state-in-effect -- one-time deep-link seed */
    setIntent("guided")
    setRisk("hold")
    setExperience({ Stocks: 2, Bonds: 1, Cryptocurrency: 1, Options: 0, Leverage: 0 })
    setAllocations(recommendPortfolio("hold", { Stocks: 2, Cryptocurrency: 1 }))
    setSeededFor("guided:hold")
    setBankLabel("Chase Checking •••• 4831")
    const fund = params.get("fund") as FundingVariant | null
    if (fund && ["a", "b", "c"].includes(fund)) setFundingVariant(fund)
    setHistory(["welcome"])
    setStep(target)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Novice = no asset type beyond "< 1 yr" of experience so far.
  const novice = !Object.values(experience).some((v) => (v ?? 0) >= 2)

  // Seed the portfolio when a path first reaches the builder. Re-seeds only if
  // the path or answers changed; the user's manual edits are otherwise preserved.
  function seedPortfolio(path: IntentPath) {
    const seedKey = `${path}:${risk ?? ""}`
    if (seededFor !== seedKey) {
      if (path === "guided" && risk) setAllocations(recommendPortfolio(risk, experience))
      else setAllocations([])
      setSeededFor(seedKey)
    }
  }

  function enterPortfolio(path: IntentPath) {
    if (path === "guided") {
      // Show the "building your portfolio" moment before revealing the result.
      go("generating")
      return
    }
    seedPortfolio(path)
    go("portfolio")
  }

  const [phaseIdx, phaseFrac] = PHASE_MAP[step]

  // Jump back to a completed phase from a shell's phase list.
  function jumpPhase(i: number) {
    if (i >= phaseIdx) return
    go(PHASE_ENTRY[i])
  }

  const stepContent = (
    <>
      {step === "welcome" && <WelcomeStep name={name} onContinue={() => go("eligibility")} />}

      {step === "eligibility" && (
        <EligibilityStep onEligible={() => go("intent")} onIneligible={() => go("waitlist")} />
      )}

      {step === "waitlist" && <WaitlistStep onBack={back} />}

      {step === "intent" && (
        <IntentStep
          intent={intent}
          onSelect={setIntent}
          onContinue={() => {
            if (intent === "guided") go("risk")
            else if (intent) enterPortfolio(intent)
          }}
        />
      )}

      {step === "risk" && (
        <RiskStep value={risk} novice={novice} onSelect={setRisk} onContinue={() => go("experience")} />
      )}

      {step === "experience" && (
        <ExperienceStep
          value={experience}
          onChange={setExperience}
          onContinue={() => enterPortfolio("guided")}
        />
      )}

      {step === "generating" && (
        <GeneratingStep
          onDone={() => {
            seedPortfolio("guided")
            goReplace("portfolio")
          }}
        />
      )}

      {step === "portfolio" && intent && (
        <PortfolioStep
          path={intent}
          allocations={allocations}
          onChange={setAllocations}
          onContinue={() => go("bank")}
        />
      )}

      {step === "bank" && (
        <BankStep
          onLinked={(label) => {
            setBankLabel(label)
            go("funding")
          }}
          onDemo={() => {
            setDemo(true)
            go("done")
          }}
        />
      )}

      {step === "funding" && (
        <FundingStep
          bankLabel={bankLabel}
          variant={fundingVariant}
          onVariantChange={setFundingVariant}
          onContinue={(amount) => {
            setFunded(amount)
            go("kyc-personal")
          }}
        />
      )}

      {step === "kyc-personal" && <KycPersonalStep onContinue={() => go("kyc-ssn")} />}
      {step === "kyc-ssn" && <KycSsnStep onContinue={() => go("kyc-employment")} />}
      {step === "kyc-employment" && <KycEmploymentStep onContinue={() => go("kyc-financial")} />}
      {step === "kyc-financial" && <KycFinancialStep onContinue={() => go("kyc-affiliations")} />}
      {step === "kyc-affiliations" && <KycAffiliationsStep onContinue={() => go("agreements")} />}

      {step === "agreements" && <AgreementsStep onSubmit={() => go("heard")} />}

      {step === "heard" && <HeardStep onContinue={() => go("done")} onSkip={() => go("done")} />}

      {step === "done" && (
        <DoneStep
          name={name}
          strategyCount={allocations.length}
          funded={funded}
          demo={demo}
          onFinish={() => {
            if (demo) {
              router.push("/strategies")
              return
            }
            // Hand off to the dashboard in its account-approval state, carrying
            // the portfolio built during onboarding.
            sessionStorage.setItem("qb-account-status", "review")
            sessionStorage.setItem("qb-starting-portfolio", JSON.stringify(allocations))
            router.push("/portfolio")
          }}
        />
      )}
    </>
  )

  return (
    <>
      <OnboardingShell
        phaseIdx={phaseIdx}
        phaseFrac={phaseFrac}
        canBack={history.length > 0 && step !== "done" && step !== "generating"}
        onBack={back}
        onExit={() => router.push("/login")}
        onJumpPhase={jumpPhase}
        allocations={allocations}
        dir={dir}
        stepKey={step}
      >
        {stepContent}
      </OnboardingShell>
    </>
  )
}
