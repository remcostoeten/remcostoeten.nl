"use client";

import { motion } from "framer-motion";

type TSkeletonLineProps = {
	width?: string;
	height?: string;
	className?: string;
};

type TSkeletonBlockProps = {
	width?: string;
	height?: string;
	className?: string;
};

type TSkeletonListProps = {
	count?: number;
	itemHeight?: string;
	spacing?: string;
	className?: string;
};

const pulseAnimation = {
	initial: { opacity: 0.4 },
	animate: { opacity: 1 },
	transition: {
		duration: 1.2,
		repeat: Infinity,
		repeatType: "reverse" as const,
		ease: "easeInOut" as const,
	},
};

export function SkeletonLine({
	width = "100%",
	height = "1rem",
	className = "",
}: TSkeletonLineProps) {
	return (
		<motion.div
			className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
			style={{ width, height }}
			{...pulseAnimation}
		/>
	);
}

export function SkeletonBlock({
	width = "100%",
	height = "4rem",
	className = "",
}: TSkeletonBlockProps) {
	return (
		<motion.div
			className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
			style={{ width, height }}
			{...pulseAnimation}
		/>
	);
}

export function SkeletonList({
	count = 3,
	itemHeight = "1.5rem",
	spacing = "0.5rem",
	className = "",
}: TSkeletonListProps) {
	return (
		<div className={`space-y-[${spacing}] ${className}`}>
			{Array.from({ length: count }).map((_, index) => (
				<motion.div
					key={index}
					className="bg-gray-200 dark:bg-gray-700 rounded"
					style={{ height: itemHeight }}
					{...pulseAnimation}
					transition={{
						...pulseAnimation.transition,
						delay: index * 0.1,
					}}
				/>
			))}
		</div>
	);
}
