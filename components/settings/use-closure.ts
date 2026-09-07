"use client"

import { useCallback, useEffect, useState } from "react"

import {
  INITIAL_CLOSURE,
  readClosure,
  writeClosure,
  type ClosureState,
} from "@/lib/account-closure"

// Closure state lives in sessionStorage so a half-finished checklist survives a
// reload — the real flow spans days, so it can't live in component state.
// Storage is read after mount to keep SSR and first paint identical.
export function useClosure() {
  const [state, setState] = useState<ClosureState>(INITIAL_CLOSURE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydration-safe one-time read */
    setState(readClosure())
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  // Re-reads storage rather than patching the closed-over state, so two
  // components driving the same closure can't overwrite each other.
  const update = useCallback((patch: Partial<ClosureState>) => {
    const next = { ...readClosure(), ...patch }
    writeClosure(next)
    setState(next)
  }, [])

  const reset = useCallback((to: ClosureState = INITIAL_CLOSURE) => {
    writeClosure(to)
    setState(to)
  }, [])

  return { state, update, reset, ready }
}
