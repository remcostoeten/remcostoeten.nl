"use client"

import { useReducer, useCallback, useMemo, useRef, useEffect, Suspense } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type {
  ComponentRegistration,
  PlaygroundState,
  PlaygroundAction,
} from "./types"
import { PlaygroundToolbar } from "./playground-toolbar"
import { ComponentPreview } from "./component-preview"
import { PropEditor } from "./prop-editor"
import { BehaviorEditor } from "./behavior-editor"
import { AnimationStudio } from "./animation-studio/animation-studio"
import { CodeExportPanel } from "./code-export-panel"

function buildDefaults(registration: ComponentRegistration): PlaygroundState {
  const props: Record<string, unknown> = {}
  for (const prop of registration.props) {
    props[prop.name] = prop.defaultValue
  }

  const behaviors: Record<string, unknown> = {}
  for (const b of registration.behaviors ?? []) {
    behaviors[b.name] = b.defaultValue
  }

  const firstAnimation = registration.animations?.[0]

  return {
    props,
    behaviors,
    activeAnimation: firstAnimation?.name ?? null,
    bezierValue: firstAnimation
      ? parseBezier(firstAnimation.timingFunction)
      : [0.25, 0.1, 0.25, 1],
    animationDuration: firstAnimation?.duration ?? 400,
    playbackProgress: 0,
    playbackSpeed: 100,
    isPlaying: false,
    loop: false,
    repeatCount: 0,
    delayBetweenMs: 0,
    currentRun: 0,
    isInDelay: false,
    selectedKeyframe: null,
    editedKeyframes: null,
    direction: "normal",
    fillMode: "none",
    timelineZoom: 1,
  }
}

function parseBezier(str: string): [number, number, number, number] {
  const match = str.match(
    /cubic-bezier\(\s*([\d.]+)\s*,\s*([-\d.]+)\s*,\s*([\d.]+)\s*,\s*([-\d.]+)\s*\)/
  )
  if (match) {
    return [
      parseFloat(match[1]),
      parseFloat(match[2]),
      parseFloat(match[3]),
      parseFloat(match[4]),
    ]
  }
  // Named presets
  const presets: Record<string, [number, number, number, number]> = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    "ease-in": [0.42, 0, 1, 1],
    "ease-out": [0, 0, 0.58, 1],
    "ease-in-out": [0.42, 0, 0.58, 1],
  }
  return presets[str] ?? [0.25, 0.1, 0.25, 1]
}

function reducer(
  state: PlaygroundState,
  action: PlaygroundAction
): PlaygroundState {
  switch (action.type) {
    case "SET_PROP":
      return { ...state, props: { ...state.props, [action.name]: action.value } }
    case "SET_BEHAVIOR":
      return {
        ...state,
        behaviors: { ...state.behaviors, [action.name]: action.value },
      }
    case "SET_BEZIER":
      return { ...state, bezierValue: action.value }
    case "SET_DURATION":
      return { ...state, animationDuration: action.value }
    case "SET_ANIMATION":
      return {
        ...state,
        activeAnimation: action.name,
        selectedKeyframe: null,
        editedKeyframes: null,
      }
    case "SET_PROGRESS":
      return { ...state, playbackProgress: action.value }
    case "SET_SPEED":
      return { ...state, playbackSpeed: action.value }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.value }
    case "SET_LOOP":
      return { ...state, loop: action.value }
    case "SET_REPEAT_COUNT":
      return { ...state, repeatCount: action.value }
    case "SET_DELAY_BETWEEN":
      return { ...state, delayBetweenMs: action.value }
    case "SET_CURRENT_RUN":
      return { ...state, currentRun: action.value }
    case "SET_IN_DELAY":
      return { ...state, isInDelay: action.value }
    case "SET_SELECTED_KEYFRAME":
      return { ...state, selectedKeyframe: action.value }
    case "SET_KEYFRAME_PROPERTY": {
      const current = state.editedKeyframes ?? {}
      const frame = current[action.offset] ?? {}
      return {
        ...state,
        editedKeyframes: {
          ...current,
          [action.offset]: { ...frame, [action.property]: action.value },
        },
      }
    }
    case "ADD_KEYFRAME": {
      const current = state.editedKeyframes ?? {}
      return {
        ...state,
        editedKeyframes: {
          ...current,
          [action.offset]: action.properties,
        },
        selectedKeyframe: action.offset,
      }
    }
    case "REMOVE_KEYFRAME": {
      const current = state.editedKeyframes ?? {}
      const next = { ...current }
      delete next[action.offset]
      return {
        ...state,
        editedKeyframes: Object.keys(next).length > 0 ? next : null,
        selectedKeyframe: null,
      }
    }
    case "SET_DIRECTION":
      return { ...state, direction: action.value }
    case "SET_FILL_MODE":
      return { ...state, fillMode: action.value }
    case "SET_TIMELINE_ZOOM":
      return { ...state, timelineZoom: action.value }
    case "RESET":
      return { ...state, ...action.defaults }
    default:
      return state
  }
}

