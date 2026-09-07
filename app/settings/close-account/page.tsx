import type { Metadata } from "next"

import { CloseAccount } from "@/components/settings/close-account"

export const metadata: Metadata = {
  title: "Close account · Quantbase",
}

export default function CloseAccountPage() {
  return <CloseAccount />
}
