import type { Config } from 'drizzle-kit';
import { env } from 'env'

export default {
  dialect: 'turso',
  schema: './src/server/db/schema.ts',
  out: './src/server/migrations',
  dbCredentials: {
    url: env.DATABASE_URL!,
    authToken: env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
