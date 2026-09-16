"use client"

// Shown across the live dashboard while a closure request is being worked.
//
// The account is still fully invested during this window — days, sometimes —
// so replacing the dashboard with a status page would hide a balance that is
// still moving. The banner states the closure, names the destination, and links
// to the tracker for the detail. It isn't dismissible: this is a live state, not
// an announcement, and it should stay visible until it isn't true any more.

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { CLOSURE_ETA } from "@/lib/account-closure"

export function ClosingBanner({ payoutBank }: { payoutBank: string | null }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-6">
      <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-primary/25 bg-primary/[0.07] px-5 py-4">
        <span className="relative flex size-8 shrink-0 items-center justify-center">
          <span className="absolute inline-flex size-3 animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#363643]">Your account is closing</p>
          <p className="text-sm text-[#47475d]">
            We&apos;re selling your investments and sending the money to{" "}
            {payoutBank ?? "your linked bank"}, usually within {CLOSURE_ETA}.
          </p>
        </div>
        <Button size="sm" variant="secondary" asChild>
          <Link href="/settings/close-account">View status</Link>
        </Button>
      </div>
    </div>
  )
}
