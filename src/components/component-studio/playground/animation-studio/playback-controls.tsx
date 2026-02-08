"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface PlaybackControlsProps {
  isPlaying: boolean
  speed: number            // 1-1000 (percent)
  loop: boolean
  repeatCount: number      // 0 = use loop, N = play N times
  delayBetweenMs: number   // ms between runs
  progress: number
  onToggle: () => void
  onStepForward: (frames?: number) => void
  onStepBackward: (frames?: number) => void
  onStepByPercent: (pct: number) => void
  onSpeedChange: (speed: number) => void
  onLoopChange: (loop: boolean) => void
  onRepeatCountChange: (count: number) => void
  onDelayBetweenChange: (ms: number) => void
  onGoToPercent: (pct: number) => void
  onReset: () => void
}

export function PlaybackControls({
  isPlaying,
  speed,
  loop,
  repeatCount,
  delayBetweenMs,
  progress,
  onToggle,
  onStepForward,
  onStepBackward,
  onStepByPercent,
  onSpeedChange,
  onLoopChange,
  onRepeatCountChange,
  onDelayBetweenChange,
  onGoToPercent,
  onReset,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Transport controls */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={onReset}
          title="Reset to start"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onGoToPercent(0)}
          title="Go to 0%"
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onStepBackward(5)}
          title="Step back 5 frames"
        >
          <Rewind className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onStepBackward(1)}
          title="Step back 1 frame"
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-none border-border/50"
          onClick={onToggle}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onStepForward(1)}
          title="Step forward 1 frame"
        >
          <SkipForward className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onStepForward(5)}
          title="Step forward 5 frames"
        >
          <FastForward className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none"
          onClick={() => onGoToPercent(100)}
          title="Go to 100%"
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>

        <div className="mx-1 h-4 w-px bg-border/30" />

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-none",
            loop && "bg-accent/40 text-foreground"
          )}
          onClick={() => onLoopChange(!loop)}
          title={loop ? "Disable infinite loop" : "Enable infinite loop"}
        >
          <Repeat className="h-3 w-3" />
        </Button>
      </div>

      {/* Precision jump */}
      <div className="flex items-center gap-2">
        <Label className="min-w-fit text-[10px] font-mono text-muted-foreground/50">
          Jump to
        </Label>
        <Input
          type="number"
          value={Math.round(progress * 100) / 100}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onGoToPercent(v)
          }}
          min={0}
          max={100}
          step={0.01}
          className="h-6 w-20 rounded-none border-border/40 bg-card/10 text-[10px] font-mono"
        />
        <span className="text-[10px] text-muted-foreground/40">%</span>

        <div className="mx-1 h-3 w-px bg-border/20" />

        <Button
          variant="ghost"
          className="h-6 rounded-none px-1.5 text-[10px] font-mono text-muted-foreground/50"
          onClick={() => onStepByPercent(-0.1)}
        >
          -0.1%
        </Button>
        <Button
          variant="ghost"
          className="h-6 rounded-none px-1.5 text-[10px] font-mono text-muted-foreground/50"
          onClick={() => onStepByPercent(0.1)}
        >
          +0.1%
        </Button>
        <Button
          variant="ghost"
          className="h-6 rounded-none px-1.5 text-[10px] font-mono text-muted-foreground/50"
          onClick={() => onStepByPercent(-1)}
        >
          -1%
        </Button>
        <Button
          variant="ghost"
          className="h-6 rounded-none px-1.5 text-[10px] font-mono text-muted-foreground/50"
          onClick={() => onStepByPercent(1)}
        >
          +1%
        </Button>
      </div>

      {/* Speed control - continuous % */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Speed
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={speed}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 1 && v <= 1000) onSpeedChange(v)
              }}
              min={1}
              max={1000}
              step={1}
              className="h-6 w-16 rounded-none border-border/40 bg-card/10 text-[10px] font-mono text-right"
            />
            <span className="text-[10px] text-muted-foreground/40">%</span>
          </div>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([v]) => onSpeedChange(v)}
          min={1}
          max={500}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground/30">
          <span>1%</span>
          <span>100%</span>
          <span>500%</span>
        </div>
      </div>

      {/* Repeat & Delay */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Repeat
          </Label>
          <Input
            type="number"
            value={repeatCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 0) onRepeatCountChange(v)
            }}
            min={0}
            max={999}
            step={1}
            className="h-7 rounded-none border-border/40 bg-card/10 text-[11px] font-mono"
            placeholder="0 = loop"
          />
          <span className="text-[9px] text-muted-foreground/40">
            0 = {loop ? "infinite" : "play once"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            Delay Between
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={delayBetweenMs}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 0) onDelayBetweenChange(v)
              }}
              min={0}
              max={30000}
              step={100}
              className="h-7 flex-1 rounded-none border-border/40 bg-card/10 text-[11px] font-mono"
            />
            <span className="text-[10px] text-muted-foreground/40">ms</span>
          </div>
          <span className="text-[9px] text-muted-foreground/40">
            {delayBetweenMs > 0
              ? `${(delayBetweenMs / 1000).toFixed(1)}s hold at end`
              : "No delay"}
          </span>
        </div>
      </div>
    </div>
  )
}
