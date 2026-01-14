import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
    clientPrefix: 'NEXT_PUBLIC_',
    server: {
        DATABASE_URL: z.string().url(),
        BETTER_AUTH_URL: z.string().url(),
        BETTER_AUTH_SECRET: z.string().min(1),

        GITHUB_CLIENT_ID: z.string().optional(),
        GITHUB_CLIENT_SECRET: z.string().optional(),

        GOOGLE_CLIENT_ID: z.string().optional(),
        GOOGLE_CLIENT_SECRET: z.string().optional(),

        ADMIN_EMAIL: z.string().email().optional(),
        ALLOWED_GITHUB_USERNAME: z.string().optional(),
        RESEND_API_KEY: z.string().optional(),
        RESEND_EMAIL_FROM: z.string().email().optional(),
        CRON_SECRET: z.string().min(1).optional(),

        IP_INFO_TOKEN: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
        NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
            
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ALLOWED_GITHUB_USERNAME: process.env.ALLOWED_GITHUB_USERNAME,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,
        CRON_SECRET: process.env.CRON_SECRET,

        IP_INFO_TOKEN: process.env.IP_INFO_TOKEN,

        NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    }
})
