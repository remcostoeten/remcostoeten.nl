import { LogIn } from "lucide-react";
import React, { useState } from "react";
import { Spinner } from "../ui/spinner";
import { FadeIn } from "../ui/fade-in";
import { User } from "../../types/cms";

type TProps = {
	onLogin: (user: User) => void;
};

export default function LoginForm({ onLogin }: TProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
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

			if (response.ok) {
				const user: User = {
					id: result.user.id.toString(),
					email: result.user.email,
					name: result.user.name,
					role: "admin",
				};
				onLogin(user);
			} else {
				alert(result.error || "Authentication failed");
			}
		} catch (error) {
			alert("An error occurred during authentication");
		} finally {
			setIsLoading(false);
		}
	};

return (
		<FadeIn>
			<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div>
					<div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
						<LogIn className="h-6 w-6 text-green-600" />
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
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
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
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
								placeholder="Enter your password"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
<div className="flex items-center">
							{isLoading ? <Spinner className="h-4 w-4 mr-2" size={16} color="#fff" /> : null}
							{isLoading ? "Signing in…" : "Sign in"}
						</div>
						</button>
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
