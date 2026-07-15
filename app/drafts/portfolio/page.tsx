import type { Metadata } from "next"

import { PortfolioBuilderDraft } from "@/components/onboarding/portfolio-builder-v2"

export const metadata: Metadata = {
  title: "Draft — Build your portfolio · Quantbase",
  robots: { index: false },
}

// DRAFT for team review — not linked from the production flow.
export default function PortfolioDraftPage() {
  return <PortfolioBuilderDraft />
}
