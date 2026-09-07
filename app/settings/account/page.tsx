import type { Metadata } from "next"

import { AccountSettings } from "@/components/settings/account-settings"

export const metadata: Metadata = {
  title: "Account · Quantbase",
}

export default function AccountSettingsPage() {
  return <AccountSettings />
}
