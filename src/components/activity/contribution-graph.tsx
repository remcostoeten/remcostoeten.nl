'use client';

import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionGraphProps {
  data: ContributionDay[];
  showLegend?: boolean;
  className?: string;
}

export function ContributionGraph({
  data,
  showLegend = true,
  className = ""
}: ContributionGraphProps) {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getColorForLevel = (level: number) => {
    const colors = [
      'bg-[#161b22]',
      'bg-[#0e4429]',
      'bg-[#006d32]',
      'bg-[#26a641]',
      'bg-[#39d353]'
    ];
    return colors[Math.min(level, 4)];
  };

  const weeks = useMemo(() => {
    if (!data || data.length === 0) return [];

    const weeksArray: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    // Get the first date and find the start of that week (Sunday)
    const firstDate = new Date(sortedData[0].date);
    const dayOfWeek = firstDate.getDay();
    
    // Add empty days for the start of the first week
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }

    // Create a map for quick lookup
    const dataMap = new Map(sortedData.map(d => [d.date, d]));

    // Iterate through all dates
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const currentDate = new Date(firstDate);

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dataMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
      weeksArray.push(currentWeek);
    }

    return weeksArray;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayWithDate = week.find(d => d.date);
      if (firstDayWithDate?.date) {
        const date = new Date(firstDayWithDate.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: months[month], position: weekIndex * 13 });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  useLayoutEffect(() => {
    if (scrollContainerRef.current && weeks.length > 0) {
      // Scroll to the end (current month)
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [weeks.length]);

  if (!data || data.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="space-y-2">
          <div className="flex gap-[3px] pl-7">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-10 h-3 bg-muted/20 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="flex gap-0">
            <div className="w-7 flex flex-col gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[10px]"></div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="w-[10px] h-[10px] bg-muted/20 rounded-sm animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>

        <div ref={graphRef} className="inline-block min-w-max">
          <div className="flex text-[10px] text-muted-foreground mb-1 pl-7 h-4">
            {monthLabels.map(({ month, position }, idx) => (
              <motion.span
                key={idx}
                className="absolute"
                style={{ marginLeft: `${position + 28}px` }}
                initial={{ opacity: 0, y: -5 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
              >
                {month}
              </motion.span>
            ))}
          </div>

          <div className="flex gap-0">
            <div className="flex flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground w-7">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <div key={i} className="h-[10px] flex items-center justify-end pr-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    if (!day.date) {
                      return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                    }

                    return (
                      <motion.div
                        key={dayIndex}
                        className={`w-[10px] h-[10px] rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-white/30 ${getColorForLevel(day.level)}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          delay: weekIndex * 0.015 + dayIndex * 0.008,
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        title={`${day.date}: ${day.count} contributions`}
                        whileHover={{ scale: 1.3 }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <motion.div
          className="flex items-center gap-2 text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-[10px] h-[10px] rounded-sm ${getColorForLevel(level)}`} />
            ))}
          </div>
          <span>More</span>
        </motion.div>
      )}
    </div>
  );
}

interface ContributionGraphWrapperProps {
  data: ContributionDay[];
}

export function ContributionGraphWrapper({ data }: ContributionGraphWrapperProps) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
        <Calendar className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Contribution Graph</span>
      </div>
      <ContributionGraph data={data} showLegend={true} />
    </div>
  );
}
