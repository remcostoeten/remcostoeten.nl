export type ProjectStatus = 'finished' | 'in progress' | 'abandoned'

export type ProjectDates = {
  start: string
  updated: string
  year: number
  end?: string
}

export type ProjectLinks = {
  live?: string
  repo?: string
  docs?: string
}

export type GithubRef = {
  owner: string
  repo: string
}

export type MediaKind = 'image' | 'video' | 'gif'

export type ProjectMedia = {
  kind: MediaKind
  src: string
  alt: string
  poster?: string
}

export type ProjectFilter = {
  category?: string | null
  status?: ProjectStatus | 'all'
  year?: number | null
  sort?: 'recent' | 'oldest'
}

export type SandboxAction = {
  label: string
  href: string
}

export type SandboxConfig = {
  key: string
  note?: string
  source?: string
  star?: string
}

export type Project = {
  slug: string
  title: string
  summary: string
  description: string
  categories: string[]
  status: ProjectStatus
  dates: ProjectDates
  stack: string[]
  links?: ProjectLinks
  github?: GithubRef
  media?: ProjectMedia
  sandbox?: SandboxConfig
}
