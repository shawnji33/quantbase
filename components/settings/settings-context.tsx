"use client"

// Shared settings state for every panel, plus the two review flags the team
// needs to see states that are otherwise hard to reach: a failing save and a
// slow load.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import {
  INITIAL_SETTINGS,
  readSettings,
  writeSettings,
  type SettingsState,
} from "@/lib/settings"

type Ctx = {
  settings: SettingsState
  update: (patch: Partial<SettingsState>) => void
  ready: boolean
  failSaves: boolean
  setFailSaves: (v: boolean) => void
  slowLoad: boolean
  setSlowLoad: (v: boolean) => void
}

const SettingsContext = createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(INITIAL_SETTINGS)
  const [ready, setReady] = useState(false)
  const [failSaves, setFailSaves] = useState(false)
  const [slowLoad, setSlowLoad] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time read */
    setSettings(readSettings())
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Re-reads storage rather than patching closed-over state, so two panels
  // can't clobber each other.
  const update = useCallback((patch: Partial<SettingsState>) => {
    const next = { ...readSettings(), ...patch }
    writeSettings(next)
    setSettings(next)
  }, [])

  const value = useMemo(
    () => ({ settings, update, ready, failSaves, setFailSaves, slowLoad, setSlowLoad }),
    [settings, update, ready, failSaves, slowLoad]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>")
  return ctx
}

/* ------------------------------- async actions ----------------------------- */

export type ActionStatus = "idle" | "working" | "done" | "error"

// Every save has three designed states. This models all of them, including the
// failure the review switcher can force.
export function useAsyncAction(delay = 800) {
  const { failSaves } = useSettings()
  const [status, setStatus] = useState<ActionStatus>("idle")

  // Success confirmation is transient; the error is not — it stays until the
  // next attempt so it can't be missed.
  useEffect(() => {
    if (status !== "done") return
    const t = window.setTimeout(() => setStatus("idle"), 2400)
    return () => window.clearTimeout(t)
  }, [status])

  const run = useCallback(
    (onSuccess?: () => void) => {
      if (status === "working") return
      setStatus("working")
      window.setTimeout(() => {
        if (failSaves) {
          setStatus("error")
          return
        }
        onSuccess?.()
        setStatus("done")
      }, delay)
    },
    [status, failSaves, delay]
  )

  const reset = useCallback(() => setStatus("idle"), [])

  return { status, run, reset }
}
