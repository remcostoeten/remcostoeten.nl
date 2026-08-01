import type { ComponentType, SVGProps } from 'react'

export type TToolCategory = 'text' | 'geo' | 'media'

export type TToolStatus = 'available'

export type TToolIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

export type TToolDefinition = {
	slug: string
	name: string
	description: string
	category: TToolCategory
	icon: TToolIcon
	status: TToolStatus
	keywords: readonly string[]
}
