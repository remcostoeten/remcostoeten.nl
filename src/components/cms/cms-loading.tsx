"use client";

import { motion } from "framer-motion";
import { FileText, Loader2, Database, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface CMSLoadingProps {
	stage?: "initial" | "pages" | "content" | "finalizing";
	message?: string;
}

const loadingStages = {
	initial: {
		icon: Database,
		message: "Initializing CMS...",
		progress: 25,
	},
	pages: {
		icon: FileText,
		message: "Loading pages...",
		progress: 50,
	},
	content: {
		icon: RefreshCw,
		message: "Preparing content...",
		progress: 75,
	},
	finalizing: {
		icon: Loader2,
		message: "Almost ready...",
		progress: 90,
	},
};

export function CMSLoading({ stage = "pages", message }: CMSLoadingProps) {
	const [currentStage, setCurrentStage] = useState(stage);
	const [progress, setProgress] = useState(0);

	const stageConfig = loadingStages[currentStage];
	const IconComponent = stageConfig.icon;

	useEffect(() => {
		const timer = setTimeout(() => {
			setProgress(stageConfig.progress);
		}, 100);

		return () => clearTimeout(timer);
	}, [currentStage, stageConfig.progress]);

	// Auto-progress through stages for better UX
	useEffect(() => {
		if (stage === "initial") {
			const stages = ["initial", "pages", "content", "finalizing"];
			let currentIndex = 0;

			const interval = setInterval(() => {
				currentIndex++;
				if (currentIndex < stages.length) {
					setCurrentStage(stages[currentIndex] as keyof typeof loadingStages);
				} else {
					clearInterval(interval);
				}
			}, 800);

			return () => clearInterval(interval);
		}
	}, [stage]);

	return (
		<div className="min-h-[60vh] flex items-center justify-center p-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center max-w-md mx-auto"
			>
				{/* Main Loading Icon */}
				<motion.div
					className="relative w-16 h-16 mx-auto mb-8"
					animate={{ rotate: currentStage === "finalizing" ? 360 : 0 }}
					transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
				>
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 animate-pulse" />
					<div className="relative w-full h-full bg-background rounded-full border-2 border-primary/20 flex items-center justify-center">
						<IconComponent className="w-8 h-8 text-primary" />
					</div>
				</motion.div>

				{/* Loading Message */}
				<motion.div
					key={currentStage}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.3 }}
					className="mb-6"
				>
					<h3 className="text-lg font-semibold text-foreground mb-2">
						{message || stageConfig.message}
					</h3>
					<p className="text-sm text-muted-foreground">
						Setting up your content management system
					</p>
				</motion.div>

				{/* Progress Bar */}
				<div className="w-full bg-secondary rounded-full h-2 mb-8 overflow-hidden">
					<motion.div
						className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					/>
				</div>

				{/* Skeleton Content Preview */}
				<div className="space-y-4">
					<div className="text-xs text-muted-foreground mb-3">Preview</div>
					<div className="bg-card rounded-lg border border-border p-4 space-y-3">
						{/* Skeleton Header */}
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-secondary rounded-lg animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-secondary rounded animate-pulse" />
								<div className="h-3 bg-secondary/60 rounded w-2/3 animate-pulse" />
							</div>
						</div>

						{/* Skeleton Content */}
						<div className="space-y-2">
							<div className="h-3 bg-secondary/40 rounded animate-pulse" />
							<div className="h-3 bg-secondary/40 rounded w-4/5 animate-pulse" />
							<div className="h-3 bg-secondary/40 rounded w-3/4 animate-pulse" />
						</div>

						{/* Skeleton Actions */}
						<div className="flex gap-2 pt-2">
							<div className="h-8 w-16 bg-secondary/60 rounded animate-pulse" />
							<div className="h-8 w-16 bg-secondary/40 rounded animate-pulse" />
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

// Alternative minimal loading component
export function CMSLoadingMinimal({ message = "Loading..." }: { message?: string }) {
	return (
		<div className="flex items-center justify-center p-8">
			<div className="text-center">
				<motion.div
					className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>
				<p className="text-muted-foreground">{message}</p>
			</div>
		</div>
	);
}

// Loading skeleton for pages list
export function CMSPagesListSkeleton() {
	return (
		<div className="p-8 space-y-6">
			{/* Header Skeleton */}
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<div className="h-8 w-32 bg-secondary rounded animate-pulse" />
					<div className="h-4 w-48 bg-secondary/60 rounded animate-pulse" />
				</div>
				<div className="h-10 w-32 bg-secondary rounded animate-pulse" />
			</div>

			{/* Pages List Skeleton */}
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.1 }}
						className="bg-card rounded-lg border border-border p-6"
					>
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-secondary rounded-lg animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-5 bg-secondary rounded animate-pulse" />
								<div className="h-4 bg-secondary/60 rounded w-3/4 animate-pulse" />
								<div className="flex gap-4">
									<div className="h-3 w-20 bg-secondary/40 rounded animate-pulse" />
									<div className="h-3 w-16 bg-secondary/40 rounded animate-pulse" />
								</div>
							</div>
							<div className="flex gap-2">
								<div className="h-8 w-16 bg-secondary/60 rounded animate-pulse" />
								<div className="h-8 w-8 bg-secondary/40 rounded animate-pulse" />
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
