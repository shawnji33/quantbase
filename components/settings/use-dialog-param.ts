"use client"

import { useEffect, useState } from "react"

// Review deep links for modals: ?dialog=<id> opens one on load.
//
// A modal is normally only reachable by clicking, which means it can't be
// linked, screenshotted, or sent to anyone. This makes every dialog in the
// settings and closure flows addressable by URL, the same way ?state= makes
// the closure lifecycle addressable.
export function useDialogParam(): string | null {
  const [dialog, setDialog] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL read
    setDialog(new URLSearchParams(window.location.search).get("dialog"))
  }, [])

  return dialog
}
