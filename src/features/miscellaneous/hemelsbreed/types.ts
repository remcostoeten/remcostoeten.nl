export type TRadiusCircle = {
	id: string
	label: string
	lat: number
	lng: number
	radiusKm: number
	color: string
	visible: boolean
}

export type TSavedMap = {
	id: string
	name: string
	circles: TRadiusCircle[]
	updatedAt: number
}

export type TPdokSuggestion = {
	id: string
	label: string
	type: string
}

export type TPdokLocation = {
	label: string
	lat: number
	lng: number
}
