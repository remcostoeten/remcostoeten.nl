import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
    clientPrefix: 'NEXT_PUBLIC_',

    server: {
        DATABASE_URL: z.string().min(1),
        TURSO_AUTH_TOKEN: z.string().min(1),
        // BETTER_AUTH_SECRET: z.string().min(1),
        // BETTER_AUTH_URL: z.string().url(),
        ADMIN_EMAIL: z.string().optional(), // self asigned email that you can do specific `operations with`

        /**
         * envs that will probably come in hand later
         */
        // GITHUB_CLIENT_ID: z.string().optional(),
        // GITHUB_CLIENT_SECRET: z.string().optional(),
        // GEMINI_API_KEY: z.string().optional(),
        // GEMINI_BACKUP_KEY: z.string().optional(),
        // ADMIN_EMAILS: z.string().optional(),
    },

    client: {},

    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
        // BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        // BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        ADMIN_EMAIL: process.env.EMAIL, // self assigned email that you can do specific `operations with`
        /**
         * envs that will probably come in hand later
         */
        // GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        // GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        // GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        // GEMINI_BACKUP_KEY: process.env.GEMINI_BACKUP_KEY,
    },
})
