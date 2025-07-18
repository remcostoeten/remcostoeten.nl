import { LogIn } from "lucide-react";
import React, { useState } from "react";
import { env } from "@/api/env";
import { useCMSToast } from "@/hooks/use-cms-toast";
import { User } from "../../types/cms";
import { GridButton, importingFrames } from "../grid-button";
import { FadeIn } from "../ui/fade-in";

type TProps = {
	onLogin: (user: User) => void;
};

export default function LoginForm({ onLogin }: TProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { error } = useCMSToast();

	const ALLOWED_EMAIL = env.ADMIN_EMAIL;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (email !== ALLOWED_EMAIL) {
			error(
				"Unauthorized Access",
				"You know you're not supposed to sign in here 🕵️",
			);
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/sign-in/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const result = await response.json();
			if (!response || !response.ok || !result.user) {
				error("Server Error", "Invalid response from server");
				return;
			}
			if (response.ok) {
				const user: User = {
					id: result.user.id.toString(),
					email: result.user.email,
					name: result.user.name,
					role: "admin",
				};
				onLogin(user);
			} else {
				error("Authentication Failed", result.error || "Authentication failed");
			}
		} catch (error) {
			console.error(
				"Authentication Error",
				"An error occurred during authentication",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<FadeIn>
			<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div>
						<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-accent/10">
							<LogIn className="h-6 w-6 text-accent-foreground" />
						</div>
						<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
							Sign in to CMS
						</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							Enter your credentials to access the content management system
						</p>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
						<div className="space-y-4">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent"
									placeholder="Enter your email"
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent"
									placeholder="Enter your password"
								/>
							</div>
						</div>

						<div>
							<GridButton
								type="submit"
								gridSize={[5, 5]}
								frames={importingFrames}
								isLoading={isLoading}
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-colors"
							>
								{isLoading ? "Signing in…" : "Sign in"}
							</GridButton>
						</div>

						<div className="text-center">
							<p className="text-xs text-gray-500">
								Access restricted to authorized users only
							</p>
						</div>
					</form>
				</div>
			</div>
		</FadeIn>
	);
}
