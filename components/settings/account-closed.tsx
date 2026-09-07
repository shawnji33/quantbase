"use client"

// Terminal state. Sign-in survives closure so tax documents stay reachable —
// the 1099-B for the closing year is issued after the account is gone, so
// killing access here would strand a document the user legally needs.
// (Retention window is a compliance call; seven years is the stated assumption.)

import { RiCheckLine, RiDownloadLine, RiFileTextLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, ClosurePage } from "@/components/settings/bits"
import { SUPPORT_EMAIL } from "@/lib/account-closure"

export function AccountClosed({ closedAt }: { closedAt: string | null }) {
  const date = closedAt
    ? new Date(closedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Today"

  return (
    <ClosurePage className="max-w-xl py-10">
      <Card className="flex flex-col items-center gap-5 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#1d7e4f]/12 text-[#1d7e4f]">
          <RiCheckLine className="size-5" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-[#363643]">
            Your account is closed
          </h1>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>

        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Your documents stay available here. We keep them for seven years so you have them at tax
          time.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary">
            <RiFileTextLine className="size-4" />
            Tax documents
          </Button>
          <Button variant="secondary">
            <RiDownloadLine className="size-4" />
            Statements
          </Button>
        </div>
      </Card>

      <p className="px-1 text-center text-xs leading-5 text-muted-foreground">
        If any dividends or interest arrive after today, we&apos;ll contact you and send them to
        your last linked bank. Questions?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </ClosurePage>
  )
}
