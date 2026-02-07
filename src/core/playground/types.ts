import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export type PlaygroundCategory = 'ui'

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

export type UiEntry = BaseEntry & {
	category: 'ui'
	preview?: ComponentType
	component?: ComponentType
}

export type RegistryEntry = UiEntry

export type CategoryMeta = {
	label: string
	icon: LucideIcon
}
