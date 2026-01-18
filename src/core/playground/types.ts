import type { ReactNode, ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export type PlaygroundCategory = 'snippet' | 'ui' | 'package' | 'cli'

export type BaseEntry = {
    id: string
    title: string
    description: string
    category: PlaygroundCategory
    tags: string[]
    language?: string
    code?: string
    github?: string
    demo?: string
}

export type SnippetEntry = BaseEntry & {
    category: 'snippet'
}

export type UiEntry = BaseEntry & {
    category: 'ui'
    preview?: ComponentType
}

export type PackageEntry = BaseEntry & {
    category: 'package'
    preview?: ComponentType
}

export type CliEntry = BaseEntry & {
    category: 'cli'
    preview?: ComponentType
}

export type RegistryEntry = SnippetEntry | UiEntry | PackageEntry | CliEntry

export type CategoryMeta = {
    label: string
    icon: LucideIcon
}
