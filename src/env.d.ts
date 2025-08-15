/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL?: string
  readonly POSTGRES_URL?: string
  readonly POSTGRES_PRISMA_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
