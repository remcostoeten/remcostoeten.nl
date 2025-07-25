import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ANIMATION_CONFIGS } from "@/modules/shared";
import { TIMEZONE_INFO, useCurrentTime, TimeNumberFlow } from "@/modules/time";

type THighlightVariant = 
  | 'solid' 
  | 'dashed' 
  | 'yellow' 
  | 'yellow-dashed'
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
  variant: THighlightVariant;
  title: string;
  description: string;
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
    case 'yellow-dashed':
      return `${baseClasses} px-2 py-1 bg-yellow-200 text-yellow-900 border-2 border-dashed border-yellow-500 rounded-md`;
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

function ParagraphVariantDemo({ variant, title, description }: TProps) {
  const currentTime = useCurrentTime();
  const highlightClasses = getHighlightClasses(variant);

  return (
    <motion.div 
      className="space-y-4 p-6 border border-muted rounded-lg bg-card"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          variant="{variant}"
        </code>
      </div>
      
      <motion.p 
        className="text-foreground leading-relaxed text-base"
        {...ANIMATION_CONFIGS.staggered(0.2)}
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
        <span className={`${highlightClasses} inline-block`}>
          <TimeNumberFlow time={currentTime} className="" />
        </span>
        .
      </motion.p>
    </motion.div>
  );
}

function ParagraphVariantsDemo() {
  const variants: Array<{ variant: THighlightVariant; title: string; description: string }> = [
    {
      variant: 'solid',
      title: 'Solid Background',
      description: 'Subtle background with muted colors for gentle emphasis'
    },
    {
      variant: 'dashed',
      title: 'Dashed Border',
      description: 'Dashed border style for a sketchy, informal look'
    },
    {
      variant: 'yellow',
      title: 'Yellow Highlight',
      description: 'Classic yellow highlighter effect for maximum attention'
    },
    {
      variant: 'yellow-dashed',
      title: 'Yellow Highlight with Dashed Border',
      description: 'Combines yellow background with dashed border for emphasis'
    },
    {
      variant: 'highlight',
      title: 'Soft Highlight',
      description: 'Subtle yellow background that is easier on the eyes'
    },
    {
      variant: 'outline',
      title: 'Primary Outline',
      description: 'Clean border using the primary theme color'
    },
    {
      variant: 'underline',
      title: 'Underlined Text',
      description: 'Simple underline decoration with primary color'
    },
    {
      variant: 'border-blue',
      title: 'Blue Border',
      description: 'Blue border for information or links'
    },
    {
      variant: 'border-green',
      title: 'Green Border',
      description: 'Green border for success or positive states'
    },
    {
      variant: 'border-red',
      title: 'Red Border',
      description: 'Red border for errors or important warnings'
    },
    {
      variant: 'border-purple',
      title: 'Purple Border',
      description: 'Purple border for creative or premium content'
    },
    {
      variant: 'border-orange',
      title: 'Orange Border',
      description: 'Orange border for warnings or call-to-action'
    },
    {
      variant: 'border-pink',
      title: 'Pink Border',
      description: 'Pink border for fun, playful, or romantic content'
    },
    {
      variant: 'border-cyan',
      title: 'Cyan Border',
      description: 'Cyan border for tech, modern, or cool themes'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <motion.header 
          className="text-center space-y-4"
          {...ANIMATION_CONFIGS.staggered(0.1)}
        >
          <h1 className="text-4xl font-bold text-foreground">
            Paragraph Variants Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all available paragraph highlight variants used throughout the application. 
            Each variant provides different visual emphasis for content highlighting.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.header>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          {...ANIMATION_CONFIGS.staggered(0.1)}
        >
          {variants.map(({ variant, title, description }) => (
            <ParagraphVariantDemo
              key={variant}
              variant={variant}
              title={title}
              description={description}
            />
          ))}
        </motion.div>

        <motion.footer 
          className="text-center pt-8 border-t border-muted"
          {...ANIMATION_CONFIGS.staggered(0.1)}
        >
          <p className="text-sm text-muted-foreground">
            These variants are used in the <code className="bg-muted px-1 py-0.5 rounded text-xs">TimezoneSection</code> component 
            and can be applied throughout the application for consistent text highlighting.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default ParagraphVariantsDemo;
