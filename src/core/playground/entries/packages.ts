import type { PackageEntry } from '../types'
import { LogUtilsDemo } from '@/components/playground/demos/log-utils'
import { DrizzleHelpersDemo } from '@/components/playground/demos/drizzle-helpers'

export const packageEntries: PackageEntry[] = [
    {
        id: 'ts-log-utils',
        title: 'ts-log-utils',
        description: 'Type-safe colored console logging with prefixes',
        category: 'package',
        language: 'ts',
        tags: ['TypeScript', 'Logging', 'Utils'],
        github: 'https://github.com/remcostoeten/ts-log-utils',
        preview: LogUtilsDemo,
        code: `type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

const colors: Record<LogLevel, string> = {
  info: '\\x1b[36m',
  warn: '\\x1b[33m', 
  error: '\\x1b[31m',
  debug: '\\x1b[90m',
  success: '\\x1b[32m'
}

function createLogger(prefix: string) {
  return Object.fromEntries(
    (Object.keys(colors) as LogLevel[]).map(level => [
      level,
      (...args: unknown[]) => 
        console.log(\`\${colors[level]}[\${prefix}]\`, ...args, '\\x1b[0m')
    ])
  ) as Record<LogLevel, (...args: unknown[]) => void>
}

export const log = createLogger('app')`,
    },
    {
        id: 'drizzle-helpers',
        title: 'drizzle-helpers',
        description: 'Common Drizzle ORM schema patterns and utilities',
        category: 'package',
        language: 'ts',
        tags: ['Drizzle', 'Database', 'ORM'],
        github: 'https://github.com/remcostoeten/drizzle-helpers',
        preview: DrizzleHelpersDemo,
        code: `import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

export const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`)
}

export const withId = {
  id: text('id').primaryKey().$defaultFn(() => createId())
}

export const users = sqliteTable('users', {
  ...withId,
  email: text('email').notNull().unique(),
  name: text('name'),
  ...timestamps
})`,
    },
]
