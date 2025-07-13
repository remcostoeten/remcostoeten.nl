"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CMSRedirectPage() {
	const router = useRouter();

	useEffect(function redirectToCMSTab() {
		router.replace("/admin#cms");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<p>Redirecting to CMS...</p>
		</div>
	);
}
