import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { db } from "db"
import { env } from "env"
import * as authSchema from "./db/auth-schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema,
    }),
    trustedOrigins: [env.BETTER_AUTH_URL],
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID!,
            clientSecret: env.GITHUB_CLIENT_SECRET!,
        },
    },
    plugins: [admin()],
})

