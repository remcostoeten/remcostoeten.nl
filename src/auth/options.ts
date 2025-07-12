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
	hooks: {
		after: [
			{
				matcher(context) {
					return context.path === "/sign-in/social";
				},
				async handler(ctx) {
					const email = ctx.user?.email;
					if (!email) {
						throw new Error("No email found in user profile");
					}
					
					const allowedEmails = [
						"remcostoeten@hotmail.com"
					];
					
					const isAllowedEmail = allowedEmails.includes(email) || email.endsWith("@remcostoeten");
					
					if (!isAllowedEmail) {
						throw new Error("Access denied: Email not authorized");
					}
				},
			},
		],
	},
});
