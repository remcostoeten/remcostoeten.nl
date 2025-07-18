"use client";

import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface LinkedinIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface LinkedinIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
}

const LinkedinIcon = forwardRef<LinkedinIconHandle, LinkedinIconProps>(
	({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
		const pathControls = useAnimation();
		const rectControls = useAnimation();
		const circleControls = useAnimation();

		const isControlledRef = useRef(false);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: () => {
					pathControls.start("animate");
					rectControls.start("animate");
					circleControls.start("animate");
				},
				stopAnimation: () => {
					pathControls.start("normal");
					rectControls.start("normal");
					circleControls.start("normal");
				},
			};
		});

		const handleMouseEnter = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					pathControls.start("animate");
					rectControls.start("animate");
					circleControls.start("animate");
				} else {
					onMouseEnter?.(e);
				}
			},
			[circleControls, onMouseEnter, pathControls, rectControls],
		);

		const handleMouseLeave = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					pathControls.start("normal");
					rectControls.start("normal");
					circleControls.start("normal");
				} else {
					onMouseLeave?.(e);
				}
			},
			[pathControls, rectControls, circleControls, onMouseLeave],
		);

		return (
			<div
				className={cn(className)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				{...props}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size}
					height={size}
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					viewBox="0 0 24 24"
				>
					<motion.path
						variants={{
							normal: {
								opacity: 1,
								pathLength: 1,
								pathOffset: 0,
							},
							animate: {
								opacity: [0, 1],
								pathLength: [0, 1],
								pathOffset: [1, 0],
								transition: {
									duration: 1,
									ease: "easeInOut",
								},
							},
						}}
						initial="normal"
						animate={pathControls}
						d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
					/>
					<motion.rect
						variants={{
							normal: {
								opacity: 1,
								pathLength: 1,
								pathOffset: 0,
							},
							animate: {
								opacity: [0, 1],
								pathLength: [0, 1],
								pathOffset: [1, 0],
								transition: {
									duration: 1,
									ease: "easeInOut",
								},
							},
						}}
						initial="normal"
						animate={rectControls}
						x="2"
						y="9"
						width="4"
						height="12"
					/>
					<motion.circle
						variants={{
							normal: {
								opacity: 1,
								pathLength: 1,
								pathOffset: 0,
							},
							animate: {
								opacity: [0, 1],
								pathLength: [0, 1],
								pathOffset: [1, 0],
								transition: {
									duration: 1,
									ease: "easeInOut",
								},
							},
						}}
						initial="normal"
						animate={circleControls}
						cx="4"
						cy="4"
						r="2"
					/>
				</svg>
			</div>
		);
	},
);

LinkedinIcon.displayName = "LinkedinIcon";

export { LinkedinIcon };
