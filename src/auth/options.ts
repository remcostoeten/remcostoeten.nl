import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb, tables } from "../db/client";

export const authOptions = betterAuth({
	database: drizzleAdapter(getDb(), {
		provider: "sqlite",
		schema: tables,
	}),
	secret: process.env.AUTH_SECRET!,
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
});
