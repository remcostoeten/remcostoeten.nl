/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL?: string
  readonly POSTGRES_URL?: string
  readonly POSTGRES_PRISMA_URL?: string
  readonly JWT_SECRET?: string
  readonly AUTH_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
