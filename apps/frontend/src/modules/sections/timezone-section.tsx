'use client';

import { AnimatedNumber } from "@/components/ui/animated-number";
import { useTimeComponents } from "@/modules/time";

export const TimezoneSection = () => {
  const { hours, minutes, seconds } = useTimeComponents();

  return (
    <>
      {/* Desktop version - top right */}
      <div className="hidden md:block fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-md border border-border/60 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-xs text-muted-foreground font-medium tracking-wide">AMS</div>
          <div className="flex items-center gap-1 text-sm font-mono">
            <AnimatedNumber
              value={hours}
              format="number"
              decimals={0}
              className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
              randomStart={false}
              shouldAnimate={false}
            />
            <span className="text-muted-foreground animate-pulse">:</span>
            <AnimatedNumber
              value={minutes}
              format="number"
              decimals={0}
              className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
              randomStart={false}
              shouldAnimate={false}
            />
            <span className="text-muted-foreground animate-pulse">:</span>
            <AnimatedNumber
              value={seconds}
              format="number"
              decimals={0}
              className="w-6 text-center tabular-nums transition-all duration-200 hover:scale-105"
              randomStart={false}
              shouldAnimate={false}
            />
          </div>
        </div>
      </div>

      {/* Mobile version - bottom center with lower opacity */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-background/60 backdrop-blur-sm border border-border/30 rounded-full shadow-lg transition-all duration-300">
          <div className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">AMS/CEST</div>
          <div className="flex items-center gap-0.5 text-xs font-mono text-muted-foreground/70">
            <AnimatedNumber
              value={hours}
              format="number"
              decimals={0}
              className="w-4 text-center tabular-nums"
              randomStart={false}
              shouldAnimate={false}
            />
            <span className="text-muted-foreground/50 animate-pulse">:</span>
            <AnimatedNumber
              value={minutes}
              format="number"
              decimals={0}
              className="w-4 text-center tabular-nums"
              randomStart={false}
              shouldAnimate={false}
            />
            <span className="text-muted-foreground/50 animate-pulse">:</span>
            <AnimatedNumber
              value={seconds}
              format="number"
              decimals={0}
              className="w-4 text-center tabular-nums"
              randomStart={false}
              shouldAnimate={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
