import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { TIMEZONE_INFO, useCurrentTime, TimeNumberFlow } from "@/modules/time";

type THighlightVariant = 
  | 'solid' 
  | 'dashed' 
  | 'yellow' 
  | 'highlight' 
  | 'outline' 
  | 'underline'
  | 'border-blue'
  | 'border-green'
  | 'border-red'
  | 'border-purple'
  | 'border-orange'
  | 'border-pink'
  | 'border-cyan';

type TProps = {
  highlightVariant?: THighlightVariant;
  showAnimation?: boolean;
  animationDelay?: number;
};

function getHighlightClasses(variant: THighlightVariant): string {
  const baseClasses = "font-medium";
  
  switch (variant) {
    case 'solid':
      return `${baseClasses} px-2 py-1 rounded-md bg-muted text-foreground`;
    case 'dashed':
      return `${baseClasses} px-2 py-1 border-2 border-dashed border-muted-foreground/30 rounded-md`;
    case 'yellow':
      return `${baseClasses} px-2 py-1 bg-yellow-200 text-yellow-900 rounded-md`;
    case 'highlight':
      return `${baseClasses} px-2 py-1 bg-yellow-300/50 text-foreground rounded-md`;
    case 'outline':
      return `${baseClasses} px-2 py-1 border-2 border-primary rounded-md`;
    case 'underline':
      return `${baseClasses} underline decoration-2 decoration-primary underline-offset-2`;
    case 'border-blue':
      return `${baseClasses} px-2 py-1 border-2 border-blue-500 rounded-md`;
    case 'border-green':
      return `${baseClasses} px-2 py-1 border-2 border-green-500 rounded-md`;
    case 'border-red':
      return `${baseClasses} px-2 py-1 border-2 border-red-500 rounded-md`;
    case 'border-purple':
      return `${baseClasses} px-2 py-1 border-2 border-purple-500 rounded-md`;
    case 'border-orange':
      return `${baseClasses} px-2 py-1 border-2 border-orange-500 rounded-md`;
    case 'border-pink':
      return `${baseClasses} px-2 py-1 border-2 border-pink-500 rounded-md`;
    case 'border-cyan':
      return `${baseClasses} px-2 py-1 border-2 border-cyan-500 rounded-md`;
    default:
      return `${baseClasses} px-2 py-1 border-2 border-dashed border-muted-foreground/30 rounded-md`;
  }
}

export function TimezoneSection({ 
  highlightVariant = 'dashed',
  showAnimation = true,
  animationDelay = 0.8
}: TProps = {}) {
  const currentTime = useCurrentTime();
  const highlightClasses = getHighlightClasses(highlightVariant);

  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.4)}
    >
      My current timezone is{" "}
      <span className={highlightClasses}>
        {TIMEZONE_INFO.offset}
      </span>{" "}
      which includes countries like{" "}
      {TIMEZONE_INFO.countries.map((country, index) => (
        <span key={country}>
          <span className={highlightClasses}>
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
          className={`${highlightClasses} inline-block`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: animationDelay, ease: "easeOut" }}
        >
          <TimeNumberFlow time={currentTime} className="" />
        </motion.span>
      ) : (
        <span className={`${highlightClasses} inline-block`}>
          <TimeNumberFlow time={currentTime} className="" />
        </span>
      )}
      .
    </motion.p>
  );
}
