"use client"

import { useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineProps {
  progress: number
  onProgressChange: (progress: number) => void
  keyframeOffsets: string[]
  selectedKeyframe: string | null
  onKeyframeSelect: (offset: string | null) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  duration: number
  currentRun: number
  totalRuns: number
  isInDelay: boolean
}

function parseOffset(offset: string): number {
  // "0%" -> 0, "50%" -> 50, "100%" -> 100, "0%, 100%" -> 0 (take first)
  const match = offset.match(/(\d+)%/)
  return match ? parseInt(match[1], 10) : 0
}

export function Timeline({
  progress,
  onProgressChange,
  keyframeOffsets,
  selectedKeyframe,
  onKeyframeSelect,
  zoom,
  onZoomChange,
  duration,
  currentRun,
  totalRuns,
  isInDelay,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Generate tick marks based on zoom level
  const tickInterval = zoom >= 4 ? 1 : zoom >= 2 ? 2 : 5
  const ticks: number[] = []
  for (let i = 0; i <= 100; i += tickInterval) {
    ticks.push(i)
  }

  // Major tick marks (always show labels on these)
  const majorInterval = zoom >= 4 ? 5 : zoom >= 2 ? 10 : 25

  const handleTrackInteraction = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      onProgressChange(Math.round(x * 10000) / 100) // 0.01% precision
    },
    [onProgressChange]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      handleTrackInteraction(e)
    },
    [handleTrackInteraction]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      handleTrackInteraction(e)
    },
    [handleTrackInteraction]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Scroll wheel on track = precision scrub (not page scroll)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+wheel = zoom
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.5 : 0.5
        onZoomChange(Math.max(1, Math.min(10, zoom + delta)))
      } else {
        // Regular wheel = scrub
        e.preventDefault()
        const scrubAmount = e.deltaY > 0 ? 0.5 : -0.5
        onProgressChange(Math.max(0, Math.min(100, progress + scrubAmount)))
      }
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [zoom, progress, onZoomChange, onProgressChange])

  // Keep playhead visible during playback
  useEffect(() => {
    if (!scrollRef.current || !trackRef.current) return
    const scroll = scrollRef.current
    const track = trackRef.current
    const trackWidth = track.offsetWidth
    const playheadX = (progress / 100) * trackWidth
    const scrollLeft = scroll.scrollLeft
    const viewWidth = scroll.offsetWidth

    if (playheadX < scrollLeft + 40 || playheadX > scrollLeft + viewWidth - 40) {
      scroll.scrollLeft = playheadX - viewWidth / 2
    }
  }, [progress])

  // Deduplicate offsets and parse positions
  const uniqueOffsets = [...new Set(keyframeOffsets)]
  const keyframePositions = uniqueOffsets.map((offset) => ({
    offset,
    position: parseOffset(offset),
  }))

  const msAtProgress = ((progress / 100) * duration).toFixed(0)

  return (
    <div className="flex flex-col gap-2">
      {/* Zoom controls + run indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-none"
            onClick={() => onZoomChange(Math.max(1, zoom - 0.5))}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="min-w-[36px] text-center text-[10px] font-mono text-muted-foreground/60">
            {zoom.toFixed(1)}x
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-none"
            onClick={() => onZoomChange(Math.min(10, zoom + 0.5))}
            disabled={zoom >= 10}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/50">
          {totalRuns > 1 && totalRuns < Infinity && (
            <span>
              Run {currentRun + 1}/{totalRuns}
            </span>
          )}
          {isInDelay && (
            <span className="text-yellow-500/70">Delay...</span>
          )}
        </div>
      </div>

      {/* Scrollable track container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden"
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="relative h-10 cursor-crosshair select-none border border-border/40 bg-card/10"
          style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-accent/15 pointer-events-none"
            style={{ width: `${progress}%` }}
          />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const isMajor = tick % majorInterval === 0
            return (
              <div key={tick} className="absolute top-0" style={{ left: `${tick}%` }}>
                <div
                  className={cn(
                    "w-px bg-border/40",
                    isMajor ? "h-2.5" : "h-1.5"
                  )}
                />
                {isMajor && (
                  <span className="absolute left-0 top-2.5 -translate-x-1/2 text-[8px] font-mono text-muted-foreground/30 pointer-events-none">
                    {tick}
                  </span>
                )}
              </div>
            )
          })}

          {/* Keyframe diamonds */}
          {keyframePositions.map(({ offset, position }) => (
            <button
              key={offset}
              onClick={(e) => {
                e.stopPropagation()
                onKeyframeSelect(selectedKeyframe === offset ? null : offset)
              }}
              className={cn(
                "absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors",
                selectedKeyframe === offset
                  ? "border-foreground bg-foreground"
                  : "border-muted-foreground/60 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              style={{ left: `${position}%` }}
              title={offset}
            />
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 z-20 h-full w-0.5 bg-foreground pointer-events-none"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute -left-1.5 -top-2 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>
        </div>
      </div>

      {/* Time readout */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono text-muted-foreground/60">
          {progress.toFixed(2)}% &middot; {msAtProgress}ms
        </span>
        {selectedKeyframe && (
          <span className="text-[10px] font-mono text-foreground/70">
            Keyframe: {selectedKeyframe}
          </span>
        )}
      </div>
    </div>
  )
}
