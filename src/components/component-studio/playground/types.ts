import type { ComponentType } from "react"

// --- Prop Schema Types ---

export interface StringPropSchema {
  name: string
  label: string
  description?: string
  required?: boolean
  type: "string"
  defaultValue: string
  placeholder?: string
}

export interface BooleanPropSchema {
  name: string
  label: string
  description?: string
  required?: boolean
  type: "boolean"
  defaultValue: boolean
}

export interface EnumPropSchema {
  name: string
  label: string
  description?: string
  required?: boolean
  type: "enum"
  defaultValue: string
  options: { value: string; label: string }[]
}

export interface NumberPropSchema {
  name: string
  label: string
  description?: string
  required?: boolean
  type: "number"
  defaultValue: number
  min?: number
  max?: number
  step?: number
}

export interface IconPropSchema {
  name: string
  label: string
  description?: string
  required?: boolean
  type: "icon"
  defaultValue: string | null
}

export type PropSchema =
  | StringPropSchema
  | BooleanPropSchema
  | EnumPropSchema
  | NumberPropSchema
  | IconPropSchema

// --- Behavior Schema Types ---

export interface BehaviorOptionEnum {
  name: string
  label: string
  description?: string
  type: "enum"
  defaultValue: string
  options: { value: string; label: string }[]
  dependsOn?: { behavior: string; notValue?: unknown; value?: unknown; source?: "prop" | "behavior" }
}

export interface BehaviorOptionBoolean {
  name: string
  label: string
  description?: string
  type: "boolean"
  defaultValue: boolean
  dependsOn?: { behavior: string; notValue?: unknown; value?: unknown; source?: "prop" | "behavior" }
}

export interface BehaviorOptionNumber {
  name: string
  label: string
  description?: string
  type: "number"
  defaultValue: number
  min?: number
  max?: number
  step?: number
  dependsOn?: { behavior: string; notValue?: unknown; value?: unknown; source?: "prop" | "behavior" }
}

export interface BehaviorOptionString {
  name: string
  label: string
  description?: string
  type: "string"
  defaultValue: string
  placeholder?: string
  dependsOn?: { behavior: string; notValue?: unknown; value?: unknown; source?: "prop" | "behavior" }
}

export type BehaviorOption =
  | BehaviorOptionEnum
  | BehaviorOptionBoolean
  | BehaviorOptionNumber
  | BehaviorOptionString

// --- Animation Schema Types ---

export interface AnimationKeyframe {
  offset: string // "0%", "50%", "100%"
  properties: Record<string, string>
}

export interface AnimationSchema {
  name: string
  label: string
  keyframes: Record<string, Record<string, string>>
  duration: number
  timingFunction: string
  iterationCount: string | number
}

// --- Category Types ---

export type CategorySlug = "ui" | "code-snippets" | "package-builds" | "cli-tools"

export interface Category {
  slug: CategorySlug
  label: string
  description: string
  icon: string
  disabled?: boolean
}

// --- Component Registration ---

export interface ComponentRegistration {
  slug: string
  name: string
  description: string
  category: CategorySlug
  component: ComponentType<Record<string, unknown>>
  props: PropSchema[]
  behaviors?: BehaviorOption[]
  animations?: AnimationSchema[]
  previewProps?: Record<string, unknown>
  /** Optional companion component rendered alongside the preview (e.g. SVG filters) */
  previewExtras?: ComponentType
  /** Optional component to showcase variants/examples below the playground */
  showcaseComponent?: ComponentType
}

// --- Playground State ---

export type AnimationDirection = "normal" | "reverse" | "alternate" | "alternate-reverse"
export type AnimationFillMode = "none" | "forwards" | "backwards" | "both"

export interface PlaygroundState {
  props: Record<string, unknown>
  behaviors: Record<string, unknown>
  activeAnimation: string | null
  bezierValue: [number, number, number, number]
  animationDuration: number
  // Playback
  playbackProgress: number       // 0-100 within current run
  playbackSpeed: number           // percent: 1-1000 (100 = normal speed)
  isPlaying: boolean
  loop: boolean
  // Repeat & delay
  repeatCount: number             // how many times to play (0 = use loop setting)
  delayBetweenMs: number          // ms to wait between runs
  currentRun: number              // which run we're on (0-indexed)
  isInDelay: boolean              // true during delay between runs
  // Keyframe editing
  selectedKeyframe: string | null
  editedKeyframes: Record<string, Record<string, string>> | null
  // Animation options
  direction: AnimationDirection
  fillMode: AnimationFillMode
  // Timeline
  timelineZoom: number            // 1-10x zoom factor
}

export type PlaygroundAction =
  | { type: "SET_PROP"; name: string; value: unknown }
  | { type: "SET_BEHAVIOR"; name: string; value: unknown }
  | { type: "SET_BEZIER"; value: [number, number, number, number] }
  | { type: "SET_DURATION"; value: number }
  | { type: "SET_ANIMATION"; name: string | null }
  | { type: "SET_PROGRESS"; value: number }
  | { type: "SET_SPEED"; value: number }
  | { type: "SET_PLAYING"; value: boolean }
  | { type: "SET_LOOP"; value: boolean }
  | { type: "SET_REPEAT_COUNT"; value: number }
  | { type: "SET_DELAY_BETWEEN"; value: number }
  | { type: "SET_CURRENT_RUN"; value: number }
  | { type: "SET_IN_DELAY"; value: boolean }
  | { type: "SET_SELECTED_KEYFRAME"; value: string | null }
  | { type: "SET_KEYFRAME_PROPERTY"; offset: string; property: string; value: string }
  | { type: "ADD_KEYFRAME"; offset: string; properties: Record<string, string> }
  | { type: "REMOVE_KEYFRAME"; offset: string }
  | { type: "SET_DIRECTION"; value: AnimationDirection }
  | { type: "SET_FILL_MODE"; value: AnimationFillMode }
  | { type: "SET_TIMELINE_ZOOM"; value: number }
  | { type: "RESET"; defaults: Partial<PlaygroundState> }
