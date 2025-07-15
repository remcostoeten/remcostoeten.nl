import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type TProps = {
	words: string[];
	className?: string;
	interval?: number;
	initialWord?: string;
};

export function SwappingWordEffect({
	words,
	className = "",
	interval = 3000,
	initialWord,
}: TProps) {
	const [currentIndex, setCurrentIndex] = useState(() => {
		if (initialWord) {
			const index = words.indexOf(initialWord);
			return index !== -1 ? index : 0;
		}
		return 0;
	});

	useEffect(() => {
		if (words.length <= 1) return;

		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % words.length);
		}, interval);

		return () => clearInterval(timer);
	}, [words.length, interval]);

	if (words.length === 0) return null;

	return (
		<span className={`inline-block ${className}`}>
			<AnimatePresence mode="wait">
				<motion.span
					key={currentIndex}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					className="inline-block"
				>
					{words[currentIndex]}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}
