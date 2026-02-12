"use client"

import { useCallback, useMemo, type Dispatch } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  AnimationSchema,
  AnimationDirection,
  AnimationFillMode,
  PlaygroundAction,
} from "../types"
import { BezierEditor } from "./bezier-editor"
import { Timeline } from "./timeline"
import { PlaybackControls } from "./playback-controls"
import { KeyframeEditor, AddKeyframeButton } from "./keyframe-editor"
import { AnimationExport } from "./animation-export"
import { useAnimationPlayback } from "@/hooks/use-animation-playback"

interface AnimationStudioProps {
  animations: AnimationSchema[]
  activeAnimation: string | null
  bezierValue: [number, number, number, number]
  duration: number
  progress: number
  speed: number
  isPlaying: boolean
  loop: boolean
  repeatCount: number
  delayBetweenMs: number
  currentRun: number
  isInDelay: boolean
  selectedKeyframe: string | null
  editedKeyframes: Record<string, Record<string, string>> | null
  direction: AnimationDirection
  fillMode: AnimationFillMode
  timelineZoom: number
  dispatch: Dispatch<PlaygroundAction>
}

const DIRECTION_OPTIONS: { value: AnimationDirection; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "reverse", label: "Reverse" },
  { value: "alternate", label: "Alternate" },
  { value: "alternate-reverse", label: "Alt-Reverse" },
]

const FILL_MODE_OPTIONS: { value: AnimationFillMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "forwards", label: "Forwards" },
  { value: "backwards", label: "Backwards" },
  { value: "both", label: "Both" },
]

