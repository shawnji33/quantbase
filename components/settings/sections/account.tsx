"use client"

// Account — plain form fields, edited in place with one persistent Save.
// No modal: a modal to change a phone number is friction for its own sake.
// Save stays disabled until something actually differs from what's stored.

import { useState } from "react"
import Link from "next/link"
import { RiArrowRightSLine } from "@remixicon/react"

import { SECTIONS } from "@/lib/settings"
import { useAsyncAction, useSettings } from "@/components/settings/settings-context"
import {
  Card,
  CardSection,
  Field,
  Panel,
  PanelHeader,
  SaveBar,
} from "@/components/settings/settings-ui"

type Form = {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AccountPanel() {
  const { settings, update } = useSettings()
  const { status, run } = useAsyncAction()

  const [form, setForm] = useState<Form | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})

  // Storage is read after mount, so the form seeds from settings on first edit
  // rather than freezing the pre-hydration defaults.
  const current: Form = form ?? {
    firstName: settings.firstName,
    lastName: settings.lastName,
    email: settings.email,
    phone: settings.phone,
    street: settings.street,
    city: settings.city,
    state: settings.state,
    zip: settings.zip,
  }

  const dirty = (Object.keys(current) as (keyof Form)[]).some(
    (k) => current[k] !== settings[k]
  )

  function set(key: keyof Form, value: string) {
    setForm({ ...current, [key]: value })
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function save() {
    const next: Partial<Record<keyof Form, string>> = {}
    if (!current.firstName.trim()) next.firstName = "Enter your first name."
    if (!current.lastName.trim()) next.lastName = "Enter your last name."
    if (!EMAIL_RE.test(current.email)) next.email = "That doesn't look like an email address."
    if (!current.phone.trim()) next.phone = "Enter a phone number we can reach you on."
    if (!/^\d{5}$/.test(current.zip)) next.zip = "Use a 5-digit ZIP code."

    setErrors(next)
    if (Object.keys(next).length > 0) return

    run(() => update(current))
  }


  return (
    <Panel>
      <PanelHeader title={SECTIONS.account.title} blurb={SECTIONS.account.blurb} />

      <Card>
        <CardSection title="Your details" description="We use these to reach you about your account.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" value={current.firstName} error={errors.firstName} onChange={(v) => set("firstName", v)} autoComplete="given-name" />
            <Field label="Last name" value={current.lastName} error={errors.lastName} onChange={(v) => set("lastName", v)} autoComplete="family-name" />
            <Field label="Email" type="email" value={current.email} error={errors.email} onChange={(v) => set("email", v)} autoComplete="email" />
            <Field label="Phone" type="tel" value={current.phone} error={errors.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />
          </div>
        </CardSection>

        <div className="border-t border-[var(--border-secondary)]" />

        <CardSection title="Mailing address" description="Where your tax documents are sent.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Street" value={current.street} onChange={(v) => set("street", v)} autoComplete="street-address" className="sm:col-span-2" />
            <Field label="City" value={current.city} onChange={(v) => set("city", v)} autoComplete="address-level2" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" value={current.state} onChange={(v) => set("state", v)} autoComplete="address-level1" />
              <Field label="ZIP" value={current.zip} error={errors.zip} onChange={(v) => set("zip", v)} autoComplete="postal-code" />
            </div>
          </div>
        </CardSection>

        <div className="border-t border-[var(--border-secondary)] px-5 py-4">
          <SaveBar status={status} dirty={dirty} onSave={save} />
        </div>
      </Card>

      <Card>
        {/* Navigation, not an action: it opens its own page. Deliberately
            static — the closure flow tracks its own progress, and mirroring
            that here would turn a signpost into a status widget. */}
        <Link
          href="/settings/close-account"
          className="group flex min-h-11 items-center gap-3 rounded-[16px] px-5 py-4 transition-colors duration-150 ease-out hover:bg-black/[0.02] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-[#363643]">Close account</span>
            <span className="text-xs leading-5 text-muted-foreground">
              We&apos;ll sell your investments, send you the money, and close your account.
            </span>
          </span>
          <RiArrowRightSLine className="size-4 shrink-0 text-[#b4b5c5] transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </Card>
    </Panel>
  )
}
