import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node14',
  external: ['drizzle-orm', '@neondatabase/serverless', '@libsql/client', 'better-sqlite3', 'pg', 'postgres', 'glob', 'react', 'react-dom', 'next'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    }
  },
})