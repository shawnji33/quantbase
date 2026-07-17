"use client"

// Account-scoped chrome (§R1.6, fixes P5): buying power, settled cash,
// Transfer, Setup auto-investments. Identical on every view; the gray panel
// surface + "Account" eyebrow deliberately separate it from strategy content.

import { Button } from "@/components/ui/button"
import { ACCOUNT, TOOLTIPS, usd } from "@/lib/portfolio"
import { Info } from "@/components/portfolio/bits"

export function AccountPanel() {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--border-secondary)] bg-[#efefef] p-[13px] shadow-[var(--shadow-card)]">
      <p className="px-1 pt-1 text-xs font-medium tracking-[0.3px] text-muted-foreground">
        Account
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[12px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-3.5 py-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Buying power <Info copy={TOOLTIPS.buyingPower} />
          </p>
          <p className="pt-0.5 text-base font-medium tabular-nums text-[#363643]">
            {usd(ACCOUNT.buyingPower)}
          </p>
        </div>
        <div className="rounded-[12px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-3.5 py-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Settled cash balance <Info copy={TOOLTIPS.settledCash} />
          </p>
          <p className="pt-0.5 text-base font-medium tabular-nums text-[#363643]">
            {usd(ACCOUNT.settledCash)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" className="w-full">
          Transfer
        </Button>
        <Button variant="secondary" className="w-full">
          Setup auto-investments
        </Button>
      </div>
    </div>
  )
}
