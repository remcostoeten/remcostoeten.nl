"use client";

import { ProgressBar } from "@/components/progress-bar";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

type TProps = {
	children: React.ReactNode;
};

export function Providers({ children }: TProps) {
	return (
		<QueryProvider>
			<ProgressBar>
				<TooltipProvider>{children}</TooltipProvider>
			</ProgressBar>
		</QueryProvider>
	);
}