interface PlaygroundLayoutProps {
  registration: ComponentRegistration
}

export function PlaygroundLayout({ registration }: PlaygroundLayoutProps) {
  const defaults = useMemo(() => buildDefaults(registration), [registration])
  const [state, dispatch] = useReducer(reducer, defaults)
  const animNameRef = useRef(`pg-anim-${Date.now()}`)

  const onPropChange = useCallback(
    (name: string, value: unknown) =>
      dispatch({ type: "SET_PROP", name, value }),
    []
  )

  const onBehaviorChange = useCallback(
    (name: string, value: unknown) =>
      dispatch({ type: "SET_BEHAVIOR", name, value }),
    []
  )

  const activeAnimSchema = useMemo(
    () =>
      registration.animations?.find((a) => a.name === state.activeAnimation) ??
      null,
    [registration.animations, state.activeAnimation]
  )

  // Generate a stable animation name that changes only when keyframes/bezier/duration change
  // This forces the browser to re-create the animation when those values change
  const animKeyframeHash = useMemo(() => {
    const keyframes = state.editedKeyframes ?? activeAnimSchema?.keyframes ?? {}
    const [x1, y1, x2, y2] = state.bezierValue
    return JSON.stringify({ keyframes, x1, y1, x2, y2, d: state.animationDuration })
  }, [state.editedKeyframes, activeAnimSchema, state.bezierValue, state.animationDuration])

  useEffect(() => {
    animNameRef.current = `pg-anim-${Date.now()}`
  }, [animKeyframeHash])

  // Build animation CSS for the live preview
  // Uses the negative animation-delay trick to scrub: paused animation at a specific point
  const animationCSS = useMemo(() => {
    if (!activeAnimSchema) return { style: undefined, css: undefined }

    const keyframes = state.editedKeyframes ?? activeAnimSchema.keyframes
    const name = animNameRef.current
    const [x1, y1, x2, y2] = state.bezierValue

    const framesCSS = Object.entries(keyframes)
      .map(
        ([offset, props]) =>
          `${offset} { ${Object.entries(props)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; ")} }`
      )
      .join("\n  ")

    const css = `@keyframes ${name} {\n  ${framesCSS}\n}`

    // Determine iteration count
    const effectiveIterCount = state.repeatCount > 0
      ? state.repeatCount
      : state.loop
        ? "infinite"
        : activeAnimSchema.iterationCount

    const iterStr = effectiveIterCount === "infinite"
      ? "infinite"
      : String(effectiveIterCount)

    if (state.isPlaying && !state.isInDelay) {
      // Playing: let the animation run with CSS
      const style: React.CSSProperties = {
        animation: `${name} ${state.animationDuration}ms cubic-bezier(${x1}, ${y1}, ${x2}, ${y2}) ${iterStr} ${state.direction} ${state.fillMode}`,
        animationPlayState: "running",
      }
      return { style, css }
    } else {
      // Paused/scrubbing: use negative animation-delay to scrub to the current progress
      const delayMs = -(state.playbackProgress / 100) * state.animationDuration
      const style: React.CSSProperties = {
        animation: `${name} ${state.animationDuration}ms cubic-bezier(${x1}, ${y1}, ${x2}, ${y2}) 1 ${state.direction} ${state.fillMode}`,
        animationPlayState: "paused",
        animationDelay: `${delayMs}ms`,
      }
      return { style, css }
    }
  }, [
    activeAnimSchema, state.editedKeyframes, state.bezierValue,
    state.animationDuration, state.isPlaying, state.isInDelay,
    state.playbackProgress, state.loop, state.repeatCount,
    state.direction, state.fillMode, animKeyframeHash,
  ])

  const hasBehaviors = (registration.behaviors?.length ?? 0) > 0
  const hasAnimations = (registration.animations?.length ?? 0) > 0

  return (
    <div className="flex h-full min-h-[600px] flex-col animate-page-enter">
      <PlaygroundToolbar
        name={registration.name}
        description={registration.description}
      />

      <ResizablePanelGroup orientation="horizontal" className="min-h-[600px] flex-1 border-b border-border/50">
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="flex h-full items-center justify-center border-r border-border/30 bg-background">
            <ComponentPreview
              registration={registration}
              props={state.props}
              behaviors={state.behaviors}
              animationStyle={animationCSS.style}
              animationKeyframesCSS={animationCSS.css}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex h-full flex-col overflow-hidden">
            <Tabs defaultValue="props" className="flex h-full flex-col">
              <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border/50 bg-transparent p-0">
                <TabsTrigger
                  value="props"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-medium uppercase tracking-wider data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Props
                </TabsTrigger>
                {hasBehaviors && (
                  <TabsTrigger
                    value="behavior"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-medium uppercase tracking-wider data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Behavior
                  </TabsTrigger>
                )}
                {hasAnimations && (
                  <TabsTrigger
                    value="animation"
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-medium uppercase tracking-wider data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Animation
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="code"
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-medium uppercase tracking-wider data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="props" className="mt-0 flex-1 overflow-y-auto">
                <PropEditor
                  schema={registration.props}
                  values={state.props}
                  onChange={onPropChange}
                />
              </TabsContent>

              {hasBehaviors && (
                <TabsContent
                  value="behavior"
                  className="mt-0 flex-1 overflow-y-auto"
                >
                  <BehaviorEditor
                    schema={registration.behaviors!}
                    behaviorValues={state.behaviors}
                    propValues={state.props}
                    onChange={onBehaviorChange}
                  />
                </TabsContent>
              )}

              {hasAnimations && (
                <TabsContent
                  value="animation"
                  className="mt-0 flex-1 overflow-y-auto"
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground/50">
                        Loading animation studio...
                      </div>
                    }
                  >
                    <AnimationStudio
                      animations={registration.animations!}
                      activeAnimation={state.activeAnimation}
                      bezierValue={state.bezierValue}
                      duration={state.animationDuration}
                      progress={state.playbackProgress}
                      speed={state.playbackSpeed}
                      isPlaying={state.isPlaying}
                      loop={state.loop}
                      repeatCount={state.repeatCount}
                      delayBetweenMs={state.delayBetweenMs}
                      currentRun={state.currentRun}
                      isInDelay={state.isInDelay}
                      selectedKeyframe={state.selectedKeyframe}
                      editedKeyframes={state.editedKeyframes}
                      direction={state.direction}
                      fillMode={state.fillMode}
                      timelineZoom={state.timelineZoom}
                      dispatch={dispatch}
                    />
                  </Suspense>
                </TabsContent>
              )}

              <TabsContent value="code" className="mt-0 flex-1 overflow-y-auto">
                <CodeExportPanel
                  registration={registration}
                  props={state.props}
                  behaviors={state.behaviors}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {registration.showcaseComponent && (
        <section className="border-t border-border/50 bg-muted/20">
          <div className="container py-12">
            <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Component Showcases
            </h2>
            <registration.showcaseComponent />
          </div>
        </section>
      )}
    </div>
  )
}
