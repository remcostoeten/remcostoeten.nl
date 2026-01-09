"use client";

import {
    ContributionGraph,
    ContributionGraphBlock,
    ContributionGraphCalendar,
    ContributionGraphFooter,
} from "@/components/kibo-ui/contribution-graph";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ContributionGraphClientProps {
    data: {
        date: string;
        count: number;
        level: number;
    }[];
}

export function ContributionGraphClient({ data }: ContributionGraphClientProps) {
    return (
        <div className="w-full overflow-hidden rounded-lg border bg-background p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">GitHub Contributions (Last Year)</h3>
            </div>
            <TooltipProvider>
                <ContributionGraph data={data}>
                    <ContributionGraphCalendar>
                        {({ activity, dayIndex, weekIndex }) => (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <g>
                                        <ContributionGraphBlock
                                            activity={activity}
                                            className="cursor-pointer hover:stroke-foreground/50 transition-all duration-300"
                                            dayIndex={dayIndex}
                                            weekIndex={weekIndex}
                                        />
                                    </g>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-semibold text-xs">{activity.date}</p>
                                    <p className="text-xs text-muted-foreground">{activity.count} contributions</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </ContributionGraphCalendar>
                    <ContributionGraphFooter />
                </ContributionGraph>
            </TooltipProvider>
        </div>
    );
}
