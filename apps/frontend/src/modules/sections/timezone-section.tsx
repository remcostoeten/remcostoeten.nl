'use client';

import { AnimatedNumber } from "@/components/ui/animated-number";
import { useTimeComponents } from "@/modules/time";

export const TimezoneSection = () => {
  const { hours, minutes, seconds } = useTimeComponents();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-md border border-border/60 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="text-xs text-muted-foreground font-medium tracking-wide">CEST</div>
        <div className="flex items-center gap-1 text-sm font-mono">
          <AnimatedNumber
            value={hours}
            format="number"
            decimals={0}
            className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
            randomStart={false}
          />
          <span className="text-muted-foreground animate-pulse">:</span>
          <AnimatedNumber
            value={minutes}
            format="number"
            decimals={0}
            className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
            randomStart={false}
          />
          <span className="text-muted-foreground animate-pulse">:</span>
          <AnimatedNumber
            value={seconds}
            format="number"
            decimals={0}
            className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
            randomStart={false}
          />
        </div>
      </div>
    </div>
  );
};