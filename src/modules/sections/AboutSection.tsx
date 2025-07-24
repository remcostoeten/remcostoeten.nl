import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

export function AboutSection() {
  return (
    <motion.p 
      className="text-foreground leading-relaxed text-base"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      With extensive experience in{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--highlight-product) / 0.2)', color: 'hsl(var(--highlight-product))' }}
      >
        Product Design
      </span>{" "}
      and{" "}
      <span 
        className="font-medium px-1 py-0.5 rounded"
        style={{ backgroundColor: 'hsl(var(--highlight-frontend) / 0.2)', color: 'hsl(var(--highlight-frontend))' }}
      >
        Frontend Development
      </span>{" "}
      I help bridge the gap between efficient design and development.
    </motion.p>
  );
}
