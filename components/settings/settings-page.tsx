"use client"

// Entry point for every settings URL. The section id comes from the route, so
// selection is a real navigation: back, forward, and a support link straight to
// /settings/security all behave.

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import type { SectionId } from "@/lib/settings"
import { SettingsProvider, useSettings } from "@/components/settings/settings-context"
import { SettingsShell } from "@/components/settings/settings-shell"
import { AccountPanel } from "@/components/settings/sections/account"
import { SecurityPanel } from "@/components/settings/sections/security"
import { BankingPanel } from "@/components/settings/sections/banking"
import { DocumentsPanel } from "@/components/settings/sections/documents"
import { ActivityPanel } from "@/components/settings/sections/activity"
import { PreferencesPanel } from "@/components/settings/sections/preferences"

const PANELS: Record<SectionId, () => React.ReactElement> = {
  account: AccountPanel,
  security: SecurityPanel,
  banking: BankingPanel,
  documents: DocumentsPanel,
  activity: ActivityPanel,
  preferences: PreferencesPanel,
}

// Design-review only. Saving states and loading skeletons are otherwise almost
// impossible to catch, so they get a switch.
function ReviewSwitcher() {
  const { failSaves, setFailSaves, slowLoad, setSlowLoad } = useSettings()
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hash read
    if (window.location.hash.startsWith("#figmacapture")) setCapturing(true)
  }, [])

  if (capturing) return null

  const group = (
    label: string,
    options: [boolean, string][],
    value: boolean,
    onChange: (v: boolean) => void
  ) => (
    <div className="glass flex items-center gap-1 rounded-full border p-1 shadow-[var(--shadow-card)]">
      <span className="px-2.5 text-xs font-medium text-muted-foreground">{label}</span>
      {options.map(([v, text]) => (
        <button
          key={text}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium",
            "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
            value === v ? "bg-primary text-primary-foreground" : "text-[#47475d] hover:bg-black/5"
          )}
        >
          {text}
        </button>
      ))}
    </div>
  )

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-2">
      {group("Saves", [[false, "Succeed"], [true, "Fail"]], failSaves, setFailSaves)}
      {group("Data", [[false, "Fast"], [true, "Slow"]], slowLoad, setSlowLoad)}
    </div>
  )
}

export function SettingsPage({
  section,
  isIndex = false,
}: {
  section: SectionId
  isIndex?: boolean
}) {
  const Panel = PANELS[section]
  return (
    <SettingsProvider>
      <SettingsShell active={section} isIndex={isIndex}>
        <Panel />
      </SettingsShell>
      <ReviewSwitcher />
    </SettingsProvider>
  )
}
