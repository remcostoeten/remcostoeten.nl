"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-client";
import { GridButton, importingFrames } from "./grid-button";

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
	variant = "outline",
	size = "default",
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
		<GridButton
			onClick={handleLogout}
			gridSize={[5, 5]}
			frames={importingFrames}
			isLoading={isLoggingOut}
			variant={variant}
			size={size}
			className={`min-w-[120px] whitespace-nowrap ${className || ""}`}
		>
			{showIcon && <LogOut className="w-4 h-4" />}
			{isLoggingOut ? "Signing Out..." : children}
		</GridButton>
	);
}
