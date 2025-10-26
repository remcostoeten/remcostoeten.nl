import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/server/env';
import * as schema from '@/server/schema';

const client = postgres(env.DATABASE_URL, { prepare: false });

/**
 * @name Drizzle
 * @description Drizzle ORM instance for database operations
 */
export const db = drizzle(client, { schema });

/**
 * @name Client
 * @description Raw client making direct sql queries, only used for standalone scripts or special cases
 */
export { client };

/**
 * @nanme Server component example
 * @description Example of a server component that uses the database
 *
 * @example
 * ```typescript

import { testConnection } from '@/server/helpers/test-connection';

export default async function Page() {
  const result = await testConnection();
  
  return (
    <div>
      {result.success ? (
        <p>✅ {result.message}</p>
      ) : (
        <p>❌ {result.message}</p>
      )}
    </div>
  );
}
 * */

/**
 * @name Standalone script
 * @description Example of a standalone script that uses the database
 * @example
 * 
 * ```typescript
 * import { testConnection } from '@/server/helpers/test-connection';
 * 
 * async function main() {
 *   const result = await testConnection();
 *   console.log(result);
 *   process.exit(result.success ? 0 : 1);
 * }
 * ```
 */