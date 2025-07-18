import type React from "react";
import AdminToggleListener from "@/components/admin-toggle-listener";
import { Providers } from "@/components/providers";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import { AuthOverlay } from "@/components/auth-overlay";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Remco Stoeten</title>
				<meta
					name="description"
					content="Frontend Developer focused on creating efficient and maintainable web applications. Working remotely from Lemmer, Netherlands."
				/>
				<meta name="author" content="Remco Stoeten" />

				<meta property="og:title" content="Remco Stoeten" />
				<meta
					property="og:description"
					content="Frontend Developer focused on creating efficient and maintainable web applications. Working remotely from Lemmer, Netherlands."
				/>
				<meta property="og:type" content="website" />
				<meta property="og:image" content="/og-image.png" />
			</head>
			<body
				className="text-balance antialiased"
				suppressHydrationWarning={true}
				style={
					{
						"--accent": "85 100% 65%",
						"--accent-hover": "85 100% 75%",
						"--accent-active": "85 100% 55%",
						"--accent-muted": "85 70% 85%",
						"--accent-contrast": "85 100% 20%",
						"--highlight-product": "85 100% 65%",
						"--highlight-frontend": "85 100% 65%",
					} as React.CSSProperties
				}
			>
				<AuthOverlay>
					<Providers>
						<Toaster />
						<Sonner />
						<AdminToggleListener />
						{children}
					</Providers>
				</AuthOverlay>
			</body>
		</html>
	);
}

export const metadata = {
	generator: "Next.js",
};
