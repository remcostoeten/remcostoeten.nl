import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	clientPrefix: 'NEXT_PUBLIC_',
	server: {
		DATABASE_URL: z.string().url(),
		RESEND_API_KEY: z.string().optional(),
		RESEND_EMAIL_FROM: z.string().email().optional(),
		CRON_SECRET: z.string().min(1).optional(),
		IP_INFO_TOKEN: z.string().optional()
	},
	client: {
		NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
		NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional()
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_EMAIL_FROM: process.env.RESEND_EMAIL_FROM,
		CRON_SECRET: process.env.CRON_SECRET,
		IP_INFO_TOKEN: process.env.IP_INFO_TOKEN,
		NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST
	}
})
