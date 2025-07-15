"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GridButton, importingFrames } from "@/components/grid-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	clearSavedCredentials,
	getSavedCredentials,
	isRememberMeEnabled,
	saveCredentials,
} from "@/lib/remember-me";

type TRegistrationStatus = {
	enabled: boolean;
	message: string;
};

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [registrationStatus, setRegistrationStatus] =
		useState<TRegistrationStatus | null>(null);
	const router = useRouter();

	useEffect(() => {
		const saved = getSavedCredentials();
		if (saved) {
			setEmail(saved.email);
			setPassword(saved.password);
			setRememberMe(isRememberMeEnabled());
		}
	}, []);

	useEffect(() => {
		async function checkRegistrationStatus() {
			try {
				const response = await fetch("/api/auth/registration-status");
				const status = await response.json();
				setRegistrationStatus(status);
			} catch (error) {
				console.error("Failed to check registration status:", error);
			}
		}

		checkRegistrationStatus();
	}, []);

	async function handleEmailSignIn(e: React.FormEvent) {
		e.preventDefault();

		if (rememberMe) {
			saveCredentials(email, password);
		} else {
			clearSavedCredentials();
		}

		setIsLoading(true);
		setError("");

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
				router.push("/admin/cms");
			} else {
				setError(result.error || "Failed to sign in");
			}
		} catch (error) {
			setError("An error occurred during sign in");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Sign in to CMS</CardTitle>
					<CardDescription>
						Enter your credentials to access the content management system
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleEmailSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								required
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="remember-me"
								checked={rememberMe}
								onCheckedChange={(checked) => setRememberMe(checked === true)}
							/>
							<label
								htmlFor="remember-me"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
							>
								Remember me
							</label>
						</div>
						{error && (
							<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
								{error}
							</div>
						)}
						<GridButton
							type="submit"
							gridSize={[5, 5]}
							frames={importingFrames}
							isLoading={isLoading}
							className="w-full"
						>
							Sign in
						</GridButton>
					</form>

					{registrationStatus?.enabled && (
						<div className="text-center text-sm">
							<span className="text-muted-foreground">
								Don't have an account?{" "}
							</span>
							<Link
								href="/auth/signup"
								className="text-primary hover:underline"
							>
								Sign up
							</Link>
						</div>
					)}

					<div className="text-center text-sm text-muted-foreground">
						Access restricted to authorized users only
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
