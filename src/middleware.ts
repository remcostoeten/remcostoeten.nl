import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Custom JWT-based authentication middleware
// Protects admin routes and API endpoints

function getAuthorizedEmails(): string[] {
	const envEmails = process.env.AUTHORIZED_EMAILS;
	if (!envEmails) {
		console.warn(
			"AUTHORIZED_EMAILS environment variable not set, falling back to default",
		);
		return ["remcostoeten@hotmail.com"];
	}
	return envEmails.split(",").map((email) => email.trim());
}

const AUTHORIZED_EMAILS = getAuthorizedEmails();

async function isAuthenticated(request: NextRequest): Promise<boolean> {
	// Check for auth token cookie (this is what the signin API sets)
	const authCookie = request.cookies.get("auth-token");
	const authHeader = request.headers.get("Authorization");

	// If we have a token cookie, validate it
	if (authCookie?.value) {
		try {
			// Import the auth functions
			const { verifyToken } = await import("@/lib/auth");
			const tokenData = await verifyToken(authCookie.value);

			if (tokenData && AUTHORIZED_EMAILS.includes(tokenData.email)) {
				return true;
			}
		} catch (error) {
			// Token verification failed, continue to fallback
		}
	}

	// Fallback: Check for valid session from auth API
	try {
		const response = await fetch(new URL("/api/auth/me", request.url), {
			headers: {
				Cookie: request.headers.get("Cookie") || "",
			},
		});

		if (response.ok) {
			const result = await response.json();
			const user = result.user;
			if (user && AUTHORIZED_EMAILS.includes(user.email)) {
				return true;
			}
		}
	} catch (error) {
		// API auth check failed, user is not authenticated
	}
	return false;
}

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Protect admin routes
	if (pathname.startsWith("/admin")) {
		const authenticated = await isAuthenticated(request);

		if (!authenticated) {
			// Redirect to signin with return URL
			const signinUrl = new URL("/auth/signin", request.url);
			signinUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signinUrl);
		}
	}

	// Protect CMS API routes
	if (pathname.startsWith("/api/cms")) {
		const authenticated = await isAuthenticated(request);

		if (!authenticated) {
			return new NextResponse(
				JSON.stringify({ success: false, message: "Authentication required" }),
				{ status: 401, headers: { "content-type": "application/json" } },
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*", "/admin", "/api/cms/:path*"],
};
