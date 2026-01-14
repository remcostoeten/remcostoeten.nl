export type Corner = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'

export interface DevWidgetConfig {
  showAuth?: boolean
  showRoutes?: boolean
  showSystemInfo?: boolean
  showSettings?: boolean
  customTitle?: string
  isAdmin?: boolean
}

export interface SessionUser {
  name?: string
  email?: string
}

export interface Session {
  user?: SessionUser
}
