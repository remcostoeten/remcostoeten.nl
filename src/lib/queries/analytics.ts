import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query'

type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

type TAnalyticsMetrics = {
  readonly totalViews: number
  readonly uniqueVisitors: number
  readonly uniquePages: number
  readonly timeframe: 'day' | 'week' | 'month'
}

type TTopPage = {
  readonly path: string
  readonly views: number
}

type TPageViewData = {
  readonly path: string
  readonly visitorId: string
  readonly userAgent?: string
  readonly referrer?: string
}

const fetchAnalyticsMetrics = async (timeframe: 'day' | 'week' | 'month'): Promise<TAnalyticsMetrics> => {
  const response = await fetch(`/api/analytics/metrics?timeframe=${timeframe}`)
  const result: TApiResponse<TAnalyticsMetrics> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch analytics metrics')
  }
  
  return result.data || {
    totalViews: 0,
    uniqueVisitors: 0,
    uniquePages: 0,
    timeframe
  }
}

const fetchTopPages = async (limit = 10): Promise<TTopPage[]> => {
  const response = await fetch(`/api/analytics/top-pages?limit=${limit}`)
  const result: TApiResponse<TTopPage[]> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch top pages')
  }
  
  return result.data || []
}

const recordPageView = async (data: TPageViewData): Promise<void> => {
  const response = await fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result: TApiResponse<void> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to record page view')
  }
}

export function useGetAnalyticsMetrics(timeframe: 'day' | 'week' | 'month') {
  return createQuery(() => ({
    queryKey: ['analytics', 'metrics', timeframe],
    queryFn: () => fetchAnalyticsMetrics(timeframe)
  }))
}

export function useGetTopPages(limit = 10) {
  return createQuery(() => ({
    queryKey: ['analytics', 'top-pages', limit],
    queryFn: () => fetchTopPages(limit)
  }))
}

export function useRecordPageView() {
  const queryClient = useQueryClient()
  
  return createMutation(() => ({
    mutationFn: recordPageView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  }))
}

export const generateVisitorId = (): string => {
  if (typeof window === 'undefined') return 'server'
  
  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}
