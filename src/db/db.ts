import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@/api/env'

const client = createClient({
	url: env.TURSO_DATABASE_URL!,
	authToken: env.TURSO_AUTH_TOKEN!
})

export const db = drizzle({ client })
