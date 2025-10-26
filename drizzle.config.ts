import type { Config } from 'drizzle-kit';
import { env } from './src/server/env';

export default {
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ['remcostoeten_db_*'],
  strict: true,
} satisfies Config;