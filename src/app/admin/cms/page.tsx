"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, ChevronRight } from "lucide-react";

export default function CMSRedirectPage() {
	const router = useRouter();

	useEffect(function redirectToCMSTab() {
		router.replace("/admin#cms");
	}, [router]);

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				whileHover={{ scale: 1.02 }}
				className="flex items-center space-x-4 p-6 rounded-lg bg-card border shadow-sm min-w-[280px] cursor-pointer"
			>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
					className="flex-shrink-0 p-3 rounded-full bg-primary/10"
				>
					<Settings className="w-5 h-5 text-primary" />
				</motion.div>
				
				<div className="flex-1">
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1, duration: 0.3 }}
						className="text-sm font-medium text-foreground"
					>
						Redirecting to CMS
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.3 }}
						className="flex items-center space-x-1 text-xs text-muted-foreground mt-1"
					>
						<span>Admin</span>
						<ChevronRight className="w-3 h-3" />
						<span>CMS</span>
					</motion.div>
				</div>
				
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.3 }}
					className="flex space-x-1"
				>
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							animate={{ opacity: [0.3, 1, 0.3] }}
							transition={{
								repeat: Infinity,
								duration: 1.5,
								delay: i * 0.2,
								ease: "easeInOut"
							}}
							className="w-1.5 h-1.5 bg-primary rounded-full"
						/>
					))}
				</motion.div>
			</motion.div>
		</div>
	);
}
