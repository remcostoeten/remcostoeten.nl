
export type TProject = {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly url?: string
  readonly githubUrl?: string
  readonly imageUrl?: string
  readonly technologies: string[]
  readonly status: 'active' | 'completed' | 'archived'
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type TPageView = {
  readonly id: string
  readonly path: string
  readonly visitorId: string
  readonly userAgent?: string
  readonly referrer?: string
  readonly createdAt: Date
}

export type TVisitorData = {
  readonly visitorId: string
  readonly pageViews: number
  readonly firstVisit: Date
  readonly lastVisit: Date
}

export type TAnalyticsMetrics = {
  readonly totalViews: number
  readonly uniqueVisitors: number
  readonly uniquePages: number
  readonly timeframe: 'day' | 'week' | 'month'
}

export type TUser = {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly avatarUrl?: string
  readonly role: 'admin' | 'user'
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type TSession = {
  readonly id: string
  readonly userId: string
  readonly token: string
  readonly expiresAt: Date
  readonly createdAt: Date
}

export type TContactMessage = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly subject: string
  readonly message: string
  readonly status: 'new' | 'read' | 'replied' | 'archived'
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type TCreateProject = Omit<TProject, 'id' | 'createdAt' | 'updatedAt'>
export type TUpdateProject = Partial<TCreateProject> & { readonly id: string }

export type TCreateContactMessage = Omit<TContactMessage, 'id' | 'status' | 'createdAt' | 'updatedAt'>

export type TCreateUser = Omit<TUser, 'id' | 'createdAt' | 'updatedAt'>
export type TUpdateUser = Partial<TCreateUser> & { readonly id: string }
