import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { TIMEZONE_INFO, useCurrentTime, TimeNumberFlow } from "@/modules/time";

type TProps = {
  showAnimation?: boolean;
  animationDelay?: number;
};

export function TimezoneSection({ 
  showAnimation = true,
  animationDelay = 0.8
}: TProps = {}) {
  const currentTime = useCurrentTime();

  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.4)}
    >
      My current timezone is{" "}
      <span className="dashed-highlight">
        {TIMEZONE_INFO.offset}
      </span>{" "}
      which includes countries like{" "}
      {TIMEZONE_INFO.countries.map((country, index) => (
        <span key={country}>
          <span className="dashed-highlight">
            {country}
          </span>
          {index < TIMEZONE_INFO.countries.length - 1 && (
            index === TIMEZONE_INFO.countries.length - 2 ? " and " : ", "
          )}
        </span>
      ))}
      . Right now it is{" "}
      {showAnimation ? (
        <motion.span 
          className="dashed-highlight inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: animationDelay, ease: "easeOut" }}
        >
          <TimeNumberFlow time={currentTime} className="" />
        </motion.span>
      ) : (
        <span className="dashed-highlight inline-block">
          <TimeNumberFlow time={currentTime} className="" />
        </span>
      )}
      .
    </motion.p>
  );
}
