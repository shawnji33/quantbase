import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SECTIONS, SECTION_IDS, type SectionId } from "@/lib/settings"
import { SettingsPage } from "@/components/settings/settings-page"

// Every section is a real, prerendered URL so deep links and the back button
// work. Anything else 404s rather than rendering an empty pane.
export const dynamicParams = false

export function generateStaticParams() {
  return SECTION_IDS.map((section) => ({ section }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const meta = SECTIONS[section as SectionId]
  return { title: meta ? `${meta.title} · Quantbase` : "Settings · Quantbase" }
}

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!SECTION_IDS.includes(section as SectionId)) notFound()
  return <SettingsPage section={section as SectionId} />
}
