"use client"

import { useEffect } from "react"

const FIGMA_CAPTURE_SCRIPT = "https://mcp.figma.com/mcp/html-to-design/capture.js"

type FigmaCaptureWindow = Window & {
  figma?: { captureForDesign?: unknown }
}

/**
 * Injects Figma's html-to-design capture script only when the URL hash starts
 * with `#figmacapture` (added by the Figma MCP `generate_figma_design` flow).
 * No external script loads during normal use.
 */
export function FigmaCaptureLoader() {
  useEffect(() => {
    if (!window.location.hash.startsWith("#figmacapture")) return
    const captureWindow = window as FigmaCaptureWindow
    if (captureWindow.figma?.captureForDesign) return

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${FIGMA_CAPTURE_SCRIPT}"]`,
    )
    if (existing && !existing.dataset.figmaCaptureLoader) existing.remove()

    const script = document.createElement("script")
    script.src = FIGMA_CAPTURE_SCRIPT
    script.async = true
    script.dataset.figmaCaptureLoader = "true"
    document.head.appendChild(script)
  }, [])

  return null
}
