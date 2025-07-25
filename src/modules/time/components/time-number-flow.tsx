import { useMemo, useRef, useEffect } from 'react';
import NumberFlow from '@number-flow/react';

type TProps = {
  time: string;
  className?: string;
};

type TTimeParts = {
  hours: number;
  minutes: number;
  seconds?: number;
  ampm?: string;
  date?: string;
};

function parseTimeString(timeString: string): TTimeParts {
  const cleanTime = timeString.trim();
  
  const dateTimeMatch = cleanTime.match(/^(\d{1,2}\/\d{1,2}\/\d{4}),?\s*(.+)$/);
  const dateMatch = cleanTime.match(/^(\w+\s+\d{1,2},\s+\d{4}),?\s*(.+)$/);
  
  let timeOnly = cleanTime;
  let date: string | undefined;
  
  if (dateTimeMatch) {
    date = dateTimeMatch[1];
    timeOnly = dateTimeMatch[2];
  } else if (dateMatch) {
    date = dateMatch[1];
    timeOnly = dateMatch[2];
  }
  
  const ampmMatch = timeOnly.match(/\s+(AM|PM)$/i);
  const ampm = ampmMatch ? ampmMatch[1].toUpperCase() : undefined;
  const timeWithoutAmpm = ampm ? timeOnly.replace(/\s+(AM|PM)$/i, '') : timeOnly;
  
  const timeParts = timeWithoutAmpm.split(':');
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  const seconds = timeParts[2] ? parseInt(timeParts[2]) : undefined;
  
  return {
    hours,
    minutes,
    seconds,
    ampm,
    date
  };
}

export function TimeNumberFlow({ time, className = "" }: TProps) {
  const timeParts = useMemo(() => parseTimeString(time), [time]);
  const prevTimePartsRef = useRef<TTimeParts | null>(null);
  
  useEffect(() => {
    if (prevTimePartsRef.current) {
      console.log('TimeNumberFlow Update:', {
        prev: prevTimePartsRef.current,
        current: timeParts,
        rawTime: time
      });
    }
    prevTimePartsRef.current = timeParts;
  }, [timeParts, time]);
  
  if (!timeParts.hours && !timeParts.minutes) {
    return <span className={`font-mono ${className}`}>{time}</span>;
  }
  
  return (
    <div className={`font-mono ${className}`}>
      {timeParts.date && (
        <span className="mr-2">{timeParts.date},</span>
      )}
      
      <NumberFlow 
        key="hours"
        value={timeParts.hours} 
        format={{ minimumIntegerDigits: 2 }}
        className="inline-block"
        transformTiming={{ duration: 400, easing: 'ease-out' }}
        spinTiming={{ duration: 500, easing: 'ease-out' }}
        opacityTiming={{ duration: 200, easing: 'ease-out' }}
      />
      <span className="mx-1 text-muted-foreground">:</span>
      <NumberFlow 
        key="minutes"
        value={timeParts.minutes} 
        format={{ minimumIntegerDigits: 2 }}
        className="inline-block"
        transformTiming={{ duration: 400, easing: 'ease-out' }}
        spinTiming={{ duration: 500, easing: 'ease-out' }}
        opacityTiming={{ duration: 200, easing: 'ease-out' }}
      />
      
      {timeParts.seconds !== undefined && (
        <>
          <span className="mx-1 text-muted-foreground">:</span>
          <NumberFlow 
            key="seconds"
            value={timeParts.seconds} 
            format={{ minimumIntegerDigits: 2 }}
            className="inline-block"
            transformTiming={{ duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            spinTiming={{ duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            opacityTiming={{ duration: 100, easing: 'ease-out' }}
          />
        </>
      )}
      
      {timeParts.ampm && (
        <span className="ml-1">{timeParts.ampm}</span>
      )}
    </div>
  );
}
