import type { Metadata } from "next"

import { EditPortfolio } from "@/components/portfolio/edit-portfolio"

export const metadata: Metadata = {
  title: "Edit portfolio · Quantbase",
  robots: { index: false },
}

export default function EditPortfolioPage() {
  return <EditPortfolio />
}
