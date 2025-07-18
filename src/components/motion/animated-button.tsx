"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import type { ButtonProps } from "@/components/ui/button";

type TProps = ButtonProps & {
	isLoading?: boolean;
	whileTap?: any;
	whileHover?: any;
	whileLoading?: any;
};

export const AnimatedButton = forwardRef<HTMLButtonElement, TProps>(
	(
		{
			whileTap = { opacity: 0.6 },
			whileHover = { opacity: 0.8 },
			whileLoading = { opacity: 0.7 },
			isLoading = false,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		return (
			<motion.button
				ref={ref}
				whileTap={!disabled && !isLoading ? whileTap : undefined}
				whileHover={!disabled && !isLoading ? whileHover : undefined}
				animate={isLoading ? whileLoading : undefined}
				transition={{
					type: "spring",
					stiffness: 400,
					damping: 17,
				}}
				disabled={disabled || isLoading}
				{...(props as any)}
			>
				{isLoading ? (
					<motion.div
						className="flex items-center gap-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2 }}
					>
						<motion.div
							className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
							animate={{ rotate: 360 }}
							transition={{
								duration: 1,
								repeat: Infinity,
								ease: "linear",
							}}
						/>
						{children}
					</motion.div>
				) : (
					children
				)}
			</motion.button>
		);
	},
);

AnimatedButton.displayName = "AnimatedButton";
