"use client";

type TProps = {
	children: React.ReactNode;
};

export function AuthProvider({ children }: TProps) {
	// No-op auth provider - just returns children
	return <>{children}</>;
}
