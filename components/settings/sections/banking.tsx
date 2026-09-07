"use client"

// Banking. Account and routing numbers are masked until the person asks to see
// them — they're on screen during screen-shares and support calls, and nothing
// here needs them legible by default. Disconnecting is confirmed, never silent.

import { useState } from "react"
import { RiBankLine, RiLinkUnlinkM } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { BANK, SECTIONS } from "@/lib/settings"
import { useAsyncAction, useSettings } from "@/components/settings/settings-context"
import {
  Card,
  CardSection,
  ConfirmDialog,
  Panel,
  PanelHeader,
  RevealValue,
  StatusPill,
} from "@/components/settings/settings-ui"

export function BankingPanel() {
  const { settings, update } = useSettings()
  const { status, run, reset } = useAsyncAction()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const connected = settings.bankConnected

  function disconnect() {
    run(() => {
      update({ bankConnected: false })
      setConfirmOpen(false)
    })
  }

  return (
    <Panel>
      <PanelHeader
        title={SECTIONS.banking.title}
        blurb={SECTIONS.banking.blurb}
        status={
          <StatusPill tone={connected ? "good" : "warn"}>
            {connected ? "Connected" : "Not connected"}
          </StatusPill>
        }
      />

      {connected ? (
        <Card>
          <CardSection
            title={BANK.nickname}
            description={`${BANK.type} · connected ${BANK.connectedOn}`}
            action={
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RiBankLine className="size-5" />
              </span>
            }
          >
            <div className="flex flex-col divide-y divide-[var(--border-secondary)] rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-4">
              <RevealValue label="Account number" value={BANK.accountNumber} />
              <RevealValue label="Routing number" value={BANK.routingNumber} />
            </div>
          </CardSection>

          <div className="border-t border-[var(--border-secondary)]" />

          <CardSection
            title="Disconnect this account"
            description="Deposits and withdrawals stop until you connect another bank. Any transfer already in flight still completes."
          >
            <Button
              variant="secondary"
              className="w-fit"
              onClick={() => {
                reset()
                setConfirmOpen(true)
              }}
            >
              <RiLinkUnlinkM className="size-4" />
              Disconnect
            </Button>
          </CardSection>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <RiBankLine className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium text-[#363643]">No bank connected</h3>
              <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                You&apos;ll need a linked bank account to deposit money, withdraw it, or close
                your account.
              </p>
            </div>
            <Button onClick={() => update({ bankConnected: true })}>Connect a bank</Button>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Disconnect Chase Checking?"
        description="You won't be able to deposit or withdraw until you connect another bank. You can reconnect at any time."
        confirmLabel="Disconnect"
        cancelLabel="Keep it"
        destructive
        status={status}
        onConfirm={disconnect}
      />
    </Panel>
  )
}
