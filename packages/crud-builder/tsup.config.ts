import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['drizzle-orm', '@neondatabase/serverless', '@libsql/client', 'better-sqlite3', 'pg', 'postgres', 'glob']
})