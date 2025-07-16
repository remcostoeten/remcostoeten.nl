import {
	incrementProgress,
	setProgress,
	startProgress,
	stopProgress,
} from "./progress-indicator";

export async function withProgress<T>(
	asyncFn: () => Promise<T>,
	options?: {
		onProgress?: (progress: number) => void;
		steps?: number;
	},
): Promise<T> {
	const { onProgress, steps = 1 } = options || {};

	try {
		startProgress();

		if (onProgress) {
			const stepIncrement = 1 / steps;
			for (let i = 0; i < steps; i++) {
				onProgress(i * stepIncrement);
				setProgress(i * stepIncrement);
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		const result = await asyncFn();

		return result;
	} finally {
		stopProgress();
	}
}

export async function withProgressSteps<T>(
	steps: Array<() => Promise<unknown>>,
	finalStep: () => Promise<T>,
): Promise<T> {
	try {
		startProgress();

		const totalSteps = steps.length + 1;

		for (let i = 0; i < steps.length; i++) {
			await steps[i]();
			setProgress((i + 1) / totalSteps);
		}

		const result = await finalStep();

		return result;
	} finally {
		stopProgress();
	}
}

export function simulateProgress(duration: number = 2000): Promise<void> {
	return new Promise((resolve) => {
		startProgress();

		const interval = 50;
		const steps = duration / interval;
		let currentStep = 0;

		const timer = setInterval(() => {
			currentStep++;
			const progress = currentStep / steps;

			if (progress >= 1) {
				clearInterval(timer);
				stopProgress();
				resolve();
			} else {
				setProgress(progress);
			}
		}, interval);
	});
}

export async function progressForSaving<T>(
	saveFn: () => Promise<T>,
): Promise<T> {
	return withProgress(saveFn, {
		onProgress: (progress) => {
			if (progress < 0.3) {
				// Validating
			} else if (progress < 0.7) {
				// Saving
			} else {
				// Finalizing
			}
		},
		steps: 3,
	});
}

export async function progressForDeleting<T>(
	deleteFn: () => Promise<T>,
): Promise<T> {
	return withProgress(deleteFn, {
		onProgress: (progress) => {
			if (progress < 0.5) {
				// Confirming
			} else {
				// Deleting
			}
		},
		steps: 2,
	});
}

export async function progressForPageLoad<T>(
	loadFn: () => Promise<T>,
): Promise<T> {
	return withProgress(loadFn, {
		onProgress: (progress) => {
			if (progress < 0.2) {
				// Fetching data
			} else if (progress < 0.6) {
				// Processing
			} else if (progress < 0.9) {
				// Rendering
			} else {
				// Complete
			}
		},
		steps: 4,
	});
}

export { startProgress, stopProgress, incrementProgress, setProgress };
