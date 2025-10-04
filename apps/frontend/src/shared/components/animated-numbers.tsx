'use client';

import { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";

interface AnimatedTimestampProps {
  timestamp: string;
  delay?: number;
}

export function AnimatedTimestamp({ timestamp, delay = 0 }: AnimatedTimestampProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

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

    setDisplayValue(targetValue);

    const initialTimer = setTimeout(() => {
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
    return <>{timestamp}</>;
  }

  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="inline-block text-right">
        <NumberFlow value={displayValue} />
      </span>
      <span>
        {parsed.unit}{parsed.isPlural ? "s" : ""} ago
      </span>
    </span>
  );
}