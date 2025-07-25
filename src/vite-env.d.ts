/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string
  readonly VITE_SITE_TITLE: string
  readonly VITE_SITE_DESCRIPTION: string
  readonly VITE_SITE_URL: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_SOCIAL_X: string
  readonly VITE_SOCIAL_GITHUB: string
  readonly VITE_SOCIAL_BEHANCE: string
  readonly VITE_SOCIAL_TELEGRAM: string
  readonly VITE_ANALYTICS_PASSWORD: string
  readonly VITE_API_PORT: string
  readonly VITE_ALLOWED_ORIGINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
