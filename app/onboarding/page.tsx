import type { Metadata } from "next"

import { OnboardingFlow } from "@/components/onboarding/flow"

export const metadata: Metadata = {
  title: "Get started — Quantbase",
}

export default function OnboardingPage() {
  return <OnboardingFlow />
}
