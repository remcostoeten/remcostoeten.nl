"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type TProps = {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	showIcon?: boolean;
	children?: React.ReactNode;
	className?: string;
};

export function LogoutButton({
	variant = "ghost",
	size = "lg",
	showIcon = true,
	children = "Sign Out",
	className,
}: TProps) {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { logout } = useAuth();

	async function handleLogout() {
		setIsLoggingOut(true);
		try {
			await logout();
		} finally {
			setIsLoggingOut(false);
		}
	}

	return (
		<Button
			onClick={handleLogout}
			disabled={isLoggingOut}
			variant={variant}
			size={size}
			className={`min-w-[140px] px-6 py-2 h-10 flex items-center ${className || ""}`}
		>
			{showIcon && <LogOut className="w-4 h-4 mr-2" />}
			<span>{isLoggingOut ? "Signing Out..." : children}</span>
		</Button>
	);
}
