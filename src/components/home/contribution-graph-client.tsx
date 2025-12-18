"use client";

import {
    ContributionGraph,
    ContributionGraphBlock,
    ContributionGraphCalendar,
} from "@/components/kibo-ui/contribution-graph";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Section } from "@/components/ui/section";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface ContributionGraphClientProps {
    data: {
        date: string;
        count: number;
        level: number;
    }[];
}

export function ContributionGraphClient({ data }: ContributionGraphClientProps) {
    const totalCount = data.reduce((sum, activity) => sum + activity.count, 0);
    const currentYear = new Date().getFullYear();

    return (
        <Section
            title="GitHub Contributions"
            headerAction={
                <span className="text-muted-foreground/60 inline-flex items-baseline">
                    <span className="-translate-y-px">
                        <AnimatedNumber value={currentYear} duration={800} />
                    </span>
                </span>
            }
        >
            <div>
                <TooltipProvider>
                    <ContributionGraph data={data}>
                        <ContributionGraphCalendar>
                            {({ activity, dayIndex, weekIndex }) => (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <g>
                                            <ContributionGraphBlock
                                                activity={activity}
                                                className="cursor-pointer hover:stroke-emerald-400/50 transition-all duration-300"
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
                        <div className="flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4 mt-2 text-xs text-muted-foreground">
                            <span>
                                <AnimatedNumber value={totalCount} duration={1200} /> contributions in the last year
                            </span>
                        </div>
                    </ContributionGraph>
                </TooltipProvider>
            </div>
        </Section>
    );
}
