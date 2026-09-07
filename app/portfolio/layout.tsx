// Same app shell as /strategies and /settings, with Dashboard active — the
// portfolio pages are the app's home.

import { AppShell } from "@/components/app-shell"

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
