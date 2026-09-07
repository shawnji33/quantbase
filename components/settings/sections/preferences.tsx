"use client"

// Investment preferences.
//
// People come here to check what they answered, not to retake the quiz — so
// risk tolerance and experience read as conclusions ("Moderate — you'd hold
// through a downturn") with an Edit action, and the raw questions only appear
// once someone asks for them.

import { useEffect, useState } from "react"
import { RiCheckLine, RiLoader4Line, RiPencilLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  ASSET_TYPES,
  EXPERIENCE_LEVELS,
  RISK_OPTIONS,
  type ExperienceMap,
  type RiskAnswer,
} from "@/lib/onboarding"
import { RISK_PROFILE, SECTIONS } from "@/lib/settings"
import { useAsyncAction, useSettings } from "@/components/settings/settings-context"
import {
  Card,
  CardSection,
  Panel,
  PanelHeader,
} from "@/components/settings/settings-ui"

/* ------------------------------- risk dialog ------------------------------- */

function RiskDialog({
  open,
  onOpenChange,
  current,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  current: RiskAnswer
  onSave: (v: RiskAnswer) => void
}) {
  const [choice, setChoice] = useState<RiskAnswer>(current)
  const { status, run, reset } = useAsyncAction()

  useEffect(() => {
    if (open) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset on close */
    setChoice(current)
    reset()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, current, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Risk tolerance</DialogTitle>
          <DialogDescription>
            If your portfolio dropped 20% in a month, what would you do?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {RISK_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setChoice(o.id)}
              aria-pressed={choice === o.id}
              className={cn(
                "flex flex-col gap-0.5 rounded-[12px] border px-4 py-3 text-left",
                "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                choice === o.id
                  ? "border-primary/40 bg-primary/[0.06]"
                  : "border-[var(--border-secondary)] bg-card hover:bg-[color-mix(in_oklch,white,black_2%)]"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  choice === o.id ? "text-primary" : "text-[#363643]"
                )}
              >
                {o.label}
              </span>
              <span className="text-xs text-muted-foreground">{o.description}</span>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={status === "working"}>
            Cancel
          </Button>
          <Button
            disabled={choice === current || status === "working"}
            onClick={() =>
              run(() => {
                onSave(choice)
                onOpenChange(false)
              })
            }
          >
            {status === "working" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------- experience dialog ---------------------------- */

function ExperienceDialog({
  open,
  onOpenChange,
  current,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  current: ExperienceMap
  onSave: (v: ExperienceMap) => void
}) {
  const [draft, setDraft] = useState<ExperienceMap>(current)
  const { status, run, reset } = useAsyncAction()

  useEffect(() => {
    if (open) return
    /* eslint-disable react-hooks/set-state-in-effect -- reset on close */
    setDraft(current)
    reset()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, current, reset])

  const dirty = ASSET_TYPES.some((a) => (draft[a] ?? 0) !== (current[a] ?? 0))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Investing experience</DialogTitle>
          <DialogDescription>
            How long you&apos;ve been investing in each of these.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {ASSET_TYPES.map((asset) => (
            <div key={asset} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-[#363643]">{asset}</span>
              <div
                role="radiogroup"
                aria-label={`${asset} experience`}
                className="flex gap-1"
              >
                {EXPERIENCE_LEVELS.map((label, level) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={(draft[asset] ?? 0) === level}
                    onClick={() => setDraft({ ...draft, [asset]: level })}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      "transition-colors duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
                      "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      (draft[asset] ?? 0) === level
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-[var(--border-secondary)] bg-card text-[#47475d] hover:bg-[color-mix(in_oklch,white,black_3%)]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={status === "working"}>
            Cancel
          </Button>
          <Button
            disabled={!dirty || status === "working"}
            onClick={() =>
              run(() => {
                onSave(draft)
                onOpenChange(false)
              })
            }
          >
            {status === "working" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------- toggle row ------------------------------- */

// Saves on flip, but the switch only moves once the save lands — same rule as
// two-factor. Failure leaves it where it was and says so.
function ToggleRow({
  title,
  description,
  checked,
  onSave,
}: {
  title: string
  description: string
  checked: boolean
  onSave: (v: boolean) => void
}) {
  const { status, run } = useAsyncAction(600)

  return (
    <CardSection
      title={title}
      description={description}
      action={
        <div className="flex shrink-0 items-center gap-2.5">
          {status === "working" && <RiLoader4Line className="size-4 animate-spin text-muted-foreground" />}
          {status === "done" && (
            <RiCheckLine className="size-4 animate-in text-[#1d7e4f] fade-in duration-200" />
          )}
          <Switch
            checked={checked}
            disabled={status === "working"}
            onCheckedChange={(next) => run(() => onSave(next))}
            aria-label={title}
          />
        </div>
      }
    >
      {status === "error" && (
        <p role="alert" className="text-xs leading-5 text-[#d92d20]">
          We couldn&apos;t change that. Try again in a moment.
        </p>
      )}
    </CardSection>
  )
}

/* ---------------------------------- panel ---------------------------------- */

export function PreferencesPanel() {
  const { settings, update } = useSettings()
  const [riskOpen, setRiskOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)

  const profile = RISK_PROFILE[settings.risk]
  const known = ASSET_TYPES.filter((a) => (settings.experience[a] ?? 0) > 0)

  return (
    <Panel>
      <PanelHeader title={SECTIONS.preferences.title} blurb={SECTIONS.preferences.blurb} />

      <Card>
        <CardSection
          title="Risk tolerance"
          action={
            <Button variant="secondary" size="sm" onClick={() => setRiskOpen(true)}>
              <RiPencilLine className="size-4" />
              Edit
            </Button>
          }
        >
          {/* The answer as a conclusion, not the question again. */}
          <div className="flex flex-col gap-1 rounded-[10px] border border-[var(--border-secondary)] bg-[#fcfcfc] px-4 py-3.5">
            <p className="text-base font-medium text-[#363643]">{profile.level}</p>
            <p className="text-sm text-muted-foreground">{profile.summary}</p>
          </div>
        </CardSection>

        <div className="border-t border-[var(--border-secondary)]" />

        <CardSection
          title="Investing experience"
          action={
            <Button variant="secondary" size="sm" onClick={() => setExpOpen(true)}>
              <RiPencilLine className="size-4" />
              Edit
            </Button>
          }
        >
          {known.length === 0 ? (
            <p className="text-sm text-muted-foreground">No experience recorded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {known.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-[var(--border-secondary)] bg-[#fcfcfc] px-3 py-1 text-xs font-medium text-[#47475d]"
                >
                  {a} · {EXPERIENCE_LEVELS[settings.experience[a] ?? 0]}
                </span>
              ))}
            </div>
          )}
        </CardSection>
      </Card>

      <Card>
        <ToggleRow
          title="Automatic rebalancing"
          description="We bring your strategies back to their target weights when they drift."
          checked={settings.autoRebalance}
          onSave={(v) => update({ autoRebalance: v })}
        />
        <div className="border-t border-[var(--border-secondary)]" />
        <ToggleRow
          title="Reinvest dividends"
          description="Dividends buy more of the strategy that paid them instead of sitting as cash."
          checked={settings.reinvestDividends}
          onSave={(v) => update({ reinvestDividends: v })}
        />
      </Card>

      <RiskDialog
        open={riskOpen}
        onOpenChange={setRiskOpen}
        current={settings.risk}
        onSave={(risk) => update({ risk })}
      />
      <ExperienceDialog
        open={expOpen}
        onOpenChange={setExpOpen}
        current={settings.experience}
        onSave={(experience) => update({ experience })}
      />
    </Panel>
  )
}
