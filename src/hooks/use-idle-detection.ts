"use client"

import { useState, useEffect, type RefObject } from "react"

export function useIdleDetection(
  elementRef: RefObject<HTMLElement | null>,
  idleMs: number,
  enabled: boolean
): boolean {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false)
      return
    }

    let timeoutId: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      setIsIdle(false)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsIdle(true), idleMs)
    }

    const events = ["mousemove", "mousedown", "scroll", "touchstart", "keydown"]
    events.forEach((e) =>
      document.addEventListener(e, resetTimer, { passive: true })
    )

    timeoutId = setTimeout(() => setIsIdle(true), idleMs)

    return () => {
      clearTimeout(timeoutId)
      events.forEach((e) => document.removeEventListener(e, resetTimer))
    }
  }, [elementRef, idleMs, enabled])

  return isIdle
}
