'use client';

import { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";

interface AnimatedTimestampProps {
  timestamp: string;
  delay?: number;
}

export function AnimatedTimestamp({ timestamp, delay = 0 }: AnimatedTimestampProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  // Parse the timestamp to extract number and unit
  const parseTimestamp = (ts: string) => {
    const match = ts.match(/^(\d+)\s+(minute|hour|day)s?\s+ago$/);
    if (match) {
      return {
        number: parseInt(match[1], 10),
        unit: match[2],
        isPlural: parseInt(match[1], 10) !== 1
      };
    }
    return null;
  };

  const parsed = parseTimestamp(timestamp);

  useEffect(() => {
    if (!parsed) return;

    const targetValue = parsed.number;
    
    // Start with the target value initially (no animation yet)
    setDisplayValue(targetValue);

    // After the initial delay, start the spin animation
    const initialTimer = setTimeout(() => {
      // Start with a random value for the spin effect
      const randomStart = Math.floor(Math.random() * 50) + 10;
      setDisplayValue(randomStart);

      // After a brief delay, animate to the actual value
      const animationTimer = setTimeout(() => {
        setDisplayValue(targetValue);
      }, 80);

      return () => clearTimeout(animationTimer);
    }, delay);

    return () => clearTimeout(initialTimer);
  }, [timestamp, parsed?.number, delay]);

  if (!parsed) {
    // For timestamps like "just now" or dates, return as-is
    return <>{timestamp}</>;
  }

  // Dynamic width based on number of digits
  const widthClass = parsed.number < 10 ? "w-2" : "w-3";

  return (
    <>
      <span className={`inline-block ${widthClass} text-right`}>
        <NumberFlow value={displayValue} />
      </span>
      {" "}
      {parsed.unit}
      {parsed.isPlural ? "s" : ""}
      {" ago"}
    </>
  );
}