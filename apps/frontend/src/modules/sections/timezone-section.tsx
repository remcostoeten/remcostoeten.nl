'use client';

import NumberFlow from "@number-flow/react";
import { TIMEZONE_INFO, useTimeComponents } from "@/modules/time";

export const TimezoneSection = () => {
  const { hours, minutes, seconds } = useTimeComponents();

  return (
    <p className="text-foreground leading-relaxed text-base">
      My current timezone is{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
      >
        {TIMEZONE_INFO.timezone}
      </span>{" "}
      which includes countries like{" "}
      {TIMEZONE_INFO.countries.map((country, index) => (
        <span key={country}>
          <span 
            className="font-medium px-1 py-0.5 rounded"
            style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          >
            {country}
          </span>
          {index < TIMEZONE_INFO.countries.length - 1 && (
            index === TIMEZONE_INFO.countries.length - 2 ? " and " : ", "
          )}
        </span>
      ))}
      . Right now it is{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded inline-flex items-center gap-0.5"
        style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
      >
        <NumberFlow 
          value={hours} 
          format={{ minimumIntegerDigits: 2 }}
        />
        :
        <NumberFlow 
          value={minutes} 
          format={{ minimumIntegerDigits: 2 }}
        />
        :
        <NumberFlow 
          value={seconds} 
          format={{ minimumIntegerDigits: 2 }}
        />
      </span>
      .
    </p>
  );
};