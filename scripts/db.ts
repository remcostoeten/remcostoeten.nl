import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { analyticsEvents, adminUser, adminSessions, adminActivityLog } from '../src/db/schema'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const sql = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(sql, {
  schema: { analyticsEvents, adminUser, adminSessions, adminActivityLog }
})

export { analyticsEvents, adminUser, adminSessions, adminActivityLog }
export type { 
  TAnalyticsEvent, 
  TNewAnalyticsEvent, 
  TAdminUser, 
  TNewAdminUser, 
  TAdminSession, 
  TNewAdminSession, 
  TAdminActivityLog, 
  TNewAdminActivityLog 
} from '../src/db/schema'
