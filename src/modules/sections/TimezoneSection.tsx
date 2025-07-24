import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { TIMEZONE_INFO, useCurrentTime } from "@/modules/time";

export function TimezoneSection() {
  const currentTime = useCurrentTime();

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
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
      >
        {currentTime}
      </motion.span>
      .
    </motion.p>
  );
}
