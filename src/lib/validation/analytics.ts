import { z } from 'zod'

export const PageViewSchema = z.object({
  page: z.string().min(1, 'Page path is required'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
})

export const AnalyticsEventSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  page: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  data: z.any().optional(),
})

export const StatsQuerySchema = z.object({
  timeframe: z.enum(['day', 'week', 'month']).default('week'),
})

export const EventsQuerySchema = z.object({
  eventType: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
})

export type TPageViewInput = z.infer<typeof PageViewSchema>
export type TAnalyticsEventInput = z.infer<typeof AnalyticsEventSchema>
export type TStatsQuery = z.infer<typeof StatsQuerySchema>
export type TEventsQuery = z.infer<typeof EventsQuerySchema>
