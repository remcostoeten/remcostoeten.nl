import { useEffect, useState } from "react";
import { createProgressIndicator } from "@/lib/progress-indicator";

type TProgressState = {
	isActive: boolean;
	start: () => void;
	stop: () => void;
	increment: (amount?: number) => void;
	set: (progress: number) => void;
};

export function useProgress(): TProgressState {
	const [isActive, setIsActive] = useState(false);
	const progressIndicator = createProgressIndicator();

	useEffect(() => {
		const unsubscribe = progressIndicator.addListener((active) => {
			setIsActive(active);
		});

		setIsActive(progressIndicator.getStatus());

		return unsubscribe;
	}, [progressIndicator]);

	return {
		isActive,
		start: () => progressIndicator.start(),
		stop: () => progressIndicator.stop(),
		increment: (amount?: number) => progressIndicator.increment(amount),
		set: (progress: number) => progressIndicator.set(progress),
	};
}
