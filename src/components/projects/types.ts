export type TProject = "desktop" | "cli" | "ui" | "saas" | "utility"

export type TStatus = "done" | "beta" | "wip" | "active"

export type TPlatform = "macos" | "windows" | "linux"

export interface IIframePreview {
  type: "iframe"
  url: string
  embedUrl?: string
  scale?: number
}

export interface IVideoPreview {
  type: "video"
  src: string
  poster?: string
}

export interface IImagePreview {
  type: "image"
  src: string
  alt?: string
}

export interface INoPreview {
  type: "none"
}

export type TPreview = IIframePreview | IVideoPreview | IImagePreview | INoPreview

export interface IGitMetrics {
  lastUpdated: string
  lastCommitMessage: string
  totalCommits: number
  firstCommitDate: string
  weeklyActivity: number[]
}

export interface IProject {
  name: string
  description: string
  additionalDescription?: string
  type: TProject
  status: TStatus
  github: string
  tech: string[]
  preview: TPreview
  spotlight?: boolean
  defaultOpen?: boolean
  showIndicatorOnScroll?: boolean
  git?: IGitMetrics
  platforms?: TPlatform[]
}
