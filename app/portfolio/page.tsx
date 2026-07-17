import type { Metadata } from "next"

import { DashboardGate } from "@/components/portfolio/dashboard-gate"

export const metadata: Metadata = {
  title: "Portfolio · Quantbase",
}

export default function PortfolioPage() {
  return <DashboardGate />
}
