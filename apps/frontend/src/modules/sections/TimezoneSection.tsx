'use client';

import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { TIMEZONE_INFO, useTimeComponents } from "@/modules/time";

export const TimezoneSection = () => {
  const { hours, minutes, seconds } = useTimeComponents();

  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.4)}
    >
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
      <motion.span 
        className="font-medium px-1 py-0.5 rounded inline-flex items-center gap-0.5"
        style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
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
      </motion.span>
      .
    </motion.p>
  );
};