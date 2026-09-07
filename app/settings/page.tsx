import type { Metadata } from "next"

import { SettingsPage } from "@/components/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings · Quantbase",
}

// The list itself on narrow screens; nav plus the default panel on wide ones.
export default function SettingsIndexPage() {
  return <SettingsPage section="account" isIndex />
}
