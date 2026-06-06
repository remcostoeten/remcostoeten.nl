export type Corner = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

export type DevWidgetConfig = {
	showAuth?: boolean
	showRoutes?: boolean
	showSystemInfo?: boolean
	showSettings?: boolean
	customTitle?: string
	isAdmin?: boolean
}

export type SessionUser = {
	name?: string
	email?: string
}

export type Session = {
	user?: SessionUser
}