export function AnimationStudio({
  animations,
  activeAnimation,
  bezierValue,
  duration,
  progress,
  speed,
  isPlaying,
  loop,
  repeatCount,
  delayBetweenMs,
  currentRun,
  isInDelay,
  selectedKeyframe,
  editedKeyframes,
  direction,
  fillMode,
  timelineZoom,
  dispatch,
}: AnimationStudioProps) {
  const currentAnim = useMemo(
    () => animations.find((a) => a.name === activeAnimation) ?? null,
    [animations, activeAnimation]
  )

  const keyframes = useMemo(
    () => editedKeyframes ?? currentAnim?.keyframes ?? {},
    [editedKeyframes, currentAnim]
  )

  const keyframeOffsets = useMemo(() => Object.keys(keyframes), [keyframes])

  const onProgressChange = useCallback(
    (value: number) => dispatch({ type: "SET_PROGRESS", value }),
    [dispatch]
  )
  const onPlayingChange = useCallback(
    (value: boolean) => dispatch({ type: "SET_PLAYING", value }),
    [dispatch]
  )
  const onCurrentRunChange = useCallback(
    (value: number) => dispatch({ type: "SET_CURRENT_RUN", value }),
    [dispatch]
  )
  const onInDelayChange = useCallback(
    (value: boolean) => dispatch({ type: "SET_IN_DELAY", value }),
    [dispatch]
  )

  const {
    stepForward,
    stepBackward,
    stepByPercent,
    toggle,
    reset,
    goToPercent,
    totalRuns,
  } = useAnimationPlayback({
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
  })

  const selectedKeyframeProps = selectedKeyframe
    ? keyframes[selectedKeyframe]
    : null

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Animation selector + duration */}
      <div className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
            Animation
          </Label>
          <Select
            value={activeAnimation ?? ""}
            onValueChange={(v) =>
              dispatch({ type: "SET_ANIMATION", name: v || null })
            }
          >
            <SelectTrigger className="h-8 rounded-none border-border/50 bg-card/20 text-sm">
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border/50 bg-card">
              {animations.map((anim) => (
                <SelectItem
                  key={anim.name}
                  value={anim.name}
                  className="text-sm"
                >
                  {anim.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
            Duration
          </Label>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={duration}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v > 0)
                  dispatch({ type: "SET_DURATION", value: v })
              }}
              min={10}
              max={30000}
              step={10}
              className="h-8 w-20 rounded-none border-border/50 bg-card/20 text-sm font-mono"
            />
            <span className="text-[10px] text-muted-foreground/40">ms</span>
          </div>
        </div>
      </div>

      {currentAnim && (
        <>
          {/* Direction + Fill Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Direction
              </Label>
              <Select
                value={direction}
                onValueChange={(v) =>
                  dispatch({ type: "SET_DIRECTION", value: v as AnimationDirection })
                }
              >
                <SelectTrigger className="h-7 rounded-none border-border/40 bg-card/10 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/50 bg-card">
                  {DIRECTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Fill Mode
              </Label>
              <Select
                value={fillMode}
                onValueChange={(v) =>
                  dispatch({ type: "SET_FILL_MODE", value: v as AnimationFillMode })
                }
              >
                <SelectTrigger className="h-7 rounded-none border-border/40 bg-card/10 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/50 bg-card">
                  {FILL_MODE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-border/20" />

          {/* Bezier curve editor */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
              Timing Function
            </Label>
            <BezierEditor
              value={bezierValue}
              onChange={(v) => dispatch({ type: "SET_BEZIER", value: v })}
              size={180}
            />
          </div>

          <Separator className="bg-border/20" />

          {/* Timeline */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
              Timeline
            </Label>
            <Timeline
              progress={progress}
              onProgressChange={onProgressChange}
              keyframeOffsets={keyframeOffsets}
              selectedKeyframe={selectedKeyframe}
              onKeyframeSelect={(v) =>
                dispatch({ type: "SET_SELECTED_KEYFRAME", value: v })
              }
              zoom={timelineZoom}
              onZoomChange={(v) =>
                dispatch({ type: "SET_TIMELINE_ZOOM", value: v })
              }
              duration={duration}
              currentRun={currentRun}
              totalRuns={totalRuns}
              isInDelay={isInDelay}
            />
          </div>

          {/* Playback controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            speed={speed}
            loop={loop}
            repeatCount={repeatCount}
            delayBetweenMs={delayBetweenMs}
            progress={progress}
            onToggle={toggle}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onStepByPercent={stepByPercent}
            onSpeedChange={(v) => dispatch({ type: "SET_SPEED", value: v })}
            onLoopChange={(v) => dispatch({ type: "SET_LOOP", value: v })}
            onRepeatCountChange={(v) =>
              dispatch({ type: "SET_REPEAT_COUNT", value: v })
            }
            onDelayBetweenChange={(v) =>
              dispatch({ type: "SET_DELAY_BETWEEN", value: v })
            }
            onGoToPercent={goToPercent}
            onReset={reset}
          />

          <Separator className="bg-border/20" />

          {/* Keyframe editor */}
          {selectedKeyframe && selectedKeyframeProps && (
            <KeyframeEditor
              offset={selectedKeyframe}
              properties={selectedKeyframeProps}
              canDelete={keyframeOffsets.length > 2}
              onChange={(property, value) =>
                dispatch({
                  type: "SET_KEYFRAME_PROPERTY",
                  offset: selectedKeyframe,
                  property,
                  value,
                })
              }
              onAddProperty={(property, value) =>
                dispatch({
                  type: "SET_KEYFRAME_PROPERTY",
                  offset: selectedKeyframe,
                  property,
                  value,
                })
              }
              onRemoveKeyframe={() =>
                dispatch({ type: "REMOVE_KEYFRAME", offset: selectedKeyframe })
              }
            />
          )}

          {/* Add keyframe */}
          <AddKeyframeButton
            onAdd={(offset, properties) =>
              dispatch({ type: "ADD_KEYFRAME", offset, properties })
            }
          />

          <Separator className="bg-border/20" />

          {/* Export */}
          <AnimationExport
            name={currentAnim.name}
            keyframes={keyframes}
            bezierValue={bezierValue}
            duration={duration}
            iterationCount={currentAnim.iterationCount}
            direction={direction}
            fillMode={fillMode}
            delayBetweenMs={delayBetweenMs}
            repeatCount={repeatCount}
          />
        </>
      )}
    </div>
  )
}
