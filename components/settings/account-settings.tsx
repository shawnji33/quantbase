"use client"

// Account settings. Deliberately small — the app had no settings surface at
// all, and this exists to give account closure a home that doesn't look bolted
// on. Closure is a normal row, not a red danger zone: the destructive weight
// belongs on the final confirm, not on a navigation link.

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  RiBankLine,
  RiFileTextLine,
  RiShieldCheckLine,
} from "@remixicon/react"

import { USER } from "@/components/app-shell"
import { Card, Row, RowGroup, SettingsPage } from "@/components/settings/bits"
import { useClosure } from "@/components/settings/use-closure"
import { gateProgress } from "@/lib/account-closure"

const BANK_KEY = "qb-bank-label"
const FALLBACK_BANK = "Chase Checking ••••4831"

export function AccountSettings() {
  const { state, ready } = useClosure()
  const [bank, setBank] = useState(FALLBACK_BANK)

  useEffect(() => {
    const saved = sessionStorage.getItem(BANK_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time read
    if (saved) setBank(saved)
  }, [])

  const progress = gateProgress(state)

  // What the closure row says depends on where the user already is.
  const closure =
    state.phase === "closed"
      ? { note: "Your account is closed.", cta: "View details" }
      : state.phase === "requested"
        ? { note: "Closure in progress. You can still cancel.", cta: "View status" }
        : progress.done > 0
          ? {
              note: `You started closing this account — ${progress.done} of ${progress.total} steps done.`,
              cta: "Continue",
            }
          : { note: "Withdraw your funds and close your account for good.", cta: "" }

  return (
    <SettingsPage>
      <h1 className="text-xl font-semibold tracking-tight text-[#363643]">Account</h1>

      {/* identity */}
      <Card>
        <div className="flex items-center gap-4 px-5 py-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {USER.initials}
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-[15px] font-medium text-[#363643]">{USER.name}</p>
            <p className="truncate text-sm text-muted-foreground">{USER.email}</p>
          </div>
        </div>
      </Card>

      {/* account records */}
      <Card>
        <RowGroup>
          <Row icon={RiBankLine} label="Linked bank" value={bank} href="#" />
          <Row icon={RiShieldCheckLine} label="Documents" value="3 files verified" href="#" />
          <Row icon={RiFileTextLine} label="Tax documents" value="1099-B · 2025" href="#" />
        </RowGroup>
      </Card>

      {/* closure */}
      <div className="flex flex-col gap-2">
        <Card>
          <Link
            href="/settings/close-account"
            className="flex items-center gap-3 rounded-[16px] px-5 py-4 transition-colors hover:bg-black/[0.02]"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-[#363643]">Close account</span>
              <span className="text-xs leading-5 text-muted-foreground">{closure.note}</span>
            </span>
            {ready && closure.cta && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {closure.cta}
              </span>
            )}
          </Link>
        </Card>
        <p className="px-1 text-xs leading-5 text-muted-foreground">
          Closing removes your Quantbase account and your brokerage account at Alpaca. Your tax
          documents stay available here afterwards.
        </p>
      </div>
    </SettingsPage>
  )
}
