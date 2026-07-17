import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HELD_STRATEGIES, EMPTY_STRATEGY, strategyById } from "@/lib/portfolio"
import { StrategyDetail } from "@/components/portfolio/detail"

export function generateStaticParams() {
  return [...HELD_STRATEGIES, EMPTY_STRATEGY].map((s) => ({ strategyId: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ strategyId: string }>
}): Promise<Metadata> {
  const { strategyId } = await params
  const s = strategyById(strategyId)
  return { title: s ? `${s.name} · Quantbase` : "Strategy · Quantbase" }
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ strategyId: string }>
}) {
  const { strategyId } = await params
  const strategy = strategyById(strategyId)
  if (!strategy) notFound()
  return <StrategyDetail strategy={strategy} />
}
