"use client";

import { ProgressBar } from "@/components/progress-bar";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";

type TProps = {
	children: React.ReactNode;
};

export function Providers({ children }: TProps) {
	return (
		<QueryProvider>
			<ThemeProvider>
				<ProgressBar>
					<TooltipProvider>{children}</TooltipProvider>
				</ProgressBar>
			</ThemeProvider>
		</QueryProvider>
	);
}
