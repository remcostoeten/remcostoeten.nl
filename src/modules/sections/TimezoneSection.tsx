import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { useTimezone, TTimezoneId } from "@/modules/time";

type TProps = {
  timezoneId?: TTimezoneId;
};

export function TimezoneSection({ timezoneId = 'UTC+1' }: TProps) {
  const { currentTime, timezoneInfo } = useTimezone({ 
    timezoneId,
    format: { format: '24h', showSeconds: true }
  });

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
        {timezoneInfo.offset}
      </span>{" "}
      which includes countries like{" "}
      {timezoneInfo.countries.map((country, index) => (
        <span key={country}>
          <span 
            className="font-medium px-1 py-0.5 rounded"
            style={{ backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          >
            {country}
          </span>
          {index < timezoneInfo.countries.length - 1 && (
            index === timezoneInfo.countries.length - 2 ? " and " : ", "
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
