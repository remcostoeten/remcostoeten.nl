"use client"

import { useCallback, useEffect, useRef } from "react"

interface UseAnimationPlaybackOptions {
  duration: number
  speed: number           // 1-1000 (percent, 100 = normal)
  isPlaying: boolean
  loop: boolean
  progress: number
  repeatCount: number     // 0 = use loop, N = play N times
  delayBetweenMs: number  // ms to wait between runs
  currentRun: number
  isInDelay: boolean
  onProgressChange: (progress: number) => void
  onPlayingChange: (playing: boolean) => void
  onCurrentRunChange: (run: number) => void
  onInDelayChange: (inDelay: boolean) => void
}

export function useAnimationPlayback({
  duration,
  speed,
  isPlaying,
  loop,
  progress,
  repeatCount,
  delayBetweenMs,
  currentRun,
  isInDelay,
  onProgressChange,
  onPlayingChange,
  onCurrentRunChange,
  onInDelayChange,
}: UseAnimationPlaybackOptions) {
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Speed as multiplier: speed=100 means 1x, speed=1 means 0.01x, speed=1000 means 10x
  const speedMultiplier = speed / 100

  // % progress per single 60fps frame at normal speed
  const frameSize = (1000 / 60 / duration) * 100

  // Total runs we want (0 means infinite if loop, 1 if not)
  const totalRuns = repeatCount > 0 ? repeatCount : loop ? Infinity : 1

  useEffect(() => {
    if (!isPlaying || isInDelay) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    lastTimeRef.current = performance.now()

    const tick = (now: number) => {
      const delta = now - lastTimeRef.current
      lastTimeRef.current = now

      const increment = (delta / duration) * 100 * speedMultiplier
      const next = progress + increment

      if (next >= 100) {
        // This run is complete
        const nextRun = currentRun + 1

        if (nextRun < totalRuns) {
          // More runs to go
          onProgressChange(100)

          if (delayBetweenMs > 0) {
            // Enter delay phase
            onInDelayChange(true)
            delayTimerRef.current = setTimeout(() => {
              onInDelayChange(false)
              onCurrentRunChange(nextRun)
              onProgressChange(0)
            }, delayBetweenMs)
          } else {
            // Immediately start next run
            onCurrentRunChange(nextRun)
            onProgressChange(0)
          }
        } else {
          // All runs complete
          onProgressChange(100)
          onPlayingChange(false)
        }
      } else {
        onProgressChange(next)
      }

      if (next < 100) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [
    isPlaying, isInDelay, duration, speedMultiplier, progress,
    currentRun, totalRuns, delayBetweenMs,
    onProgressChange, onPlayingChange, onCurrentRunChange, onInDelayChange,
  ])

  // Cleanup delay timer on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
    }
  }, [])

  const stepForward = useCallback(
    (frames = 1) => {
      const next = Math.min(100, progress + frameSize * frames)
      onProgressChange(next)
    },
    [progress, frameSize, onProgressChange]
  )

  const stepBackward = useCallback(
    (frames = 1) => {
      const next = Math.max(0, progress - frameSize * frames)
      onProgressChange(next)
    },
    [progress, frameSize, onProgressChange]
  )

  const stepByPercent = useCallback(
    (pct: number) => {
      const next = Math.max(0, Math.min(100, progress + pct))
      onProgressChange(next)
    },
    [progress, onProgressChange]
  )

  const toggle = useCallback(() => {
    if (isInDelay) {
      // Cancel delay and stop
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
      onInDelayChange(false)
      onPlayingChange(false)
      return
    }
    if (progress >= 100 && !isPlaying) {
      onProgressChange(0)
      onCurrentRunChange(0)
      onPlayingChange(true)
    } else {
      onPlayingChange(!isPlaying)
    }
  }, [isPlaying, isInDelay, progress, onProgressChange, onPlayingChange, onCurrentRunChange, onInDelayChange])

  const reset = useCallback(() => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
    onInDelayChange(false)
    onPlayingChange(false)
    onProgressChange(0)
    onCurrentRunChange(0)
  }, [onProgressChange, onPlayingChange, onCurrentRunChange, onInDelayChange])

  const goToPercent = useCallback(
    (pct: number) => {
      onProgressChange(Math.max(0, Math.min(100, pct)))
    },
    [onProgressChange]
  )

  return {
    frameSize,
    speedMultiplier,
    stepForward,
    stepBackward,
    stepByPercent,
    toggle,
    reset,
    goToPercent,
    totalRuns,
  }
}
