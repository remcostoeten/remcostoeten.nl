"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TRegistrationStatus = {
	enabled: boolean;
	message: string;
};

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [registrationStatus, setRegistrationStatus] =
		useState<TRegistrationStatus | null>(null);
	const [isCheckingStatus, setIsCheckingStatus] = useState(true);
	const router = useRouter();

	useEffect(() => {
		async function checkRegistrationStatus() {
			try {
				const response = await fetch("/api/auth/registration-status");
				const status = await response.json();
				setRegistrationStatus(status);

				if (!status.enabled) {
					setError(
						"Registration is currently disabled. Please contact an administrator.",
					);
				}
			} catch (error) {
				console.error("Failed to check registration status:", error);
				setError("Failed to check registration status");
			} finally {
				setIsCheckingStatus(false);
			}
		}

		checkRegistrationStatus();
	}, []);

	async function handleEmailSignUp(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setSuccess("");

		if (!registrationStatus?.enabled) {
			setError("Registration is currently disabled");
			setIsLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/sign-up/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
					name,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSuccess("Account created successfully! You can now sign in.");
				setTimeout(() => {
					router.push("/auth/signin");
				}, 2000);
			} else {
				setError(result.error || "Failed to create account");
			}
		} catch (error) {
			setError("An error occurred during sign up");
		} finally {
			setIsLoading(false);
		}
	}

	if (isCheckingStatus) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Card className="w-full max-w-md">
					<CardContent className="flex items-center justify-center py-8">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">
								Checking registration status...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Create CMS Account</CardTitle>
					<CardDescription>
						{registrationStatus?.enabled
							? "Create your account to access the content management system"
							: "Registration is currently disabled"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleEmailSignUp} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your full name"
								required
								disabled={!registrationStatus?.enabled}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
								disabled={!registrationStatus?.enabled}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password (min 8 characters)"
								required
								disabled={!registrationStatus?.enabled}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirm your password"
								required
								disabled={!registrationStatus?.enabled}
							/>
						</div>
						{error && (
							<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
								{error}
							</div>
						)}
						{success && (
							<div className="text-sm text-green-600 bg-green-50 p-2 rounded">
								{success}
							</div>
						)}
						<GridButton
							type="submit"
							gridSize={[5, 5]}
							frames={importingFrames}
							isLoading={isLoading}
							disabled={!registrationStatus?.enabled}
							className="w-full"
						>
							{registrationStatus?.enabled
								? "Create Account"
								: "Registration Disabled"}
						</GridButton>
					</form>

					<div className="text-center text-sm">
						<span className="text-muted-foreground">
							Already have an account?{" "}
						</span>
						<Link href="/auth/signin" className="text-primary hover:underline">
							Sign in
						</Link>
					</div>

					<div className="text-center text-sm text-muted-foreground">
						{registrationStatus?.enabled
							? "Access restricted to authorized emails only"
							: "Registration is currently disabled for security purposes"}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
