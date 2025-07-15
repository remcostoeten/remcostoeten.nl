"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	progressForDeleting,
	progressForPageLoad,
	progressForSaving,
	simulateProgress,
	startProgress,
	stopProgress,
	useProgress,
} from "@/lib/progress";

export function ProgressDemo() {
	const { isActive } = useProgress();

	async function handleSaveDemo() {
		await progressForSaving(async () => {
			await new Promise((resolve) => setTimeout(resolve, 2000));
			return { success: true };
		});
	}

	async function handleDeleteDemo() {
		await progressForDeleting(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			return { success: true };
		});
	}

	async function handlePageLoadDemo() {
		await progressForPageLoad(async () => {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			return { success: true };
		});
	}

	async function handleSimulateDemo() {
		await simulateProgress(2000);
	}

	function handleManualStart() {
		startProgress();
	}

	function handleManualStop() {
		stopProgress();
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Progress Indicator Demo</CardTitle>
				<CardDescription>
					Test the global progress indicators for different scenarios
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Status:</span>
					<span
						className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-600"}`}
					>
						{isActive ? "Active" : "Inactive"}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<Button onClick={handleSaveDemo} disabled={isActive} size="sm">
						Save Demo
					</Button>
					<Button
						onClick={handleDeleteDemo}
						disabled={isActive}
						size="sm"
						variant="destructive"
					>
						Delete Demo
					</Button>
					<Button
						onClick={handlePageLoadDemo}
						disabled={isActive}
						size="sm"
						variant="secondary"
					>
						Page Load Demo
					</Button>
					<Button
						onClick={handleSimulateDemo}
						disabled={isActive}
						size="sm"
						variant="outline"
					>
						Simulate Demo
					</Button>
				</div>

				<div className="flex gap-2">
					<Button
						onClick={handleManualStart}
						disabled={isActive}
						size="sm"
						variant="outline"
					>
						Manual Start
					</Button>
					<Button
						onClick={handleManualStop}
						disabled={!isActive}
						size="sm"
						variant="outline"
					>
						Manual Stop
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
